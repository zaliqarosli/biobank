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

// TODO: Permision check needs to be make to make sure they are supposed to
// edit this specimen
function saveContainer($db)
{
    $containerDAO = new ContainerDAO($db);
    // Get container ID
    if (isset($_POST['id'])) {
        $containerId = $_POST['id'];
        $container = $containerDAO->getContainerFromId($containerId);
    } else {
        $container = $containerDAO->createContainer();
    }

    if (isset($_POST['comments'])) {
        $comments = $_POST['comments'];
        if (!is_string($comments)) {
            showError('Comments are not of type string');
        }
        $container->setComments($comments);
    }

    // Validate barcode
    if (isset($_POST['barcode'])) {
        $barcode = $_POST['barcode'];
        if (!(is_string($barcode))) {
            showError(404, 'Type ID is not of type int');
        }
        $container->setBarcode($barcode);
    } else {
        showError(404, 'Container Type must be provided');
    }

    // Validate type ID
    if (isset($_POST['typeId'])) {
        $typeId = intval($_POST['typeId']);
        if (!(is_int($typeId) && $typeId > 0)) {
            showError(404, 'Type ID is not of type int');
        }
        $container->setTypeId($typeId);
    } else {
        showError(404, 'Container Type must be provided');
    }

    // Validate temperature
    //TODO: check if parent ID exists. If so, this container should adopt
    //      the parent's temperature.
    if (isset($_POST['temperature'])) {
        $temperature = floatval($_POST['temperature']);
        if (!is_float($temperature)) {
            showError(404, 'Temperature is not of type float');
        }
        $container->setTemperature($temperature);
    }

    // Validate status ID
    if (isset($_POST['statusId'])) {
        $statusId = intval($_POST['statusId']);
        if (!(is_int($statusId) && $statusId > 0)) {
            showError(404, 'Status ID is not of type int');
        }
        $container->setStatusId($statusId);
    }

    // Validate origin ID
    if (isset($_POST['originId'])) {
        $originId = intval($_POST['originId']);
        if (!(is_int($originId) && $originId > 0)) {
            showError(404, 'Origin ID is not of type int');
        }
        $container->setOriginId($originId);
    }

    // Validate location ID
    if (isset($_POST['locationId'])) {
        $locationId = intval($_POST['locationId']);
        if (!(is_int($locationId) && $locationId > 0)) {
            showError(404, 'Location ID is not of type int');
        }
        $container->setLocationId($locationId);
    }

    // Validate parent container ID
    //TODO: there needs to be a check that parentContainerId is not a 
    //child of the container in question, and is not the container itself.
    $parentContainerId = $_POST['parentContainerId'] ?? null;
    if(!is_null($parentContainerId)) {
        $parentContainerId = intval($parentContainerId);
        if (!(is_int($parentContainerId) && $parentContainerId > 0)) {
            showError(404, 'Parent container ID is not of type int');
        }
    }
    $container->setParentContainerId($parentContainerId);

    // Validate child container IDs
    //if (isset($_POST['childContainerIds'])) {
    //    $childContainerIds = $_POST['childContainerIds'];
    //    if (!is_array($childContainerIds)) {
    //        showError(404, 'Child container IDs is not of type array');
    //    }
    //    $container->setChildContainerIds($childContainerIds);
    //}

    // Validate container coordinate
    $coordinate = $_POST['coordinate'] ?? null;
    // Coordinate cannot be assigned without parent container
    if (!is_null($coordinate)) {
        $coordinate = intval($coordinate);
        if (is_null($parentContainerId)) {
            showError(404, 'Container must have a parent to be assigned a coordinate');
        }
        if (!(is_int($coordinate)) && ($coordinate > 0)) {
            showError('Coordinate is not of type int');
        }
    }
    $container->setCoordinate($coordinate);

    // Validate create date/time
    if (isset($_POST['dateTimeCreate'])) {
        $dateTimeCreate = $_POST['dateTimeCreate'];
        if (!is_string($dateTimeCreate) && empty($dateTimeCreate)) {
            showError('Create date/time is not of type string');
        }
        $container->setDateTimeCreate($dateTimeCreate);
    }

    // Validate comments
    if (isset($_POST['comments'])) {
        $comments = $_POST['comments'];
        if (!is_string($comments)) {
            showError('Comments are not of type string');
        }
        $container->setComments($comments);
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
