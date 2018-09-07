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

class PoolData extends \NDB_Menu_Filter
{
    //TODO: not sure what poolSettings is for?
    var $poolSettings;
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
        // return $user->hasPermission('biobank_view_containers');

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
        $provisioner = new PoolDAO($db);

        $user = \User::singleton();

        if ($user->hasPermission('access_all_profiles') == false) {
            $provisioner = $provisioner->filter(
                new \LORIS\Data\Filters\UserSiteMatch()
            );
        }
        return $provisioner;
    }

    /**
     * Create a form to filter media by various criteria
     *
     * @return void
     * @throws \ConfigurationException
     * @throws \DatabaseException
     * @throws \Exception
     */
    function _setFilterForm()
    {
        $db   = \Database::singleton();
        $poolDAO = new PoolDAO($db);

        //Sites
        //$siteList = \Utility::getSiteList(false);
        //foreach ($siteList as $key => $site) {
        //   unset($siteList[$key]);
        //   $siteList[$site] = $site;
        //}

        // Form Elements
		    $this->addBasicText('label', 'Label');
    }

    /**
     * Converts the results of this menu filter to a JSON format to be retrieved
     * with ?format=json
     *
     * @return string a json encoded string of the headers and data from this table
     */
    function toJSON() : String
    {
        $table = (new \LORIS\Data\Table())
            ->withDataFrom($this->getDataProvisioner());
        $arr   = array_map(
            function ($row) {
                return array_values($row);
            },
            json_decode($table->toJSON(\User::singleton()), true)
        );
        return json_encode(
            [
             'Headers'       => [
                                 'Label',
                                 'Date',
                                 'Time',
                                ],
             'Data'          => $arr,
             'form'          => $this->form->form,
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
