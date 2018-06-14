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
    $data   = json_decode($_POST['data'], true);

    switch($action) {
    case 'saveBarcodeList':
        saveBarcodeList($db, $data);
        break;
    case 'saveContainer':
        saveContainer($db, $data);
        break;
    case 'saveSpecimen':
        saveSpecimen($db, $data);
        break;
    case 'submitPoolForm':
        submitPoolForm($db, $_POST);
        break;
    }
}

function saveBarcodeList($db, $barcodeList)
{
    foreach ($barcodeList as $barcode) {
        
        $container = $barcode['container'];
        $specimen  = $barcode['specimen'];
        $containerId = saveContainer($db, $container);
        $specimen['containerId'] = $containerId;
        saveSpecimen($db, $specimen);
    }
}

function saveContainer($db, $data)
{
    $containerDAO = new ContainerDAO($db);

    // Get container ID
    if (isset($data['id'])) {
        $container = $containerDAO->getContainerFromId($data['id']);
    } else {
        $container = $containerDAO->createContainer();
    }

    $barcode           = $data['barcode'] ?? null;
    $typeId            = $data['typeId'] ?? null;
    $temperature       = $data['temperature'] ?? null;
    $statusId          = $data['statusId'] ?? null;
    $originId          = $data['originId'] ?? null;
    $locationId        = $data['locationId'] ?? null;
    $parentContainerId = $data['parentContainerId'] ?? null;
    $coordinate        = $data['coordinate'] ?? null;

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
    return $containerDAO->saveContainer($container);
}

function saveSpecimen($db, $data)
{
    $specimenDAO = new SpecimenDAO($db);

    // Get specimen ID
    if (isset($data['id'])) {
        $specimenId = $data['id'];
        $specimen   = $specimenDAO->getSpecimenFromId($specimenId);
    } else {
        $specimen = $specimenDAO->createSpecimen();
    }

    $containerId      = $data['containerId'] ?? null; 
    $typeId           = $data['typeId'] ?? null; 
    $quantity         = $data['quantity'] ?? null;
    $unitId           = $data['unitId'] ?? null;
    $fTCycle          = $data['fTCycle'] ?? null;
    $parentSpecimenId = $data['parentSpecimenId'] ?? null;
    $candidateId      = $data['candidateId'] ?? null;
    $sessionId        = $data['sessionId'] ?? null;
    $collection       = $data['collection'] ?? null;
    $preparation      = $data['preparation'] ?? null;
    $analysis         = $data['analysis'] ?? null;

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

    $foreignKeys = [
        'containerId'      => $containerId,
        'typeId'           => $typeId,
        'unitId'           => $unitId,
        'fTCycle'          => $fTCycle,
        'parentSpecimenId' => $parentSpecimenId,
        'candidateId'      => $candidateId,
        'sessionId'        => $sessionId,
    ];

    // Validate arrays
    $arrays = [
        'collection'  => $collection,
        'preparation' => $preparation,
        'analysis'    => $analysis,
    ];

    validateRequired($required);
    validateForeignKeys($foreignKeys);
    validateArrays($arrays);
    validateFloats(array('quantity'=>$quantity));

    // Validate Collection
    if (isset($collection)) {
        $collection['quantity']   = $collection['quantity'] ?? null;
        $collection['unitId']     = $collection['unitId'] ?? null;
        $collection['locationId'] = $collection['locationId'] ?? null;
        $collection['date']       = $collection['date'] ?? null;
        $collection['time']       = $collection['time'] ?? null;
        $collection['comments']   = $collection['comments'] ?? null;
        $collection['data']       = $collection['data'] ?? null;
        
        $required = [
            'Collection Quantity'    => $collection['quantity'],
            'Collection Unit ID'     => $collection['unitId'],
            'Collection Location ID' => $collection['locationId'],
            'Collection Date'        => $collection['date'],
            'Collection Time'        => $collection['time'],
        ];

        $foreignKeys = [
            'Collection Unit ID'     => $collection['unitId'],
            'Collection Location ID' => $collection['locationId'],
        ];

        //TODO: data needs to also be properly validated based on the given
        // validation criteria from the back end which needs to be queried.
        // This includes:
        //   - making sure all the keys are integers
        //   - finding the datatype that corresponds to that attribute
        //   - validating for that datatype

        validateRequired($required);
        validateForeignKeys($foreignKeys);
        validateArrays(array('data'=>$collection['data']));
        validateFloats(array('quantity'=>$collection['quantity']));
        //TODO: validate quantity to be positive
        //validatePositive(array('quantity'=>$quantity));
        validateStrings(array('comments'=>$collection['comments']));
        //TODO: validation for date and time should go here
    }
 
    //Validate Preparation
    if (isset($preparation)) {
        $preparation['protocolId'] = $preparation['protocolId'] ?? null;
        $preparation['locationId'] = $preparation['locationId'] ?? null;
        $preparation['date']       = $preparation['date'] ?? null;
        $preparation['time']       = $preparation['time'] ?? null;
        $preparation['comments']   = $preparation['comments'] ?? null;
        $preparation['data']       = $preparation['data'] ?? null;

        $required = [
            'Preparation Protocol' => $preparation['protocolId'],
            'Preparation Location' => $preparation['locationId'],
            'Preparation Date'     => $preparation['date'],
            'Preparation Time'     => $preparation['time'],
        ];
        validateRequired($required);

        $foreignKeys = [
            'Preparation Protocol' => $preparation['protocolId'],
            'Preparation Location' => $preparation['locationId'],
        ];
        validateForeignKeys($foreignKeys);
        validateArrays(array('data'=>$preparation['data']));
        validateStrings(array('comments'=>$preparation['comments']));
        //TODO: validation fro date and time should go here
    }

    //TODO: put analysis requireds here
    if (isset($analysis)) {
        $analysis['methodId']   = $analysis['methodId'] ?? null;
        $analysis['locationId'] = $analysis['locationId'] ?? null;
        $analysis['date']       = $analysis['date'] ?? null;
        $analysis['time']       = $analysis['time'] ?? null;
        $analysis['comments']   = $analysis['comments'] ?? null;
        $analysis['data']       = $analysis['data'] ?? null;

        $required = [
            'Analysis Method'   => $analysis['methodId'],
            'Analysis Location' => $analysis['locationId'],
            'Analysis Date'     => $analysis['date'],
            'Analysis Time'     => $analysis['time'],
        ];
        validateRequired($required);

        $foreignKeys = [
            'Analysis Method' => $analysis['methodId'],
            'Analysis Location' => $analysis['locationId'],
        ];
        validateForeignKeys($foreignKeys);
        validateArrays(array('data'=>$analysis['data']));
        validateStrings(array('comments'=>$analysis['comments']));
        //TODO: validation for date and time should go here

        //TODO: RESET THE VALUES OF ANALYSIS BECAUSE OR ELSE DATA IS NOT SET
        //TO NULL;
    }

    if ($_FILES) {
      $config = \NDB_Config::singleton();
      $mediaPath = $config->getSetting('mediaPath');

      if (!isset($mediaPath)) {
        showError(400, 'Error! Media path is not set in Loris Settings!');
      }

      if (!file_exists($mediaPath)) {
        showError(400, "Error! The upload folder '.$mediaPath.' does not exist!");
      }

      foreach($_FILES as $file) {
        $fileName = $file['name'];
        $extension = pathinfo($fileName)['extension'];

        if (!isset($extension)) {
          showError(400, 'Please make sure your file has a valid extension.');
        }

        if (move_uploaded_file($file['tmp_name'], $mediaPath . $fileName)) {
           //TODO: look into NDB_notifier? 
        } else {
            showError(400, 'Could not upload the file. Please try again!');
        }
      }
    }

    $specimen->setContainerId($containerId);
    $specimen->setTypeId($typeId);
    $specimen->setQuantity($quantity);
    $specimen->setUnitId($unitId);
    $specimen->setFTCycle($fTCycle);
    $specimen->setParentSpecimenId($parentSpecimenId);
    $specimen->setCandidateId($candidateId);
    $specimen->setSessionId($sessionId);
    $specimen->setCollection($collection);
    $specimen->setPreparation($preparation);
    $specimen->setAnalysis($analysis);

    $specimenDAO->saveSpecimen($specimen);
}

function isNegativeInt($param) {
    if (is_null($param)) {
        return false;
    }

    if (!is_numeric($param)) {
        return false;
    }

    if (intval($param) >= 0) {
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
        if (isNegativeInt($value) && !is_null($value)) {
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

function showError($code, $message)
{
    if (!isset($message)) {
        $message = 'An unknown error occurred!';
    }

    http_response_code($code);
    header('Content-Type: application/json; charset=UTF-8');
    exit(json_encode(['message' => $message]));
}
