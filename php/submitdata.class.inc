<?php
/**
 * Biobank Data Submitter
 *
 * Handles biobank submit requests received from a front-end ajax call.
 *
 * PHP Version 7
 *
 * @category Loris
 * @package  Biobank
 * @author   Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://github.com/aces/Loris/
 */
namespace LORIS\biobank;
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;

/**
 * Biobank Data Submitter.
 *
 * Handles biobank submission requests received from a front-end ajax call.
 *
 * PHP Version 7
 *
 * @category Loris
 * @package  Biobank
 * @author   Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license  htpp://ww.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://github.com/aces/Loris/
 */
class SubmitData extends \NDB_Page
{
    public $skipTemplate = true;                                                   
                                                                                   
    /**                                                                            
     * Same as the permission for the main biobank class.                          
     *                                                                             
     * @return bool true iff the user has access to this page.                     
     */                                                                            
    function _hasAccess()                                                          
    {                                                                              
        return true;                                                               
    }                                                                              
                                                                                   
    /**                                                                            
     * This acts as an Ajax endpoint that returns all options for populating       
     * forms and for mapping front-end data in the Biobank Module                  
     *                                                                             
     * @param ServerRequestInterface $request The incoming PSR7 request            
     *                                                                             
     * @return ResponseInterface The outgoing PSR7 response                        
     */                                                                            
    public function handle(ServerRequestInterface $request) : ResponseInterface 
    {                                                                              
        // The parent handles things like hasAccess checks.                        
        $resp = parent::handle($request);                                          
        switch($resp->getStatusCode()) {                                           
        case 200:                                                                  
            // If it waas a 200 code, it just means display was called and         
            // access validated. We still need to do other validations             
            // and add the result body.                                            
            break;                                                                 
        default:                                                                   
            return $resp;                                                          
        }                                                                          
                                                                                   
        // Ensure it's a POST request.                                              
        if ($request->getMethod() != 'POST') {                                      
            return (new \LORIS\Http\Response())                                    
                ->withHeader("content-Type", "text/plain")                         
                ->withStatus(405)                                                  
                ->withHeader("Allow", "POST")                                       
                ->withBody(                                                     
                    new \LORIS\Http\StringStream(                               
                        "Only POST requests are allowed"                         
                    )                                                           
                );                                                              
        }                                                                       

        /**
         * Data Submission Controller
         */
        $queryParams = $request->getQueryParams();
        $action      = $queryParams['action'];
        $postParams  = $request->getParsedBody();
        $data        = json_decode($postParams['data'], true);
        $db          = \Database::singleton();
        $user        = \User::singleton();
        
        switch($action) {
            case 'saveSpecimenList':
                $this->saveSpecimenList($db, $user, $data);
                break;
            case 'saveContainerList':
                $this->saveContainerList($db, $user, $data);
                break;
            case 'savePool':
                $this->savePool($db, $user, $data);
                break;
            case 'saveContainer':
                $this->saveContainer($db, $user, $data);
                break;
            case 'saveSpecimen':
                $this->saveSpecimen($db, $user, $data);
                break;
        }

        return (new \LORIS\Http\Response())                                     
            ->withHeader("Content-Type", "application/json")                    
            ->withStatus(200);
    }  

    // TODO: Function Declaration
    function saveContainerList($db, $user, $list) {
        $containerDAO   = new ContainerDAO($db);
        $containerTypes = $containerDAO->getContainerTypes();
    
        foreach ($list as $item) {
            $container = $item['container'];
            //TODO: regex will have to go here based on container type
            saveContainer($db, $user, $container);
        }
    }
    
    // TODO: Function Declaration
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
                    $this->showError(400, 'Barcode is not of proper format for the 
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
    
    // TODO: Function Declaration
    function savePool($db, $user, $data)
    {
        $poolDAO      = new PoolDAO($db);
        $specimenDAO  = new SpecimenDAO($db);
        $containerDAO = new ContainerDAO($db);
    
        //$id          = $data['id'] ?? null;
        $label       = $data['label']       ?? null;
        $specimenIds = $data['specimenIds'] ?? null;
        $centerId    = $data['centerId']    ?? null;
        $date        = $data['date']        ?? null;
        $time        = $data['time']        ?? null;
    
        /* Validation */
    
        //TODO: Make sure to check that containers are available.
        //TODO: Make sure to check there are atleast two items in the list
        //TODO: check for required fields.
        //TODO: check for proper format of label, date and time.
    
        $baseSpecimen  = $specimenDAO->getSpecimenFromId($specimenIds[0]);
        $baseContainer = $containerDAO->getContainerFromSpecimen($baseSpecimen);
    
        foreach($specimenIds as $specimenId) {
            $specimen  = $specimenDAO->getSpecimenFromId($specimenId);
            $container = $containerDAO->getContainerFromSpecimen($specimen);
            $barcode   = $container->getBarcode();
    
            if ($baseSpecimen->getCandidateId() !== $specimen->getCandidateId()) {
                $this->showError(400, 'Pooled specimens must belong to the same Candidate');
            }
    
            if ($baseSpecimen->getSessionId() !== $specimen->getSessionId()) {
                $this->showError(400, 'Pooled specimens must belong to the same Session');
            }
    
            if ($baseSpecimen->getTypeId() !== $specimen->getTypeId()) {
                $this->showError(400, 'Pooled specimens must be of the same Type');
            }
            
            if ($baseContainer->getCenterId() !== $container->getCenterId()) {
                $this->showError(400, 'Pooled specimens must be at the same Site');
            }
    
            if ($specimen->getQuantity() === 0 ) {
                $this->showError(400, "Quantity of '$barcode' must be greater than '0'");
            }
    
            if ($specimen->getPoolId() !== null) {
                $this->showError(400, "Specimen '$barcode' already belongs to a Pool");
            }
    
            //TODO: Decide if quantity of all pooled specimens should go to 0.
        }
    
        if (!$user->hasPermission('biobank_pool_create')) {
            $this->showError(403, 'You do not have permission to create Pools'); 
        }
        $pool = $poolDAO->createPool();
    
        //Set persistence variables.
        $pool->setLabel($label);
        $pool->setSpecimenIds($specimenIds);
        $pool->setCenterId($centerId);
        $pool->setDate($date);
        $pool->setTime($time);
    
        // Save Pool
        $poolDAO->savePool($pool);
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
            $this->showError(400, "Coordinate can not be set without a Parent Container.");
        }
    
        $this->validateRequired($required);
        $this->validatePositiveInt($positiveInt);
        $this->validateFloats($floats);
    
        // Instatiate Container.
        if (isset($id)) {
            if (!$user->hasPermission('biobank_container_update')) {
                $this->showError(403, 'You do not have permission to update Containers'); 
            }
    
            $container = $containerDAO->getContainerFromId($id);
            $this->validateParentContainer($containerDAO, $container, $parentContainerId);
        } else {
            $containerTypes = $containerDAO->getContainerTypes();
            if (!$user->hasPermission('biobank_container_create') &&
                !($user->hasPermission('biobank_specimen_create') && 
                $containerTypes[$typeId]['primary'] === 0)) 
            {
                $this->showError(403, 'You do not have permission to create Containers'); 
            }
                
            $container = $containerDAO->createContainer();
            $this->validateBarcode($containerDAO, $barcode);
            $container->setBarcode($barcode);
            $container->setTypeId($typeId);
            //TODO: figure out if this should go here or above.
            $container->setOriginId($centerId);
        }
    
        //Set persistence variables.
        $container->setTemperature($temperature);
        $container->setStatusId($statusId);
        $container->setCenterId($centerId);
        $container->setParentContainerId($parentContainerId);
        $container->setCoordinate($coordinate);
    
        // Save Container
        return $containerDAO->saveContainer($container);
    }
    
    function saveSpecimen($db, $user, $data)
    {
        $specimenDAO = new SpecimenDAO($db);
    
        $containerId       = $data['containerId'] ?? null; 
        $typeId            = $data['typeId'] ?? null; 
        $quantity          = $data['quantity'] ?? null;
        $unitId            = $data['unitId'] ?? null;
        $fTCycle           = $data['fTCycle'] ?? null;
        $parentSpecimenIds = $data['parentSpecimenIds'] ?? null;
        $candidateId       = $data['candidateId'] ?? null;
        $sessionId         = $data['sessionId'] ?? null;
        $collection        = $data['collection'] ?? null;
        $preparation       = $data['preparation'] ?? null;
        $analysis          = $data['analysis'] ?? null;
    
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
            'candidateId'      => $candidateId,
            'sessionId'        => $sessionId,
        ];
    
        // Validate arrays
        $arrays = [
            'collection'        => $collection,
            'preparation'       => $preparation,
            'analysis'          => $analysis,
            'parentSpecimenIds' => $parentSpecimenIds,
        ];
    
        $floats = [
            'Quantity' => $quantity,
        ];
    
        //TODO: Check that if there are multiple parentSpecimens, that each of those
        //specimens come from the same candidate, session, type and origin centerId.
    
        $this->validateRequired($required);
        $this->validatePositiveInt($positiveInt);
        $this->validateArrays($arrays);
        $this->validateFloats($floats);
    
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
                'Collection Quantity'  => $collection['quantity'],
                'Collection Unit ID'   => $collection['unitId'],
                'Collection Center ID' => $collection['centerId'],
                'Collection Date'      => $collection['date'],
                'Collection Time'      => $collection['time'],
            ];
    
            $positiveInt = [
                'Collection Unit ID'   => $collection['unitId'],
                'Collection Center ID' => $collection['centerId'],
            ];
    
            //TODO: data needs to also be properly validated based on the given
            // validation criteria from the back end which needs to be queried.
            // This includes:
            //   - making sure all the keys are integers
            //   - finding the datatype that corresponds to that attribute
            //   - validating for that datatype
    
            $this->validateRequired($required);
            $this->validatePositiveInt($positiveInt);
            $this->validateArrays(array('data'=>$collection['data']));
            $this->validateFloats(array('quantity'=>$collection['quantity']));
            //TODO: validate quantity to be positive
            //validatePositive(array('quantity'=>$quantity));
            $this->validateStrings(array('comments'=>$collection['comments']));
            //TODO: validation for date and time should go here
        }
     
        //Validate Preparation
        if (isset($preparation)) {
            //TODO: Check if preparation was previously set and whether the user has
            //permission to biobank_specimen_create.
            $preparation['protocolId'] = $preparation['protocolId'] ?? null;
            $preparation['centerId'] = $preparation['centerId'] ?? null;
            $preparation['date']       = $preparation['date'] ?? null;
            $preparation['time']       = $preparation['time'] ?? null;
            $preparation['comments']   = $preparation['comments'] ?? null;
            $preparation['data']       = $preparation['data'] ?? null;
    
            $required = [
                'Preparation Protocol'  => $preparation['protocolId'],
                'Preparation Center ID' => $preparation['centerId'],
                'Preparation Date'     => $preparation['date'],
                'Preparation Time'     => $preparation['time'],
            ];
            $this->validateRequired($required);
    
            $positiveInt = [
                'Preparation Protocol'  => $preparation['protocolId'],
                'Preparation Center ID' => $preparation['centerId'],
            ];
            $this->validatePositiveInt($positiveInt);
            $this->validateArrays(array('data'=>$preparation['data']));
            $this->validateStrings(array('comments'=>$preparation['comments']));
            //TODO: validation fro date and time should go here
        }
    
        //TODO: put analysis requireds here
        if (isset($analysis)) {
            //TODO: Check if analysis was previously set and whether the user has
            //permission to biobank_specimen_create.
            $analysis['methodId'] = $analysis['methodId'] ?? null;
            $analysis['centerId'] = $analysis['centerId'] ?? null;
            $analysis['date']     = $analysis['date'] ?? null;
            $analysis['time']     = $analysis['time'] ?? null;
            $analysis['comments'] = $analysis['comments'] ?? null;
            $analysis['data']     = $analysis['data'] ?? null;
    
            $required = [
                'Analysis Method'   => $analysis['methodId'],
                'Analysis CenterID' => $analysis['centerId'],
                'Analysis Date'     => $analysis['date'],
                'Analysis Time'     => $analysis['time'],
            ];
            $this->validateRequired($required);
    
            $positiveInt = [
                'Analysis Method'   => $analysis['methodId'],
                'Analysis CenterID' => $analysis['centerId'],
            ];
            $this->validatePositiveInt($positiveInt);
            $this->validateArrays(array('data'=>$analysis['data']));
            $this->validateStrings(array('comments'=>$analysis['comments']));
            //TODO: validation for date and time should go here
        }
    
        if ($_FILES) {
          $config = \NDB_Config::singleton();
          $mediaPath = $config->getSetting('mediaPath');
    
          if (!isset($mediaPath)) {
            $this->showError(400, 'Error! Media path is not set in Loris Settings!');
          }
    
          if (!file_exists($mediaPath)) {
            $this->showError(400, "Error! The upload folder '.$mediaPath.' does not exist!");
          }
    
          foreach($_FILES as $file) {
            $fileName = $file['name'];
            $extension = pathinfo($fileName)['extension'];
    
            if (!isset($extension)) {
              $this->showError(400, 'Please make sure your file has a valid extension.');
            }
    
            if (move_uploaded_file($file['tmp_name'], $mediaPath . $fileName)) {
               //TODO: look into NDB_notifier? 
            } else {
                $this->showError(400, 'Could not upload the file. Please try again!');
            }
          }
        }
    
        // Instantiate Specimen.
        if (isset($data['id'])) {
            if (!$user->hasPermission('biobank_specimen_update')) {
                $this->showError(403, 'You do not have permission to update Specimens'); 
            }
            $specimen   = $specimenDAO->getSpecimenFromId($data['id']);
        } else {
            if (!$user->hasPermission('biobank_specimen_create')) {
                $this->showError(403, 'You do not have permission to create Specimens'); 
            }
            $specimen = $specimenDAO->createSpecimen();
        }
    
        $specimen->setContainerId($containerId);
        $specimen->setTypeId($typeId);
        $specimen->setQuantity($quantity);
        $specimen->setUnitId($unitId);
        $specimen->setFTCycle($fTCycle);
        $specimen->setParentSpecimenIds($parentSpecimenIds);
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
                $this->showError(400, "$key value must be provided");
            }
        }
    }
    
    function validatePositiveInt(array $fields) {
        foreach ($fields as $key=>$value) {
            if ($this->isNegativeInt($value) && !is_null($value)) {
                $this->showError(400, "$key should be a positive integer.");
            }
        }
    }
    
    function validateStrings(array $fields) {
        foreach ($fields as $key=>$value) {
            if (!is_string($value) && !is_null($value)) {
                $this->showError(400, "$key must be a string.");
            }
        }
    }
    
    function validateFloats(array $fields) {
        foreach ($fields as $key=>$value) {
            if (!(is_numeric($value) && is_float(floatval($value)))) {
                $this->showError(400, "$key must be a number.");
            }
        }
    }
    
    function validateArrays(array $fields) {
        foreach ($fields as $key=>$value) {
            if (!is_array($value) && !is_null($value)) {
                $this->showError(400, "$key must be an array.");
            }
        }
    }
    
    function validateParentContainer($containerDAO, $container, $parentId) {
        if ($container->getId() == $parentId) {
                $this->showError(400, 'A container can not be placed within itself or
                    within one of its descendant containers.');
        }
        $childContainers = $containerDAO->getChildContainers($container);
        if (isset($childContainers)) {
            foreach ($childContainers as $child) {
                $this->validateParentContainer($containerDAO, $child, $parentId);
            }
        }
    }
    
    function validateBarcode($containerDAO, $barcode) {
        $containerList = $containerDAO->selectContainers();
        foreach ($containerList as $container) {
            $b = $container->getBarcode();
            if ($b === $barcode) {
                $this->showError(400, 'Barcode must be unique');
            }
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
}
