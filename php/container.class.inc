<?php
/** 
 * Container Object Class
 * This class contains an instance of a database handling that is needed to
 * permanently store and retrieve Container Transfer Object instances.
 *
 *
 * PHP Version 7.0.25
 *
 * @category Loris
 * @package  Biobank
 * @author   Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris/
 */
 
namespace LORIS\biobank;
 
class Container implements \JsonSerializable 
{
    /**
     * Persistent Instance variables.
     *
     * These variables are directly mapped to the fields of the database schema
     * that describe a container entity.
     *
     * @access private
     */
    private $id;                 //int
    private $barcode;            //string
    private $typeId;             //int
    private $capacityId;         //int
    private $dimensionId;        //int
    private $temperature;        //float
    private $statusId;           //int
    private $originId;           //int
    private $centerId;           //int
    private $parentContainerId;  //int
    private $childContainerIds;  //array
    private $coordinate;         //int
    private $dateTimeCreate;     //string

    // TODO: decide if comments for containers are depricated!
    // Also decide if we are instroducing 'Labels' for containers.
    private $comments;           //string

    /**
     * Initiliazes a new instance of the Container Class
     */
    function __construct()
    {
    }

    /**
     * Sets the container's ID
     *
     * @param int $id the container's ID
     *
     * @return none
     */
    public function setId(string $id)
    {
        $this->id = $id;
    } 

    /**
     * Gets the container's ID
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Sets the container's barcode
     *
     * @param string $barcode the container's barcode
     *
     * @return none
     */
    public function setBarcode(string $barcode)
    {
        $this->barcode = $barcode;
    }

    /**
     * Gets the container's barcode
     *
     * @return string
     */
    public function getBarcode() : String 
    {
        return $this->barcode;
    }

    /**
     * Sets the ID of the container type
     *
     * @param int $typeId ID of the container type
     *
     * @return none
     */
    public function setTypeId(string $typeId)
    {
        $this->typeId = $typeId;
    }

    /**
     * Gets the ID of the container type
     *
     * @return int
     */
    public function getTypeId()
    {
        return $this->typeId;
    }

    /**
     * Sets the ID of the container's capacity
     *
     * @param int $capacityId ID of the container's capacity
     *
     * @return none
     */
    public function setCapacityId(string $capacityId)
    {
        $this->capacityId = $capacityId;
    }

    /**
     * Gets the ID of the container's capacity
     *
     * @return int
     */
    public function getCapacityId()
    {
        return $this->capacityId;
    }

    /**
     * Sets the ID of the container's dimensions
     *
     * @param int $dimensionId ID of the container's dimensions
     *
     * @return none
     */
    public function setDimensionId(string $dimensionId)
    {
        $this->dimensionId = $dimensionId;
    }

    /**
     * Gets the ID of the container's dimensions
     *
     * @return int
     */
    public function getDimensionId()
    {
        return $this->dimensionId;
    }

    /**
     * Sets the container's temperature
     *
     * @param float $temperature the container's temperature
     *
     * @return none
     */
    public function setTemperature(string $temperature)
    {
        $this->temperature = $temperature;
    }

    /**
     * Gets the container's temperature
     *
     * @return float
     */
    public function getTemperature()
    {
        return $this->temperature;
    }

    /**
     * Sets the ID of the container's current status
     *
     * @param int $statusId the ID of the container's current status
     *
     * @return none
     */
    public function setStatusId(string $statusId)
    {
        $this->statusId = $statusId;
    }

    /**
     * Gets the ID of the container's current status
     *
     * @return int
     */
    public function getStatusId()
    {
        return $this->statusId;
    }

    /**
     * Sets the ID of the container's origin
     *
     * @param int $originId the ID of the container's origin
     *
     * @return none
     */
    public function setOriginId(string $originId)
    {
        $this->originId = $originId;
    }

    /**
     * Gets the ID of the container's origin
     *
     * @return int
     */
    public function getOriginId()
    {
        return $this->originId;
    }

    /**
     * Sets the ID of the container's current centerId
     *
     * @param int $centerId the ID of the container's current centerId
     *
     * @return none
     */
    public function setCenterId(string $centerId)
    {
        $this->centerId = $centerId;
    }

    /**
     * Gets the ID of the container's current centerId
     *
     * @return int
     */
    public function getCenterId()
    {
        return $this->centerId;
    }

    /**
     * Sets the parent container's ID
     *
     * @param int $parentContainerId the parent container's ID
     *
     * @return none
     */
    public function setParentContainerId(string $parentContainerId=null)
    {
        $this->parentContainerId = $parentContainerId;
    }

    /**
     * Gets the parent container's ID
     *
     * @return int
     */
    public function getParentContainerId()
    {
        return $this->parentContainerId;
    }

    /**
     * Sets the IDs of the children containers
     *
     * @param array $childContainerIds array of IDs of children container
     *
     * @return none
     */
    public function setChildContainerIds(array $childContainerIds)
    {
        $this->childContainerIds = $childContainerIds;
    }

    /**
     * Gets the IDs of the children containers
     *
     * @return array
     */
    public function getChildContainerIds()
    {
        return $this->childContainerIds;
    }

    /**
     * Sets the container's current coordinate in storage
     *
     * @param int $coordinate the container's current coordinate
     *
     * @return none
     */
    public function setCoordinate(int $coordinate=null)
    {
        $this->coordinate = $coordinate;
    }

    /**
     * Gets the container's current coordinate in storage
     *
     * @return int
     */
    public function getCoordinate()
    {
        return $this->coordinate;
    }

    // TO DELETE: this setter function might not be needed
    /**
     * Sets date/time at time of container creation
     *
     * @param string $dateTimeCreate the date/time the container is created
     *
     * @return none
     */
    public function setDateTimeCreate(string $dateTimeCreate)
    {
        $this->dateTimeCreate = $dateTimeCreate;
    }

    /**
     * Gets the date/time at time of container creation
     *
     * @return string
     */
    public function getDateTimeCreate()
    {
        return $this->dateTimeCreate;
    }

    /**
     * Sets comments
     *
     * @param string $comments extra comments pertaining to the container
     *
     * @return none
     */
    public function setComments(string $comments)
    {
        $this->comments = $comments;
    }

    /**
     * Gets comments
     *
     * @return string
     */
    public function getComments()
    {
        return $this->comments;
    }

    /**
     * Gets an Array representing the state of the Container
     *
     * @return Array
     */
    public function jsonSerialize()
    {
        $containerData = array();
        if (isset($this->id)) {
            $containerData['id']                = $this->id;
        }
        if (isset($this->barcode)) {
            $containerData['barcode']           = $this->barcode;
        }
        if (isset($this->typeId)) {
            $containerData['typeId']            = $this->typeId;
        }
        if (isset($this->capacityId)) {
            $containerData['capacityId']        = $this->capacityId;
        }
        if (isset($this->dimensionId)) {
            $containerData['dimensionId']       = $this->dimensionId;
        }
        if (isset($this->temperature)) {
            $containerData['temperature']       = $this->temperature;
        }
        if (isset($this->statusId)) {
            $containerData['statusId']          = $this->statusId;
        }
        if (isset($this->originId)) {
            $containerData['originId']          = $this->originId;
        }
        if (isset($this->centerId)) {
            $containerData['centerId']          = $this->centerId;
        }
        if (isset($this->parentContainerId)) {
            $containerData['parentContainerId'] = $this->parentContainerId;
        }
        if (isset($this->childContainerIds)) {
            $containerData['childContainerIds'] = $this->childContainerIds;
        }
        if (isset($this->coordinate)) {
            $containerData['coordinate']        = $this->coordinate;
        }
        if (isset($this->dateTimeCreate)) {
            $containerData['dateTimeCreate']    = $this->dateTimeCreate;
        }
        if (isset($this->comments)) {
            $containerData['comments']          = $this->comments;
        }
        return $containerData;
    }

    /**
     * Not currently in use - May be useful down the line
     *
     * hasEqualMapping-method will compare two Container instances and return true
     * if they contain same values in all persistent instance variables.
     */
    function hasEqualMapping($container)
    {
        if ($container->getId()                != $this->id) {
            return(false);
        }
        if ($container->getBarcode()           != $this->barcode) {
            return(false);
        }
        if ($container->getTypeId()            != $this->typeId) {
            return(false);
        }
        if ($container->getCapacityId()        != $this->capacityId) {
            return(false);
        }
        if ($container->getDimensionId()       != $this->dimensionId) {
            return(false);
        }
        if ($container->getStatusId()          != $this->statusId) {
            return(false);
        }
        if ($container->getOriginId()          != $this->originId) {
            return(false);
        }
        if ($container->getCenterId()        != $this->centerId) {
            return(false);
        }
        if ($container->getParentContainerId() != $this->parentContainerId) {
            return(false);
        }
        if ($container->getChildContainerIds() != $this->childContainerIds) {
            return(false);
        }
        if ($container->getCoordinate()        != $this->coordinate) {
            return(false);
        }
        if ($container->getDateTimeCreate()    != $this->dateTimeCreate) {
            return(false);
        }
        if ($container->getComments()          != $this->comments) {
            return(false);
        }
        return true;
    }

    /**
     * Depricated - Not currently in use. 
     * Clone will return an identical deep copy of the given Container.
     */
    function cloneContainer()
    {
        $clone = new Container();
        $clone->setId($this->id);
        $clone->setBarcode($this->barcode);
        $clone->setTypeId($this->typeId);
        $clone->setStatusId($this->statusId);
        $clone->setOriginId($this->originId);
        $clone->setCenterIdId($this->centerId);
        $clone->setParentContainerId($this->parentContainerId);
        $clone->setChildContainerIds($this->childContainerIds);
        $clone->setDateTimeCreate($this->createDate);
        $clone->setComments($this->comments);

        return $clone;
    }

    //TODO: This was necessary for implementation with the dataframework
    // Find out if it's actually necessary.
    function toJSON() {
        return json_encode($this);
    }
}
?>
