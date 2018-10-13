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
class ContainerController extends \NDB_Page
{
    var $responder;
    var $dao;
    var $db;
    var $user;

    //TODO: Look into NDB_Page and NDB_Menu_Filter to understand the right flow
    //of function calls to be able to do this in a nice way
    function __construct($db, $user, $responder)
    {
        $this->db = $db;
        $this->user = $user;
        $this->responder = $responder;
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
        $this->db        = \Database::singleton();
        $this->user      = $request->getAttribute('user');
        $this->dao       = new ContainerDAO($this->db);
        $this->responder = new BiobankResponder();

        $action = $request->getQueryParams()['action'];
        $data   = json_decode($request->getParsedBody()['data'], true);
        switch($action) {
        case 'saveContainer':
            // XXX: This is neccesarily an update - should I write that into the logic?
            // Prepare Container
            $container = $this->prepContainer($data);

            // Save Container
            $this->dao->saveContainer($container);
            return $this->responder->success('Success!');
            break;
        case 'saveContainerList':
            // XXX: This is neccesarily an create - should I write that into the logic?
            // Prepare Containers
            $containerList = array();
            foreach ($data as $item) {
                $container = $this->prepContainer($item['container']);
                $containerList[] = $container;
            }

            // Save Containers
            foreach($containerList as $container) {
                $this->dao->saveContainer($container);
            }
            return $this->responder->success('Success!');
            break;
        default:
            return $this->responder->badRequest('The request made to the server is invalid');
        }
    }

    /**
     * Converts the results of this menu filter to a JSON format to be retrieved
     * with ?format=json
     *
     * @return string a json encoded string of the headers and data from this table
     */
    public function fetchContainers() : string
    {
        $containers = $this->getDataProvisioner()->execute($this->user);
        // XXX: potentially include a mapper here that removes the Parent Container
        // ID from the Container Object if there is no biobank_container_view
        // permission. This way, there will be no need for any permission
        // information in the DAO.
        return json_encode($containers);
    }

    /**
     * Gets the data source for this menu filter.
     *
     * @return \LORIS\Data\Provisioner
     */
    private function getDataProvisioner() : \LORIS\Data\Provisioner
    {
        $provisioner = new ContainerDAO($this->db);

        // XXX: I am still unsure if this filter is working properly. Ask Dave
        // about the details of getting it to work.
        if ($this->user->hasPermission('access_all_profiles') == false) {
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
     * Prepares Container for Submission into the Database.
     *
     * @param array        $data
     *
     * @return Container $container to be submitted
     */
    public function prepContainer(array $data) : Container
    {
        $container = $this->setContainer($data);
        $this->validatePermission($container);
        $this->validateData($container);

        return $container;
    }

    /**
     * Instatiates a Container Object using the information sent from the front-end.
     *
     * @param array        $data Data to be used to create Container Object
     *
     * @return Container   $container Instantiated Container Object
     */
    public function setContainer(array $data) : Container
    {
        //Set persistence variables.
        $container = $this->dao->createContainer();

        $container->setId($data['id']);
        $container->setBarcode($data['barcode']);
        $container->setTypeId($data['typeId']);
        $container->setTemperature($data['temperature']);
        $container->setStatusId($data['statusId']);
        $container->setCenterId($data['centerId']);
        $container->setOriginId($data['originId']);
        $container->setParentContainerId($data['parentContainerId']);
        $container->setCoordinate($data['coordinate']);

        return $container;
    }

    /**
     * Checks User Permissions for creating or updating Container Objects.
     *
     * @param Container    $container Container to be checked
     * ADD RESPONDER
     *
     * @return void
     */
    function validatePermission(Container $container) : void
    {
        $id = $container->getId();
        if (isset($id)) {
            if (!$this->user->hasPermission('biobank_container_update')) {
                $this->responder->forbidden('Container: Update Permission Denied');
            }
        } else {
            $containerTypes = $this->dao->getContainerTypes();
            if (!$this->user->hasPermission('biobank_container_create')
                && !($this->user->hasPermission('biobank_specimen_create')
                && $containerTypes[$container->getTypeId()]['primary'] === 0)
            ) {
                $this->responder->forbidden('Container: Create Permission Denied');
            }
        }
    }

    /**
     * Validates Container Object before being saved
     *
     * @param Container    $container Container to be validated
     * TODO: ADD RESPONDER
     *
     * @return void
     */
    private function validateData(Container $container) : void
    {
        $this->validateBarcode($container);
        $this->validateTypeId($container);
        $this->validateTemperature($container);
        $this->validateStatusId($container);
        $this->validateCenterId($container);
        $this->validateParentContainerId($container);
        $this->validateCoordinate($container);
    }

    private function validateBarcode($container)
    {
        $barcode = $container->getBarcode();
        if (is_null($barcode)) {
            $this->responder->iSE("Barcode value must be set");
        }
        //TODO: Rather than check the ID here, it may be best to check the action.
        $id = $container->getId();
        if (!isset($id)) {
            $containerList = $this->dao->selectContainers();
            foreach ($containerList as $c) {
                $b = $c->getBarcode();
                if ($b === $barcode) {
                    $this->responder->iSE('Barcode must be unique');
                }
            }
        }
        //TODO: Regex check on Barcode.
        //i.e.
        //$specimenTypes = $this->dao->getSpecimenTypes();
        //$regex = $specimenTypes[$specimen['typeId']]['regex'];
        //if (isset($regex)) {
        //    if (preg_match($regex, $container['barcode']) !== 1) {
        //        $this->responder->iSE('Barcode is not of proper format for the 
        //                               selected specimen type');
        //    }
        //}
    }

    private function validateTypeId($container) {
        if (is_null($container->getTypeId)) {
            $this->responder->iSE("Type value must be set");
       }
    }

    private function validateTemperature($container) {
        $temperature = $container->getTemperature();
        if (is_null($temperature)) {
            $this->responder->iSE("Temperature value must be set");
        }
        if (!(is_numeric($temperature) && is_float(floatval($temperature)))) {
            $this->responder->iSE('Temperature must be a number');
        }
        if ($temperature < -273 || $temperature > 999) {
            $this->responder->iSE('Temperature must be between -273.15 and 1000.');
        }
    }

    private function validateStatusId($container) {
        if (is_null($container->getStatusId)) {
            $this->responder->iSE("Status value must be set");
        }
    }

    private function validateCenterId($container) {
        if (is_null($container->getCenterId)) {
            $this->responder->iSE("Center value must be set");
        }
    }

    /**
     * Recursive functino that checks if the Parent Container is a child of the
     * Container Object
     *
     * @param Container    $container Container to be validated
     *
     * @return void
     */
    private function validateParentContainerId($container)
    {
        $parentContainerId = $container->getParentContainerId();
        if (isset($parentContainerId)) {
            if ($container->getId() == $parentContainerId) {
                    $this->responder->iSE(
                        'A container can not be placed within itself or
                        within one of its descendant containers.'
                    );
            }
            $childContainers = $this->dao->getChildContainers($container);
            if (isset($childContainers)) {
                foreach ($childContainers as $child) {
                    $this->parentContainer($child);
                }
            }
        }
    }

    private function validateCoordinate($container) {
        $coordinate = $container->getCoordinate();
        if (isset($coordinate)) {
            if (!((is_int($coordinate) || ctype_digit($coordinate)) && (int)$coordinate > 0)) {
                $this->responder('Coordinate must be a positive integer.');
            }
            
            $parentContainerId = $container->getParentContainerId();
            if (!isset($parentContainerId)) {
                $this->responder->iSE('Coordinate can not be set without a Parent
                                       Container.');
            }
            // TODO: Check that the coordinate value is within the container's 
            // dimension capacity.
        } 
    }
}
