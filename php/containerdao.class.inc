<?php

namespace LORIS\biobank;

/**
 * Container Data Acces Object (DAO) Class
 * This class contains all database handling that is needed to
 * permanently store and retrieve Container Transfer Object instances
 *
 * PHP Version 7.0
 *
 * @category Loris
 * @package  Biobank
 * @author   Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris/
 */

class ContainerDAO 
{

    public $db;

    /**
     * Constructor
     */
    function __construct($database) {
        $this->db=$database;
    }

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
		$container = $this->createContainer();
		$container->setId($id);
		
		return $container;
	}

	private function createContainerFromQuery(array $containerData) {
		$container = $this->createContainer();
		$this->fromSQL($container, $containerData);
		
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

	public function getContainerFromId(int $id) {
        $query = "SELECT bc.ID, bc.Barcode, bc.TypeID,
                    bct.CapacityID, bct.DimensionID, bc.StatusID,
                    bc.OriginID, bc.LocationID, bccr.ParentContainerID,
                    bccr.Coordinate, bc.DateTimeUpdate, bc.DateTimeCreate,
                    bc.Comments
                  FROM biobank_container bc
                  LEFT JOIN biobank_container_coordinate_rel bccr ON bc.ID=bccr.ChildContainerID
                  JOIN biobank_container_type bct ON bc.TypeID=bct.ID
                  WHERE bc.ID=:i";
		$result = $this->db->pselectrow($query, array('i' => $id));
	
		$container = $this->createContainerFromQuery($result);

		return $container;
	}

	public function getContainerFromBarcode(string $barcode)
	{
		$id        = $this->getContainerIdFromBarcode($barcode);
		$container = $this->getContainerFromId($id);

		return $container;
	}

	public function selectContainers(array $containerData) {
		$conditions = $this->db->_implodeWithKeys(' AND ', $containerData);
		
        // This seems to be redundancy and may need to be fixed
        $query = "SELECT bc.ID, bc.Barcode, bc.TypeID,
                    bct.CapacityID, bct.DimensionID, bc.StatusID,
                    bc.OriginID, bc.LocationID, bccr.ParentContainerID,
                    bccr.Coordinate, bc.DateTimeUpdate, bc.DateTimeCreate,
                    bc.Comments
                  FROM biobank_container bc
                  LEFT JOIN biobank_container_coordinate_rel bccr ON bc.ID=bccr.ChildContainerID
                  JOIN biobank_container_type bct ON bc.TypeID=bct.ID
                  WHERE ".$conditions;
	 	$result = $this->db->pselect($query, array());

		$containers = array();
		if(!empty($result)) {
			foreach ($result as $row) {
                //This is now indexed by ID - however it may not be the best way to 
                //this. It may be better to use an pselectByIndex();
                $container = $this->createContainerFromQuery($row);
				$containers[$container->getId()] = $container->toArray();
			}
		}

		return $containers;
	 }	
	
	public function getContainerFromSpecimen(SpecimenTO $specimen) {
        $containerId = $specimen->getContainerId();

        if (isset($containerId)) {
            $container = $this->getContainerFromId($containerId);
            return $container;
        }
    }

	public function getParentContainer(ContainerTO &$container) {
		$parentContainerId = $container->getParentContainerId();
		
		if (isset($parentContainerId)) {
		    $query  = "SELECT * FROM biobank_container
                       WHERE ID=".$parentContainerId;
		    $result = $this->db->pselectrow($query, array());
			
			$parentContainer = $this->createContainerFromQuery($result);	
	
			return $parentContainer;
		}
	}

    ////////////////////////////////////////////////////////////////////////////////////////
    // Refactor - there may be a better way to accomplish this through instantiating a container object
    // or through using commands involving getting barcode and ID
    // the goal here is is to get and ID to Barcode relationship
    // -- the goal may actually be to use the selectContainers by passing it an array of non-primary container types
    // THIS WILL EVENTUALLY USE selectContainers INSTEAD
    public function getContainersNonPrimary() {
        $query = "SELECT bc.ID as id, bc.Barcode as barcode, bc.TypeID as typeId,
                    bct.CapacityID as capacityId, bct.DimensionID as dimensionId, 
                    bc.StatusID as statusId, bc.OriginID as originId, bc.LocationID as locationId,
                    bccr.ParentContainerID as parentContainerId, bccr.Coordinate as coordinate,
                    bc.DateTimeUpdate as dateTimeUpdate, bc.DateTimeCreate as dateTimeCreate,
                    bc.Comments as comments
                  FROM biobank_container bc
                  LEFT JOIN biobank_container_coordinate_rel bccr ON bc.ID=bccr.ChildContainerID
                  JOIN biobank_container_type bct ON bc.TypeID=bct.ID
                  WHERE bct.Primary=0";
        $containersNonPrimary = $this->queryToArray($query, 'id');
       
        return $containersNonPrimary;
    }

    public function getContainersPrimary() {
        $query = "SELECT * FROM biobank_container bc
                  JOIN biobank_container_type bct ON bc.TypeID=bct.ID
                  WHERE bct.Primary=1";
        $containersPrimary = $this->queryToArray($query, 'ID');
       
        return $containersPrimary;
    }
    ////////////////////////////////////////////////////////////////////////////////////////

	public function getContainerTypes(int $primary) {
		$query  = "SELECT ID as id, Type as type, Descriptor as descriptor,
                     Label as label, `Primary` as `primary`, CapacityID as capacityId,
                     DimensionID as dimensionId
                   FROM biobank_container_type
                   WHERE `Primary`=:p";
		$containerTypes = $this->queryToArray($query, 'id',  array('p'=>$primary));
		
		return $containerTypes;
	}

	public function getAllContainerTypes() {
		$query  = "SELECT ID as id, Type as type, Descriptor as descriptor,
                     Label as label, `Primary` as `primary`, CapacityID as capacityId,
                     DimensionID as dimensionId
                   FROM biobank_container_type";
		$containerTypes = $this->queryToArray($query, 'id',  array());
		
		return $containerTypes;
	}

	public function getContainerCapacities() {
		$query  = "SELECT ID as id, Quantity as quantity, UnitID as unitId 
                   FROM biobank_container_capacity";
		$containerTypes = $this->queryToArray($query, 'id');

		return $containerTypes;
	}

    public function getContainerUnits() {
        $query = "SELECT ID as id, Unit as unit 
                  FROM biobank_unit";
        $containerUnits = $this->queryToArray($query, 'id');

        return $containerUnits;
    }

	public function getContainerDimensions() {
		$query = "SELECT ID as id, X as x, Y as y, Z as z 
                  FROM biobank_container_dimension";
		$containerDimensions = $this->queryToArray($query, 'id');

		return $containerDimensions;
	}

	public function getContainerStati() {
		$query = "SELECT ID as id, Status as status
                  FROM biobank_container_status";
		$containerStati = $this->queryToArray($query, 'id');
		
		return $containerStati;
	}

    public function getContainerCoordinates() {
        $query = "SELECT ParentContainerID as parentContainerId, 
                    Coordinate as coordinate, ChildContainerID as childContainerId
                  FROM biobank_container_coordinate_rel";
        $result = $this->db->pselect($query, array());
        $containerCoordinates = array();
        foreach($result as $row) {
            if (empty($row['coordinate'])) {
            $containerCoordinates[$row['parentContainerId']]['Unassigned'][] = $row['childContainerId'];
            } else {
              $containerCoordinates[$row['parentContainerId']][$row['coordinate']] = $row['childContainerId'];
            }
        }

        return $containerCoordinates;
    }

    //Not sure if currently in use - may be able to use getSites instead
    public function getSiteInfo() {
        $query = "SELECT * FROM psc";
        $result = $this->db->pselect($query, array());
  
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
		$result = $this->db->pselect($query, $condition);

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
		$containerData = $this->toSQL($container);
		$this->db->insert('biobank_container', $containerData);

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
		$containerData = $this->toSQL($container);
		$this->db->update('biobank_container', $containerData, array('id' => $container->getId()));

		//should return false if did not work
		return true;
	}
	
	public function getContainerIdFromBarcode(string $barcode) 
	{
		if (!isset($barcode) || empty($barcode)) {
			return false;
		}

	    $query  = "SELECT ID FROM biobank_container ";
	    $query .= "WHERE Barcode=:bc";
	    $containerId = $this->db->pselectOne($query, array('bc'=>$barcode));       
	    
	    if (empty($containerId)) {
	        return false;
	    }
	    
	    return $containerId;
	}

	public function getBarcodeFromContainerId(int $id) 
	{
		if (!isset($id) || empty($id)) {
			return false;
		}
	
	    $query  = "SELECT Barcode FROM biobank_container ";
	    $query .= "WHERE ID=:i";
	    $barcode = $this->db->pselectOne($query, array('i'=>$id));

	    if (empty($barcode)) {
			return false;
	    }

	    return $barcode;
	}

     /**
      * toSQL will return an Array representing the stat of the Container for the purpose
      * of sending it to the databse
      */
     private function toSQL(ContainerTO $container)
     {
         $containerData = array();
         if (isset($container->getId)) {
             $containerData['ID']                     = $container->getId;
         }
         if (isset($container->getBarcode)) {
             $containerData['Barcode']                = $container->getBarcode;
         }
         if (isset($container->getTypeId)) {
             $containerData['TypeID']                 = $container->getTypeId;
         }
         if (isset($container->getCapacityId)) {
             $containerData['CapacityID']             = $container->getCapacityId;
         }
         if (isset($container->getDimensionId)) {
             $containerData['DimensionID']            = $container->getDimensionId;
         }
         if (isset($container->getStatusId)) {
             $containerData['StatusID']               = $container->getStatusId;
         }
         if (isset($container->getOriginId)) {
             $containerData['OriginID']               = $container->getOriginId;
         }
         if (isset($container->getLocationId)) {
             $containerData['LocationID']             = $container->getLocationId;
         }
         if (isset($container->getParentContainerId)) {
             $containerData['ParentContainerID']      = $container->getParentContainerId;
         }
         if (isset($container->getCoordinate)) {
             $containerData['Coordinate']             = $container->getCoordinate;
         }
         if (isset($container->getDateTimeUpdate)) {
             $containerData['DateTimeUpdate']         = $container->getDateTimeUpdate;
         }
         if (isset($container->getDateTimeCreate)) {
             $containerData['CreateDate']             = $container->getCreateDate;
         }
         if (isset($container->getComments)) {
             $containerData['Comments']               = $container->getComments;
         }
 
         return $containerData;
     }

     /**
      *
      *
      */
     private function fromSQL(ContainerTO $container, array $containerData)
     {
        if (isset($containerData['ID'])) {
            $container->setId($containerData['ID']);
        }
        if (isset($containerData['Barcode'])) {
            $container->setBarcode($containerData['Barcode']);
        }
        if (isset($containerData['TypeID'])) {
            $container->setTypeId($containerData['TypeID']);
        }
        if (isset($containerData['CapacityID'])) {
            $container->setCapacityId($containerData['CapacityID']);
        }
        if (isset($containerData['DimensionID'])) {
            $container->setDimensionId($containerData['DimensionID']);
        }
        if (isset($containerData['StatusID'])) {
            $container->setStatusId($containerData['StatusID']);
        }
        if (isset($containerData['OriginID'])) {
            $container->setOriginId($containerData['OriginID']);
        }
        if (isset($containerData['LocationID'])) {
            $container->setLocationId($containerData['LocationID']);
        }
        if (isset($containerData['ParentContainerID'])) {
			$container->setParentContainerId($containerData['ParentContainerID']);
		}
        if (isset($containerData['Coordinate'])) {
			$container->setCoordinate($containerData['Coordinate']);
		}
        if (isset($containerData['DateTimeUpdate'])) {
            $container->setDateTimeUpdate($containerData['DateTimeUpdate']);
        }
        if (isset($containerData['DateTimeCreate'])) {
            $container->setDateTimeCreate($containerData['DateTimeCreate']);
        }
        if (isset($containerData['Comments'])) {
			$container->setComments($containerData['Comments']);
		}
     }
}
