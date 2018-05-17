<?php

namespace LORIS\biobank;

/**
 * Biobank Data Submitter.
 *
 * Handles biobank submission requests received from a front-end ajax call.
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
 * Data Submission Controller
 */
if (isset($_GET['action'])) {
    $db     = \Database::singleton();
    $action = $_GET['action'];
 
    switch($action) {
    case 'submitPoolForm':
        submitPoolForm($db, $_POST);
        break;
    case 'submitSpecimenForm':
        $_POST['barcodeFormList'] = json_decode($_POST['barcodeFormList'], true);
        submitSpecimenForm($db, $_POST);
        break;
    case 'submitContainer':
        submitContainer($db);
        break;
    case 'updateContainerParent':
        updateContainerParent($db);
        break;
    case 'saveSpecimen':
        saveSpecimen($db);
        break;
    case 'saveContainer':
        saveContainer($db);
        break;
    case 'checkoutContainer':
        checkoutContainer($db);
        break;
    case 'updateSpecimenCollection':
        updateSpecimenCollection($db);
        break;
    case 'insertSpecimenPreparation':
        $specimenId = $_POST['specimenId'];
        saveSpecimenPreparation($db, $_POST, $specimenId, true);
        break;
    case 'updateSpecimenPreparation':
        $specimenId = $_POST['specimenId'];
        saveSpecimenPreparation($db, $_POST, $specimenId, false);
        break;
    }
}

// TODO: this will become a general update function
// TODO: Permision check needs to be make to make sure they are supposed to
// edit this specimen
function saveContainer($db)
{
    $containerDAO = new ContainerDAO($db);

    $containerId = $_POST['id'];
    $container = $containerDAO->getContainerFromId($containerId);

    $parentContainerId = $_POST['parentContainerId'] ?? null;
    $container->setParentContainerId($parentContainerId);

    $coordinate = $_POST['coordinate'] ?? null;
    if (!is_null($parentContainerId)) {
      $container->setCoordinate($coordinate);
    } else if (!is_null($coordinate)) {
      showError(404, 'Container must have a parent to be place at a Coordinate');
    }

    if (isset($_POST['temperature'])) {
      $container->setTemperature($_POST['temperature']);
    } else if (false) {
      //TODO: check if parent ID exists. If so, this container should adopt
      //the parent's temperature.
    } else {
      showError(404, 'Temperature must be set to a number');
    }

    $containerDAO->saveContainer($container);
}

function saveSpecimen($db)
{
    $specimenDAO = new SpecimenDAO($db);

    $specimenId = $_POST['id'];
    $specimen = $specimenDAO->getSpecimenFromId($specimenId);

    if (isset($_POST['quantity'])) {
        $quantity = $_POST['quantity'];
        $specimen->setQuantity($quantity);
    }

    $specimenDAO->saveSpecimen($specimen);

}

//TODO: This function can be done much better
// If anything, it will become an updateContainer function that will be capable of 
// handling any update needs.
function updateContainerParent($db)
{
    $parentContainerId = $_POST['parentContainerId'] ?? null;
    $coordinate        = $_POST['coordinate'] ?? null;
    $container         = isset($_POST['container']) ? json_decode($_POST['container'], true) : null;
    $containerId       = $container['id'];

    $containerDAO = new ContainerDAO($db);
    $parentContainer = $containerDAO->getContainerFromId($parentContainerId);
    //TODO: this maybe should be replaced with a 'getChildrenBarcodes' function
    //$barcodePath = $containerDAO->getBarcodePath($parentContainer);
    //$containerBarcode = $container['barcode'];

    //if (in_array($containerBarcode, $barcodePath)) {
    //  showError("Containers Can Not Be Placed Within Their Sub-Containers");
    //}

    if ($containerId === $parentContainerId) {
      showError(400, 'Containers Can Not Be Placed Within Themselves');
    }

    if (isset($container['parentContainerId'])) {
        $query = array(
                   'ParentContainerID' => $parentContainerId,
                   'Coordinate'        => $coordinate
                 );

        $db->update('biobank_container_coordinate_rel', $query, array('ChildContainerID' => $containerId));

    } else if (!isset($parentContainerId)) {
       showError(400, 'A Parent Container Must Be Selected');

    } else {
        $query = array(
                   'ParentContainerID' => $parentContainerId,
                   'Coordinate'        => $coordinate,
                   'ChildContainerID'  => $containerId
                 );

        $db->insert('biobank_container_coordinate_rel', $query);
    }
}


function checkoutContainer($db) {
        $containerId = $_POST['containerId'] ?? null;

        $db->delete('biobank_container_coordinate_rel', array('ChildContainerID' => $containerId));
}

function submitPoolForm($db, $data)
{
    $specimenForm = isset($data['specimenForm']) ? json_decode($data['specimenForm'], true) : null;

    $preparationForm = isset($data['preparationForm']) ? json_decode($data['preparationForm'], true) : null;

    if ($preparationForm) {
      //TODO: there has to be a better way to deal with this data.
      $specimenIds = $specimenForm['parentSpecimenIds'] ?? null;
      foreach ($specimenIds as $specimenId) {
        saveSpecimenPreparation($db, $preparationForm, $specimenId, true);
      }
    }

    submitSpecimenForm($db, $specimenForm);
}

/**
 * TODO: This function should probably handle and sort of container update OR submission
 * of any form
 * Handles submission of container data
 */
function submitContainer($db)
{
    $centerId        = $_POST['site'] ?? null;
    $barcodeFormList = isset($_POST['barcodeFormList']) 
        ? json_decode($_POST['barcodeFormList'], true) : null;

    foreach ($barcodeFormList as $barcodeForm) {
        $barcode = isset($barcodeForm['barcode']) ? $barcodeForm['barcode'] : null;
        $typeId  = isset($barcodeForm['containerType']) ? $barcodeForm['containerType'] : null;
        $query = array(
                   'Barcode'           => $barcode,
                   'ContainerTypeID'   => $typeId,
                   'ContainerStatusID' => '1',
                   'OriginCenterID'    => $centerId,
                   'CurrentCenterID'   => $centerId
                 );    
                       
        $db->insert('biobank_container', $query);
    }
}


/**
 * Handles the specimen submit process
 *
 * @throws DatabaseException
 *
 * @return void
 */
function submitSpecimenForm($db, $data)
{
    $containerDAO = new ContainerDAO($db);

    $parentSpecimenIds = $data['parentSpecimenIds'] ?? null;
    $candidateId       = $data['pscid'] ?? null;
    $sessionId         = $data['visitLabel'] ?? null;
    $centerId          = $db->pselectOne("SELECT CenterId FROM session WHERE ID=:id", array('id'=>$sessionId));
    $barcodeFormList   = $data['barcodeFormList'] ?? null;
    $quantity          = $data['quantity'] ?? null;
    $unitId            = $data['unitId'] ?? null;


    //TODO: Make this format ubiquitous!
    foreach ($barcodeFormList as $barcodeForm) {
        // Check that each value is set and is not equal to an empty string
        foreach ($barcodeForm as $key=>$field) {
          if (gettype($field) === 'array') {
            foreach($field as $subKey=>$subField) {
              $barcodeForm[$subKey] = isset($subField) && preg_match('/^\s*$/', $subField) !== 1 ? 
                                        $subField : null;
            } 
          } else {
            $barcodeForm[$key] = isset($field) && preg_match('/^\s*$/', $field) !== 1 ? $field : null;
          }
        }

        // All type checks should go here
        $barcode            = $barcodeForm['barcode'];
        $specimenTypeId     = $barcodeForm['specimenType'];
        $containerTypeId    = $barcodeForm['containerType'];
        $parentContainerId  = $barcodeForm['parentContainerId'];
        $coordinate         = $barcodeForm['coordinate'];
        $collectionQuantity = $barcodeForm['quantity'];
        $collectionUnitId   = $barcodeForm['unitId'];
        $date               = $barcodeForm['date'];
        $time               = $barcodeForm['time'];
        $comments           = $barcodeForm['comments'];
        $data               = json_encode($barcodeForm['data']);

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
                   'ContainerID'    => $containerId,
                   'SpecimenTypeID' => $specimenTypeId,
                   'Quantity'       => $collectionQuantity,
                   'UnitID'         => $collectionUnitId,
                   'CandidateID'    => $candidateId,
                   'SessionID'      => $sessionId
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
      // This needs to be worked out

      $db->update('biobank_specimen', array('Quantity' => $quantity, 'UnitID' => $unitId), array('ParentSpecimenID' => $parentSpecimenId));
    }
}

//TODO: This should probably be called by the submitSpecimenForm() function
function updateSpecimenCollection($db)
{
    //this may need to be reworked to be derived from the specimen and not the container
    $containerDAO  = new ContainerDAO($db);
    $containerId   = $_POST['containerId'] ??  null;
    $container     = $containerDAO->getContainerFromId($containerId);

    $specimenId        = $_POST['specimenId'] ?? null;
    $specimenTypeId    = $_POST['specimenType'] ?? null;
    $containerTypeId   = $_POST['containerType'] ?? null;
    $parentContainerId = $_POST['parentContainer'] ?? null;
    $quantity          = $_POST['quantity'] ?? null;
    $unitId            = $_POST['unitId'] ?? null;
    $locationId        = $container->getLocationId();
    $date              = $_POST['date'] ?? null;
    $time              = $_POST['time'] ?? null;
    $comments          = $_POST['comments'] ?? null;
    $data              = $_POST['data'] ?? null;


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

function saveSpecimenPreparation($db, $data, $specimenId, $insert)
{
    //it can be done this way, or by passing the container Id through the form
    $specimenDAO  = new SpecimenDAO($db);
    $containerDAO = new ContainerDAO($db);

    $specimen   = $specimenDAO->getSpecimenFromId($specimenId);
    $container  = $containerDAO->getContainerFromSpecimen($specimen);
    $locationId = $container->getLocationId();

    $protocolId = $data['protocolId'] ?? null;
    $date       = $data['date'] ?? null;
    $time       = $data['time'] ?? null;
    $comments   = $data['comments'] ?? null;
    //$data       = isset($data['data']) ? json_encode($data['data']) : null;
    $data       = $data['data'] ?? null;

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

function showError($code, $message)
{
    if (!isset($message)) {
        $message = 'An unknown error occurred!';
    }

    http_response_code($code);
    header('Content-Type: application/json; charset=UTF-8');
    exit(json_encode(['message' => $message]));
}
