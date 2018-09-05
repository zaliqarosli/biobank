<?php
/**
 * Pool Class
 * This class contains an instance of a database handling that is needed to
 * permanently store and retrieve Pool Object instances.
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

class Pool implements \JsonSerializable
{
    /**
     * Persistent Instance variables. 
     *
     * These variables are directly mapped to the fields of the database schema
     * that describe a pool entity.
     *
     * @access private
     */
    private $id;          //int    
    private $label;       //string
    private $specimenIds; //array
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
     * @param int $id the pool's ID
     *
     * @return none
     */
    public function setId(int $id) 
    {
    	$this->id = $id;
    }
    
    /**
     * Gets the pool's ID
     *
     * @return int
     */
    public function getId()
    {
	    return $this->id;
    }
    
    /**
     * Sets the label of the pool
     *
     * @param string $label the pool's label
     *
     * @return none
     */
    public function setLabel(string $label) 
    {
    	$this->label = $label;
    }
    
    /**
     * Gets the label of the pool
     *
     * @return string
     */
    public function getLabel() 
    {
    	return $this->label;
    }
    
    /**
     * Sets the Specimen IDs of the pool
     *
     * @param array $specimenIds Specimen IDs of the pool
     *
     * @return none
     */
    public function setSpecimenIds(array $specimenIds) 
    {
    	$this->specimenIds = $specimenIds;
    }
    
    /**
     * Gets the Specimen IDs of the pool
     *
     * @return array
     */
    public function getSpecimenIds() 
    {
    	return $this->specimenIds;
    }
    
    /**
     * Sets the date of pool
     *
     * @param string $date the date of the pool
     *
     * @return none
     */
    public function setDate(string $date) 
    {
    	$this->date = $date;
    }
    
    /**
     * Gets the date of pool 
     *
     * @return date
     */
    public function getDate() 
    {
    	return $this->date;
    }
    
    /**
     * Sets the time of pool
     *
     * @param string $time the time of the pool
     *
     * @return none
     */
    public function setTime(string $time) 
    {
    	$this->time = $time;
    }
    
    /**
     * Gets the time of pool 
     *
     * @return time
     */
    public function getTime() 
    {
    	return $this->time;
    }

    /*
     * Returns an array representing the state of the Pool.
     *
     * @return array poolData
     */
    function jsonSerialize() 
    {
       $poolData = array();
       if (isset($this->id)) {
           $poolData['id'] = $this->id;
       }
       if (isset($this->label)) {
           $poolData['label'] = $this->label;
       }
       if (isset($this->specimenIds)) {
           $poolData['specimenIds'] = $this->specimenIds;
       }
       if (isset($this->date)) {
           $poolData['date'] = $this->date;
       }
       if (isset($this->time)) {
           $poolData['time'] = $this->time;
       }
    
        return $poolData;
    }
}
?>
