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
        $action = $request->getQueryParams()['action'];
        $data   = json_decode($request->getParsedBody()['data'], true);
        $db     = \Database::singleton();
        $user   = \User::singleton();
        $dao    = new ContainerDAO($db);

        switch($action) {
        case 'saveContainerList':
            $containerTypes = $containerDAO->getContainerTypes();

            foreach ($list as $item) {
                $container = $item['container'];
                $this->saveContainer($db, $user, $container);
            }
            return $this->response('text/html', 200);
            break;
        case 'saveContainer':
            $container = $this->instantiateContainer($dao, $data);

            // XXX: These tries should probably be grouped together!
            try {
                $this->checkPermission($container, $dao, $user);
            } catch (\Exception $e) {
                return $this->response('application/json', 403, $e->getMessage());
            }

            try {
                $this->validate($dao, $container);
            } catch (\Exception $e) {
                return $this->response('application/json', $e->getMessage());
            }

            // Save Container
            $dao->saveContainer($container);

            return $this->response('text/html', 200);
            break;
        case 'getContainers':
            $containers = $this->fetchContainers();
            return $this->response('application/json', 200, $containers);
            break;
        default:
            // XXX: This should cause some sort of error.
        }
    }

    /**
     * Instatiates a Container Object using the information sent from the front-end.
     *
     * @param ContainerDAO $dao  DAO instance use to create Container Object
     * @param array        $data Data to be used to create Container Object
     *
     * @return Container   $container Instantiated Container Object
     */
    public function instantiateContainer(ContainerDAO $dao, array $data) : Container
    {
        // TODO: figure out if ?? null is necessary.
        $id          = $data['id']                ?? null;
        $barcode     = $data['barcode']           ?? null;
        $typeId      = $data['typeId']            ?? null;
        $temperature = $data['temperature']       ?? null;
        $statusId    = $data['statusId']          ?? null;
        $centerId    = $data['centerId']          ?? null;
        $originId    = $data['originId']          ?? null;
        $parentContainerId = $data['parentContainerId'] ?? null;
        $coordinate        = $data['coordinate']        ?? null;

        // XXX: Perhaps put a try block here that looks to catch invalid Argument
        // exceptions.
        //Set persistence variables.
        $container = $dao->createContainer();

        $container->setId($id);
        $container->setBarcode($barcode);
        $container->setTypeId($typeId);
        $container->setTemperature($temperature);
        $container->setStatusId($statusId);
        $container->setCenterId($centerId);
        $container->setOriginId($originId);
        $container->setParentContainerId($parentContainerId);
        $container->setCoordinate($coordinate);

        // catch (InvalidArgumentException $e) {
        //
        // }

        return $container;
    }

    /**
     * Checks User Permissions for creating or updating Container Objects.
     *
     * @param ContainerDAO $dao       Instance of DAO used to check permissions
     * @param Container    $container Container to be checked
     * @param User         $user      User to be checked
     *
     * @throws Exception if the user does not meet permission requirements for
     *                  the given action
     * @return void
     */
    function checkPermission(Container $container, ContainerDAO $dao, \User $user) : void
    {
        $id = $container->getId();
        if (isset($id)) {
            if (!$user->hasPermission('biobank_container_update')) {
                throw new Exception('Container: Update Permission Denied');
            }
        } else {
            $containerTypes = $dao->getContainerTypes();
            if (!$user->hasPermission('biobank_container_create')
                && !($user->hasPermission('biobank_specimen_create')
                && $containerTypes[$container->getTypeId()]['primary'] === 0)
            ) {
                throw new Exception('Container: Create Permission Denied');
            }
        }
    }

    /**
     * Validates Container Object before being saved
     *
     * @param ContainerDAO $dao       Instance of DAO used to validate Container
     * @param Container    $container Container to be validated
     *
     * @throws Exception if the provided Container does not meet validation
     *                  requirements
     * @return void
     */
    function validate(ContainerDAO $dao, Container $container) : void
    {
        try {
            $required = [
                         'Barcode'        => $container->getBarcode(),
                         'Container Type' => $container->getTypeId(),
                         'Temperature'    => $container->getTemperature(),
                         'Status'         => $container->getStatusId(),
                         'Center'         => $container->getCenterId(),
                        ];

            // Validate required fields
            foreach($required as $key=>$value) {
                if (is_null($value)) {
                    throw new Exception("$key value must be provided");
                }
            }

            // Validate Coordinate dependency on Parent Container.
            if (!is_null($coordinate) && is_null($parentContainerId)) {
                throw new Exception(
                    'Coordinate can not be set without a Parent
                                      Container.'
                );
            }

            // Validate that Barcode is unique if container in new.
            $id = $container->getId();
            if (!isset($id)) {
                $containerList = $dao->selectContainers();
                $barcode       = $container->getBarcode();
                foreach ($containerList as $c) {
                    $b = $c->getBarcode();
                    if ($b === $barcode) {
                        throw new Exception('Barcode must be unique');
                    }
                }
            }

            // Validate that parent container is not a child.
            $parentContainerId = $container->getParentContainerId();
            if (isset($parentContainerId)) {
                $this->validateParentContainer($dao, $container, $parentContainerId);
            }

            // TODO: perhaps check also that the value is within the container's capacity/dimensions?
            // Validate Coordinate
            $coordinate = $container->getCoordinate();
            if (isset($coordinate)) {
                if (!((is_int($coordinate) || ctype_digit($coordinate)) && (int)$coordinate > 0)) {
                    throw new Exception("Coordinate must be a positive integer.");
                }
            }

            // Validate Temperature
            // TODO: check that temperature value is not too high or low.
            $temperature = $container->getTemperature();
            if (!(is_numeric($temperature) && is_float(floatval($temperature)))) {
                throw new Exception("Temperature must by a number.");
            }
        } catch (\Exception $e) {
            throw new Exception($e->getMessage());
        }
    }

    /**
     * Recursive function that checks if the Parent Container is a child of the
     * Container Object
     *
     * @param ContainerDAO $dao       Instance of DAO used to validate the Parent
     * @param Container    $container Container to be validated
     * @param in           $parentId  Current Parent ID to be checked.
     *
     * @throws Exception if the provided Container does not meet validation
     *                  requirements
     * @return void
     */
    public function validateParentContainer(ContainerDAO $dao, Container $container, int $parentId) : void
    {
        if ($container->getId() == $parentId) {
            throw new Exception(
                'A container can not be placed within itself or
                                 within one of its descendant containers.'
            );
        }
        $childContainers = $dao->getChildContainers($container);
        if (isset($childContainers)) {
            foreach ($childContainers as $child) {
                $this->validateParentContainer($containerDAO, $child, $parentId);
            }
        }
    }

    /**
     * Returns a PSR7 response to the handle to be sent to the front end.
     *
     * @param string $header
     * @param int    $status
     * @param string $body
     *
     * @return ResponseInterface The outgoing PSR7 response
     */
    private function response(string $header, int $status, string $body = '') : ResponseInterface
    {
        return (new \LORIS\Http\Response())
            ->withHeader("Content-Type", $header)
            ->withStatus($status)
            ->withBody(new \LORIS\Http\StringStream($body));
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
