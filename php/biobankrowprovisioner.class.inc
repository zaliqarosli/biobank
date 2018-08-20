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

class BiobankRowProvisioner extends \LORIS\Data\Provisioners\DBRowProvisioner
{
    /**
    * Create a BiobankRowProvisioner, which gets rows for the dicom_archive
    * menu table.
    */
    function __construct()
    {
        parent::__construct(
            "SELECT bc1.Barcode,
                    bc1.CurrentCenterID as CenterID,
                    bst.Label as Type,
                    CONCAT(bs1.Quantity, ' ', bu.Label) as Quantity,
                    c.PSCID,
                    s.Visit_label as `Visit Label`,
                    bcs.Label as Status,
                    psc.Name as Site,
                    bc2.Barcode as `ParentBarcode`,
                    bc3.Barcode as `Container Barcode`
             FROM   biobank_specimen bs1
             LEFT JOIN biobank_container bc1
               USING (ContainerID)
             LEFT JOIN biobank_specimen_type bst
               USING (SpecimenTypeID)
             LEFT JOIN biobank_unit bu
               USING (UnitID)
             LEFT JOIN biobank_specimen_parent bsp
               USING (SpecimenID)
             LEFT JOIN biobank_specimen bs2
               ON bsp.ParentSpecimenID=bs2.SpecimenID
             LEFT JOIN biobank_container_parent bcp
               ON bc1.ContainerID=bcp.ContainerID
             LEFT JOIN biobank_container bc2
               ON bs2.ContainerID=bc2.ContainerID
             LEFT JOIN biobank_container bc3
               ON bcp.ParentContainerID=bc3.ContainerID
             LEFT JOIN candidate c
               ON bs1.CandidateID=c.CandID
             LEFT JOIN session s
               ON bs1.SessionID=s.ID
             LEFT JOIN biobank_container_status bcs
               ON bcs.ContainerStatusID=bc1.ContainerStatusID
             LEFT JOIN psc
               ON bc1.CurrentCenterID=psc.CenterID",
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
        return new BiobankRow($row, $cid);
    }
}
