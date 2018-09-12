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

class Biobank extends \NDB_Menu_Filter
{
    //TODO: not sure what dicomArchiveSettings is for?
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

