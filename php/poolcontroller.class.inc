<?php

/**
 * This class features the code that enables access to the Pools of the
 * LORIS Biobank Module.
 *
 * PHP Version 7.2
 *
 * @category   Biobank
 * @package    Main
 * @subpackage Biobank
 * @author     Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license    http://www.gnu.org/licenses/gpl-3.0.text GPLv3
 * @link       http://www.github.com/aces/Loris/
 */

namespace LORIS\biobank;
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;

class PoolController extends \NDB_Menu_Filter
{

    /**
     * Determines whether user has access to Pools
     *
     * @return bool true iff the user has access to this entity
     */
     function _hasAccess()
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
        $this->AjaxModule   = true;
        $this->skipTemplate = true;
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
                                                                                   
        $queryParams = $request->getQueryParams();
        $action      = $queryParams['action'];
        $postParams  = $request->getParsedBody();
        $data        = json_decode($postParams['data'], true);
        $db          = \Database::singleton();
        $user        = \User::singleton();

        switch($action) {
        case 'savePool':
            $this->submitPool($db, $user, $data);
            break;
        case 'getPools':
            $pools = $this->getPools();
            break;
        }

        return (new \LORIS\Http\Response())
            ->withHeader("Content-Type", "application/json")
            ->withStatus(200)
            ->withBody(new \LORIS\Http\StringStream($pools));
    }

    private function submitPool($db, $user, $data) {
        $poolDAO      = new PoolDAO($db);                                       
        $specimenDAO  = new SpecimenDAO($db);                                   
        $containerDAO = new ContainerDAO($db);                                  
                                                                                
        $label       = $data['label']       ?? null;                            
        $specimenIds = $data['specimenIds'] ?? null;                            
        $centerId    = $data['centerId']    ?? null;                            
        $date        = $data['date']        ?? null;                            
        $time        = $data['time']        ?? null;                            
                                                                                
        /* Business Validation */
        //TODO: Make sure to check that containers are available.               
        //TODO: Make sure to check there are atleast two items in the list      

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

    /**
     * Gets the data source for this menu filter.
     *
     * @return \LORIS\Data\Provisioner
     */
    function getDataProvisioner() : \LORIS\Data\Provisioner
    {
        $db          = \Database::singleton();
        $user        = \User::singleton();
        $provisioner = new PoolDAO($db);

        if ($user->hasPermission('access_all_profiles') == false) {
            $provisioner = $provisioner->filter(
                new \LORIS\Data\Filters\UserSiteMatch()
            );
        }

        // XXX: a filter will evenutally go here to filter out the pools that the
        // user does not have permission to view. Currently, the controller (DAO)
        // is fulfilling that role.

        return $provisioner;
    }

    /**
     * Converts the results of this menu filter to a JSON format to be retrieved
     * with ?format=json
     *
     * @return string a json encoded string of the headers and data from this table
     */
    function getPools() : string
    {
        $user  = \User::singleton();
        $pools = $this->getDataProvisioner()->execute($user);

        return json_encode($pools);
    }
}
