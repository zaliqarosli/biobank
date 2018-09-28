<?php

namespace LORIS\biobank;

/**
 * Container Data Access Object (DAO) Class
 * This class contains all database handling that is needed to
 * permanently store and retrieve Container Object instances
 *
 * PHP Version 7.0
 *
 * @category Loris
 * @package  Biobank
 * @author   Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris/
 */

class ContainerDAO extends \LORIS\Data\ProvisionerInstance
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
     * This method is used when the DAO class needs to create a new Container 
     * instance.
     * 
     * @return object Container
     */
    public function createContainer() : Container
    {
        return new Container();
    }

    /** 
     * This method creates a Container instance from the result of a database 
     * query of the biobank_container table. 
     *
     * @param  array  $containerData Array from which a Container will be instantiated
     * @return object $container
     */
    public function createContainerFromQuery(array $containerData) : Container
    {
        $container = $this->createContainer();
        $this->fromSQL($container, $containerData);
        
        return $container;
    }

    /** 
     * This will load all container persistence variables from the database for a
     * given $id into a Container object, and return the object.
     *
     * @param  int    $id        Value of the $id for the Container that will be
     *                           instantiated
     * @return object $container Instance of Container Object
     */
    public function getContainerFromId(int $id) : Container
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
        
        //Loading Child Container IDs into the Container Object, if they exist.
        $childContainerIds = $this->getChildContainerIds($container);
        if (!empty($childContainerIds)) {
            $container->setChildContainerIds($childContainerIds);
        }

        return $container;
    }

    /**
     * This retrieves an array of all the Child Container IDs associated with
     * the give Container Object from the biobank_container_parent table.
     *
     * @param object $container         Instance of Container Object
     *
     * @return array $childContainerIds List of Container Object IDs that are 
     *                                  children of the Container Object
     *
     */
    public function getChildContainerIds(Container $container)
    {
         $containerId = $container->getId();
         $query = 'SELECT ContainerID
                   FROM biobank_container_parent
                   WHERE ParentContainerID=:i';
         $childContainerIds = $this->db->pselectcol($query, array('i'=>$containerId));
    
         return $childContainerIds;
    }

    // XXX: Currently this function is never used with any conditions passed as 
    // parameters. Decide if this is a necessary feature.
    /**
     * This will select all containers from the database that match the
     * attribute values passed by $conditions and will return an array
     * of container objects.
     *
     * @param  array $conditions Conditions to be met by the query
     *
     * @return array $containers List of Container Objects that match the query
     */
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
	
    /**
     * This wrapper function returns the associated Container Object for a given
     * Specimen Object.
     *
     * @param  object $specimen  Specimen Object in question
     *
     * @return object $container Associated Container Object
     *
     */
    public function getContainerFromSpecimen(Specimen $specimen) : Container
    {
        $containerId = $specimen->getContainerId();

        if (isset($containerId)) {
            $container = $this->getContainerFromId($containerId);
            return $container;
        } else {
            // XXX: An Error should probably be thrown here, since specimens 
            // should always have an associated container
        }
    }

    // XXX: The conditions parameter is only used to differentiate primary types
    // from non primary types. Decide if this is a front-end concern.
    /**
     * Queries all rows of the biobank_container_type table and returns a nested
     * array with the ID field as the index. Conditions may be passed to filter
     * the results
     *
     * @param  array $conditions     Conditions to be met by the query
     *
     * @return array $containerTypes All data concerning each container type
     */
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

    // XXX: Althought container capacities were at first thought to be important
    // in the design of this entity, they are not being used in any way throughout
    // the module. Decide if container capacities are still important, or if they should 
    // be deprecated. 
    /**
     * Queries all rows of the biobank_container_capacity table and returns a 
     * nested array with the ID field as the index.
     *
     * @return array $containerCapacities All data concerning each container capacity
     */
    public function getContainerCapacities() {
        $query  = 'SELECT ContainerCapacityID as id,
                          Quantity as quantity,
                          UnitID as unitId 
                  FROM biobank_container_capacity';
        $containerCapacities = $this->db->pselectWithIndexKey($query, array(), 'id');

        return $containerCapacities;
    }

    // XXX: Although container units were at first thought to be important
    // in the design of this entity, they are only being used by Specimen Objects
    // in this module. Decide if container units are still important, or if they 
    // should be deprecated. 
    /**
     * Queries all rows of the biobank_unit table and returns a 
     * nested array with the ID field as the index.
     *
     * @return array $containerUnits All data concerning each unit
     */
    public function getContainerUnits() {
        $query = "SELECT UnitID as id,
                         Label as unit 
                  FROM biobank_unit";
        $containerUnits = $this->db->pselectWithIndexKey($query, array(), 'id');

        return $containerUnits;
    }

    /**
     * Queries all rows of the biobank_container_dimension table and returns a 
     * nested array with the ID field as the index.
     *
     * @return array $containerDimensions All data concerning each container dimension
     */
    public function getContainerDimensions() {
        $query = "SELECT ContainerDimensionID as id,
                         X as x,
                         Y as y,
                         Z as z 
                  FROM biobank_container_dimension";
        $containerDimensions = $this->db->pselectWithIndexKey($query, array(), 'id');
        
        return $containerDimensions;
    }

    /**
     * Queries all rows of the biobank_container_status table and returns a 
     * nested array with the ID field as the index.
     *
     * @return array $containerStati All data concerning each container status
     */
    public function getContainerStati() {
        $query = "SELECT ContainerStatusID as id,
                         Label as status
                  FROM biobank_container_status";
        $containerStati = $this->db->pselectWithIndexKey($query, array(), 'id');
        
        return $containerStati;
    }

    /**
     * Queries all rows of the biobank_container_parent table and returns a 
     * nested array with the Parent Container ID field as the first index, the 
     * coordinate value as the second index, and the Child Container ID as the value 
     * If there is no coordinate, the string 'Unassigned' serves as the second
     * index.
     *
     * @return array $containerCoordinates A Nested array of Child Container IDs
     *                                     indexed by Parent Container ID and 
     *                                     Coordinate value or Unassigned.
     */
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

    /**
     *
     *
     *
     *
     *
     */
    public function saveContainer(Container $newContainer) 
    {
        // Converts Container Object into SQL format.
        $data = $this->toSQL($newContainer);
 
        // Inserts or Updates the biobank_container table with given data.
        $this->db->insertOnDuplicateUpdate(
            'biobank_container',
            $data['containerData']
        );

        
        $containerId = $newContainer->getId();
        // If update:
        if (isset($containerId)) {
            $oldContainer = $this->getContainerFromId($containerId);
            $oldParentContainerId = $oldContainer->getParentContainerId();
            // If there is no longer an associated Parent Container ID, delete
            // it from the entry from the biobank_container_parent table.
            if (isset($oldParentContainerId) && !isset($parentContainerId)) {
                $this->db->delete(
                    'biobank_container_parent',
                    array('ContainerID' => $containerId)
                );
            }
        // If insert:
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

        //DO: this if statement will eventually be equalmapping(temperature);
        if (true) {
            $temperature = $newContainer->getTemperature();
            $this->cascadeToChildren($newContainer, 'Temperature', $temperature);
        }

        if (true) {
           $statusId = $newContainer->getStatusId();
           $this->cascadeToChildren($newContainer, 'ContainerStatusID', $statusId);
        }

        if (true) {
          $centerId = $newContainer->getCenterId();
          $this->cascadeToChildren($newContainer, 'CurrentCenterID', $centerId);
        }

        //DO: not sure if this is good practice
        return $containerId;
    }

    private function cascadeToChildren(Container $container, string $field, $value)
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

    public function getChildContainers(Container $container)
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


    private function toSQL(Container $container)
    {
         $containerData = array(
             'ContainerID'       => $container->getId(),
             'Barcode'           => $container->getBarcode(),
             'ContainerTypeID'   => $container->getTypeId(),
             'Temperature'       => $container->getTemperature(),
             'ContainerStatusID' => $container->getStatusId(),
             'OriginCenterID'    => $container->getOriginId(),
             'CurrentCenterID'   => $container->getCenterId(),
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

    private function fromSQL(Container $container, array $containerData)
    {
        //XXX: Look into whether permissions should be checked here, or by the
        //controller later on. It is likely the role of the filter to be removing
        //the parentContainerId, but I can't currently get it to work.
        $user = \User::singleton();
        if (isset($containerData['ContainerID'])) {
            $container->setId($containerData['ContainerID']);
        }
        if (isset($containerData['Barcode'])) {
            $container->setBarcode($containerData['Barcode']);
        }
        if (isset($containerData['ContainerTypeID'])) {
            $container->setTypeId($containerData['ContainerTypeID']);
        }
        //DO: Capacity and Dimension may want to be removed because they are not
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
            $container->setCenterId($containerData['CurrentCenterID']);
        }
        if (isset($containerData['ParentContainerID'])
               && $user->hasPermission('biobank_container_view')) {
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

    protected function getAllInstances() : \Traversable
    {
        //XXX: Look into permissions should be checked here, or by the controller.
        // It is likely the role of the filter to be deciding what to provision,
        // but I can't get the filter to work.
        $user = \User::singleton();
        if ($user->hasPermission('biobank_container_view') &&
            $user->hasPermission('biobank_specimen_view')) {
            return new \ArrayIterator($this->selectContainers());
        } else if ($user->hasPermission('biobank_container_view')) {
            return new \ArrayIterator($this->selectContainers(['Primary' => 0]));
        } else if ($user->hasPermissino('biobank_specimen_view')) {
            return new \ArrayIterator($this->selectContainers(['Primary' => 1]));
        }
    }
}
