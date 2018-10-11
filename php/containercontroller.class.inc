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
class ContainerController extends \NDB_Menu_Filter
{
    /**
     * Set up the variables required by NDB_Menu_Filter class for construction
     * a query
     *
     * @return void
     */
    function _setupVariables() : void
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
        $action    = $request->getQueryParams()['action'];
        $data      = json_decode($request->getParsedBody()['data'], true);
        $db        = \Database::singleton();
        $user      = \User::singleton();
        $dao       = new ContainerDAO($db);
        // XXX: decide if the responder should be an interface or not.
        $responder = new BiobankResponder();

        switch($action) {
        case 'saveContainerList':
            // Prepare Containers
            $containerList = array();
            foreach ($data as $item) {
                $container = $this->prepContainer($dao, $item['container'], $user);
                $containerList[] = $container;
            }

            // Save Containers
            foreach($containerList as $container) {
                $dao->saveContainer($container);
            }
            return $responder->success('Success!');
            break;
        case 'saveContainer':
            // Prepare Container
            $container = $this->prepContainer($dao, $data, $user, $responder);

            // Save Container
            $dao->saveContainer($container);
            return $responder->success('Success!');
            break;
        case 'getContainers':
            // Fetch Containers
            $containers = $this->fetchContainers();
            return $responder->success($containers);
            break;
        default:
            // XXX: This should cause some sort of error.
        }
    }

    /**
     * Prepares Container for Submission into the Database.
     *
     * @param ContainerDAO $dao
     * @param array        $data
     * @param User         $user
     * ADD RESPONDER
     *
     * @return Container $container to be submitted
     */
    public function prepContainer(ContainerDAO $dao, array $data, \User $user, BiobankResponder $responder) : Container
    {
        $container = $this->setContainer($dao, $data);
        $this->validatePermission($user, $container, $dao, $responder);
        $this->validateData($dao, $container, $responder);

        return $container;
    }

    /**
     * Instatiates a Container Object using the information sent from the front-end.
     *
     * @param ContainerDAO $dao  DAO instance use to create Container Object
     * @param array        $data Data to be used to create Container Object
     *
     * @return Container   $container Instantiated Container Object
     */
    public function setContainer(ContainerDAO $dao, array $data) : Container
    {
        //Set persistence variables.
        $container = $dao->createContainer();

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
     * @param User         $user      User to be checked
     * @param Container    $container Container to be checked
     * @param ContainerDAO $dao       Instance of DAO used to check permissions
     * ADD RESPONDER
     *
     * @return void
     */
    function validatePermission(\User $user, Container $container, ContainerDAO $dao, BiobankResponder $responder) : void
    {
        $id = $container->getId();
        if (isset($id)) {
            if (!$user->hasPermission('biobank_container_update')) {
                $responder->forbidden('Container: Update Permission Denied');
            }
        } else {
            $containerTypes = $dao->getContainerTypes();
            if (!$user->hasPermission('biobank_container_create')
                && !($user->hasPermission('biobank_specimen_create')
                && $containerTypes[$container->getTypeId()]['primary'] === 0)
            ) {
                $responder->forbidden('Container: Create Permission Denied');
            }
        }
    }

    /**
     * Validates Container Object before being saved
     *
     * @param ContainerDAO $dao       Instance of DAO used to validate Container
     * @param Container    $container Container to be validated
     * TODO: ADD RESPONDER
     *
     * @return void
     */
    function validateData(ContainerDAO $dao, Container $container, BiobankResponder $responder) : void
    {
        $validator = new BiobankValidator($responder, $dao);
        //Perhaps pass the responder down to each of the validator functions.
        //$this->validateBarcode($container, $responder);

        /*Custom Validation*/
        $validator->barcode($container);
        $validator->type($container);
        $validator->temperature($container);
        $validator->status($container);
        $validator->center($container);
        $validator->parentContainer($container);
        $validator->coordinate($container);
    }

    /**
     * Gets the data source for this menu filter.
     *
     * @return \LORIS\Data\Provisioner
     */
    private function getDataProvisioner() : \LORIS\Data\Provisioner
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
    private function fetchContainers() : string
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
