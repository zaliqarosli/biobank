<?php

/**
 *
 * PHP Version 5
 *
 * @category Loris
 * @package  Biobank
 * @author   Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/CCNA/
 */

namespace LORIS\biobank;
include 'containerto.class.inc';

/**
 * Container Data Acces Object (DAO) Class
 * This class contains all database handling that is needed to
 * permanently store and retrieve Container Transfer Object instances
 *
 * @category Loris
 * @package  Biobank
 * @author   Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/CCNA/
 */


class ContainerDAO {

	/**
	 * createContainerObject-method. This method is used when the Dao class needs 
	 * to create new value container instance. The reason why this method exists
	 * is that sometimes the programmer may want to extend also the containerTO
	 * and then this method can be overrided to return extended containerTO.
	 * NOTE: If you extend the containerTO class, make sure to override the
	 * clone() method in it!
	 */
	private function createContainer() {
		
		return new ContainerTO();
	}

	private function createContainerFromId(int $id) {
		$container = ContainerDAO::createContainer();
		$container->setId($id);
		
		return $container;
	}

	private function createContainerFromQuery(array $containerData) {
		$container = ContainerDAO::createContainer();
		ContainerDAO::fromSQL($container, $containerData);
		
		return $container;
	}

	/**
	 * loadContainer-method. This will load containerTO contents from database
	 * Upper layer should use this so that containerTO
	 * instance is created and only primary-key should be specified. Then call
	 * this method to complete other persistent information. This method will
	 * overwrite all other fields except primary-key and possible runtime variables.
	 * If load can not find matching row, NotFoundException will be thrown.
	 *
	 * @param conn		This method requires working database connection.
	 * @param valueObject	This paramter contains the class instance to be loaded.
	 *			Primary-key field must be set for this to work properly.
	 */

	public static function getContainerFromId(int $id) {
		$db = \Database::singleton();

		$query 	= "SELECT * FROM biobank_container
                   WHERE ID=".$id;
		$result = $db->pselectrow($query, array());
	
		$container = ContainerDAO::createContainerFromQuery($result);

		return $container;
	}

	public static function getContainerFromBarcode(string $barcode)
	{
		$id        = ContainerDAO::getContainerIdFromBarcode($barcode);
		$container = ContainerDAO::getContainerFromId($id);

		return $container;
	}

	public static function selectContainers(array $containerData) {
		$db = \Database::singleton();
		$conditions = $db->_implodeWithKeys(' AND ', $containerData);
		
		$query  = "SELECT * FROM biobank_container
                   WHERE ".$conditions;
	 	$result = $db->pselect($query, array());

		$containers = array();
		if(!empty($result)) {
			foreach ($result as $row) {
				$containers[] = $this->createContainerFromQuery($row);
			}
		}
		return $containers;
	 }	
	
	public static function getContainerFromSpecimen(SpecimenTO $specimen) {
        $containerId = $specimen->getContainerId();

        if (isset($containerId)) {
            $container = ContainerDAO::getContainerFromId($containerId);
            return $container;
        }
    }

	public static function getParentContainer(ContainerTO &$container) {
		$db = \Database::singleton();
		$parentContainerId = $container->getParentContainerId();
		
		if (isset($parentContainerId)) {
		    $query  = "SELECT * FROM biobank_container
                       WHERE ID=".$parentContainerId;
		    $result = $db->pselectrow($query, array());
			
			$parentContainer = ContainerDAO::createContainerFromQuery($result);	
	
			return $parentContainer;
		}
	}

    ////////////////////////////////////////////////////////////////////////////////////////
    // Refactor - there may be a better way to accomplish this through instantiating a container object
    // or through using commands involving getting barcode and ID
    // the goal here is is to get and ID to Barcode relationship
    // -- the goal may actually be to use the selectContainers by passing it an array of non-primary container types
    public function getContainersNonPrimary() {
        $query = "SELECT bc.ID as id, Barcode as barcode, TypeID as typeId,
                    StatusID as statusId, LocusID as locusId, ParentContainerID as parentContainerId,
                    DateTimeUpdate as dateTimeUpdate, CreateDate as createDate, CreateTime as createTime,
                    Notes as notes
                  FROM biobank_container bc
                  JOIN biobank_container_type bct ON bc.TypeID=bct.ID
                  WHERE bct.Primary=0";
        $containersNonPrimary = ContainerDAO::queryToArray($query, 'id');
       
        return $containersNonPrimary;
    }

    public function getContainersPrimary() {
        $query = "SELECT * FROM biobank_container bc
                  JOIN biobank_container_type bct ON bc.TypeID=bct.ID
                  WHERE bct.Primary=1";
        $containersPrimary = ContainerDAO::queryToArray($query, 'ID');
       
        return $containersPrimary;
    }
    ////////////////////////////////////////////////////////////////////////////////////////

	public function getContainerTypes(int $primary) {
		$query  = "SELECT ID as id, Type as type, Descriptor as descriptor,
                     Label as label, `Primary` as `primary`, CapacityID as capacityId,
                     DimensionID as dimensionId
                   FROM biobank_container_type
                   WHERE `Primary`=:p";
		$containerTypes = ContainerDAO::queryToArray($query, 'id',  array('p'=>$primary));
		
		return $containerTypes;
	}

    //public function getContainerTypesPrimary() {
    //    $query  = "SELECT * FROM biobank_container_type
    //               WHERE `Primary`=1";
    //    $containerTypesPrimary = ContainerDAO::queryToArray($query, array(), 'ID');

    //    return $containerTypesPrimary;
    //}

	public function getContainerCapacities() {
		$query  = "SELECT ID as id, Quantity as quantity, UnitID as unitId 
                   FROM biobank_container_capacity";
		$containerTypes = ContainerDAO::queryToArray($query, 'id');

		return $containerTypes;
	}

    public function getContainerUnits() {
        $query = "SELECT ID as id, Unit as unit 
                  FROM biobank_unit";
        $containerUnits = ContainerDAO::queryToArray($query, 'id');

        return $containerUnits;
    }

	public function getContainerDimensions() {
		$query = "SELECT ID as id, X as x, Y as y, Z as z 
                  FROM biobank_container_dimension";
		$containerDimensions = ContainerDAO::queryToArray($query, 'id');

		return $containerDimensions;
	}

	public function getContainerStati() {
		$query = "SELECT ID as id, Status as status
                  FROM biobank_container_status";
		$containerStati = ContainerDAO::queryToArray($query, 'id');
		
		return $containerStati;
	}

    //POTENTIALLY REMOVE STATUS
	public function getContainerLoci() {
		$query = "SELECT ID as id, LocationID as locationId, DestinationID as destinationId,
                    OriginID as originId, Status as status
                  FROM biobank_container_locus";
		$containerLoci = ContainerDAO::queryToArray($query, 'id');
		
		return $containerLoci;
	}

    public function getSiteInfo() {
        $db = \Database::singleton();
        $query = "SELECT * FROM psc";
        $result = $db->pselect($query, array());
  
        foreach($result as $row) {
            foreach($row as $column=>$value) {
                if ($column!='CenterID') {
                    $containerSites[$row['CenterID']][$column] = $value;
                }
            }
        }

        return $containerSites;
    }

	private function queryToArray(string $query, string $primaryKey, array $condition=array()) {
		$db = \Database::singleton();
		$result = $db->pselect($query, $condition);

        $info = array();
		foreach($result as $row) {
            $info[$row[$primaryKey]] = $row;
            unset($info[$row[$primaryKey]][$primaryKey]); 
		}
		
		return $info;
	}		

	/**
	 * create-method. This will create new row in database according to supplied
	 * containerTO contents. Make sure that values for all NOT NULL columns are
	 * correctly specified. Also, if this table does not use automatic surrage-keys
	 * the primary-key must be specified. After INSERT command this method will
	 * read the generated primary-key back to containerTO if automatic surrage-keys
	 * were used.
	 *
	 * @param containerTO 	This parameter containes the class instance to be create.
	 *				If automatic surrogate-keys are not used the Primary-key
	 *				field must be set for this to work properly.
	 */
	private function insertContainer(ContainerTO $container) {
		$db = \Database::singleton();
		$containerData = ContainerDAO::toSQL($container);
		$db->insert('biobank_container', $containerData);

	    return true;
	}

	/**
	 * save-method. This method will save the current state of containerTO to database.
	 * Save can not be used to create new instances in database, so upper layer must
	 * make sure that the primary-key is correctly specified. Primary-key will indicate
	 * which instance is going to be updated in database. If save can not find matching
	 * row, NotFoundException will be thrown.
	 *
	 * @param containerTO	This parameter contains the class instance to be saved.
	 *		Primary-key field must be set to work properly.
	 */
	private function updateContainer(ContainerTO $container) {
		$db = \Database::singleton();
		$containerData = ContainerDAO::toSQL($container);
		$db->update('biobank_container', $containerData, array('id' => $container->getId()));

		//should return false if did not work
		return true;
	}
	
	public static function getContainerIdFromBarcode(string $barcode) 
	{
		if (!isset($barcode) || empty($barcode)) {
			return false;
		}

		$db = \Database::singleton();
	    $query  = "SELECT ID FROM biobank_container ";
	    $query .= "WHERE Barcode=:bc";
	    $containerId = $db->pselectOne($query, array('bc'=>$barcode));       
	    
	    if (empty($containerId)) {
	        return false;
	    }
	    
	    return $containerId;
	}

	public static function getBarcodeFromContainerId(int $id) 
	{
		if (!isset($id) || empty($id)) {
			return false;
		}
	
		$db = \Database::singleton();
	    $query  = "SELECT Barcode FROM biobank_container ";
	    $query .= "WHERE ID=:i";
	    $barcode = $db->pselectOne($query, array('i'=>$id));

	    if (empty($barcode)) {
			return false;
	    }

	    return $barcode;
	}

     /**
      * toSQL will return an Array representing the stat of the Container for the purpose
      * of sending it to the databse
      */
     private static function toSQL(ContainerTO $container)
     {
         $containerData = array();
         if (isset($container->getId)) {
             $containerData['ID']                  = $container->getId;
         }
         if (isset($container->getBarcode)) {
             $containerData['Barcode']             = $container->getBarcode;
         }
         if (isset($container->getTypeId)) {
             $containerData['TypeID']             = $container->getTypeId;
         }
         if (isset($container->getStatusId)) {
             $containerData['StatusID']           = $container->getStatusId;
         }
         if (isset($container->getLocusId)) {
             $containerData['LocusID']            = $container->getLocusId;
         }
         if (isset($container->getParentContainerId)) {
             $containerData['ParentContainerID'] = $container->getParentContainerId;
         }
         if (isset($container->getDateTimeUpdate)) {
             $containerData['DateTimeUpdate']         = $container->getDateTimeUpdate;
         }
         if (isset($container->getCreateDate)) {
             $containerData['CreateDate']        = $container->getCreateDate;
         }
         if (isset($container->getCreateTime)) {
             $containerData['CreateTime']        = $container->getCreateTime;
         }
         if (isset($container->getNotes)) {
             $containerData['Notes']               = $container->getNotes;
         }
 
         return $containerData;
     }

     /**
      *
      *
      */
     private static function fromSQL(ContainerTO $container, array $containerData)
     {
        $container->setId($containerData['ID']);
        $container->setBarcode($containerData['Barcode']);
        $container->setTypeId($containerData['TypeID']);
        $container->setStatusId($containerData['StatusID']);
        $container->setLocusId($containerData['LocusID']);
        if (isset($containerData['ParentContainerID'])) {
			$container->setParentContainerId($containerData['ParentContainerID']);
		}
        $container->setDateTimeUpdate($containerData['DateTimeUpdate']);
        $container->setCreateDate($containerData['CreateDate']);
        $container->setCreateTime($containerData['CreateTime']);
        if (isset($containerData['Notes'])) {
			$container->setNotes($containerData['Notes']);
		}
     }
}
