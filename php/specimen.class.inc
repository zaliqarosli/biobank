<?php
/**
 * Specimen Object Class
 * This class contains an instance of a database handling that is needed to
 * permanently store and retrieve Specimen Object instances.
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

class Specimen implements \JsonSerializable
{
    /**
     * Persistent Instance variables.
     *
     * These variables are directly mapped to the fields of the database schema
     * that describe a specimen entity.
     *
     * @access private
     */
    private $id;                //int
    private $containerId;       //int
    private $typeId;            //int
    private $quantity;          //float
    private $unitId;            //int
    private $fTCycle;           //int
    private $parentSpecimenIds; //array
    private $candidateId;       //int
    private $sessionId;         //int
    private $poolId;            //int
    private $collection;        //array
    private $preparation;       //array
    private $analysis;          //array

    /**
     * Initiliazes a new instance of the Specimen Class
     */
    function __construct()
    {
    }

    /**
     * Sets the specimen's ID
     *
     * @param string $id the specimen's ID
     *
     * @return void
     */
    public function setId(string $id) : void
    {
        $this->id = $id;
    }

    /**
     * Gets the specimen's ID
     *
     * @return string
     */
    public function getId() : string
    {
        return $this->id;
    }

    /**
     * Sets the ID of the specimen's container
     *
     * @param string $containerId the ID of the specimen's container
     *
     * @return void
     */
    public function setContainerId(string $containerId) : void
    {
        $this->containerId = $containerId;
    }

    /**
     * Gets the ID of the specimen's container
     *
     * @return string
     */
    public function getContainerId() : string
    {
        return $this->containerId;
    }

    /**
     * Sets the ID of the specimen type
     *
     * @param string $typeId ID of the specimen type
     *
     * @return void
     */
    public function setTypeId(string $typeId) : void
    {
        $this->typeId = $typeId;
    }

    /**
     * Gets the ID of the specimen type
     *
     * @return string
     */
    public function getTypeId() : string
    {
        return $this->typeId;
    }

    /**
     * Sets the current amount of specimen available
     *
     * @param float $quantity the current amount of specimen available
     *
     * @return void
     */
    public function setQuantity(float $quantity) : void
    {
        $this->quantity = $quantity;
    }

    /**
     * Gets the current amount of specimen available
     *
     * @return float
     */
    public function getQuantity() : float
    {
        return $this->quantity;
    }

    /**
     * Sets the ID of the specimen's unit of quantity
     *
     * @param string $unitId the ID of the quantity's unit
     *
     * @return void
     */
    public function setUnitId(int $unitId) : void
    {
        $this->unitId = $unitId;
    }

    /**
     * Gets the ID of the specimen's unit of quantity
     *
     * @return string
     */
    public function getUnitId() : string
    {
        return $this->unitId;
    }

    /**
     * Sets the specimen's current Freeze-Thaw cycle
     *
     * @param int $fTCycle the specimen's current F-T cycle
     *
     * @return void
     */
    public function setFTCycle(int $fTCycle = null) : void
    {
        $this->fTCycle = $fTCycle;
    }

    /**
     * Gets the specimen's current Freeze-Thaw cycle
     *
     * @return int
     */
    public function getFTCycle() : ?int
    {
        return $this->fTCycle;
    }

    /**
     * Sets the parent specimen's ID
     *
     * @param array $parentSpecimenIds the parent specimen's IDs
     *
     * @return void
     */
    public function setParentSpecimenIds(array $parentSpecimenIds = null) : void
    {
        $this->parentSpecimenIds = $parentSpecimenIds;
    }

    /**
     * Gets the parent specimen's ID
     *
     * @return array
     */
    public function getParentSpecimenIds() : array
    {
        return $this->parentSpecimenIds;
    }

    /**
     * Sets the ID of the candidate to which the specimen belongs
     *
     * @param string $candidateId ID of the specimen's donor
     *
     * @return void
     */
    public function setCandidateId(string $candidateId) : void
    {
        $this->candidateId = $candidateId;
    }

    /**
     * Gets the ID of the candidate to which the specimen belongs
     *
     * @return string
     */
    public function getCandidateId() : string
    {
        return $this->candidateId;
    }

    /**
     * Sets the ID of the candidate's session/timepoint in which the specimen was collected
     *
     * @param string $sessionId the ID of the specimen's session of collection
     *
     * @return void
     */
    public function setSessionId(string $sessionId) : void
    {
        $this->sessionId = $sessionId;
    }

    /**
     * Gets the ID of the candidate's session/timepoint in which the specimen was collected
     *
     * @return string
     */
    public function getSessionId() : string
    {
        return $this->sessionId;
    }

    /**
     * Sets the ID of the specimen's pool group, if it exists.
     *
     * @param string $poolId the ID of the specimen's pool group
     *
     * @return none
     */
    public function setPoolId(string $poolId = null) : void
    {
        $this->poolId = $poolId;
    }

    /**
     * Gets the ID of the specimen's pool group.
     *
     * @return string
     */
    public function getPoolId() : string
    {
        return $this->poolId;
    }

    /**
     * Sets an associative array of data stored for the specimen's collection stage
     *
     * @param array $collection key-value pair data for the specimen's collection stage
     *
     * @return void
     */
    public function setCollection(array $collection) : void
    {
        $this->collection = $collection;
    }

    /**
     * Gets an associative array of data stored for the specimen's collection stage
     *
     * @return array
     */
    public function getCollection() : array
    {
        return $this->collection;
    }

    /**
     * Sets an associative array of data stored for the specimen's preparation stage
     *
     * @param array $preparation key-value pair data for the specimen's preparation stage
     *
     * @return void
     */
    public function setPreparation(array $preparation = null) : void
    {
        $this->preparation = $preparation;
    }

    /**
     * Gets an associative array of data stored for the specimen's preparation stage
     *
     * @return array
     */
    public function getPreparation() : ?array
    {
        return $this->preparation;
    }

    /**
     * Sets an associative array of data stored for the specimen's analysis stage
     *
     * @param array $analysis key-value pair data for the specimen's analysis stage
     *
     * @return void
     */
    public function setAnalysis(array $analysis = null) : void
    {
        $this->analysis = $analysis;
    }

    /**
     * Gets an associative array of data stored for the specimen's analysis stage
     *
     * @return array
     */
    public function getAnalysis() : ?array
    {
        return $this->analysis;
    }

    /*
     * Returns an array representing the state of the Specimen.
     *
     * @return array
     */
    public function jsonSerialize() : array
    {
        return array(
                'id'                => $this->id,
                'containerId'       => $this->containerId,
                'typeId'            => $this->typeId,
                'quantity'          => $this->quantity,
                'unitId'            => $this->unitId,
                'fTCycle'           => $this->fTCycle,
                'parentSpecimenIds' => $this->parentSpecimenIds,
                'candidateId'       => $this->candidateId,
                'sessionId'         => $this->sessionId,
                'poolId'            => $this->poolId,
                'collection'        => $this->collection,
                'preparation'       => $this->preparation,
                'analysis'          => $this->analysis,
               );
    }

    /**
     * Returns a JSON encoded string of the state of the Specimen
     *
     * @return string JSON encoded string of Specimen data
     */
    private function toJSON() : string
    {
        return json_encode($this);
    }
}
?>
