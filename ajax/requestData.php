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
    case 'getSpecimenData':
        echo json_encode(getSpecimenData($db));
        break;
    case 'getContainerData':
        echo json_encode(getContainerData($db));
        break;
    case 'downloadFile':
        downloadFile();
        break;
    case 'getContainerFilterData':
        echo json_encode(getContainerFilterData($db));
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
        'containers'                 => $containerDAO->selectContainers(),
        'containersPrimary'          => $containerDAO->selectContainers(['Primary'=>1]),
        'containersNonPrimary'       => $containerDAO->selectContainers(['Primary'=>0]),
        'specimenUnits'              => $specimenDAO->getSpecimenUnits(),
        'specimenTypeAttributes'     => $specimenDAO->getSpecimenTypeAttributes(),
        'attributeDatatypes'         => $specimenDAO->getAttributeDatatypes(),
        'attributeOptions'           => $specimenDAO->getAttributeOptions(),
    );
}

 /**
  * Returns Container Data
  *
  * @return array
  */
function getContainerData($db)
{
    $containerDAO = new ContainerDAO($db);
    $barcode      = $_GET['barcode'];

    return array(
        'container'       => $containerDAO->getContainerFromBarcode($barcode),
        'childContainers' => $containerDAO->getChildContainers($container) ?? (object)[],
        'parentContainers'=> $containerDAO->getAllParentContainers($container),
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



//TODO: This function really shouldn't be here. This should be in the container class.
function getContainerFilterData($db) 
{
    /**
     * Filter Option Queries and Mapping
     */
    $containerDAO = new ContainerDAO($db);
    
    //Container Types
    $containerTypes = array();
    $containerTypeList = $containerDAO->getContainerTypes(['Primary'=>0]);
    foreach ($containerTypeList as $containerType) {
        $containerTypes[$containerType['label']] = $containerType['label'];
    }

    //Container Statuses
    $containerStati = array();
    $containerStatusList = $containerDAO->getContainerStati();
    foreach ($containerStatusList as $containerStatus) {
        $containerStati[$containerStatus['status']] = $containerStatus['status'];
    }
    
    //Sites
    $siteList = \Utility::getSiteList(false);
    foreach ($siteList as $key => $site) {
        unset($siteList[$key]);
        $siteList[$site] = $site;
    }

    /**
     * Form Construction
     */
    $form = array(
        'barcode'       => array('label'   => 'Barcode', 
                                 'name'    => 'barcode', 
                                 'class'   => 'form-control input-sm', 
                                 'type'    => 'text'),
        'type'          => array('label'   => 'Type', 
                                 'name'    => 'type', 
                                 'class'   => 'form-control input-sm', 
                                 'type'    => 'select',
                                 'options' => $containerTypes),
        'status'        => array('label'   => 'Status', 
                                 'name'    => 'status', 
                                 'class'   => 'form-control input-sm', 
                                 'type'    => 'select',
                                 'options' => $containerStati),
        'site'           => array('label'  => 'Site', 
                                 'name'    => 'site', 
                                 'class'   => 'form-control input-sm', 
                                 'type'    => 'select',
                                 'options' => $siteList),
        'parentBarcode' => array('label'   => 'Parent Barcode', 
                                 'name'    => 'parentBarcode', 
                                 'class'   => 'form-control input-sm', 
                                 'type'    => 'text')
    );
  
    /**
     * Table Headers
     */
    $headers = array(
        'Barcode',
        'Type', 
        'Status',
        'Site',
        'Parent Barcode',
        'Date Created',
    );

    /**
     * Table Values
     */
    $query = "SELECT bc1.Barcode,
                     bct.Label as Type,
                     bcs.Label as Status,
                     psc.Name as Site,
                     bc2.Barcode as `Parent Barcode`,
                     bc1.DateTimeCreate as `Date Created`
              FROM biobank_container bc1
              LEFT JOIN biobank_container_type bct 
                USING (ContainerTypeID)
              LEFT JOIN biobank_container_status bcs
                USING (ContainerStatusID)
              LEFT JOIN psc ON bc1.CurrentCenterID=psc.CenterID
              LEFT JOIN biobank_container_parent bcp
                USING (ContainerID)
              LEFT JOIN biobank_container bc2
                ON bcp.ParentContainerID=bc2.ContainerID
              WHERE bct.Primary=:n";

    $result = $db->pselect($query, array('n' => 0));
    
    /**
     * Data Mapping
     */
    $data = array();
    foreach($headers as $key=>$header) {
      foreach($result as $rowIndex=>$row) {
        foreach($row as $column=>$value) {
            if ($column == $header) { 
              $data[$rowIndex][$key] = $value;
            }
        }
      }
    }

    /**
     * Return All Values
     */
    $containerFilterData = array(
        'form'    => $form,
        'Headers' => $headers,
        'Data'    => $data
    );

    return $containerFilterData;
}

