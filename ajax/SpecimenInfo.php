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
    if ($action == "getFormOptions") {
        echo json_encode(getFormOptions($db), JSON_NUMERIC_CHECK);
    } else if ($action == "getSpecimenData") {
        echo json_encode(getSpecimenData($db), JSON_NUMERIC_CHECK);
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
                   'Barcode'           => $barcode,
                   'ContainerTypeID'   => $containerTypeId,
                   'ContainerStatusID' => '1',
                   'OriginCenterID'    => $centerId,
                   'CurrentCenterID'   => $centerId,
                   'Comments'          => $comments
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
                   'SpecimenTypeID'   => $specimenTypeId,
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
                   'CenterID'   => $centerId,
                   'Date'       => $date,
                   'Time'       => $time,
                   'Comments'   => $comments,
                   'Data'       => $data
                 );

        $db->unsafeinsert('biobank_specimen_collection', $query);
    }
    
    //This could be better - it's a bit of a patch for the moment
    if ($parentSpecimenId && $quantity && $unitId) {
      $db->update('biobank_specimen', array('Quantity' => $quantity, 'UnitID' => $unitId), array('ParentSpecimenID' => $parentSpecimenId));
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

    $db->update('biobank_container', $query, array('ContainerID' => $containerId));

    $query = array(
               'SpecimenTypeID' => $specimenTypeId
             );

    $db->update('biobank_specimen', $query, array('SpecimenID' => $specimenId));

    $query = array(
               'Quantity'   => $quantity,
               'UnitID'     => $unitId,
               'CenterID'   => $locationId,
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
               'SpecimenID'         => $specimenId,
               'SpecimenProtocolID' => $protocolId,
               'CenterID'           => $locationId,
               'Date'               => $date,
               'Time'               => $time,
               'Comments'           => $comments,
               'Data'               => $data
             );

    if ($insert === true) {
      $db->unsafeinsert('biobank_specimen_preparation', $preparation);
    }

    if ($insert === false) {
      $db->unsafeupdate('biobank_specimen_preparation', $preparation, array('SpecimenID' => $specimenId));
    }
}


function getFormOptions($db)
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
    $attributeOptions         = $specimenDAO->getAttributeOptions();

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
                   'attributeOptions'           => $attributeOptions,
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
    $attributeOptions           = $specimenDAO->getAttributeOptions();
    $specimenUnits              = $specimenDAO->getSpecimenUnits();
    $containersNonPrimary       = $containerDAO->getContainersNonPrimary();
    $containerTypes             = $containerDAO->getAllContainerTypes();
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
                     'attributeOptions'           => $attributeOptions,
                     'containersNonPrimary'       => $containersNonPrimary,
                     'containerTypes'             => $containerTypes,
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


    // This presents two different solutions -- I do not think that either is proper or elegant. There should be a better
    // way to do this.
    $parentSpecimen = $specimenDAO->getParentSpecimen($specimen);
    if ($parentSpecimen) {
        $parentSpecimenContainerId = $parentSpecimen->getContainerId();
        $specimenData['parentSpecimenBarcode'] = $containerDAO->getBarcodeFromContainerId($parentSpecimenContainerId);
        $specimenData['parentSpecimen'] = $parentSpecimen->toArray();
    }

    $parentContainerId = $container->getParentContainerId();
    if ($parentContainerId) {
        $parentContainerBarcode = $containerDAO->getBarcodeFromContainerId($parentContainerId);
        $specimenData['parentContainerBarcode'] = $parentContainerBarcode;
    }

    return $specimenData;
}
