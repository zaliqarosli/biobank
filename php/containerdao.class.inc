<?php declare(strict_types=1);
/**
 * Container Data Access Object (DAO) Class
 * This class contains all database handling that is needed to
 * permanently store and retrieve Container Object instances
 *
 * PHP Version 7.2
 *
 * @category   Data
 * @package    Loris
 * @subpackage Biobank
 * @author     Henri Rabalais <henri.rabalais@mcin.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link       https://www.github.com/aces/Loris/
 */
namespace LORIS\biobank;

/**
 * Container Data Access Object (DAO) Class
 * This class contains all database handling that is needed to
 * permanently store and retrieve Container Object instances
 *
 * PHP Version 7.2
 *
 * @category   Data
 * @package    Loris
 * @subpackage Biobank
 * @author     Henri Rabalais <henri.rabalais@mcin.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
  @link       https://www.github.com/aces/Loris/
 */
class ContainerDAO extends \LORIS\Data\ProvisionerInstance
{
    /**
     * Global variable $db
     *
     * @access private
     */
    private $db;

    /**
     * Initializes a new instance of the ContainerDAO Class
     *
     * @param Database $database Instance of the LORIS Database class
     */
    function __construct($database)
    {
        $this->db = $database;
    }

    /**
     * This method is used when the DAO class needs to create a new Container
     * instance.
     *
     * @return Container
     */
    public function getInstance() : Container
    {
        return new Container();
    }

    /**
     * This will load all container persistence variables from the database for a
     * given $id into a Container object, and return the object.
     *
     * @param string $id Value of the $id for the Container that will be
     *                   instantiated
     *
     * @return Container $container Instance of Container Object
     */
    public function getInstanceFromId(string $id) : Container
    {
        $query     = 'SELECT bc.ContainerID,
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
                         bc.DateTimeCreate
                  FROM biobank_container bc
                  LEFT JOIN biobank_container_parent bcp
                    USING (ContainerID)
                  JOIN biobank_container_type bct
                    USING (ContainerTypeID)
                  WHERE bc.ContainerID=:i';
        $result    = $this->db->pselectrow($query, array('i' => $id));
        $container = $this->getInstanceFromQuery($result);

        // Load Child Container IDs into the Container Object.
        $childContainerIds = $this->getChildContainerIds($container);
        $container->setChildContainerIds($childContainerIds);

        return $container;
    }

    /**
     * This retrieves an array of all the Child Container IDs associated with
     * the give Container Object from the biobank_container_parent table.
     *
     * @param Specimen $container Instance of Container Object
     *
     * @return array $childContainerIds List of Container Object IDs that are
     *                                  children of the Container Object
     */
    public function getChildContainerIds(Container $container) : array
    {
         $containerId = $container->getId();
         $query       = 'SELECT ContainerID
                   FROM biobank_container_parent
                   WHERE ParentContainerID=:i';
         $childContainerIds = $this->db->pselectCol($query, array('i' => $containerId));

         return $childContainerIds;
    }

    // XXX: Currently this function is never used with any conditions passed as
    // parameters. Decide if this is a necessary feature.
    /**
     * This will select all containers from the database that match the
     * attribute values passed by $conditions and will return an array
     * of container objects.
     *
     * @param array $conditions Conditions to be met by the query
     *
     * @return array $containers List of Container Objects that match the query
     */
    public function selectInstances(array $conditions = null) : array
    {
        $query  = 'SELECT ContainerID
                  FROM biobank_container
                  LEFT JOIN biobank_container_parent
                    USING (ContainerID)
                  JOIN biobank_container_type
                    USING (ContainerTypeID)';
        $query .= $conditions ? ' WHERE '.$this->db->_implodeWithKeys(' AND ', $conditions) : '';

        $result     = $this->db->pselect($query, array());
        $containers = array();
        if (!empty($result)) {
            foreach ($result as $row) {
                $id        = $row['ContainerID'];
                $container = $this->getInstanceFromId($id);
                $containers[$id] = $container;
            }
        }

        return $containers;
    }

    /**
     * Instantiates an ArrayIterator class that is composed of all the Container
     * Objects.
     *
     * @return traversable Iterator of Container Objects
     */
    protected function getAllInstances() : \Traversable
    {
        return new \ArrayIterator($this->selectInstances());
    }

    /**
     * This wrapper function returns the associated Container Object for a given
     * Specimen Object.
     *
     * @param Specimen $specimen Specimen Object in question
     *
     * @return Container $container Associated Container Object
     */
    public function getInstanceFromSpecimen(Specimen $specimen) : Container
    {
        $containerId = $specimen->getContainerId();

        if (isset($containerId)) {
            $container = $this->getInstanceFromId($containerId);
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
     * @param array $conditions Conditions to be met by the query
     *
     * @return array $containerTypes All data concerning each container type
     */
    public function getTypes(array $conditions = null) : array
    {
        $query  = 'SELECT ContainerTypeID as id,
                          Type as type,
                          Descriptor as descriptor,
                          Label as label,
                          `Primary` as `primary`,
                          ContainerCapacityID as capacityId,
                          ContainerDimensionID as dimensionId
                   FROM biobank_container_type';
        $query .= $conditions ? ' WHERE '.$this->db->_implodeWithKeys(' AND ', $conditions) : null;
        $types  = $this->db->pselectWithIndexKey($query, array(), 'id');

        return $types;
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
    public function getCapacities() : array
    {
        $query      = 'SELECT ContainerCapacityID as id,
                          Quantity as quantity,
                          UnitID as unitId 
                  FROM biobank_container_capacity';
        $capacities = $this->db->pselectWithIndexKey($query, array(), 'id');

        return $capacities;
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
    public function getUnits() : array
    {
        $query = "SELECT UnitID as id,
                         Label as unit 
                  FROM biobank_unit";
        $units = $this->db->pselectWithIndexKey($query, array(), 'id');

        return $units;
    }

    /**
     * Queries all rows of the biobank_container_dimension table and returns a
     * nested array with the ID field as the index.
     *
     * @return array $containerDimensions All data concerning each container dimension
     */
    public function getDimensions() : array
    {
        $query      = "SELECT ContainerDimensionID as id,
                         X as x,
                         Y as y,
                         Z as z 
                  FROM biobank_container_dimension";
        $dimensions = $this->db->pselectWithIndexKey($query, array(), 'id');

        return $dimensions;
    }

    /**
     * Queries all rows of the biobank_container_status table and returns a
     * nested array with the ID field as the index.
     *
     * @return array $containerStati All data concerning each container status
     */
    public function getStati() : array
    {
        $query = "SELECT ContainerStatusID as id,
                         Label as status
                  FROM biobank_container_status";
        $stati = $this->db->pselectWithIndexKey($query, array(), 'id');

        return $stati;
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
    public function getCoordinates() : array
    {
        $query       = "SELECT ContainerID as childContainerId,
                         ParentContainerID as parentContainerId,
                         Coordinate as coordinate
                  FROM   biobank_container_parent";
        $result      = $this->db->pselect($query, array());
        $coordinates = array();
        foreach ($result as $row) {
            if (empty($row['coordinate'])) {
                $coordinates[$row['parentContainerId']]['Unassigned'][] = $row['childContainerId'];
            } else {
                $coordinates[$row['parentContainerId']][$row['coordinate']] = $row['childContainerId'];
            }
        }

        return $coordinates;
    }

    /**
     * This function receives a Container Object, converts it into a SQL format
     * and inserts it into all relevant tables in the database. Certain
     * information is then cascaded to the children of the Container.
     *
     * @param object $newContainer The Container Object to be inserted into the
     *                             database.
     *
     * @return string $containerId  The ID of the Container that was inserted.
     */
    public function saveInstance(Container $newContainer) : string
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
            $oldContainer         = $this->getInstanceFromId($containerId);
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
            // set the respective data array index to the value of the new
            // container ID.
            $data['parentData']['ContainerID'] = $containerId;
        }

        $parentContainerId = $newContainer->getParentContainerId();
        // If parent container ID exists, create an association in the
        // biobank_container_parent rel table
        if (isset($parentContainerId)) {
            $this->db->insertOnDuplicateUpdate(
                'biobank_container_parent',
                $data['parentData']
            );
        }

        //Cascade changes in temperature, status, and center to all child Containers
        $temperature = $newContainer->getTemperature();
        $this->cascadeToChildren($newContainer, 'Temperature', $temperature);
        $statusId = $newContainer->getStatusId();
        $this->cascadeToChildren($newContainer, 'ContainerStatusID', $statusId);
        $centerId = $newContainer->getCenterID();
        $this->cascadeToChildren($newContainer, 'CurrentCenterID', $centerId);

        //TODO: not sure if this is good practice, but the specimen controller
        //needs this information to be able to associate itself with the proper
        //container.
        return $containerId;
    }

    /**
     * This recursive functioncascades the $value to the specified $field of
     * all the children of the $container Object.
     *
     * @param object $container Container Object from which to retrieve children
     * @param string $field     The field at which to associate the $value
     * @param string $value     The value to assigned to the $field in question
     *
     * @return void
     */
    private function cascadeToChildren(
        Container $container,
        string $field,
        string $value
    ) {
        $childContainers = $this->getChildContainers($container);

        if (!empty($childContainers)) {
            foreach ($childContainers as $id=>$childContainer) {
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

    /**
     * This function takes a Container Object and retrieves an array of all the
     * children of the $container.
     *
     * @param object $container Container Object from which to retrieve
     *                          children
     *
     * @return array  $childContainers Array of child containers
     */
    public function getChildContainers(Container $container) : array
    {
        $childContainers   = array();
        $childContainerIds = $this->getChildContainerIds($container);
        if (!empty($childContainerIds)) {
            foreach ($childContainerIds as $id) {
                $childContainers[$id] = $this->getInstanceFromId($id);
            }
        }
        return $childContainers;
    }

    /**
     * This function takes a Container Object and prepares the data to be
     * inserted into the database by converting it to a data array.
     *
     * @param object $container Container Object to be converted
     *
     * @return array  $data      Array containing the data to be inserted
     */
    private function toSQL(Container $container) : array
    {
         $containerData = array(
                           'ContainerID'       => $container->getId(),
                           'Barcode'           => $container->getBarcode(),
                           'ContainerTypeID'   => $container->getTypeId(),
                           'Temperature'       => $container->getTemperature(),
                           'ContainerStatusID' => $container->getStatusId(),
                           'OriginCenterID'    => $container->getOriginId(),
                           'CurrentCenterID'   => $container->getCenterID(),
                          );

         $parentData = array(
                        'ContainerID'       => $container->getId(),
                        'ParentContainerID' => $container->getParentContainerId(),
                        'Coordinate'        => $container->getCoordinate(),
                       );

         return $data = array(
                         'containerData' => $containerData,
                         'parentData'    => $parentData,
                        );
    }

    /**
     * This function takes an array that resulted from an SQL query and
     * instantiates it as a Container Object.
     *
     * @param array $data Values to be instantiated.
     *
     * @return Container
     */
    private function getInstancefromQuery(array $data)
    {
        return $this->getInstanceFromArray(
            array(
             'id'                => $data['ContainerID'],
             'barcode'           => $data['Barcode'],
             'typeId'            => $data['ContainerTypeID'],
             'temperature'       => $data['Temperature'],
             'statusId'          => $data['ContainerStatusID'],
             'originId'          => $data['OriginCenterID'],
             'currentId'         => $data['CurrentCenterID'],
             'parentContainerId' => $data['ParentContainerID'],
             'coordinate'        => $data['Coordinate'],
             'dimensionId'       => $data['ContainerDimensionID'],
             'comments'          => $data['Comments'],
            )
        );
    }

    /**
     * Instatiates a Container Object using the information from the client-side
     *
     * @param array $data Data to be used to create Container Object
     *
     * @return Container $container Instantiated Container Object
     */
    public function getInstanceFromArray(array $data) : Container
    {
        //Set persistence variables.
        $container = $this->getInstance();
        $container->setId($data['id'] ?? null);
        $container->setBarcode($data['barcode']);
        $container->setTypeId($data['typeId']);
        $container->setTemperature($data['temperature']);
        $container->setStatusId($data['statusId']);
        $container->setCenterId($data['centerId']);
        $container->setOriginId($data['originId']);
        $container->setParentContainerId($data['parentContainerId']);
        $container->setCoordinate($data['coordinate']);

        return $container;
    }
}
