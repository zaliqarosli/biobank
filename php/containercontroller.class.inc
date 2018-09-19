<?php


/**
 * This class features the code that enables access to the containers of the
 * LORIS Biobank Module.
 *
 * PHP Version 5
 *
 * @category   Biobank
 * @package    Main
 * @subpackage Biobank
 * @author     Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license    http://www.gnu.org/licenses/gpl-3.0.text GPLv3
 * @link       http://www.github.com/aces/Loris/
 */

namespace LORIS\biobank;

class ContainerController extends \NDB_Menu_Filter
{
    /**
     * Determine whether the user has permission to view this page.
     *
     * @return bool whether the user has access
     */
    function _hasAccess()
    {
        $user = \USER::singleton();
        $perm = $user->hasPermission('biobank_container_view') ||
                $user->hasPermission('biobank_specimen_view');
        return $perm;
    }

    /**
     * Set up the variables required by NDB_Menu_Filter class for construction
     * a query
     *
     * @return void
     */
    function _setupVariables()
    {
        $this->AjaxModule   = true;
        $this->skipTemplate = true;
    }

    /**
     * Gets the data source for this menu filter.
     *
     * @return \LORIS\Data\Provisioner
     */
    function getDataProvisioner() : \LORIS\Data\Provisioner
    {
        $db = \Database::singleton();
        $provisioner = new ContainerDAO($db);
        $user = \User::singleton();

        if ($user->hasPermission('access_all_profiles') == false) {
            $provisioner = $provisioner->filter(
                new \LORIS\Data\Filters\UserSiteMatch()
            );
        }
        //if ($user->hasPermission('biobank_container_view') == false) {
        //    print_r('NO CONTAINER VIEW');
        //    var_dump($provisioner);
        //    $provisioner = $provisioner->filter(
        //        new \LORIS\Data\Filters\NonPrimaryContainerFilter()
        //    );
        //}
        //if ($user->hasPermission('biobank_specimen_view') == false) {
        //    $provisioner = $provisioner->filter(
        //        new PrimaryContainerFilter()
        //    );
        //}
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
        $user = \User::singleton();
        $containers   = $this->getDataProvisioner()->execute($user);
        return json_encode($containers);
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
