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
    /**
     * Global variable $db
     *
     * @access public
     */
    public $db;

    /**
     * Initializes a new instance of the ContainerDAO Class
     *
     * @param object $database Instance of the LORIS Database class
     */
    function __construct($database) 
    {
        $this->db=$database;
    }

    /** 
     * This method is used when the DAO class needs to create new Container 
     * instance.
     * 
     * @return object ContainerTO
     */
    public function createContainer() : ContainerTO
    {
        return new ContainerTO();
    }

    /** 
     * This method creates a Container instance from the result of a database 
     * query of the biobank_container table. 
     *
     * @param  array  $containerData Array from which a ContainerTO will be instantiated
     * @return object $container
     */
    public function createContainerFromQuery(array $containerData) : ContainerTO
    {
        $container = $this->createContainer();
        $this->fromSQL($container, $containerData);
        
        return $container;
    }

    /** 
     * This will load all container persistence variables from the database for a
     * given $id into a ContainerTO object, and return the object.
     *
     * @param  int    $id        Value of the $id for the ContainerTO that will be
     *                           instantiated.
     * @return object $container Instance of ContainerTO class.
     */
    public function getContainerFromId(int $id) : ContainerTO
    {
        $query = 'SELECT bc.ContainerID,
                         bc.Barcode,
                         bc.ContainerTypeID,
                         bct.ContainerCapacityID,
                         bct.ContainerDimensionID,
                         bc.ContainerStatusID,
                         bc.Temperature,
                         bc.OriginCenterID,
                         bc.CurrentCenterID,
                         bcp.ParentContainerID,
                         bcp.Coordinate,
                         bc.DateTimeUpdate,
                         bc.DateTimeCreate,
                         bc.Comments
                  FROM biobank_container bc
                  LEFT JOIN biobank_container_parent bcp
                    USING (ContainerID)
                  JOIN biobank_container_type bct
                    USING (ContainerTypeID)
                  WHERE bc.ContainerID=:i';
        $result = $this->db->pselectrow($query, array('i' => $id));
        $container = $this->createContainerFromQuery($result);
        
        $childContainerIds = $this->getChildContainerIds($container);
        if (!empty($childContainerIds)) {
            $container->setChildContainerIds($childContainerIds);
        }

        return $container;
    }

    /**
     * This method load all container contents from the database for a given $barcode.
     *
     * @param  string $barcode  Value of the $barcode for the 
     *                          ContainerTO that will be instantiated
     * @return object $container
     */
    public function getContainerFromBarcode(string $barcode) : ContainerTO
    {
        $id        = $this->getContainerIdFromBarcode($barcode);
        $container = $this->getContainerFromId($id);
        
        return $container;
    }

    public function getBarcodeFromContainerId(int $id) : string
    {
        if (!isset($id) || empty($id)) {
            return false;
        }
    
        $query  = 'SELECT Barcode
                   FROM biobank_container
                   WHERE ContainerID=:i';
        $barcode = $this->db->pselectOne($query, array('i'=>$id));
        
        if (empty($barcode)) {
        return false;
        }
        
        return $barcode;
    }
    
    public function getContainerIdFromBarcode(string $barcode) 
    {
        if (!isset($barcode) || empty($barcode)) {
        	return false;
        }
        
        $query  = "SELECT ContainerID
                   FROM biobank_container
                   WHERE Barcode=:bc";
        $containerId = $this->db->pselectOne($query, array('bc'=>$barcode));       
        
        if (empty($containerId)) {
            return false;
        }
        
        return $containerId;
    }

    public function getChildContainerIds(ContainerTO $container)
    {
         $containerId = $container->getId();
         $query = 'SELECT ContainerID
                   FROM biobank_container_parent
                   WHERE ParentContainerID=:i';
         $childContainerIds = $this->db->pselectcol($query, array('i'=>$containerId));
    
         return $childContainerIds;
    }

    public function getChildContainers(ContainerTO $container)
    {
        $childContainerIds = $container->getChildContainerIds();

        if (isset($childContainerIds)) {
            $childContainers = array();
            foreach ($childContainerIds as $id) {
                $childContainers[$id] = $this->getContainerFromId($id);
            }

            return $childContainers;
        }
    }

    public function getParentContainer(ContainerTO $container)
    {
        $parentContainerId = $container->getParentContainerId();

        if (isset($parentContainerId)) {
            $parentContainer = $this->getContainerFromId($parentContainerId);	
            return $parentContainer;
        }
    }

    public function getAllParentContainers(ContainerTO $container) 
    {
        $parentContainers = array();
    
        $parentContainer = $this->getParentContainer($container);
        while (isset($parentContainer)) {
            $parentContainers[] = $parentContainer;
            $parentContainer = $this->getParentContainer($parentContainer);
        }   
        
        return $parentContainers;
    }

    public function selectContainers(array $conditions = null) {
        $query = 'SELECT ContainerID
                  FROM biobank_container
                  LEFT JOIN biobank_container_parent
                    USING (ContainerID)
                  JOIN biobank_container_type
                    USING (ContainerTypeID)';
        $query .= $conditions ? ' WHERE '.$this->db->_implodeWithKeys(' AND ', $conditions) : '';
    
        $result = $this->db->pselect($query, array());
        $containers = array();
        if(!empty($result)) {
        		foreach ($result as $row) {
                $id = $row['ContainerID'];
                $container = $this->getContainerFromId($id);
                $containers[$id] = $container;
        		}
        }

        return $containers;
	  }	
	
    //TODO: this may be deprecated since it is not being used anywhere
    public function getContainerFromSpecimen(SpecimenTO $specimen) : ContainerTO
    {
        $containerId = $specimen->getContainerId();

        if (isset($containerId)) {
            $container = $this->getContainerFromId($containerId);
            return $container;
        }
    }


    public function getContainerTypes(array $conditions = null) {
        $query  = 'SELECT ContainerTypeID as id,
                          Type as type,
                          Descriptor as descriptor,
                          Label as label,
                          `Primary` as `primary`,
                          ContainerCapacityID as capacityId,
                          ContainerDimensionID as dimensionId
                   FROM biobank_container_type';
        $query .= $conditions ? ' WHERE '.$this->db->_implodeWithKeys(' AND ', $conditions) : null;
        $containerTypes = $this->db->pselectWithIndexKey($query, array(), 'id');
        
        return $containerTypes;
    }

    public function getContainerCapacities() {
        $query  = 'SELECT ContainerCapacityID as id,
                          Quantity as quantity,
                          UnitID as unitId 
                  FROM biobank_container_capacity';
        $containerTypes = $this->db->pselectWithIndexKey($query, array(), 'id');

        return $containerTypes;
    }

    public function getContainerUnits() {
        $query = "SELECT UnitID as id,
                         Label as unit 
                  FROM biobank_unit";
        $containerUnits = $this->db->pselectWithIndexKey($query, array(), 'id');

        return $containerUnits;
    }

    public function getContainerDimensions() {
        $query = "SELECT ContainerDimensionID as id,
                         X as x,
                         Y as y,
                         Z as z 
                  FROM biobank_container_dimension";
        $containerDimensions = $this->db->pselectWithIndexKey($query, array(), 'id');
        
        return $containerDimensions;
    }

    public function getContainerStati() {
        $query = "SELECT ContainerStatusID as id,
                         Label as status
                  FROM biobank_container_status";
        $containerStati = $this->db->pselectWithIndexKey($query, array(), 'id');
        
        return $containerStati;
    }

    public function getContainerCoordinates() {
        $query = "SELECT ContainerID as childContainerId,
                         ParentContainerID as parentContainerId,
                         Coordinate as coordinate
                  FROM   biobank_container_parent";
        $result = $this->db->pselect($query, array());
        $containerCoordinates = array();
        foreach($result as $row) {
            if (empty($row['coordinate'])) {
                $containerCoordinates[$row['parentContainerId']]['Unassigned'][] =
                    $row['childContainerId'];
            }
            else {
                $containerCoordinates[$row['parentContainerId']][$row['coordinate']] =
                    $row['childContainerId'];
            }
        }

        return $containerCoordinates;
    }

    public function saveContainer(ContainerTO $newContainer) 
    {
        $data = $this->toSQL($newContainer);
 
        $this->db->insertOnDuplicateUpdate(
            'biobank_container',
            $data['containerData']
        );

        $containerId = $newContainer->getId();
        if (isset($containerId)) {
            $oldContainer = $this->getContainerFromId($containerId);

            $oldParentContainerId = $oldContainer->getParentContainerId();
            if (isset($oldParentContainerId) && !isset($parentContainerId)) {
                $this->db->delete(
                    'biobank_container_parent',
                    array('ContainerID' => $containerId)
                );
            }
        } else {
            $containerId = $this->db->getLastInsertId();
            $data['parentData']['ContainerID'] = $containerId;
        }

        $parentContainerId = $newContainer->getParentContainerId();
        if (isset($parentContainerId)) {
            $this->db->insertOnDuplicateUpdate(
                'biobank_container_parent',
                $data['parentData']
            );       
        }

        //TODO: this if statement will eventually be equalmapping(temperature);
        if (true) {
            $temperature = $newContainer->getTemperature();
            $this->cascadeToChildren($newContainer, 'Temperature', $temperature);
        }

        if (true) {
           $statusId = $newContainer->getStatusId();
           $this->cascadeToChildren($newContainer, 'ContainerStatusID', $statusId);
        }

        if (true) {
          $locationId = $newContainer->getLocationId();
          $this->cascadeToChildren($newContainer, 'CurrentCenterID', $locationId);
        }

        //TODO: not sure if this is good practice
        return $containerId;
    }

    private function cascadeToChildren(ContainerTO $container, string $field, $value)
    {
        $childContainers = $this->getChildContainers($container);
        
        if (isset($childContainers)) {   
            foreach($childContainers as $id=>$childContainer) {
                $data = $this->toSQL($childContainer);
                $data['containerData'][$field] = $value;
                $this->db->insertOnDuplicateUpdate(
                    'biobank_container',
                    $data['containerData']
                );
                
                $this->cascadeToChildren($childContainer, $field, $value);
            }
        }
    }

    private function toSQL(ContainerTO $container)
    {
         $containerData = array(
             'ContainerID'       => $container->getId(),
             'Barcode'           => $container->getBarcode(),
             'ContainerTypeID'   => $container->getTypeId(),
             'Temperature'       => $container->getTemperature(),
             'ContainerStatusID' => $container->getStatusId(),
             'OriginCenterID'    => $container->getOriginId(),
             'CurrentCenterID'   => $container->getLocationId(),
             'DateTimeCreate'    => $container->getDateTimeCreate(),
             'Comments'          => $container->getComments(),
         );
 
         $parentData = array(
             'ContainerID'       => $container->getId(),
             'ParentContainerID' => $container->getParentContainerId(),
             'Coordinate'        => $container->getCoordinate(),
         );

         return $data = array(
             'containerData' => $containerData,
             'parentData'    => $parentData
         );
    }

    private function fromSQL(ContainerTO $container, array $containerData)
    {
        if (isset($containerData['ContainerID'])) {
            $container->setId($containerData['ContainerID']);
        }
        if (isset($containerData['Barcode'])) {
            $container->setBarcode($containerData['Barcode']);
        }
        if (isset($containerData['ContainerTypeID'])) {
            $container->setTypeId($containerData['ContainerTypeID']);
        }
        //TODO: Capacity and Dimension may want to be removed because they are not
        // in biobank_container
        if (isset($containerData['ContainerCapacityID'])) {
            $container->setCapacityId($containerData['ContainerCapacityID']);
        }
        if (isset($containerData['ContainerDimensionID'])) {
            $container->setDimensionId($containerData['ContainerDimensionID']);
        }
        if (isset($containerData['Temperature'])) {
            $container->setTemperature($containerData['Temperature']);
        }
        if (isset($containerData['ContainerStatusID'])) {
            $container->setStatusId($containerData['ContainerStatusID']);
        }
        if (isset($containerData['OriginCenterID'])) {
            $container->setOriginId($containerData['OriginCenterID']);
        }
        if (isset($containerData['CurrentCenterID'])) {
            $container->setLocationId($containerData['CurrentCenterID']);
        }
        if (isset($containerData['ParentContainerID'])) {
            $container->setParentContainerId($containerData['ParentContainerID']);
        }
        if (isset($containerData['Coordinate'])) {
            $container->setCoordinate($containerData['Coordinate']);
        }
        if (isset($containerData['DateTimeCreate'])) {
            $container->setDateTimeCreate($containerData['DateTimeCreate']);
        }
        if (isset($containerData['Comments'])) {
            $container->setComments($containerData['Comments']);
        }
    }
}
