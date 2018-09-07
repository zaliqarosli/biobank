<?php

namespace LORIS\biobank;

/**
 * Biobank Data Requester.
 *
 * Handles biobank fetch and get requests received from a front-end ajax call.
 *
 * PHP Version 5
 *
 * @category Loris
 * @package  Biobank
 * @author   Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license  Loris license
 * @link     https://github.com/aces/Loris-Trunk
 */

/**
 * Data Request Controller
 */
if (isset($_GET['action'])) {
    $db     = \Database::singleton();
    $action = $_GET['action'];
    
    switch($action) {
    case 'getFormOptions':
        echo json_encode(getFormOptions($db));
        break;
    case 'downloadFile':
        downloadFile();
        break;
    }
}

/**
 * Retrieves all options for populating forms and displays.
 *
 * @return array
 */
function getFormOptions($db)
{
    $specimenDAO  = new SpecimenDAO($db);
    $containerDAO = new ContainerDAO($db);
    $poolDAO      = new PoolDAO($db);

    //TODO: This should eventually be replaced by candidate DAO
    $query      = 'SELECT CandID as id, PSCID as pscid FROM candidate';
    $candidates = $db->pselectWithIndexKey($query, array(), 'id');

    //TODO: This should eventually be replaced by session DAO
    $query = 'SELECT ID as id, Visit_label as label FROM session';
    $sessions = $db->pselectWithIndexKey($query, array(), 'id');

    $centers = \Utility::getSiteList();

    //TODO: This should eventually be replaced by session DAO
    $query = 'SELECT c.CandID as candidateId,
                     s.ID sessionId,
                     s.Visit_label as label,
                     s.CenterID as centerId
             FROM candidate c
             LEFT JOIN session s
               USING(CandID)';
    $result = $db->pselect($query, array());
    $candidateSessions = array();
    $sessionCenters = array();
    foreach ($result as $row) {
        foreach($row as $column=>$value) {
            $candidateSessions[$row['candidateId']][$row['sessionId']]['label'] = $row['label'];
            $sessionCenters[$row['sessionId']]['centerId'] = $row['centerId'];
        }
    }

    return array(
        'specimens'                  => $specimenDAO->selectSpecimens(),
        'containers'                 => $containerDAO->selectContainers(),
        'pools'                      => $poolDAO->selectPools(),
        'candidates'                 => $candidates,
        'sessions'                   => $sessions,
        'centers'                    => $centers,
        'candidateSessions'          => $candidateSessions,
        'sessionCenters'             => $sessionCenters,
        'specimenTypes'              => $specimenDAO->getSpecimenTypes(),
        'specimenTypeUnits'          => $specimenDAO->getSpecimenTypeUnits(),
        'specimenProtocols'          => $specimenDAO->getSpecimenProtocols(),
        'specimenProtocolAttributes' => $specimenDAO->getSpecimenProtocolAttributes(),
        'specimenMethods'            => $specimenDAO->getSpecimenMethods(),
        'specimenMethodAttributes'   => $specimenDAO->getSpecimenMethodAttributes(),
        'containerTypes'             => $containerDAO->getContainerTypes(),
        'containerTypesPrimary'      => $containerDAO->getContainerTypes(['Primary'=>1]),
        'containerTypesNonPrimary'   => $containerDAO->getContainerTypes(['Primary'=>0]),
        'containerDimensions'        => $containerDAO->getContainerDimensions(),
        'containerCoordinates'       => $containerDAO->getContainerCoordinates(),
        'containerStati'             => $containerDAO->getContainerStati(),
        'containersPrimary'          => $containerDAO->selectContainers(['Primary'=>1]),
        'containersNonPrimary'       => $containerDAO->selectContainers(['Primary'=>0]),
        'specimenUnits'              => $specimenDAO->getSpecimenUnits(),
        'specimenTypeAttributes'     => $specimenDAO->getSpecimenTypeAttributes(),
        'attributeDatatypes'         => $specimenDAO->getAttributeDatatypes(),
        'attributeOptions'           => $specimenDAO->getAttributeOptions(),
    );
}

//TODO: This was taken for Media, but may need some changes.
function downloadFile() {

    $user = \User::singleton();
    if (!$user->hasPermission('media_write')) {
        showError(403, 'Permission to download file is denied');
        exit;
    }

    // Make sure that the user isn't trying to break out of the $path
    // by using a relative filename.
    $file = basename($_GET['file']);
    $config = \NDB_Config::singleton();
    $path = $config->getSetting('mediaPath');
    $filePath = $path . $file;

    if (!file_exists($filePath)) {
        error_log('ERROR: File'.$filePath.' does not exist');
        showError(404, 'File was not found');
        exit(1);
    }

    // Output file in downloadable format                                           
    header('Content-Description: File Transfer');                                   
    header('Content-Type: application/force-download');                             
    header("Content-Transfer-Encoding: Binary");                                    
    header("Content-disposition: attachment; filename=\"" . basename($filePath) . "\"");
    readfile($filePath);                                                            
}
