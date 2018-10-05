<?php


/**
 * This class features the code that enables access to the containers of the
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
require '/var/www/loris/modules/biobank/filters/NonPrimaryContainerFilter.php';
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;

class ContainerController extends \NDB_Menu_Filter
{

    /**
     * Determines whether user has access to Containers
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
     * This acts as an Ajax endpoint that resolves requests from the front-end.
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
        case 'saveContainerList':
            $this->submitContainerList($db, $user, $data);
        case 'saveContainer':
            $this->submitContainer($db, $user, $data);
            break;
        case 'getContainers':
            $containers = $this->toJSON();
            break;
        }
            return (new \LORIS\Http\Response())
                ->withHeader("Content-Type", "application/json")
                ->withStatus(200)
                ->withBody(new \LORIS\Http\StringStream($containers));
    }

    private function submitContainerList($db, $user, $data) {
        $containerDAO   = new ContainerDAO($db);                                   
        $containerTypes = $containerDAO->getContainerTypes();                      
                                                                                   
        foreach ($list as $item) {                                                 
            $container = $item['container'];                                       
            //TODO: regex will have to go here based on container type             
            $this->submitContainer($db, $user, $container);                                 
        }                                                                          
    }    

    public function submitContainer($db, $user, $data) {
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

    /**
     * Gets the data source for this menu filter.
     *
     * @return \LORIS\Data\Provisioner
     */
    function getDataProvisioner() : \LORIS\Data\Provisioner
    {
        $db          = \Database::singleton();
        $user        = \User::singleton();
        $provisioner = new ContainerDAO($db);

        // XXX: I am still unsure if this filter is working properly. Ask Dave
        // about the details of getting it to work.
        if ($user->hasPermission('access_all_profiles') == false) {
            $provisioner = $provisioner->filter(
                new \LORIS\Data\Filters\UserSiteMatch()
            );
        }

        // XXX: These filter currently do not work and therefore they provisioner
        // (DAO) is doing the work of checking the permissions and returning the
        // appropriate information.

        //if ($user->hasPermission('biobank_container_view') == false) {
        //    $provisioner = $provisioner->filter(
        //        new NonPrimaryContainerFilter()
        //    );
        //}
        //if ($user->hasPermission('biobank_specimen_view') == false) {
        //    $provisioner = $provisioner->filter(
        //        new PrimaryContainerFilter()
        //    );
        //}
        return $provisioner;
    }

    /**
     * Converts the results of this menu filter to a JSON format to be retrieved
     * with ?format=json
     *
     * @return string a json encoded string of the headers and data from this table
     */
    function toJSON() : string
    {
        $user       = \User::singleton();
        $containers = $this->getDataProvisioner()->execute($user);
        // XXX: potentially include a mapper here that removes the Parent Container
        // ID from the Container Object if there is no biobank_container_view 
        // permission. This way, there will be no need for any permission 
        // information in the DAO.
        return json_encode($containers);
    }
}
