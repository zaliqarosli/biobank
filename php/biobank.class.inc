<?php
/**
 * This file contains the NDB_Menu_Filter_biobank class
 *
 * PHP Version 7
 *
 * @category Module
 * @package  Biobank
 * @author   Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/LORIS/
 */

namespace LORIS\biobank;

class Biobank extends \NDB_Menu_Filter
{
    public $hasWritePermission = false;
    public $hasHidePermission  = false;
    public $AjaxModule         = true;
    public $skipTemplate       = true;

    /**
     * Check user permissions
     *
     * @return bool
     * @throws ConfigurationException
     */
    function _hasAccess()
    {

        // HR: Permission will eventually go here

        return true;
    }

    /**
     * Create a form to filter biobank by various criteria
     *
     * @return bool
     */
    function setup()
    {
        parent::setup();

        $user = \User::singleton();
        $db   = \Database::singleton();
        $specimenDAO = new SpecimenDAO($db);
        $containerDAO = new ContainerDAO($db);

        $siteList  = array();
        $visitList = \Utility::getVisitList();

        // allow to view all sites data through filter
        if ($user->hasPermission('access_all_profiles')) {
            $siteList = \Utility::getSiteList(false);
            // Index sites using their names (used to filter react tables)
            foreach ($siteList as $key => $site) {
                unset($siteList[$key]);
                $siteList[$site] = $site;
            }
        } else {
            // allow only to view own site data
            $siteIDs = $user->getData('CenterIDs');
            foreach ($siteIDs as $val) {
                $site =& \Site::singleton($val);
                if ($site->isStudySite()) {
                    $siteList[$site->getCenterName()] = $site->getCenterName();
                }
            }
        }

        // Produce Filter selection options for specimen type
        $specimenTypes = array();
        $specimenTypeList = $specimenDAO->getSpecimenTypes();
		    foreach ($specimenTypeList as $specimenType) {
	        	$specimenTypes[$specimenType['type']] = $specimenType['type'];
		    }

        // Produce Filter selection options for container stati
        $containerStati = array();
        $containerStatusList = $containerDAO->getContainerStati();
        foreach ($containerStatusList as $containerStatus) {
            $containerStati[$containerStatus['status']] = $containerStatus['status'];
        }

        // Form Elements
		    $this->addBasicText('barcode', 'Barcode');
        $this->addSelect('type', 'Type', $specimenTypes);
		    $this->addBasicText('parentBarcode', 'Parent Barcode');
        $this->addBasicText('containerBarcode', 'Container Barcode');
        $this->addBasicText('pSCID', 'PSCID', ["size" => 9, "maxlength" => 7]);
        $this->addSelect('visitLabel', 'Visit Label', $visitList);
        $this->addSelect('status', 'Status', $containerStati); 

        return true;
    }

    /**
     * Build a list of biobank specimen to display in Data Table
     *
     * @return bool
     * @throws DatabaseException
     */
    function _setupVariables()
    {
        $user = \User::singleton();
        // the base query -- Some of these joins should probably be broken down into subqueries
        $query  = " FROM biobank_specimen bs1
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
                      ON bcs.ContainerStatusID=bc1.ContainerStatusId";
	
        // set the class variables
        $this->columns = array(
		        'bc1.Barcode',
		        'bst.Label as Type',
		        'CONCAT(bs1.Quantity, " ", bu.Label) as Quantity',
		        'c.PSCID',
		        's.Visit_label',
		        'bcs.Label as Status',
		        'bc2.Barcode as ParentBarcode',
		        'bc3.Barcode as ContainerBarcode',
        );

        $this->query = $query;
        $this->headers  = [
            'Barcode',
            'Type',
            'Quantity',
            'PSCID',
            'Visit Label',
            'Status',
            'Parent Barcode',
            'Container Barcode',
        ];

        return true;
    }

    /**
     * Converts the results of this menu filter to a JSON format to be retrieved
     * with ?format=json
     *
     * @return a json encoded string of the headers and data from this table
     */
    function toJSON()
    {
        $result         = $this->toArray();
        $result['form'] = $this->form->form;

        return json_encode($result);
    }

    /**
     * Include additional CSS files:
     *  1. biobank.css
     *
     * @return array of javascript to be inserted
     */
    function getCSSDependencies()
    {
        $factory = \NDB_Factory::singleton();
        $baseURL = $factory->settings()->getBaseURL();
        $deps    = parent::getCSSDependencies();
        return array_merge(
            $deps,
            [$baseURL . "/biobank/css/biobank.css"]
        );
    }

    /**
     * Include additional JS files
     *
     * @return array of javascript to be inserted
     */
    function getJSDependencies()
    {
        $factory = \NDB_Factory::singleton();
        $baseURL = $factory->settings()->getBaseURL();
        $deps    = parent::getJSDependencies();
        return array_merge(
            $deps,
            array(
             $baseURL . "/biobank/js/biobankIndex.js",
            )
        );
    }
}

