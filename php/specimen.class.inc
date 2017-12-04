<?php
/**
 * This file contains the NDB_Form_biobank class
 *
 * PHP Version 5
 *
 * @category Loris
 * @package  Biobank
 * @author   Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/CCNA/
 */
namespace LORIS\biobank;

/**
 * Creates the form for NDB_Form_biobank
 *
 * @category Loris
 * @package  Biobank
 * @author   Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/CCNA/
 */
class Specimen extends \NDB_Form
{
    public $skipTemplate = true;

    /**
     * Entry point for /biobank/specimen/
     * Checks if file id is provided and otherwise redirects to /biobank/ page
     *
     * @param string $name       The test name being accessed
     * @param string $page       The subtest being accessed (may be null)
     * @param string $identifier The identifier for the data to load on this page
     * @param string $commentID  The CommentID to load the data for
     * @param string $formname   The name to give this form
     *
     * @return none
     */
    function _setupPage($name, $page, $identifier, $commentID, $formname)
    {
        parent::_setupPage($name, $page, $identifier, $commentID, $formname);

        $db      = \Database::singleton();
        $factory = \NDB_Factory::singleton();
        $baseURL = $factory->settings()->getBaseURL();
	
	$specimenDAO = new SpecimenDAO();
        $barcode = $_GET['barcode'];
	$specimenId = $specimenDAO->getSpecimenIdFromBarcode($barcode);

        // Check if specimen barcode is set, is empty, and exists in database;
	// if not redirect to /biobank/ page
        if (!$specimenId) {
            header('Location: ' . $baseURL . '/biobank/');
        }
    }

    /**
     * Include additional CSS files:
     *  1. biobank.js
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
     * Include additional JS files:
     *  1. specimenForm.js - reactified form to update biobank
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
            [$baseURL . "/biobank/js/specimenFormIndex.js"]
        );
    }

    /**
     * Check user permissions
     *
     * @return bool
     * @throws ConfigurationException
     */
    function _hasAccess()
    {
        //create user object
        $user =& \User::singleton();

        return $user->hasPermission('media_read');
    }

}
