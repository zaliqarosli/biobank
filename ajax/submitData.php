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
    //TODO: Check for 'Edit' or 'Create' Permission.
    $db     = \Database::singleton();
    $user   = \User::singleton();
    $action = $_GET['action'];
    $data   = json_decode($_POST['data'], true);

    switch($action) {
    case 'saveSpecimenList':
        saveSpecimenList($db, $user, $data);
        break;
    case 'saveContainerList':
        saveContainerList($db, $user, $data);
        break;
    case 'saveContainer':
        saveContainer($db, $user, $data);
        break;
    case 'saveSpecimen':
        saveSpecimen($db, $user, $data);
        break;
    case 'submitPoolForm':
        submitPoolForm($db, $_POST);
        break;
    }
}

//TODO: saveContainerList and saveBarcodeList may be able to go into a generalizable
// function!
function saveContainerList($db, $user, $list) {
    $containerDAO   = new ContainerDAO($db);
    $containerTypes = $containerDAO->getContainerTypes();

    foreach ($list as $item) {
        $container = $item['container'];
        //TODO: regex will have to go here based on container type
        saveContainer($db, $user, $container);
    }
}

function saveSpecimenList($db, $user, $list)
{
    $specimenDAO   = new SpecimenDAO($db);
    $specimenTypes = $specimenDAO->getSpecimenTypes();

    foreach ($list as $item) {
        $container = $item['container'];
        $specimen  = $item['specimen'];

        // Check that barcode is of proper format for given specimen type.
        $regex = $specimenTypes[$specimen['typeId']]['regex'];
        if (isset($regex)) {
            if (preg_match($regex, $container['barcode']) !== 1) {
                showError(400, 'Barcode is not of proper format for the 
                        selected specimen type');
            }
        }

        // Save Container and Specimen
        $containerId = saveContainer($db, $user, $container);
        $specimen['containerId'] = $containerId;
        //TODO: if save specimen fails, it should delete the container it is 
        //associated to.
        saveSpecimen($db, $user, $specimen);
    }
}

function saveContainer($db, $user, $data)
{
    $containerDAO = new ContainerDAO($db);

    $id                = $data['id']                ?? null;
    $barcode           = $data['barcode']           ?? null;
    $typeId            = $data['typeId']            ?? null;
    $temperature       = $data['temperature']       ?? null;
    $statusId          = $data['statusId']          ?? null;
    $centerId          = $data['centerId']          ?? null;
    $parentContainerId = $data['parentContainerId'] ?? null;
    $coordinate        = $data['coordinate']        ?? null;

    // Validate required fields.
    $required = [
        'Barcode'        => $barcode,
        'Container Type' => $typeId,
        'Temperature'    => $temperature,
        'Status'         => $statusId,
        'Center'         => $centerId,
    ];

    // Validate foreign keys as positive integer.
    $positiveInt = [
        'typeId'            => $typeId,
        'statusId'          => $statusId,
        'centerId'          => $centerId,
        'parentContainerId' => $parentContainerId,
        'coordinate'        => $coordinate,
    ];

    // Validate floats.
    $floats = [
        'temperature' => $temperature,
    ];

    // Validate Coordinate dependency on Parent Container.
    if (!is_null($coordinate) && is_null($parentContainerId)) {
        showError(400, "Coordinate can not be set without a Parent Container.");
    }

    validateRequired($required);
    validatePositiveInt($positiveInt);
    validateFloats($floats);

    // Instatiate Container.
    if (isset($id)) {
        //if (!$user->hasPermission('biobank_edit')) {
        //    showError(403, 'You do not have permission to edit Containers'); 
        //}

        $container = $containerDAO->getContainerFromId($id);
        validateParentContainer($containerDAO, $container, $parentContainerId);
    } else {
        //if (!$user->hasPermission('biobank_write')) {
        //    showError(403, 'You do not have permission to create Containers'); 
        //}
            
        $container = $containerDAO->createContainer();
        validateBarcode($containerDAO, $barcode);
        $container->setBarcode($barcode);
        $container->setTypeId($typeId);
        //TODO: figure out if this should go here or above.
        $container->setOriginId($centerId);
    }

    //Set persistence variables.
    $container->setTemperature($temperature);
    $container->setStatusId($statusId);
    $container->setLocationId($centerId);
    $container->setParentContainerId($parentContainerId);
    $container->setCoordinate($coordinate);

    // Save Container
    return $containerDAO->saveContainer($container);
}

function saveSpecimen($db, $user, $data)
{
    $specimenDAO = new SpecimenDAO($db);

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

     $positiveInt = [
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

    $floats = [
        'Quantity' => $quantity,
    ];

    validateRequired($required);
    validatePositiveInt($positiveInt);
    validateArrays($arrays);
    validateFloats($floats);

    // Validate Collection
    if (isset($collection)) {
        $collection['quantity']   = $collection['quantity'] ?? null;
        $collection['unitId']     = $collection['unitId'] ?? null;
        $collection['centerId']   = $collection['centerId'] ?? null;
        $collection['date']       = $collection['date'] ?? null;
        $collection['time']       = $collection['time'] ?? null;
        $collection['comments']   = $collection['comments'] ?? null;
        $collection['data']       = $collection['data'] ?? null;
        
        $required = [
            'Collection Quantity'    => $collection['quantity'],
            'Collection Unit ID'     => $collection['unitId'],
            'Collection Location ID' => $collection['centerId'],
            'Collection Date'        => $collection['date'],
            'Collection Time'        => $collection['time'],
        ];

        $positiveInt = [
            'Collection Unit ID'     => $collection['unitId'],
            'Collection Location ID' => $collection['centerId'],
        ];

        //TODO: data needs to also be properly validated based on the given
        // validation criteria from the back end which needs to be queried.
        // This includes:
        //   - making sure all the keys are integers
        //   - finding the datatype that corresponds to that attribute
        //   - validating for that datatype

        validateRequired($required);
        validatePositiveInt($positiveInt);
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
        $preparation['centerId'] = $preparation['centerId'] ?? null;
        $preparation['date']       = $preparation['date'] ?? null;
        $preparation['time']       = $preparation['time'] ?? null;
        $preparation['comments']   = $preparation['comments'] ?? null;
        $preparation['data']       = $preparation['data'] ?? null;

        $required = [
            'Preparation Protocol' => $preparation['protocolId'],
            'Preparation Location' => $preparation['centerId'],
            'Preparation Date'     => $preparation['date'],
            'Preparation Time'     => $preparation['time'],
        ];
        validateRequired($required);

        $positiveInt = [
            'Preparation Protocol' => $preparation['protocolId'],
            'Preparation Location' => $preparation['centerId'],
        ];
        validatePositiveInt($positiveInt);
        validateArrays(array('data'=>$preparation['data']));
        validateStrings(array('comments'=>$preparation['comments']));
        //TODO: validation fro date and time should go here
    }

    //TODO: put analysis requireds here
    if (isset($analysis)) {
        $analysis['methodId']   = $analysis['methodId'] ?? null;
        $analysis['centerId'] = $analysis['centerId'] ?? null;
        $analysis['date']       = $analysis['date'] ?? null;
        $analysis['time']       = $analysis['time'] ?? null;
        $analysis['comments']   = $analysis['comments'] ?? null;
        $analysis['data']       = $analysis['data'] ?? null;

        $required = [
            'Analysis Method'   => $analysis['methodId'],
            'Analysis Location' => $analysis['centerId'],
            'Analysis Date'     => $analysis['date'],
            'Analysis Time'     => $analysis['time'],
        ];
        validateRequired($required);

        $positiveInt = [
            'Analysis Method' => $analysis['methodId'],
            'Analysis Location' => $analysis['centerId'],
        ];
        validatePositiveInt($positiveInt);
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

    // Instantiate Specimen.
    if (isset($data['id'])) {
        //if (!$user->hasPermission('biobank_edit')) {
        //    showError(403, 'You do not have permission to edit Specimens'); 
        //}
        $specimen   = $specimenDAO->getSpecimenFromId($data['id']);
    } else {
        //if (!$user->hasPermission('biobank_write')) {
        //    showError(403, 'You do not have permission to create Specimens'); 
        //}
        $specimen = $specimenDAO->createSpecimen();
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

function validatePositiveInt(array $fields) {
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

function validateParentContainer($containerDAO, $container, $parentId) {
    if ($container->getId() == $parentId) {
            showError(400, 'A container can not be placed within itself or
                within one of its descendant containers.');
    }
    $childContainers = $containerDAO->getChildContainers($container);
    foreach ($childContainers as $child) {
        validateParentContainer($containerDAO, $child, $parentId);
    }
}

function validateBarcode($containerDAO, $barcode) {
    $containerList = $containerDAO->selectContainers();
    foreach ($containerList as $container) {
        $b = $container->getBarcode();
        if ($b === $barcode) {
            showError(400, 'Barcode must be unique');
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
