<?php declare(strict_types=1);
/**
 * Pool Data Access Object (DAO) Class
 * This class contains all database handling that is needed to
 * permanently store and retrieve Pool Object instances
 *
 * PHP Version 7.2
 *
 * @category   DAO
 * @package    Loris
 * @subpackage Biobank
 * @author     Henri Rabalais <henri.rabalais@mcin.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link       https://www.github.com/aces/Loris/
 */

namespace LORIS\biobank;

/**
 * Pool Data Access Object (DAO) Class
 * This class contains all database handling that is needed to
 * permanently store and retrieve Pool Object instances
 *
 * PHP Version 7.2
 *
 * @category   DAO
 * @package    Loris
 * @subpackage Biobank
 * @author     Henri Rabalais <henri.rabalais@mcin.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link       https://www.github.com/aces/Loris/
 */

class PoolDAO extends \LORIS\Data\ProvisionerInstance
{
    /**
     * Global variable $db
     *
     * @access protected
     */
    private $db;

    /**
     * Initializes a new instance of the PoolDAO Class
     *
     * @param Database $db Instance of the LORIS Database class
     */
    function __construct(\Database $db)
    {
        $this->db = $db;
    }

    /**
     * This method is used when the DAO class needs to create new Pool
     * instance.
     *
     * @return Pool
     */
    public function getInstance() : Pool
    {
        return new Pool();
    }

    /**
     * This will load all pool persistence variables from the database for a
     * given $id into a Pool object, and return the object.
     *
     * @param string $id Value of the $id for the Pool that will be
     *                   instantiated.
     *
     * @return Pool $pool Instance of Pool class
     */
    public function getInstanceFromId(string $id) : Pool
    {
        $query  = "SELECT bp.PoolID,
                          bp.Label,
                          bp.CenterID,
                          bp.Date,
                          DATE_FORMAT(bp.Time, '%H:%i') as Time
                  FROM    biobank_pool bp
                  WHERE   bp.PoolID=:i";
        $result = $this->db->pselectRow($query, array('i' => $id));
        $pool   = $this->getInstanceFromQuery($result);

        // XXX: It seems a bit clumsy to be loading this information into the
        // Pool here. I can't help but feel that there is a better place to be
        // doing this. Perhaps in createPoolFromQuery?
        $specimenDAO  = new SpecimenDAO($this->db);
        $containerDAO = new ContainerDAO($this->db);
        //Get all Specimen IDs that belong to the pool
        $specimenIds = $this->getSpecimenIds($pool);
        //Access information from the first specimen in the pool to populate the
        //Pool Candidate ID and Session ID
        $specimenId  = $specimenIds[1];
        $specimen    = $specimenDAO->getInstanceFromId($specimenId);
        $container   = $containerDAO->getInstanceFromSpecimen($specimen);
        $candidateId = $specimen->getCandidateId();
        $sessionId   = $specimen->getSessionId();

        $pool->setSpecimenIds($specimenIds);
        $pool->setCandidateId($candidateId);
        $pool->setSessionId($sessionId);

        return $pool;
    }

    /**
     * This function returns an array of all the Specimen Ids that are associated
     * with the given Pool Instance's ID.
     *
     * @param Pool $pool Pool Instance
     *
     * @return array  $specimenIds array of associated Specimen IDs
     */
    public function getSpecimenIds(Pool $pool) : array
    {
        $poolId      = $pool->getId();
        $query       = 'SELECT SpecimenID
                  FROM biobank_specimen_pool_rel
                  WHERE PoolID=:i';
        $specimenIds = $this->db->pselectcol($query, array('i' => $poolId));

        return $specimenIds;
    }

    // XXX: Currently this function is never used with any conditions passed as
    // paramters. Decide if this is a necessary feature.
    /**
     * This will select all pools from the database that match the
     * attribute values passed through $poolData and will return an array
     * of pool objects.
     *
     * @param array $conditions Conditions to be met by the query
     *
     * @return array $pools      List of Pool Objects that match the query
     */
    public function selectInstances(array $conditions = null) : array
    {
        $query  = 'SELECT PoolID
                  FROM biobank_pool';
        $query .= $conditions ? ' WHERE '.$this->db->implodeWithKeys(' AND ', $conditions) : '';

        $result = $this->db->pselect($query, array());
        $pools  = array();
        if (!empty($result)) {
            foreach ($result as $row) {
                $id         = $row['PoolID'];
                $pool       = $this->getInstanceFromId($id);
                $pools[$id] = $pool;
            }
        }

        return $pools;
    }

    /**
     * Instantiates an ArrayIterator class that is composed of all the Pool
     * Objects
     *
     * @return traversable Iterator of Pool Objects
     */
    protected function getAllInstances() : \Traversable
    {
        return new \ArrayIterator($this->selectInstances());
    }

    /**
     * This function recieves a Pool Object, converts it into an SQL format
     * and inserts it into all relevant tables in the database. Certain
     * information is then cascaded to the children of the Pool.
     *
     * @param Pool $newPool The Pool to be inserted into the database.
     *
     * @return void
     */
    public function saveInstance(Pool $newPool) : void
    {
        //Convert Pool to SQL format.
        $data = $this->toSQL($newPool);

        // TODO: Introduce a SQL Transaction here with a try catch.
        // Insert or Update the biobank_pool table with respective data.
        $this->db->insertOnDuplicateUpdate(
            'biobank_pool',
            $data['biobank_pool']
        );

        $poolId = $newPool->getId();
        // If update:
        if (isset($poolId)) {
            // XXX: Logic will likely eventually go here.
            // If insert:
        } else {
            $poolId = $this->db->getLastInsertId();
            // set the respective data array index to the value of the new
            // pool ID
            $specimenIds = $newPool->getSpecimenIds();
            foreach ($specimenIds as $id) {
                $data['biobank_specimen_pool_rel'][$id]['PoolID'] = $poolId;
            }
        }

        // insert or update biobank_specimen_pool_rel with relevant data.
        foreach ($data['biobank_specimen_pool_rel'] as $insert) {
            $this->db->insertOnDuplicateUpdate(
                'biobank_specimen_pool_rel',
                $insert
            );
        }

        // XXX: decide if quantity of all pooled specimens should go to 0.
        // XXX: logic for adding preparations to pools will likely go here as well.
    }

    /**
     * This method takes a Pool Object and prepares the data to be inserted into
     * the database by converting it to a data array
     *
     * @param Pool $pool Pool Object to be converted
     *
     * @return array $data Array containing the data to be inserted
     */
    private function toSQL(Pool $pool) : array
    {
        $poolData = array(
                     'PoolID'   => $pool->getId(),
                     'Label'    => $pool->getLabel(),
                     'CenterID' => $pool->getCenterID(),
                     'Date'     => $pool->getDate(),
                     'Time'     => $pool->getTime(),
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

    /**
     * This function takes an array that resulted from an SQL query and
     * instantiates it as a Pool Object.
     *
     * @param array $data Values to be reassigned.
     *
     * @return Pool
     */
    private function getInstanceFromQuery(array $data)
    {
        return $this->getInstanceFromArray( 
            array(
             'id'       => $data['PoolID'],
             'label'    => $data['Label'],
             'centerId' => $data['CenterID'],
             'date'     => $data['Date'],
             'time'     => $data['Time'],
            )
        );
    }

    /**
     * Instatiates a Pool Object from an array.
     *
     * @param array $data Data to be used to create the Pool Object
     *
     * @return Pool $pool Instantiated Pool Object
     */
    public function getInstanceFromArray(array $data) : Pool
    {
        // Set persistence variables
        $pool = $this->getInstance();
        $pool->setLabel($data['label']);
        $pool->setSpecimenIds($data['specimenIds']);
        $pool->setCenterId($data['centerId']);
        $pool->setDate($data['date']);
        $pool->setTime($data['time']);
    }
}
