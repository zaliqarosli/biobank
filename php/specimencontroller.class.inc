<?php

/**
 * This class features the code for the menu portion of the LORIS Biobank Module.
 *
 * PHP Version 5
 *
 * @category   Biobank
 * @package    Main
 * @subpackage Biobank
 * @author     Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license    http://www.gnu.org/licenses/gpl-3.0.text GPLv3
 * @link       http://www.github.com/aces/LORIS
 */

namespace LORIS\biobank;

class SpecimenController extends \NDB_Menu_Filter
{
    //TODO: not sure what dicomArchiveSettings is for?
    var $dicomArchiveSettings;
    public $AjaxModule         = true;

    /**
     * Determine whether the user has permission to view this page.
     *
     * @return bool whether the user has access
     */
    function _hasAccess()
    {

        // TODO: Permission will eventually go here
        // $user = \USER::singleton();
        // return $user->hasPermission('dicom_archive_view_allsites');

        return true;
    }

    /**
     * Set up the variables required by NDB_Menu_Filter class for construction
     * a query
     *
     * @return void
     */
    function _setupVariables()
    {
        //TODO: ask Dave about this
        // Reset the filter because this is broken with react modules
        $this->_resetFilters();
        $this->skipTemplate = true;
        $this->columns = [];
    }

    /**
     * Gets the data source for this menu filter.
     *
     * @return \LORIS\Data\Provisioner
     */
    function getDataProvisioner() : \LORIS\Data\Provisioner
    {
        $db = \Database::singleton();
        $provisioner = new SpecimenDAO($db);

        $user = \User::singleton();

        if ($user->hasPermission('access_all_profiles') == false) {
            $provisioner = $provisioner->filter(
                new \LORIS\Data\Filters\UserSiteMatch()
            );
        }
        return $provisioner;
    }

    /**
     * Create a form to filter media by variosu criteria
     *
     * @return void
     * @throws \ConfigurationException
     * @throws \DatabaseException
     * @throws \Exception
     */
    function _setFilterForm()
    {
        $db   = \Database::singleton();
        $specimenDAO = new SpecimenDAO($db);
        $containerDAO = new ContainerDAO($db);

        $visitList = \Utility::getVisitList();

        // Produce Filter selection options for specimen type
        // TODO: Should this go in the dao?
        $specimenTypes = array();
        $specimenTypeList = $specimenDAO->getSpecimenTypes();
		    foreach ($specimenTypeList as $specimenType) {
	        	$specimenTypes[$specimenType['type']] = $specimenType['type'];
		    }

        // Produce Filter selection options for container stati
        // TODO: Should this go in the dao?
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
    }

    /**
     * Converts the results of this menu filter to a JSON format to be retrieved
     * with ?format=json
     *
     * @return string a json encoded string of the headers and data from this table
     */
    function toJSON() : String
    {
        $user = \User::singleton();
        $provisioner = $this->getDataProvisioner();
        $specimens = $provisioner->execute($user);

        $table = (new \LORIS\Data\Table())
            ->withDataFrom($provisioner->map(new SpecimenMapper()));
        $arr   = array_map(
            function ($row) {
                return array_values($row);
            },
            json_decode($table->toJSON(\User::singleton()), true)
        );

        return json_encode(
            [
             'Headers'   => [
                             'ID',
                             'Barcode',
                             'Type',
                             'Quantity',
                             'Unit',
                             'F/T Cycle',
                             'Parent Specimens',
                             'PSCID',
                             'Visit Label',
                             'Pool',
                             'Status',
                             'Site',
                             'Parent Barcode',
                             'Container Barcode',
                            ],
             'Data'      => $arr,
             'specimens' => $specimens,
             'form'      => $this->form->form,
            ]
        );
    }

    /**
     * Converts the data from the data table to an array suitable for JSON
     * serialization. Overrides the base class in order to enforce name regex
     * rules.
     *
     *@return array of data from dicom_archive menu filter
     */
    function toArray()
    {
        return json_decode($this->toJSON());
    }

    public function __toString()
    {
        $this->toJSON();
    }
}

