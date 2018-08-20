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

class ContainerRowProvisioner extends \LORIS\Data\Provisioners\DBRowProvisioner
{
    /**
    * Create a BiobankRowProvisioner, which gets rows for the dicom_archive
    * menu table.
    */
    function __construct()
    {
        parent::__construct(
            "SELECT bc1.Barcode,
                    bct.Label as Type,
                    bcs.Label as Status,
                    psc.Name as Site,
                    bc2.Barcode as `Parent Barcode`,
                    bc1.DateTimeCreate as `Date Created`,
                    bc1.CurrentCenterID as CenterID
             FROM   biobank_container bc1
             LEFT JOIN biobank_container_type bct
               USING (ContainerTypeID)
             LEFT JOIN biobank_container_status bcs
               USING (ContainerStatusID)
             LEFT JOIN psc 
               ON bc1.CurrentCenterID=psc.CenterID
             LEFT JOIN biobank_container_parent bcp
               USING (ContainerID)
             LEFT JOIN biobank_container bc2
               ON bcp.ParentContainerID=bc2.ContainerID
             WHERE bct.Primary=:n",
             array('n' => 0)
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
        return new ContainerRow($row, $cid);
    }
}
