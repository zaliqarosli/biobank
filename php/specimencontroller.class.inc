<?php

/**
 * This class features the code that enables access to the Pools of the LORIS 
 * Biobank Module.
 *
 * PHP Version 7.2
 *
 * @category   Biobank
 * @package    Main
 * @subpackage Biobank
 * @author     Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license    http://www.gnu.org/licenses/gpl-3.0.text GPLv3
 * @link       http://www.github.com/aces/Lors/
 */

namespace LORIS\biobank;

class SpecimenController extends \NDB_Menu_Filter
{
    /**
     * Set up the variables required by NDB_Menu_Filter class for construction
     * a query
     *
     * @return void
     */
    function _setupVariables()
    {
        $this->skipTemplate = true;
        $this->AjaxModule   = true;
    }

    /**
     * Gets the data source for this menu filter.
     *
     * @return \LORIS\Data\Provisioner
     */
    function getDataProvisioner() : \LORIS\Data\Provisioner
    {
        $db          = \Database::singleton();
        $user        = \User::singleton();
        $provisioner = new SpecimenDAO($db);

        // XXX: I am still unsure if this filter is working properly. Ask Dave
        // about the details of getting it to work.
        if ($user->hasPermission('access_all_profiles') == false) {
            $provisioner = $provisioner->filter(
                new \LORIS\Data\Filters\UserSiteMatch()
            );
        }

        // XXX: A filter wil likely need to go here to filter out the specimen
        // data if they do not have the proper permission. Currently, the controller
        // (DAO) is fulfilling that role.

        return $provisioner;
    }

    /**
     * Converts the results of this menu filter to a JSON format to be retrieved
     * with ?format=json
     *
     * @return string a json encoded string of the headers and data from this table
     */
    function toJSON() : String
    {
        $user      = \User::singleton();
        $specimens = $this->getDataProvisioner()->execute($user);

        return json_encode($specimens);
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
}
