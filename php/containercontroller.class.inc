<?php


/**
 * This class features the code that enables access to the containers of the
 * LORIS Biobank Module.
 *
 * PHP Version 7.2
 *
 * @category   Biobank
 * @package    Main
 * @subpackage Biobank
 * @author     Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license    http://www.gnu.org/licenses/gpl-3.0.text GPLv3
 * @link       http://www.github.com/aces/Loris/
 */

namespace LORIS\biobank;
require '/var/www/loris/modules/biobank/filters/NonPrimaryContainerFilter.php';

class ContainerController extends \NDB_Menu_Filter
{

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
        $db          = \Database::singleton();
        $user        = \User::singleton();
        $provisioner = new ContainerDAO($db);

        // XXX: I am still unsure if this filter is working properly. Ask Dave
        // about the details of getting it to work.
        if ($user->hasPermission('access_all_profiles') == false) {
            $provisioner = $provisioner->filter(
                new \LORIS\Data\Filters\UserSiteMatch()
            );
        }

        // XXX: These filter currently do not work and therefore they provisioner
        // (DAO) is doing the work of checking the permissions and returning the
        // appropriate information.

        //if ($user->hasPermission('biobank_container_view') == false) {
        //    $provisioner = $provisioner->filter(
        //        new NonPrimaryContainerFilter()
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
        $user       = \User::singleton();
        $containers = $this->getDataProvisioner()->execute($user);
        // XXX: potentially include a mapper here that removes the Parent Container
        // ID from the Container Object if there is no biobank_container_view 
        // permission. This way, there will be no need for any permission 
        // information in the DAO.
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
