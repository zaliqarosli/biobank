<?php

namespace LORIS\biobank;

require 'specimendao.class.inc';

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
    $action = $_GET['action'];
    if ($action == "getFormData") {
        echo json_encode(getFormFields(), JSON_NUMERIC_CHECK);
    } else if ($action == "getSpecimenData") {
        echo json_encode(getSpecimenData(), JSON_NUMERIC_CHECK);
    } else if ($action == "submitSpecimen") {
        submitSpecimen();
    } else if ($action == "edit") {
        editFile();
    }
}

/**
 * Handles the biobank update/specimen process
 *
 * @throws DatabaseException
 *
 * @return void
 */
function editFile()
{
    $db   =& Database::singleton();
    $user =& User::singleton();
    
    // SET PROPER PERMISSION
    //if (!$user->hasPermission('media_write')) {
    //    header("HTTP/1.1 403 Forbidden");
    //    exit;
    //}

    // Read JSON from STDIN
    $stdin       = file_get_contents('php://input');
    $req         = json_decode($stdin, true);
    $idBiobankFile = $req['idBiobankFile'];

    if (!$idBiobankFile) {
        showError("Error! Invalid biobank file ID!");
    }

    $updateValues = [
                     'date_taken' => $req['dateTaken'],
                     'comments'   => $req['comments'],
                     'hide_file'  => $req['hideFile'] ? $req['hideFile'] : 0,
                    ];

    try {
        $db->update('biobank_specimen', $updateValues, ['id' => $idBiobankFile]);
    } catch (DatabaseException $e) {
        showError("Could not update the file. Please try again!");
    }

}


/**
 * Handles the biobank upload process
 *
 * @throws DatabaseException
 *
 * @return void
 */
function submitSpecimen()
{
    //$uploadNotifier = new NDB_Notifier(
    //    "biobank",
    //    "upload"
    //);

    $db     = \Database::singleton();
    //$config = \NDB_Config::singleton();
    //$user   = \User::singleton();
    //if (!$user->hasPermission('biobank_write')) {
    //    header("HTTP/1.1 403 Forbidden");
    //    exit;
    //}

    //// Validate biobank path and destination folder
    //$biobankPath = $config->getSetting('biobankPath');

    //if (!isset($biobankPath)) {
    //    showError("Error! Biobank path is not set in Loris Settings!");
    //    exit;
    //}

    //if (!file_exists($biobankPath)) {
    //    showError("Error! The upload folder '$biobankPath' does not exist!");
    //    exit;
    //}

    // Process posted data
    
    $parentSpecimenId = isset($_POST['parentSpecimen']) ? $_POST['parentSpecimen'] : null;
    $candidateId      = isset($_POST['pscid']) ? $_POST['pscid'] : null;
    $sessionId        = isset($_POST['visitLabel']) ? $_POST['visitLabel'] : null;
    $timeCollect      = isset($_POST['timeCollect']) ? $_POST['timeCollect'] : null;
    $barcodeFormList  = isset($_POST['barcodeFormList']) ? json_decode($_POST['barcodeFormList'], true) : null;
    //$site           = isset($_POST['forSite']) ? $_POST['forSite'] : null;

    $specimenTypeAttributes = SpecimenDAO::getSpecimenTypeAttributes();
    foreach ($barcodeFormList as $barcodeForm) {
        $barcode           = isset($barcodeForm['barcode']) ? $barcodeForm['barcode'] : null;
        $specimenTypeId    = isset($barcodeForm['specimenType']) ? $barcodeForm['specimenType'] : null;
        $containerTypeId   = isset($barcodeForm['containerType']) ? $barcodeForm['containerType'] : null;
        $parentContainerId = isset($barcodeForm['parentContainer']) ? $barcodeForm['parentContainer'] : null;
        $quantity          = isset($barcodeForm['quantity']) ? $barcodeForm['quantity'] : null;
        $notes             = isset($barcodeForm['notes']) ? $barcodeForm['notes'] : null;

        print_r($barcodeForm);

        if (!empty($specimenTypeId)) {
           foreach($specimenTypeAttributes[$specimenTypeId] as $attributeId=>$parameters) {
               $data[$parameters['name']] = isset($barcodeForm[$attributeId]) ? $barcodeForm[$attributeId] : null;
           }
           $data = json_encode($data);
        } 

        $query = [
                  'barcode'             => $barcode,
                  'type_id'             => $containerTypeId,
                  'status_id'           => '1',
                  'locus_id'            => '1',
                  'parent_container_id' => $parentContainerId,
                  'time_create'         => $timeCollect,
                  'notes'               => $notes,
                 ];

        $db->insert('biobank_container', $query);

	    $containerId = ContainerDAO::getContainerIdFromBarcode($barcode);
	    $query = [
                  'container_id'       => $containerId,
                  'type_id'            => $specimenTypeId,
                  'quantity'           => $quantity,
                  'parent_specimen_id' => $parentSpecimenId,
                  'candidate_id'       => $candidateId,
                  'session_id'         => $sessionId,
                  'time_collect'       => $timeCollect,
                  'notes'              => $notes,
                  'data'               => $data,
                 ];


        $db->unsafeinsert('biobank_specimen', $query);
    }

    // If required fields are not set, show an error
    //if (!isset($_FILES) || !isset($pscid) || !isset($visit) || !isset($site)) {
    //    showError("Please fill in all required fields!");
    //    return;
    //}
    //$fileName  = preg_replace('/\s/', '_', $_FILES["file"]["name"]);
    //$fileType  = $_FILES["file"]["type"];
    //$extension = pathinfo($fileName)['extension'];

    //if (!isset($extension)) {
    //    showError("Please make sure your file has a valid extension!");
    //    return;
    //}

    //$userID = $user->getData('UserID');

    //$sessionID = $db->pselectOne(
    //    "SELECT s.ID as session_id FROM candidate c " .
    //    "LEFT JOIN session s USING(CandID) WHERE c.PSCID = :v_pscid AND " .
    //    "s.Visit_label = :v_visit_label AND s.CenterID = :v_center_id",
    //    [
    //     'v_pscid'       => $pscid,
    //     'v_visit_label' => $visit,
    //     'v_center_id'   => $site,
    //    ]
    //);

    //if (!isset($sessionID) || count($sessionID) < 1) {
    //    showError(
    //        "Error! A session does not exist for candidate '$pscid'' " .
    //        "and visit label '$visit'."
    //    );

    //    return;
    //}


    // Build insert query ON HOLD FOR NOW
    //$query = [
    //          'barcode'     => $barcode,
    //          'type_id'     => $containerTypeId,
    //          'status_id'   => '1',
    //          'locus_id'    => '1',
    //          'parent_container_id' => $parentContainerId,
    //          'time_create' => $timeCollect,
    //          'notes'       => $notes,
    //         ];

    //$db->insert('biobank_container', $query);

	//$containerId = ContainerDAO::getContainerIdFromBarcode($barcode);
	//$query = [
    //          'container_id' => $containerId,
    //          'type_id'      => $specimenTypeId,
    //          'quantity'     => $quantity,
    //          'candidate_id' => $candidateId,
    //          'session_id'   => $sessionId,
    //          'time_collect' => $timeCollect,
    //          'notes'        => $notes,
    //          'data'         => $data,
    //         ];


    //$db->unsafeinsert('biobank_specimen', $query);

    //if (move_uploaded_file($_FILES["file"]["tmp_name"], $biobankPath . $fileName)) {
    //    $existingFiles = getFilesList();
    //    $idBiobankFile   = array_search($fileName, $existingFiles);
    //    try {
    //        // Override db record if file_name already exists
    //        if ($idBiobankFile) {
    //            $db->update('biobank_specimen', $query, ['id' => $idBiobankFile]);
    //        } else {
    //            $db->insert('biobank_specimen', $query);
    //        }
    //        $uploadNotifier->notify(array("file" => $fileName));
    //    } catch (DatabaseException $e) {
    //        showError("Could not upload the file. Please try again!");
    //    }
    //} else {
    //    showError("Could not upload the file. Please try again!");
    //}
}

function getFormFields()
{

    $db = \Database::singleton();

    //THIS SHUOLD EVENTUALLY BE REPLACED BY CANDIDATE DAO
    $query      = "SELECT ID, PSCID FROM candidate ORDER BY PSCID";
    $candidates = $db->pselect($query, array());
    foreach ($candidates as $row=>$column) {
        $PSCIDs[$column['ID']] = $column['PSCID'];
    }

    $visitList       = \Utility::getVisitList();
    $siteList        = \Utility::getSiteList(false);

    // Build array of session data to be used in upload media dropdowns
    $sessionData    = array(); 
    $sessionRecords = $db->pselect(
        "SELECT c.PSCID, s.Visit_label, s.CenterID, s.ID " .
        "FROM candidate c ".
        "LEFT JOIN session s USING(CandID) ".
        "LEFT JOIN flag f ON (s.ID=f.SessionID) ".
        "ORDER BY c.PSCID ASC",
        []
    );  

    //SINCE Visit_label and CenterID BOTH BELONG TO SAME SESSION, ONLY ONE NEEDS TO BE SAVED
    // AND THE OTHER CAN BE AUTO-FILLED
    foreach ($sessionRecords as $record) {

        // Populate sites
        if (!isset($sessionData[$record["PSCID"]]['sites'])) {
            $sessionData[$record["PSCID"]]['sites'] = array();
        }
        if ($record["CenterID"] !== null && !in_array(
            $record["CenterID"],
            $sessionData[$record["PSCID"]]['sites'],
            true
        )
        ) {
            $sessionData[$record["PSCID"]]['sites'][$record["CenterID"]]
                = $siteList[$record["CenterID"]];
        }

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

    //Array mapping for Front end selectform 'options' since dao returns all columns of table rather than proper options mapping
    $specimenTypes = SpecimenDAO::getSpecimenTypes();
	foreach ($specimenTypes as $id=>$attribute) {
        $specimenTypes[$id] = $attribute['label'];
	}

    $containerTypesPrimary = ContainerDAO::getContainerTypesPrimary();
    $containerCapacities = ContainerDAO::getContainerCapacities();
    $containerUnits = ContainerDAO::getContainerUnits();
    foreach ($containerTypesPrimary as $typeId=>$attribute) {

        $capacityId = $containerTypesPrimary[$typeId]['capacity_id'];
        $unitId = $containerCapacities[$capacityId]['unit_id'];

        $units[$typeId] = $containerUnits[$unitId]['unit'];        
        $capacities[$typeId] = $containerCapacities[$capacityId]['quantity'];
        $containerTypesPrimary[$typeId] = $attribute['label'];
    }

    //$containerTypesNonPrimary = ContainerDAO::getContainerTypesNonPrimary();
    //foreach ($containerTypesNonPrimary as $id=>$attribute) {
    //    $containerTypesNonPrimary[$id] = $attribute['label'];
    //}

    $containersNonPrimary = ContainerDAO::getContainersNonPrimary();
    foreach ($containersNonPrimary as $id=>$attribute) {
        $containerBarcodesNonPrimary[$id] = $attribute['barcode'];
    }

	$specimenTypeAttributes = SpecimenDAO::getSpecimenTypeAttributes();
    $attributeDatatypes = SpecimenDAO::getAttributeDatatypes();
    
    $formFields = [
               'PSCIDs'                 => $PSCIDs,
               'visits'                 => $visitList,
               'sites'                  => $siteList,
               'sessionData'            => $sessionData,
               'specimenTypes'          => $specimenTypes,
               'containerTypesPrimary'  => $containerTypesPrimary,
               //'containerTypesNonPrimary' => $containerTypesNonPrimary,
               'containerBarcodesNonPrimary' => $containerBarcodesNonPrimary,
               'units'                  => $units,
               'capacities'             => $capacities,
               'specimenTypeAttributes' => $specimenTypeAttributes,
               'attributeDatatypes'     => $attributeDatatypes,
              ];

    return $formFields;
    
}



 /*
  * @return array
  * @throws DatabaseException
  */
function getSpecimenData()
{
    $db = \Database::singleton();

    $specimenData        = array();
    $barcode             = $_GET['barcode'];
    $specimen            = SpecimenDAO::getSpecimenFromBarcode($barcode);
    $container           = ContainerDAO::getContainerFromSpecimen($specimen);
	$specimenTypes       = SpecimenDAO::getSpecimenTypes();
	$containerTypesPrimary      = ContainerDAO::getContainerTypesPrimary();
    $containerCapacities = ContainerDAO::getContainerCapacities();
    $containerUnits      = ContainerDAO::getContainerUnits();
    $containerStati      = ContainerDAO::getContainerStati();
	$containerLoci       = ContainerDAO::getContainerLoci();

	// In the future, this information should be retrieved using the candidateDAO and the sessionDAO
	$candidateInfo = SpecimenDAO::getCandidateInfo($specimen->getCandidateId());
    $sessionInfo   = SpecimenDAO::getSessionInfo($specimen->getSessionId());
    $siteInfo      = ContainerDAO::getSiteInfo();

    $specimenData = [
			   'specimenTypes'  => $specimenTypes,
			   'containerTypesPrimary' => $containerTypesPrimary,
			   'containerCapacities' => $containerCapacities,
	           'containerUnits' => $containerUnits,
               'containerStati' => $containerStati,
               'containerLoci'  => $containerLoci,
		       'candidateInfo'  => $candidateInfo,
			   'sessionInfo'    => $sessionInfo,
               'siteInfo'       => $siteInfo,
               'specimenData'   => $specimen->toArray(),
	           'containerData'  => $container->toArray(),
              ];
    
    $parentSpecimenId = $specimen->getParentSpecimenId();
    if ($parentSpecimenId) {
	    $parentSpecimenBarcode = SpecimenDAO::getBarcodeFromSpecimenId($parentSpecimenId);
	    $specimenData['parentSpecimenBarcode'] = $parentSpecimenBarcode;
    }

    $parentContainerId = $container->getParentContainerId();
    if ($parentContainerId) {
	    $parentContainerBarcode = ContainerDAO::getBarcodeFromContainerId($parentContainerId);
	    $specimenData['parentContainerBarcode'] = $parentContainerBarcode;
    }

    
    return $specimenData;
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

/**
 * Utility function to convert data from database to a
 * (select) dropdown friendly format
 *
 * @param array  $options array of options
 * @param string $item    key
 * @param string $item2   value
 *
 * @return array
 */
function toSelect($options, $item, $item2)
{
    $selectOptions = [];

    $optionsValue = $item;
    if (isset($item2)) {
        $optionsValue = $item2;
    }

    foreach ($options as $key => $value) {
        $selectOptions[$options[$key][$optionsValue]] = $options[$key][$item];
    }

    return $selectOptions;
	
}

/**
 * Returns an array of (id, file_name) pairs from biobank table
 *
 * @return array
 * @throws DatabaseException
 */
function getFilesList()
{
    $db       =& \Database::singleton();
    $fileList = $db->pselect("SELECT id, file_name FROM media", []);

    $mediaFiles = [];
    foreach ($fileList as $row) {
        $mediaFiles[$row['id']] = $row['file_name'];
    }

    return $mediaFiles;
}
