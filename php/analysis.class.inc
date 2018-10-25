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

class Analysis extends Process 
{
    /**
     * Persistent Instance variables.
     *
     * These variables are directly mapped to the fields of the database schema
     * that describe a specimen entity.
     *
     * @access private
     */
    private $methodId; //int

    /**
     * Sets the ID of the specimen's method
     *
     * @param int $methodId
     *
     * @return void
     */
    public function setMethodId(int $methodId) : void
    {
        $this->methodId = $methodId;
    }

    /**
     * Gets the ID of the specimen's method
     *
     * @return int
     */
    public function getMethodId() : int
    {
        return $this->methodId;
    }

    /*
     * Returns an array representing the state of the Specimen.
     *
     * @return array
     */
    public function jsonSerialize() : array
    {
        $parent = parent::jsonSerialize();
        return array_merge($parent,
            array(
                'methodId' => $this->methodId,
            )
        );
    }
}
?>
