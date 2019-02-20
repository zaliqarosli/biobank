<?php declare(strict_types=1);
/**
 * Pool Class
 * This class contains an instance of a database handling that is needed to
 * permanently store and retrieve Pool Object instances.
 *
 * PHP Version 7.2
 *
 * @category   Entity
 * @package    Loris
 * @subpackage Biobank
 * @author     Henri Rabalais <henri.rabalais@mcin.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link       https://www.github.com/aces/Loris/
 */
namespace LORIS\biobank;

/**
 * Pool Class
 * This class contains an instance of a database handling that is needed to
 * permanently store and retrieve Pool Object instances.
 *
 * PHP Version 7.2
 *
 * @category   Entity
 * @package    Loris
 * @subpackage Biobank
 * @author     Henri Rabalais <henri.rabalais@mcin.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link       https://www.github.com/aces/Loris/
 */
class Pool implements \JsonSerializable, \LORIS\Data\DataInstance
{
    /**
     * Persistent Instance variables.
     *
     * These variables are directly mapped to the fields of the database schema
     * that describe a pool entity.
     *
     * @access private
     */
    private $id;          //string
    private $label;       //string
    private $specimenIds; //array
    private $candidateId; //string
    private $sessionId;   //string
    private $centerId;    //string
    private $date;        //string
    private $time;        //string

    /**
     * Initiliazes a new instance of the Pool Class
     */
    function __construct()
    {
    }

    /**
     * Sets the pool's ID
     *
     * @param string $id the pool's ID
     *
     * @return void
     */
    public function setId(string $id = null) : void
    {
        $this->id = $id;
    }

    /**
     * Gets the pool's ID
     *
     * @return string
     */
    public function getId() : ?string
    {
        return $this->id;
    }

    /**
     * Sets the label of the pool
     *
     * @param string $label the pool's label
     *
     * @return void
     */
    public function setLabel(string $label) : void
    {
        $this->label = $label;
    }

    /**
     * Gets the label of the pool
     *
     * @return string
     */
    public function getLabel() : string
    {
        return $this->label;
    }

    /**
     * Sets the Specimen IDs of the pool
     *
     * @param array $specimenIds Specimen IDs of the pool
     *
     * @return void
     */
    public function setSpecimenIds(array $specimenIds) : void
    {
        $this->specimenIds = $specimenIds;
    }

    /**
     * Gets the Specimen IDs of the pool
     *
     * @return array
     */
    public function getSpecimenIds() : array
    {
        return $this->specimenIds;
    }

    /**
     * Sets the Candidate ID of the pool
     *
     * @param string $candidateId Candidate ID of the pool
     *
     * @return void
     */
    public function setCandidateId(string $candidateId) : void
    {
        $this->candidateId = $candidateId;
    }

    /**
     * Gets the Candidate ID of the pool
     *
     * @return string
     */
    public function getCandidateId() : string
    {
        return $this->candidateId;
    }

    /**
     * Sets the Session ID of the pool
     *
     * @param string $sessionId Session ID of the pool
     *
     * @return void
     */
    public function setSessionId(string $sessionId) : void
    {
        $this->sessionId = $sessionId;
    }

    /**
     * Gets the Session ID of the pool
     *
     * @return string
     */
    public function getSessionId() : string
    {
        return $this->sessionId;
    }

    /**
     * Sets the Center ID of the pool
     *
     * @param array $centerId Center ID of the pool
     *
     * @return void
     */
    public function setCenterId(string $centerId) : void
    {
        $this->centerId = $centerId;
    }

    /**
     * Gets the Center ID of the pool
     *
     * @return string
     */
    public function getCenterID() : string
    {
        return $this->centerId;
    }

    /**
     * Sets the date of pool
     *
     * @param string $date the date of the pool
     *
     * @return void
     */
    public function setDate(string $date) : void
    {
        $this->date = $date;
    }

    /**
     * Gets the date of pool
     *
     * @return string
     */
    public function getDate() : string
    {
        return $this->date;
    }

    /**
     * Sets the time of pool
     *
     * @param string $time the time of the pool
     *
     * @return void
     */
    public function setTime(string $time) : void
    {
        $this->time = $time;
    }

    /**
     * Gets the time of pool
     *
     * @return string
     */
    public function getTime() : string
    {
        return $this->time;
    }

    /**
     * Returns an array representing the state of the Pool.
     *
     * @return array
     */
    public function jsonSerialize() : array
    {
        return array(
                'id'          => $this->id,
                'label'       => $this->label,
                'specimenIds' => $this->specimenIds,
                'candidateId' => $this->candidateId,
                'sessionId'   => $this->sessionId,
                'centerId'    => $this->centerId,
                'date'        => $this->date,
                'time'        => $this->time,
               );
    }

    /**
     * Returns a JSON encoded string of the state of the Pool
     *
     * @return string JSON encoded string of Pool data
     */
    public function toJSON() : string
    {
        return json_encode($this);
    }
}

