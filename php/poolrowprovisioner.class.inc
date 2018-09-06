<?php

/**
* This file implements a data provisioner to get all possible rows
* for the dicom archive menu page.
*
* PHP Version 7
*
* @category   Behavioural
* @package    Main
* @subpackage Imaging
* @author     Henri Rabalais <hrabalais.mcin@mcgill.ca>
* @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
* @link       https://www.github.com/aces/Loris/
*/

namespace LORIS\biobank;

// Mapping converts one datatype to another
// implement provisionerInstance
// getallInstances would need to return an iterator that returnces instances from the dao

class PoolRowProvisioner extends \LORIS\Data\Provisioners\DBRowProvisioner
{
    /**
    * Create a BiobankRowProvisioner, which gets rows for the dicom_archive
    * menu table.
    */
    function __construct()
    {
        parent::__construct(
            "SELECT bp.Label,
                    bp.Date,
                    DATE_FORMAT(bp.Time, '%H:%i') as Time
             FROM   biobank_pool bp",
             array()
        );
    }

    /**
    * Returns an instance of a BiobankRow object for a given
    * table row.
    *
    * @param array $row The database row from the LORIS Database class.
    *
    * @return \LORIS\Data\DataInstance An instance representing this row.
    */
    public function getInstance($row) : \LORIS\Data\DataInstance
    {
        $cid = $row['CenterID'];
        unset($row['CenterID']);
        return new PoolRow($row, $cid);
    }
}
