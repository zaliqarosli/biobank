<?php

namespace LORIS\biobank;

/**
 * Pool Data Access Object (DAO) Class
 * This class contains all database handling that is needed to
 * permanently store and retrieve Pool Object instances
 *
 * PHP Version 7.0
 *
 * @category Loris
 * @package  Biobank
 * @author   Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris/
 */

class PoolDAO 
{

    /**
     * Global variable $db
     *
     * @access public
     */
    public $db;

    /**
     * Initializes a new instance of the PoolDAO Class
     *
     * @param object $database Instance of the LORIS Database class
     */
    function __construct($database) {
        $this->db = $database;
    }

    /**
     * This method is used when the DAO class needs to create new Pool 
     * instance.
     * 
     * @return object Pool
     */
    public function createPool() : Pool
    {
        return new Pool();
    }
   
    /**
     * This method creates a Pool instance from the result of a database 
     * query of the biobank_pool table. 
     *
     * @param  array  $poolData Array from which a Pool will be instantiated
     * @return object $pool
     */
    private function createPoolFromQuery(array $poolData) : Pool
    {
        $pool = $this->createPool();
        $this->fromSQL($pool, $poolData);
    	
        return $pool;
    }
    
    /**
     * This will load all pool persistence variables from the database for a
     * given $id into a Pool object, and return the object.
     *
     * @param  int    $id   Value of the $id for the Pool that will be
     *                      instantiated
     * @return object $pool Instance of Pool class
     */
    public function getPoolFromId(int $id) : Pool
    {
        $query = "SELECT bp.PoolID,
                         bp.Label,
                         bp.Date,
                         DATE_FORMAT(bp.Time, '%H:%i') as Time
                  FROM   biobank_pool bs
                  WHERE  bs.PoolID=:i";
        $result = $this->db->pselectRow($query, array('i' => $id));
        $result['SpecimenIDs'] = $this->getSpecimenIds($id);
        $pool = $this->createPoolFromQuery($result);
        
        return $pool;
    }

    /**
     * This function returns an array of all the Specimen Ids that are associated
     * with the given Pool Instance's ID.
     *
     * @param int $id   Pool Instance's ID
     *
     * @array $specimenIds array of associated Specimen IDs
     */
    public function getSpecimenIds($id)
    {
        $query = 'SELECT SpecimenID
                  FROM biobank_specimen_pool_rel
                  WHERE PoolID=:i';
        $specimenIds = $this->db->pselectcol($query, array('i'=>$id));

        return $specimenIds;
    }
    
   /* 
    * This will select all pools from the database that match the 
    * attribute values passed through $poolData and will return an array
    * of pool objects.
    * 
    * @param  array $poolData TODO: finish description
    * @return array $pools    TODO: finish description
    */
    public function selectPools(array $conditions = null) : array
    {
        $query = 'SELECT PoolID
                  FROM biobank_pool';
        $query .= $conditions ? ' WHERE '.$this->db->implodeWithKeys(' AND ', $conditions) : '';

        $result = $this->db->pselect($query, array());
        $pools = array();
        if (!empty($result)) {
            foreach($result as $row) {
                $id = $row['PoolID'];
                $pool = $this->getPoolFromId($id);
                $pools[$id] = $pool;
            }
        }
        
        return $pools;
    }

    //TODO: define function
    public function savePool(Pool $newPool)
    {
        $data = $this->toSQL($newPool);

        $this->db->insertOnDuplicateUpdate(
            'biobank_pool',
            $data['biobank_pool']
        );

        $poolId = $newPool->getId();
        if (isset($poolId)) {
            //todo: what is this oldPool used for?
            $oldPool = $this->getPoolFromId($poolId);
        } else {
            $poolId = $this->db->getLastInsertId();
            $specimenIds = $newPool->getSpecimenIds();
            foreach ($specimenIds as $id) {
                $data['biobank_specimen_pool_rel'][$id]['PoolID'] = $poolId;
            }
        }

        foreach($data['biobank_specimen_pool_rel'] as $insert) {
            $this->db->insertOnDuplicateUpdate(
                'biobank_specimen_pool_rel',
                 $insert
            );
        }
    } 

    //TODO: define function
    private function toSQL(Pool $pool) 
    {
        $poolData = array(
            'PoolID' => $pool->getId(),
            'Label'  => $pool->getLabel(),
            'Date'   => $pool->getDate(),
            'Time'   => $pool->getTime(),
        );

        $specimenIds = $pool->getSpecimenIds();
        foreach ($specimenIds as $id) {
            $specimenPoolData[$id] = array(
                'PoolID'     => $pool->getId(), 
                'SpecimenID' => $id,
            );
        }

        return $data = array(
            'biobank_pool'              => $poolData,
            'biobank_specimen_pool_rel' => $specimenPoolData,
        );
    }

    //TODO: define this function.
    private function fromSQL(Pool $pool, array $poolData)
    {
        //Construct Global Persistence Variables
        $pool->setId($poolData['PoolID']);
        $pool->setLabel($poolData['Label']);
	    	$pool->setSpecimenIds($poolData['SpecimenIDs']);
        $pool->setDate($poolData['Date']);
        $pool->setTime($poolData['Time']);
    }
}
