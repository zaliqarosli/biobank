<?php
/**
 * This file contains the NDB_Menu_Filter_biobank class
 *
 * PHP Version 5
 *
 * @category Module
 * @package  Biobank
 * @author   Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/CCNA/
 */
namespace LORIS\biobank;

/**
 * Main class for biobank module corresponding to /biobank/ URL
 * Child or Clinical section of the LorisMenu.
 *
 * Displays a list of biobank files and control panel to search them and upload
 * new ones.
 *
 * PHP Version 5
 *
 * @category Module
 * @package  Biobank
 * @author   Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/CCNA/
 */

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
        //create user object
        //$user =& \User::singleton();
        return true;
    }

    /**
     * Create a form to filter biobank by various criteria
     *
     * @param string $name       The test name being accessed
     * @param string $page       The subtest being accessed (may be null)
     * @param string $identifier The identifier for the data to load on this     page
     * @param string $commentID  The CommentID to load the data for
     * @param string $formname   The name to give this form
     *
     * @return bool
     */
    function _setupPage($name, $page, $identifier, $commentID, $formname)
    {
        parent::_setupPage($name, $page, $identifier, $commentID, $formname);

        $user = \User::singleton();
        $db   = \Database::singleton();

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

        $specimenTypeList  = [];
		$specimenTypeQuery = $db->pselect("SELECT Type as type FROM biobank_specimen_type", []);
		foreach ($specimenTypeQuery as $specimenType) {
	    	$specimenTypeList[$specimenType['type']] = $specimenType['type'];
		}


        // Form Elements
		$this->addBasicText('barcode', 'Barcode');
        $this->addSelect('type', 'Type', $specimenTypeList);
		$this->addBasicText('parentBarcode', 'Parent Barcode');
        $this->addBasicText('pSCID', 'PSCID', ["size" => 9, "maxlength" => 7]);
        $this->addSelect('visitLabel', 'Visit Label', $visitList);

        // Add hidden files filter is user is admin
        if ($this->hasHidePermission) {
            // Unable to create checkbox using addCheckbox(), using addSelect for
            // the time being
            // select options
            $hiddenOptions = array(
                              ""  => 'Both',
                              "0" => 'Visible only',
                              "1" => 'Hidden only',
                             );
            $this->addSelect('hideFile', 'File Visibility', $hiddenOptions);
        }

        $this->tpl_data["hasWritePermission"] = $this->hasWritePermission;
        $this->tpl_data["hasHidePermission"]  = $this->hasHidePermission;

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
        $user =& \User::singleton();
        // the base query
        $query  = " FROM biobank_specimen bs1";
        $query .= " LEFT JOIN biobank_container bc1 ON bs1.ContainerID=bc1.ID";
	    $query .= " LEFT JOIN biobank_specimen_type bst ON bs1.TypeID=bst.ID";
	    $query .= " LEFT JOIN biobank_unit bu ON bs1.UnitID=bu.ID";
	    $query .= " LEFT JOIN biobank_specimen bs2 ON bs1.ParentSpecimenID=bs2.ID";
	    $query .= " LEFT JOIN biobank_container bc2 ON bs2.ContainerID=bc2.ID";
		$query .= " LEFT JOIN biobank_container bc3 ON bc1.ParentContainerID=bc3.ID";
	    $query .= " LEFT JOIN candidate c ON bs1.CandidateID=c.CandID";
	    $query .= " LEFT JOIN session s ON bs1.SessionID=s.ID";
	    $query .= " LEFT JOIN biobank_container_status bcs ON bc1.StatusID=bcs.ID";
	
	//$query .= " RIGHT JOIN biobank_specimen bs2 ON bs2.parent_specimen_id=bs.id";

        // set the class variables
        $this->columns
            = [
		 'bc1.Barcode',
		 'bst.Type',
		 'CONCAT(bs1.Quantity, " ", bu.Unit) as Quantity',
		 'bc2.Barcode as ParentBarcode',
		 'bc3.Barcode as ContainerBarcode',
		 'c.PSCID',
		 's.Visit_label',
		 'bs1.CollectDate',
		 'bcs.Status',
		 //'bs1.Data',
		 'bs1.Notes'
              ];

        $this->query = $query;
        $this->group_by = '';
        $this->order_by = 'bc1.Barcode';
        $this->headers  = [
                           'Barcode',
                           'Type',
			   			   'Quantity',
                           'Parent Barcode',
						   'Container Barcode',
			   			   'PSCID',
			   			   'Visit Label',
                           'Date Collected',
			   			   'Status',
			   			   //'Data',
                           'Notes'
                          ];

        // Add Edit field if user has permissions
        if ($this->hasWritePermission) {
            array_push($this->headers, 'Edit Metadata');
        }

        //$this->validFilters = [
        //                       'c.PSCID',
        //                       'm.instrument',
        //                       's.Visit_label',
        //                       's.CenterID',
        //                       'm.hide_file',
        //                      ];
        //$this->formToFilter = [
        //                       'pscid'       => 'c.PSCID',
        //                       //'instrument'  => 'm.instrument',
        //                       'visit_label' => 's.Visit_label',
        //                       'for_site'    => 's.CenterID',
        //                       //'hide_file'   => 'm.hide_file',
        //                      ];
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
        $result['maxUploadSize'] = \Utility::getMaxUploadSize();
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

