<?php
/**
 * Container Object Class
 * This class contains an instance of a database handling that is needed to
 * permanently store and retrieve Container Object instances.
 *
 * PHP Version 7.2
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
    private $id;                 //string
    private $barcode;            //string
    private $typeId;             //string
    private $dimensionId;        //string
    private $temperature;        //float
    private $statusId;           //string
    private $originId;           //string
    private $centerId;           //string
    private $parentContainerId;  //string
    private $childContainerIds;  //array
    private $coordinate;         //string

    /**
     * Initiliazes a new instance of the Container Class
     */
    function __construct()
    {
    }

    /**
     * Sets the container's ID
     *
     * @param string $id the container's ID
     *
     * @return void
     */
    public function setId(string $id = null) : void
    {
        $this->id = $id;
    }

    /**
     * Gets the container's ID
     *
     * @return string
     */
    public function getId() : ?string
    {
        return $this->id;
    }

    /**
     * Sets the container's barcode
     *
     * @param string $barcode the container's barcode
     *
     * @return void
     */
    public function setBarcode(string $barcode) : void
    {
        $this->barcode = $barcode;
    }

    /**
     * Gets the container's barcode
     *
     * @return string
     */
    public function getBarcode() : string
    {
        return $this->barcode;
    }

    /**
     * Sets the ID of the container type
     *
     * @param string $typeId ID of the container type
     *
     * @return void
     */
    public function setTypeId(string $typeId) : void
    {
        $this->typeId = $typeId;
    }

    /**
     * Gets the ID of the container type
     *
     * @return string
     */
    public function getTypeId() : string
    {
        return $this->typeId;
    }

    /**
     * Sets the ID of the container's dimensions
     *
     * @param string $dimensionId ID of the container's dimensions
     *
     * @return void
     */
    public function setDimensionId(string $dimensionId) : void
    {
        $this->dimensionId = $dimensionId;
    }

    /**
     * Gets the ID of the container's dimensions
     *
     * @return string
     */
    public function getDimensionId() : string
    {
        return $this->dimensionId;
    }

    /**
     * Sets the container's temperature
     *
     * @param float $temperature the container's temperature
     *
     * @return void
     */
    public function setTemperature(float $temperature) : void
    {
        $this->temperature = $temperature;
    }

    /**
     * Gets the container's temperature
     *
     * @return float
     */
    public function getTemperature() : float
    {
        return $this->temperature;
    }

    /**
     * Sets the ID of the container's current status
     *
     * @param string $statusId the ID of the container's current status
     *
     * @return void
     */
    public function setStatusId(string $statusId) : void
    {
        $this->statusId = $statusId;
    }

    /**
     * Gets the ID of the container's current status
     *
     * @return string
     */
    public function getStatusId() : string
    {
        return $this->statusId;
    }

    /**
     * Sets the ID of the container's origin
     *
     * @param string $originId the ID of the container's origin
     *
     * @return void
     */
    public function setOriginId(string $originId) : void
    {
        $this->originId = $originId;
    }

    /**
     * Gets the ID of the container's origin
     *
     * @return string
     */
    public function getOriginId() : string
    {
        return $this->originId;
    }

    /**
     * Sets the ID of the container's current centerId
     *
     * @param string $centerId the ID of the container's current centerId
     *
     * @return none
     */
    public function setCenterId(string $centerId) : void
    {
        $this->centerId = $centerId;
    }

    /**
     * Gets the ID of the container's current centerId
     *
     * @return string
     */
    public function getCenterId() : string
    {
        return $this->centerId;
    }

    /**
     * Sets the parent container's ID
     *
     * @param string $parentContainerId the parent container's ID
     *
     * @return void
     */
    public function setParentContainerId(string $parentContainerId=null) : void
    {
        $this->parentContainerId = $parentContainerId;
    }

    /**
     * Gets the parent container's ID
     *
     * @return string or void
     */
    public function getParentContainerId() : ?string
    {
        return $this->parentContainerId;
    }

    /**
     * Sets the IDs of the children containers
     *
     * @param array $childContainerIds array of IDs of children container
     *
     * @return void
     */
    public function setChildContainerIds(array $childContainerIds) : void
    {
        $this->childContainerIds = $childContainerIds;
    }

    /**
     * Gets the IDs of the children containers
     *
     * @return array
     */
    public function getChildContainerIds() : ?array
    {
        return $this->childContainerIds;
    }

    /**
     * Sets the container's current coordinate in storage
     *
     * @param string $coordinate the container's current coordinate
     *
     * @return void
     */
    public function setCoordinate(string $coordinate = null) : void
    {
        $this->coordinate = $coordinate;
    }

    /**
     * Gets the container's current coordinate in storage
     *
     * @return string
     */
    public function getCoordinate() : ?string
    {
        return $this->coordinate;
    }

    /**
     * Gets an array representing the state of the Container
     *
     * @return array
     */
    public function jsonSerialize() : array
    {
        return array(
                'id'                => $this->id,
                'barcode'           => $this->barcode,
                'typeId'            => $this->typeId,
                'dimensionId'       => $this->dimensionId,
                'temperature'       => $this->temperature,
                'statusId'          => $this->statusId,
                'originId'          => $this->originId,
                'centerId'          => $this->centerId,
                'parentContainerId' => $this->parentContainerId,
                'childContainerIds' => $this->childContainerIds,
                'coordinate'        => $this->coordinate,
               );
    }

    /**
     * Returns a JSON encoded string of the state of the Container
     *
     * @return string JSON encoded string of Container data
     */
    private function toJSON() : string
    {
        return json_encode($this);
    }
}
?>
