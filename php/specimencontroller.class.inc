<?php

/**
 * This class features the code that enables access to the Pools of the LORIS 
 * Biobank Module.
 *
 * PHP Version 7.2
 *
 * @category   Biobank
 * @package    Main
 * @subpackage Biobank
 * @author     Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license    http://www.gnu.org/licenses/gpl-3.0.text GPLv3
 * @link       http://www.github.com/aces/Lors/
 */

namespace LORIS\biobank;
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;

class SpecimenController extends \NDB_Menu_Filter
{
    /**
     * Determines whether user has access to Specimens
     *
     * @return bool true iff the user has access to this entity
     */
    function _hasAcess()
    {
        // TODO: determine the proper permissions to be placed here.
        return true;
    }

    /**
     * Set up the variables required by NDB_Menu_Filter class for construction
     * a query
     *
     * @return void
     */
    function _setupVariables()
    {
        $this->skipTemplate = true;
        $this->AjaxModule   = true;
    }

    /**
     * This acts as an Ajax endpoint that resolves requests from the front-end
     *
     * @param ServerRequestInterface $request The incoming PSR7 request
     *
     * @return ResponseInterface The outgoing PSR7 response
     */
    public function handle(ServerRequestInterface $request) : ResponseInterface
    {
        // The parent handles things like has Access checks.
        $resp = parent::handle($request);
        switch($resp->getStatusCode()) {
        case 200:
            break;
        default:
            return $resp;
        }

        $queryParams = $request->getQueryParams();
        $action      = $queryParams['action'];
        $postParams  = $request->getParsedBody();
        $data        = json_decode($postParams['data'], true);
        $db          = \Database::singleton();
        $user        = \User::singleton();

        switch($action) {
        case 'saveSpecimenList':
            $this->submitSpecimenList($db, $user, $data);
        case 'saveSpecimen':
            $this->submitSpecimen($db, $user, $data);
            break;
        case 'getSpecimens':
            $specimens = $this->toJSON();
            break;
        }

        return (new \LORIS\Http\Response())
            ->withHeader("Content-Type", "application/json")
            ->withStatus(200)
            ->withBody(new \LORIS\Http\StringStream($specimens));
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

    /**
     * Gets the data source for this menu filter.
     *
     * @return \LORIS\Data\Provisioner
     */
    function getDataProvisioner() : \LORIS\Data\Provisioner
    {
        $db          = \Database::singleton();
        $user        = \User::singleton();
        $provisioner = new SpecimenDAO($db);

        // XXX: I am still unsure if this filter is working properly. Ask Dave
        // about the details of getting it to work.
        if ($user->hasPermission('access_all_profiles') == false) {
            $provisioner = $provisioner->filter(
                new \LORIS\Data\Filters\UserSiteMatch()
            );
        }

        // XXX: A filter wil likely need to go here to filter out the specimen
        // data if they do not have the proper permission. Currently, the controller
        // (DAO) is fulfilling that role.

        return $provisioner;
    }

    /**
     * Converts the results of this menu filter to a JSON format to be retrieved
     * with ?format=json
     *
     * @return string a json encoded string of the headers and data from this table
     */
    function toJSON() : String
    {
        $user      = \User::singleton();
        $specimens = $this->getDataProvisioner()->execute($user);

        return json_encode($specimens);
    }
}
