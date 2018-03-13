<?php

namespace LORIS\biobank;

//require_once 'specimendao.class.inc';
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
    //create specimento here

    $action = $_GET['action'];
    if ($action == "getFormData") {
        echo json_encode(getFormData($db), JSON_NUMERIC_CHECK);
    } else if ($action == "getSpecimenData") {
        echo json_encode(getSpecimenData($db), JSON_NUMERIC_CHECK);
    } else if ($action == "getContainerFilterData") {
        echo json_encode(getContainerFilterData($db), JSON_NUMERIC_CHECK);
    } else if ($action == "submitSpecimen") {
        submitSpecimen($db);
    } else if ($action == "updateSpecimenCollection") {
        updateSpecimenCollection($db);
    } else if ($action == "insertSpecimenPreparation") {
        saveSpecimenPreparation($db, true);
    } else if ($action == "updateSpecimenPreparation") {
        saveSpecimenPreparation($db, false);
    }
}

/**
 * Handles the specimen submit process
 *
 * @throws DatabaseException
 *
 * @return void
 */
function submitSpecimen($db)
{
    $containerDAO = new ContainerDAO($db);

    $parentSpecimenId = isset($_POST['parentSpecimen']) ? $_POST['parentSpecimen'] : null;
    $candidateId      = isset($_POST['pscid']) ? $_POST['pscid'] : null;
    $sessionId        = isset($_POST['visitLabel']) ? $_POST['visitLabel'] : null;
    $centerId         = $db->pselectOne("SELECT CenterId FROM session WHERE ID=:id", array('id'=>$sessionId));
    $barcodeFormList  = isset($_POST['barcodeFormList']) ? json_decode($_POST['barcodeFormList'], true) : null;
    $quantity         = isset($_POST['quantity']) ? $_POST['quantity'] : null;
    $unitId           = isset($_POST['unitId']) ? $_POST['unitId'] : null;

    foreach ($barcodeFormList as $barcodeForm) {
        $barcode            = isset($barcodeForm['barcode']) ? $barcodeForm['barcode'] : null;
        $specimenTypeId     = isset($barcodeForm['specimenType']) ? $barcodeForm['specimenType'] : null;
        $containerTypeId    = isset($barcodeForm['containerType']) ? $barcodeForm['containerType'] : null;
        $parentContainerId  = isset($barcodeForm['parentContainerId']) ? $barcodeForm['parentContainerId'] : null;
        $coordinate         = isset($barcodeForm['coordinate']) ? $barcodeForm['coordinate'] : null;
        $collectionQuantity = isset($barcodeForm['quantity']) ? $barcodeForm['quantity'] : null;
        $collectionUnitId   = isset($barcodeForm['unitId']) ? $barcodeForm['unitId'] : null;
        $date               = isset($barcodeForm['date']) ? $barcodeForm['date'] : null;
        $time               = isset($barcodeForm['time']) ? $barcodeForm['time'] : null;
        $comments           = isset($barcodeForm['comments']) ? $barcodeForm['comments'] : null;
        $data               = isset($barcodeForm['data']) ? json_encode($barcodeForm['data']) : null;

        $query = array(
                   'Barcode'    => $barcode,
                   'TypeID'     => $containerTypeId,
                   'StatusID'   => '1',
                   'OriginID'   => $centerId,
                   'LocationID' => $centerId,
                   'Comments'   => $comments
                 );

        $db->insert('biobank_container', $query);

        $containerId  = $db->getLastInsertId();

        if (isset($parentContainerId)) {
            $query = array(
                       'ParentContainerID' => $parentContainerId,
                       'Coordinate'        => $coordinate,
                       'ChildContainerID'  => $containerId
                     );
 
            $db->insert('biobank_container_coordinate_rel', $query);
        }

        $query = array(
                   'ContainerID'      => $containerId,
                   'TypeID'           => $specimenTypeId,
                   'Quantity'         => $collectionQuantity,
                   'UnitID'           => $collectionUnitId,
                   'ParentSpecimenID' => $parentSpecimenId,
                   'CandidateID'      => $candidateId,
                   'SessionID'        => $sessionId
                 );

        $db->insert('biobank_specimen', $query);

        $specimenId = $db->getLastInsertId();
        $query = array(
                   'SpecimenID' => $specimenId,
                   'Quantity'   => $collectionQuantity,
                   'UnitID'     => $collectionUnitId,
                   'LocationID' => $centerId,
                   'Date'       => $date,
                   'Time'       => $time,
                   'Comments'   => $comments,
                   'Data'       => $data
                 );

        $db->unsafeinsert('biobank_specimen_collection', $query);
    }
    
    //This could be better
    if ($parentSpecimenId && $quantity && $unitId) {
      $db->update('biobank_specimen', array('Quantity' => $quantity, 'UnitID' => $unitId), array('ID' => $parentSpecimenId));
    }

}

function updateSpecimenCollection($db)
{

    //this may need to be reworked to be derived from the specimen and not the container
    $containerId   = isset($_POST['containerId']) ? $_POST['containerId'] : null;
    $containerDAO  = new ContainerDAO($db);
    $container     = $containerDAO->getContainerFromId($containerId);

    $specimenId        = isset($_POST['specimenId']) ? $_POST['specimenId'] : null;
    $specimenTypeId    = isset($_POST['specimenType']) ? $_POST['specimenType'] : null;
    $containerTypeId   = isset($_POST['containerType']) ? $_POST['containerType'] : null;
    $parentContainerId = isset($_POST['parentContainer']) ? $_POST['parentContainer'] : null;
    $quantity          = isset($_POST['quantity']) ? $_POST['quantity'] : null;
    $unitId            = isset($_POST['unitId']) ? $_POST['unitId'] : null;
    $locationId        = $container->getLocationId();
    $date              = isset($_POST['date']) ? $_POST['date'] : null;
    $time              = isset($_POST['time']) ? $_POST['time'] : null;
    $comments          = isset($_POST['comments']) ? $_POST['comments'] : null;
    $data              = isset($_POST['data']) ? $_POST['data'] : null;


    //This part about container comments should probably be removed eventually
    $query = array(
               'Comments' => $comments,
             );

    $db->update('biobank_container', $query, array('ID' => $containerId));

    $query = array(
               'TypeID' => $specimenTypeId
             );

    $db->update('biobank_specimen', $query, array('ID' => $specimenId));

    $query = array(
               'Quantity'   => $quantity,
               'UnitID'     => $unitId,
               'LocationID' => $locationId,
               'Date'       => $date,
               'Time'       => $time,
               'Comments'   => $comments,
               'Data'       => $data
             );
   
    $db->unsafeupdate('biobank_specimen_collection', $query, array('SpecimenID' => $specimenId));
}

function saveSpecimenPreparation($db, $insert)
{
    //it can be done this way, or by passing the container Id through the form
    $specimenDAO   = new SpecimenDAO($db);
    $containerDAO = new ContainerDAO($db);

    $specimenId = isset($_POST['specimenId']) ? $_POST['specimenId'] : null;
    $specimen   = $specimenDAO->getSpecimenFromId($specimenId);
    $container  = $containerDAO->getContainerFromSpecimen($specimen);
    $locationId = $container->getLocationId();

    $protocolId   = isset($_POST['protocolId']) ? $_POST['protocolId'] : null;
    $date         = isset($_POST['date']) ? $_POST['date'] : null;
    $time         = isset($_POST['time']) ? $_POST['time'] : null;
    $comments     = isset($_POST['comments']) ? $_POST['comments'] : null;
    $data         = isset($_POST['data']) ? $_POST['data'] : null;

    $preparation = array(
               'SpecimenID' => $specimenId,
               'ProtocolID' => $protocolId,
               'LocationID' => $locationId,
               'Date'       => $date,
               'Time'       => $time,
               'Comments'   => $comments,
               'Data'       => $data
             );

    if ($insert === true) {
      $db->unsafeinsert('biobank_specimen_preparation', $preparation);
    }

    if ($insert === false) {
      $db->unsafeupdate('biobank_specimen_preparation', $preparation, array('SpecimenID' => $specimenId));
    }
}


function getFormData($db)
{
    $specimenDAO  = new SpecimenDAO($db);
    $containerDAO = new ContainerDAO($db);

    // This should eventually be replaced by candidate DAO
    $query      = "SELECT CandID, PSCID FROM candidate ORDER BY PSCID";
    $candidates = $db->pselect($query, array());
    foreach ($candidates as $row=>$column) {
        $pSCIDs[$column['CandID']] = $column['PSCID'];
    }

    $visitList = \Utility::getVisitList();
    $sites = \Utility::getSiteList();

    // This should eventually be replaced by session dao
    // Build array of session data to be used in upload media dropdowns
    $sessionData    = array();
    $sessionRecords = $db->pselect(
        "SELECT c.PSCID, s.Visit_label, s.CenterID, s.ID
         FROM candidate c
         LEFT JOIN session s USING(CandID)
         LEFT JOIN flag f ON (s.ID=f.SessionID)
         ORDER BY c.PSCID ASC",
        array()
    );

    // this array building should be moved to the front end
    foreach ($sessionRecords as $record) {

        // Populate visits
        if (!isset($sessionData[$record["PSCID"]]['visits'])) {
            $sessionData[$record["PSCID"]]['visits'] = array();
        }
        if ($record["Visit_label"] !== null && !in_array(
            $record["Visit_label"],
            $sessionData[$record["PSCID"]]['visits'],
            true
        )
        ) {
            $sessionData[$record["PSCID"]]['visits'][$record["ID"]]
                = $record["Visit_label"];
        }
    }

    $specimenTypes            = $specimenDAO->getSpecimenTypes();
    $specimenTypeUnits        = $specimenDAO->getSpecimenTypeUnits();
    $specimenUnits            = $specimenDAO->getSpecimenUnits();
    $containerTypesPrimary    = $containerDAO->getContainerTypes(1);
    $containerTypesNonPrimary = $containerDAO->getContainerTypes(0);
    $containerDimensions      = $containerDAO->getContainerDimensions();
    $containerCoordinates     = $containerDAO->getContainerCoordinates();
    $containersNonPrimary     = $containerDAO->getContainersNonPrimary();
    $specimenTypeAttributes   = $specimenDAO->getSpecimenTypeAttributes();
    $attributeDatatypes       = $specimenDAO->getAttributeDatatypes();

    $formData = array(
                   'pSCIDs'                     => $pSCIDs,
                   'visits'                     => $visitList,
                   'sessionData'                => $sessionData,
                   'specimenTypes'              => $specimenTypes,
                   'specimenTypeUnits'          => $specimenTypeUnits,
                   'containerTypesPrimary'      => $containerTypesPrimary,
                   'containerTypesNonPrimary'   => $containerTypesNonPrimary,
                   'containerDimensions'        => $containerDimensions,
                   'containerCoordinates'       => $containerCoordinates,
                   'containersNonPrimary'       => $containersNonPrimary,
                   'specimenUnits'              => $specimenUnits,
                   'specimenTypeAttributes'     => $specimenTypeAttributes,
                   'attributeDatatypes'         => $attributeDatatypes,
                   'sites'                      => $sites
                  );

    return $formData;
}

 /*
  * @return array
  * @throws DatabaseException
  */
function getSpecimenData($db)
{

    $specimenDAO  = new SpecimenDAO($db);
    $containerDAO = new ContainerDAO($db);

    $specimenData               = array();
    $barcode                    = $_GET['barcode'];
    $specimen                   = $specimenDAO->getSpecimenFromBarcode($barcode);
    $container                  = $containerDAO->getContainerFromSpecimen($specimen);
    $specimenTypes              = $specimenDAO->getSpecimenTypes();
    $specimenTypeUnits          = $specimenDAO->getSpecimenTypeUnits();
    $specimenTypeAttributes     = $specimenDAO->getSpecimenTypeAttributes();
    $specimenProtocols          = $specimenDAO->getSpecimenProtocols();
    $specimenProtocolAttributes = $specimenDAO->getSpecimenProtocolAttributes();
    $attributeDatatypes         = $specimenDAO->getAttributeDatatypes();
    $specimenUnits              = $specimenDAO->getSpecimenUnits();
    $containersNonPrimary       = $containerDAO->getContainersNonPrimary();
    $containerTypesPrimary      = $containerDAO->getContainerTypes(1);
    $containerCapacities        = $containerDAO->getContainerCapacities();
    $containerDimensions        = $containerDAO->getContainerDimensions();
    $containerCoordinates       = $containerDAO->getContainerCoordinates();
    $containerUnits             = $containerDAO->getContainerUnits();
    $containerStati             = $containerDAO->getContainerStati();
    $sites                      = \Utility::getSiteList(false);

    // This information should be retrieved using the candidateDAO and the sessionDAO
    $candidateInfo = $specimenDAO->getCandidateInfo($specimen->getCandidateId());
    $sessionInfo   = $specimenDAO->getSessionInfo($specimen->getSessionId());

    $specimenData = [
                     'specimenTypes'              => $specimenTypes,
                     'specimenProtocols'          => $specimenProtocols,
                     'specimenUnits'              => $specimenUnits,
                     'specimenTypeAttributes'     => $specimenTypeAttributes,
                     'specimenTypeUnits'          => $specimenTypeUnits,
                     'specimenProtocolAttributes' => $specimenProtocolAttributes,
                     'attributeDatatypes'         => $attributeDatatypes,
                     'containersNonPrimary'       => $containersNonPrimary,
                     'containerTypesPrimary'      => $containerTypesPrimary,
                     'containerCapacities'        => $containerCapacities,
                     'containerDimensions'        => $containerDimensions,
                     'containerCoordinates'       => $containerCoordinates,
                     'containerStati'             => $containerStati,
                     'candidateInfo'              => $candidateInfo,
                     'sessionInfo'                => $sessionInfo,
                     'sites'                      => $sites,
                     'specimen'                   => $specimen->toArray(),
                     'container'                  => $container->toArray(),
                    ];

    $parentSpecimenId = $specimen->getParentSpecimenId();
    if ($parentSpecimenId) {
        $parentSpecimenBarcode = $specimenDAO->getBarcodeFromSpecimenId($parentSpecimenId);
        $parentSpecimen        = $specimenDAO->getSpecimenFromId($parentSpecimenId);
        // or $parentSpecimen  = $specimenDAO->getParentSpecimen($specimen)?
        $specimenData['parentSpecimenBarcode'] = $parentSpecimenBarcode;
        $specimenData['parentSpecimen'] = $parentSpecimen->toArray();
    }

    $parentContainerId = $container->getParentContainerId();
    if ($parentContainerId) {
        $parentContainerBarcode = $containerDAO->getBarcodeFromContainerId($parentContainerId);
        $specimenData['parentContainerBarcode'] = $parentContainerBarcode;
    }

    return $specimenData;
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

/**
 * Utility function to return errors from the server
 *
 * @param string $message error message to display
 *
 * @return void
 */
function showError($message)
{
    if (!isset($message)) {
        $message = 'An unknown error occurred!';
    }
    header('HTTP/1.1 500 Internal Server Error');
    header('Content-Type: application/json; charset=UTF-8');
    die(json_encode(['message' => $message]));
}

