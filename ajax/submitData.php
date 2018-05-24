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
    case 'saveContainer':
        saveContainer($db);
        break;
    case 'submitPoolForm':
        submitPoolForm($db, $_POST);
        break;
    case 'submitSpecimenForm':
        $_POST['barcodeFormList'] = json_decode($_POST['barcodeFormList'], true);
        submitSpecimenForm($db, $_POST);
        break;
    case 'saveSpecimen':
        saveSpecimen($db);
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

function saveContainer($db)
{
    $containerDAO = new ContainerDAO($db);

    // Get container ID
    if (isset($_POST['id'])) {
        $container = $containerDAO->getContainerFromId($_POST['id']);
    } else {
        $container = $containerDAO->createContainer();
    }

    $barcode           = $_POST['barcode'] ?? null;
    $typeId            = $_POST['typeId'] ?? null;
    $temperature       = $_POST['temperature'] ?? null;
    $statusId          = $_POST['statusId'] ?? null;
    $originId          = $_POST['originId'] ?? null;
    $locationId        = $_POST['locationId'] ?? null;
    $parentContainerId = $_POST['parentContainerId'] ?? null;
    $coordinate        = $_POST['coordinate'] ?? null;

    // Validate required fields
    $required = [
        'barcode'     => $barcode,
        'typeId'      => $typeId,
        'temperature' => $temperature,
        'statusId'    => $statusId,
        'originId'    => $originId,
        'locationId'  => $locationId,
    ];

    // Validate foreign keys
    $foreignKeys = [
        'typeId'            => $typeId,
        'statusId'          => $statusId,
        'originId'          => $originId,
        'locationId'        => $locationId,
        'parentContainerId' => $parentContainerId,
        'coordinate'        => $coordinate,
    ];

    // Validate strings
    $strings = [
        'barcode' => $barcode,
    ];

    // Validate floats
    $floats = [
        'temperature' => $temperature,
    ];

    validateRequired($required);
    validateForeignKeys($foreignKeys);
    validateStrings($strings);
    validateFloats($floats);
    
    // Validate Coordinate dependency on Parent Container
    if (is_null($coordinate) && !is_null($parentContainerId)) {
        showError(400, "Coordinate can not be set without a Parent Container.");
    }

    //Set persistence variables.
    $container->setBarcode($barcode);
    $container->setTypeId($typeId);
    $container->setTemperature($temperature);
    $container->setStatusId($statusId);
    $container->setOriginId($originId);
    $container->setLocationId($locationId);
    $container->setParentContainerId($parentContainerId);
    $container->setCoordinate($coordinate);

    //Save Container.
    $containerDAO->saveContainer($container);
}

function saveSpecimen($db)
{
    $specimenDAO = new SpecimenDAO($db);

    // Get container ID
    if (isset($_POST['id'])) {
        $specimenId = $_POST['id'];
        $specimen = $specimenDAO->getSpecimenFromId($specimenId);
    } else {
        $specimen = $specimenDAO->createSpecimen();
    }

    $containerId      = $_POST['containerId'] ?? null; 
    $typeId           = $_POST['typeId'] ?? null; 
    $quantity         = $_POST['quantity'] ?? null;
    $unitId           = $_POST['unitId'] ?? null;
    $parentSpecimenId = $_POST['parentSpecimenId'] ?? null;
    $candidateId      = $_POST['candidateId'] ?? null;
    $sessionId        = $_POST['sessionId'] ?? null;
    //TODO: might need to decode these
    $collection       = $_POST['collection'] ? json_decode($_POST['collection'], true) : null;
    $preparation      = $_POST['preparation'] ?? null;
    $analysis         = $_POST['analysis'] ?? null;

    // Validate required fields
    $required = [
        'containerId' => $containerId,
        'typeId'      => $typeId,
        'quantity'    => $quantity,
        'unitId'      => $unitId,
        'candidateId' => $candidateId,
        'sessionId'   => $sessionId,
        'collection'  => $collection
    ];
    validateRequired($required);

    $foreignKeys = [
        'containerId'      => $containerId,
        'typeId'           => $typeId,
        'unitId'           => $unitId,
        'parentSpecimenId' => $parentSpecimenId,
        'candidateId'      => $candidateId,
        'sessionId'        => $sessionId,
    ];
    validateForeignKeys($foreignKeys);

    // Validate arrays
    $arrays = [
        'collection'  => $collection,
        'preparation' => $preparation,
        'analysis'    => $analysis,
    ];
    validateArrays($arrays);

    $floats = [
        'quantity' => $quantity,
    ];
    validateFloats($floats);

    // Validate Collection
    if (isset($collection)) {
        $quantity   = $collection['quantity'] ?? null;
        $unitId     = $collection['unitId'] ?? null;
        $locationId = $collection['locationId'] ?? null;
        $date       = $collection['date'] ?? null;
        $time       = $collection['time'] ?? null;
        $comments   = $collection['comments'] ?? null;
        $data       = $collection['data'] ?? null;
        
        $required = [
            'collectionQuantity'   => $quantity,
            'collectionUnitId'     => $unitId,
            'collectionLocationId' => $locationId,
            'collectionDate'       => $date,
            'collectionTime'       => $time,
        ];
        validateRequired($required);

        $foreignKeys = [
            'collectionUnitId'     => $unitId,
            'collectionLocationId' => $locationId,
        ];
        validateForeignKeys($foreignKeys);

        //TODO: data needs to also be properly validated based on the given
        // validation criteria from the back end which needs to be queried.
        // This includes:
        //   - making sure all the keys are integers
        //   - finding the datatype that corresponds to that attribute
        //   - validating for that datatype
        validateArrays(array('data'=>$data));
        validateFloats(array('quantity'=>$quantity));
        validateStrings(array('comments'=>$comments));

        //TODO: validation for date and time should go here
    }
 
    //TODO: Validate Preparation
    if (isset($prepartion)) {

    }

    //TODO: put analysis requireds here
    if (isset($analysis)) {
     
    }

    $specimen->setContainerId($containerId);
    $specimen->setTypeId($typeId);
    $specimen->setQuantity($quantity);
    $specimen->setParentSpecimenId($parentSpecimenId);
    $specimen->setCandidateId($candidateId);
    $specimen->setSessionId($sessionId);
    $specimen->setCollection($collection);
    $specimen->setPreparation($preparation);
    $specimen->setAnalysis($analysis);

    $specimenDAO->saveSpecimen($specimen);

}

function isPositiveInt($param) {
    if (is_null($param)) {
        return false;
    }

    if (!is_numeric($param)) {
        return false;
    }

    if (intval($param) < 1) {
        return false;
    }
   
    return true;
}

function validateRequired(array $fields) {
    foreach($fields as $key=>$value) {
        if (is_null($value)) {
            showError(400, "$key value must be provided");
        }
    }
}

function validateForeignKeys(array $fields) {
    foreach ($fields as $key=>$value) {
        if (!isPositiveInt($value) && !is_null($value)) {
            showError(400, "$key should be a positive integer.");
        }
    }
}

function validateStrings(array $fields) {
    foreach ($fields as $key=>$value) {
        if (!is_string($value) && !is_null($value)) {
            showError(400, "$key must be a string.");
        }
    }
}

function validateFloats(array $fields) {
    foreach ($fields as $key=>$value) {
        if (!(is_numeric($value) && is_float(floatval($value)))) {
            showError(400, "$key must be a number.");
        }
    }
}

function validateArrays(array $fields) {
    foreach ($fields as $key=>$value) {
        if (!is_array($value) && !is_null($value)) {
            showError(400, "$key must be an array.");
        }
    }
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
    if ($parentSpecimenIds && $quantity && $unitId) {
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
