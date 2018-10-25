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

class Preparation extends Process 
{
    /**
     * Persistent Instance variables.
     *
     * These variables are directly mapped to the fields of the database schema
     * that describe a specimen entity.
     *
     * @access private
     */
    private $protocolId; //int

    /**
     * Sets the ID of the specimen's protocol
     *
     * @param int $protocolId
     *
     * @return void
     */
    public function setProtocolId(int $protocolId) : void
    {
        $this->protocolId = $protocolId;
    }

    /**
     * Gets the ID of the specimen's protocol
     *
     * @return int
     */
    public function getProtocolId() : int
    {
        return $this->protocolId;
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
                'protocolId' => $this->protocolId,
            )
        );
    }
}
?>
