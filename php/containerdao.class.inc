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

		$query 	= "SELECT * FROM biobank_container ";
		$query .= "WHERE id=".$id;
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
		
		$query  = "SELECT * FROM biobank_container ";
		$query .= "WHERE ".$conditions;
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
		    $query  = "SELECT * FROM biobank_container ";
		    $query .= "WHERE id=".$parentContainerId;
		    $result = $db->pselectrow($query, array());
			
			$parentContainer = ContainerDAO::createContainerFromQuery($result);	
	
			return $parentContainer;
		}
	}

	public function getContainerTypesNonPrimary() {
		$query  = "SELECT * FROM biobank_container_type ";
        $query .= "WHERE `primary`=0";
		$containerTypesNonPrimary = ContainerDAO::queryToArray($query);
		
		return $containerTypesNonPrimary;
	}

    public function getContainerTypesPrimary() {
        $query  = "SELECT * FROM biobank_container_type ";
        $query .= "WHERE `primary`=1";
        $containerTypesPrimary = ContainerDAO::queryToArray($query);

        return $containerTypesPrimary;
    }

	public function getContainerCapacities() {
		$query  = "SELECT * FROM biobank_container_capacity";
		$containerTypes = ContainerDAO::queryToArray($query);

		return $containerTypes;
	}

    public function getContainerUnits() {
        $query = "SELECT * FROM biobank_container_unit";
        $containerUnits = ContainerDAO::queryToArray($query);

        return $containerUnits;
    }

	public function getContainerDimensions() {
		$query = "SELECT * FROM biobank_container_dimension";
		$containerDimensions = ContainerDAO::queryToArray($query);

		return $containerDimensions;
	}

	public function getContainerStati() {
		$query = "SELECT * FROM biobank_container_status";
		$containerStati = ContainerDAO::queryToArray($query);
		
		return $containerStati;
	}

	public function getContainerLoci() {
		$query = "SELECT * FROM biobank_container_locus";
		$containerLoci = ContainerDAO::queryToArray($query);
		
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

	private function queryToArray(string $query) {
		$db = \Database::singleton();
		$result = $db->pselect($query, array());

        $info = array();
		foreach($result as $row) {
			foreach($row as $column=>$value) {
		        	if ($column!='id') {
					$info[$row['id']][$column] = $value;
				}
			}
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
	    $query  = "SELECT id FROM biobank_container ";
	    $query .= "WHERE barcode=:bc";
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
	    $query  = "SELECT barcode FROM biobank_container ";
	    $query .= "WHERE id=:i";
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
             $containerData['id']                  = $container->getId;
         }
         if (isset($container->getBarcode)) {
             $containerData['barcode']             = $container->getBarcode;
         }
         if (isset($container->getTypeId)) {
             $containerData['type_id']             = $container->getTypeId;
         }
         if (isset($container->getStatusId)) {
             $containerData['status_id']           = $container->getStatusId;
         }
         if (isset($container->getLocusId)) {
             $containerData['locus_id']            = $container->getLocusId;
         }
         if (isset($container->getParentContainerId)) {
             $containerData['parent_container_id'] = $container->getParentContainerId;
         }
         if (isset($container->getTimeUpdate)) {
             $containerData['time_update']         = $container->getTimeUpdate;
         }
         if (isset($container->getTimeCreate)) {
             $containerData['time_create']        = $container->getTimeCreate;
         }
         if (isset($container->getNotes)) {
             $containerData['notes']               = $container->getNotes;
         }
 
         return $containerData;
     }

     /**
      *
      *
      */
     private static function fromSQL(ContainerTO $container, array $containerData)
     {
        $container->setId($containerData['id']);
        $container->setBarcode($containerData['barcode']);
        $container->setTypeId($containerData['type_id']);
        $container->setStatusId($containerData['status_id']);
        $container->setLocusId($containerData['locus_id']);
        if (isset($containerData['parent_container_id'])) {
			$container->setParentContainerId($containerData['parent_container_id']);
		}
        $container->setTimeUpdate($containerData['time_update']);
        $container->setTimeCreate($containerData['time_create']);
        if (isset($containerData['notes'])) {
			$container->setNotes($containerData['notes']);
		}
     }

}
