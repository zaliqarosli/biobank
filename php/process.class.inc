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

abstract class Process implements \JsonSerializable 
{
    /**
     * Persistent Instance variables.
     *
     * These variables are directly mapped to the fields of the database schema
     * that describe a specimen entity.
     *
     * @access private
     */
    private $id;       //int
    private $centerId; //int
    private $date;     //string
    private $time;     //string
    private $comments; //string
    private $data;     //array

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
    public function setId(int $id = null) : void
    {
        $this->id = $id;
    }

    /**
     * Gets the specimen's ID
     *
     * @return string
     */
    public function getId() : ?int
    {
        return $this->id;
    }

    /**
     * Sets the ID of the specimen's center at time of collection.
     *
     * @param string $centerId the ID of the collection center
     *
     * @return void
     */
    public function setCenterId(int $centerId) : void
    {
        $this->centerId = $centerId;
    }

    /**
     * Gets the ID of the specimen's collection center
     *
     * @return string
     */
    public function getCenterId() : int
    {
        return $this->centerId;
    }

    /**
     * Sets the date of collection
     *
     * @param string $date
     *
     * @return void
     */
    public function setDate(string $date) : void
    {
        $this->date = $date;
    }

    /**
     * Gets the date of collection
     *
     * @return string
     */
    public function getDate() : string
    {
        return $this->date;
    }

    /**
     * Sets the time of collection
     *
     * @param string $time
     *
     * @return void
     */
    public function setTime(string $time) : void
    {
        $this->time = $time;
    }

    /**
     * Gets the time of collection
     *
     * @return string
     */
    public function getTime() : string
    {
        return $this->time;
    }

    /**
     * Sets collection comments
     *
     * @param string $comments
     *
     * @return void
     */
    public function setComments(string $comments = null) : void
    {
        $this->comments = $comments;
    }

    /**
     * Gets the time of collection
     *
     * @return string
     */
    public function getComments() : ?string
    {
        return $this->comments;
    }

    /**
     * Sets the Data array that contains custom attributes and values
     *
     * @param array $data
     *
     * @return void
     */
    public function setData(array $data = null) : void
    {
        $this->data = $data;
    }

    /**
     * Gets the Data array that contains custom attributes and values
     *
     * @return string
     */
    public function getData() : ?array
    {
        return $this->data;
    }

    /*
     * Returns an array representing the state of the Process.
     *
     * @return array
     */
    public function jsonSerialize() : array
    {
        return array(
                'id'       => $this->id,
                'centerId' => $this->centerId,
                'date'     => $this->date,
                'time'     => $this->time,
                'comments' => $this->comments,
                'data'     => $this->data,
        );
    }
}
?>
