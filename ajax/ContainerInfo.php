<?php

namespace LORIS\biobank;

//require_once 'containerdao.class.inc';

/**
 * Biobank uploader.
 *
 * Handles biobank upload and update actions received from a front-end ajax call
 *
 * PHP Version 5
 *
 * @category Loris
 * @package  Biobank
 * @author   Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license  Loris license
 * @link     https://github.com/aces/Loris-Trunk
 */

if (isset($_GET['action'])) {
    $db     = \Database::singleton();
    //create containerto here

    $action = $_GET['action'];
    if ($action == "getContainerData") {
        echo json_encode(getContainerData($db), JSON_NUMERIC_CHECK);
    } else if ($action == "getContainerFilterData") {
        echo json_encode(getContainerFilterData($db), JSON_NUMERIC_CHECK);
    } else if ($action == "submitContainer") {
        submitContainer($db);
    } else if ($action == "updateContainerParent") {
        updateContainerParent($db);
    }
}

function submitContainer($db)
{

    $centerId        = isset($_POST['site']) ? $_POST['site'] : null;
    $barcodeFormList = isset($_POST['barcodeFormList']) ? json_decode($_POST['barcodeFormList'], true) : null;

    foreach ($barcodeFormList as $barcodeForm) {
        $barcode = isset($barcodeForm['barcode']) ? $barcodeForm['barcode'] : null;
        $typeId  = isset($barcodeForm['containerType']) ? $barcodeForm['containerType'] : null;

        $query = array(
                   'Barcode'  => $barcode,
                   'TypeID'   => $typeId,
                   'StatusID' => '1',
                   'OriginID' => $centerId,
                   'LocationID' => $centerId
                 );
        
        $db->insert('biobank_container', $query);
    }
}

 /*
  * @return array
  * @throws DatabaseException
  */
function getContainerData($db)
{

    $containerDAO = new ContainerDAO($db);

    $barcode                    = $_GET['barcode'];
    $container                  = $containerDAO->getContainerFromBarcode($barcode);
    $containerId                = $container->getId();
    $containerChildren          = $containerDAO->selectContainers(array('ParentContainerID'=>$containerId));
    $containerCoordinates       = $containerDAO->getContainerCoordinates();
    $parentContainerId          = $container->getParentContainerId();
    $containersNonPrimary       = $containerDAO->getContainersNonPrimary();
    $containerTypes             = $containerDAO->getAllContainerTypes();
    $containerCapacities        = $containerDAO->getContainerCapacities();
    $containerDimensions        = $containerDAO->getContainerDimensions();
    $containerUnits             = $containerDAO->getContainerUnits();
    $containerStati             = $containerDAO->getContainerStati();
    $sites                      = \Utility::getSiteList(false);

    $containerData = [
                     'containersNonPrimary'       => $containersNonPrimary,
                     'containerTypes'             => $containerTypes,
                     'containerCapacities'        => $containerCapacities,
                     'containerDimensions'        => $containerDimensions,
                     'containerStati'             => $containerStati,
                     'sites'                      => $sites,
                     'container'                  => $container->toArray(),
                     'containerChildren'          => $containerChildren,
                     'containerCoordinates'       => $containerCoordinates,
                    ];

    $parentContainerId = $container->getParentContainerId();
    if ($parentContainerId) {
        $parentContainerBarcode = $containerDAO->getBarcodeFromContainerId($parentContainerId);
        $containerData['parentContainerBarcode'] = $parentContainerBarcode;
    }

    return $containerData;
}

function updateContainerParent($db)
{

    $parentContainerId = isset($_POST['parentContainerId']) ? $_POST['parentContainerId'] : null;
    $coordinate        = isset($_POST['coordinate']) ? $_POST['coordinate'] : null;
    $container         = isset($_POST['container']) ? json_decode($_POST['container'], true) : null;
    $containerId       = $container['id'];

    if (isset($container['parentContainerId'])) {

        $query = array(
                   'ParentContainerID' => $parentContainerId,
                   'Coordinate'        => $coordinate
                 );
        
        $db->update('biobank_container_coordinate_rel', $query, array('ChildContainerID' => $containerId));

    } else if (!isset($parentContainerId)) {
        // If the user wants to remove the container from it's parent completely, we may have to use 
        $db->delete('biobank_container_coordinate_rel', array('ChildContainerID' => $containerId));

    } else {
        $query = array(
                   'ParentContainerID' => $parentContainerId,
                   'Coordinate'        => $coordinate,
                   'ChildContainerID'  => $containerId
                 );

        $db->insert('biobank_container_coordinate_rel', $query);
    }
}

function getContainerFilterData($db) 
{
    /**
     * Filter Option Queries and Mapping
     */
    $containerDAO = new ContainerDAO($db);
    
    //Container Types
    $containerTypes = array();
    $containerTypeList = $containerDAO->getContainerTypes(0);
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
    $form = array('barcode'       => array('label'   => 'Barcode', 
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
                  'location'      => array('label'   => 'Location', 
                                           'name'    => 'location', 
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
                     'Location',
                     'Parent Barcode',
                     'Date Created',
                     'Comments'
                    );

    /**
     * Table Values
     */
    $query = "SELECT bc1.Barcode, bct.Label as Type, bcs.Status, psc.Name as Location, 
              bc2.Barcode as `Parent Barcode`, bc1.DateTimeCreate as `Date Created`, bc1.Comments
              FROM biobank_container bc1
              LEFT JOIN biobank_container_type bct ON bc1.TypeID=bct.ID
              LEFT JOIN biobank_container_status bcs ON bc1.StatusID=bcs.ID
              LEFT JOIN psc ON bc1.LocationID=psc.CenterId
              LEFT JOIN biobank_container_coordinate_rel bccr ON bc1.ID=bccr.ChildContainerID
              LEFT JOIN biobank_container bc2 ON bccr.ParentContainerID=bc2.ID
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
