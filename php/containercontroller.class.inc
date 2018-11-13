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
class ContainerController
{
    /**
     * Global variable $dao
     *
     * @access private
     */
    public $dao;

    /**
     * Global variable $db
     *
     * @access private
     */
    private $db;

    /**
     * Global variable $user
     *
     * @access private
     */
    private $user;

    /**
     * Initializes a new instance of the ContainerController Class
     *
     * @param User             $user
     * @param Database         $db
     */
    function __construct($db, $user)
    {
        $this->user      = $user;
        $this->db        = $db;
        $this->dao       = new ContainerDAO($db);
    }

    /**
     * Get all Container Objects permitted by the Container Data Provisioner (DAO).
     *
     * @return string a json encoded string of all permissable Container Objects
     */
    public function getAll() : string
    {
        $containers = [];
        $containerIt = $this->getDataProvisioner()->execute($this->user);
        foreach ($containerIt as $id => $container) {
            $containers[$id] = $container;
        }

        return json_encode($containers);
    }

    /**
     * Get all data associated with the Container Entity. This will be used
     * for front-end mapping and populating form options.
     *
     * @return array Associative array of option data.
     */
    public function getOptions() : array
    {
        $this->validatePermission('view');
        return array(
            'types'           => $this->dao->getTypes(),
            'typesPrimary'    => $this->dao->getTypes(['Primary' => 1]),
            'typesNonPrimary' => $this->dao->getTypes(['Primary' => 0]),
            'dimensions'      => $this->dao->getDimensions(),
            'coordinates'     => $this->dao->getCoordinates(),
            'stati'           => $this->dao->getStati(),
        );
    }

    /**
     * This method takes in a list of container arrays from the front-end,
     * validates them, instantiates them and then sends them to the DAO to be
     * saved to the database.
     *
     * @param array $list a list of container arrays to be created.
     *
     * @return void
     */
    public function create(array $list) : void
    {
       $this->validatePermission('create');
       $containerList = array();
       foreach ($list as $item) {
           $container = $this->getInstanceFromArray($item['container']);
           $this->validateInstance($container);
           $containerList[] = $container;
       }

       // Save Containers
       foreach($containerList as $container) {
           $this->dao->saveInstance($container);
       }
    }

    /**
     * This method takes in a container array from the front-end,
     * validates them, instantiates them and then sends them to the DAO to be
     * saved to the database.
     *
     * @param array $data container array to be created
     *
     * @return void
     */
    public function update(array $data) : void
    {
        $this->validatePermission('update');
        $container = $this->getInstanceFromArray($data);
        $this->validateInstance($container);
        $this->dao->saveInstance($container);
    }

    /**
     * Treats the Container DAO as a Provisioner that can be iterated through 
     * to provide the permissable Container Objects for the current User.
     *
     * @return \LORIS\Data\Provisioner
     */
    private function getDataProvisioner() : \LORIS\Data\Provisioner
    {
        $provisioner = $this->dao;

        //if ($this->user->hasPermission('access_all_profiles') === false) {
        //    $provisioner = $provisioner->filter(
        //        new \LORIS\Data\Filters\UserSiteMatch()
        //    );
        //}
        if ($this->user->hasPermission('biobank_container_view') === false) {
            $provisioner = $provisioner->filter(
                new NonPrimaryContainerFilter()
            );
        }
        if ($this->user->hasPermission('biobank_specimen_view') === false) {
            $provisioner = $provisioner->filter(
                new PrimaryContainerFilter()
            );
        }
        return $provisioner;
    }

    /**
     * Instatiates a Container Object using the information sent from the front-end.
     *
     * @param array      $data Data to be used to create Container Object
     *
     * @return Container $container Instantiated Container Object
     */
    public function getInstanceFromArray(array $data) : Container
    {
        //Set persistence variables.
        $container = $this->dao->getInstance();
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
     * @param string $action User requested action.
     *
     * @return void
     */
    private function validatePermission(string $action) : void
    {
        switch($action) {
        case 'view':
            if (!$this->user->hasPermission('biobank_container_view')) {
                throw new \Forbidden('Container: View Permission Denied');
            }
        case 'update':
            if (!$this->user->hasPermission('biobank_container_update')) {
                throw new \Forbidden('Container: Update Permission Denied');
            }
        case 'create':
            if (!$this->user->hasPermission('biobank_container_create')) {
               throw new \Forbidden('Container: Create Permission Denied');
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
    public function validateInstance(Container $container) : void
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
            throw new \Invalid("Barcode value must be set");
        }
        //TODO: Rather than check the ID here, it may be best to check the action.
        $id = $container->getId();
        if (!isset($id)) {
            $containerList = $this->dao->selectInstances();
            foreach ($containerList as $c) {
                $b = $c->getBarcode();
                if ($b === $barcode) {
                    throw new \Invalid('Barcode must be unique');
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
        if (is_null($container->getTypeId())) {
            throw new \Invalid("Type value must be set");
       }
    }

    private function validateTemperature($container) {
        $temperature = $container->getTemperature();
        if (is_null($temperature)) {
            throw new \Invalid("Temperature value must be set");
        }
        if (!(is_numeric($temperature) && is_float(floatval($temperature)))) {
            throw new \Invalid('Temperature must be a number');
        }
        if ($temperature < -273 || $temperature > 999) {
            throw new \Invalid('Temperature must be between -273.15 and 1000.');
        }
    }

    private function validateStatusId($container) {
        if (is_null($container->getStatusId())) {
            throw new \Invalid("Status value must be set");
        }
    }

    private function validateCenterId($container) {
        if (is_null($container->getCenterId())) {
            throw new \Invalid("Center value must be set");
        }

        $parentContainerId = $container->getParentContainerId();
        if (isset($parentContainerId)) {
            $parentContainer = $this->dao->getInstanceFromId($parentContainerId);
            if ($container->getCenterID() !== $parentContainer->getCenterID()) {
                throw new \Invalid('A container must be checked out before
                     moving location', 400);
            }
        }
    }

    private function validateParentContainerId($container)
    {
        $this->validateParentContainers($container);
    }

    /**
     * Recursive function that checks if the Parent Container is a child of the
     * Container Object
     *
     * @param Container    $container Container to be validated
     *
     * @return void
     */
    private function validateParentContainers($container)
    {
        $parentContainerId = $container->getParentContainerId();
        if (isset($parentContainerId)) {
            if ($container->getId() == $parentContainerId) {
                throw new \Invalid(
                    'A container can not be placed within itself or
                    within one of its descendant containers.'
                );
            }
            $childContainers = $this->dao->getChildContainers($container);
            if (isset($childContainers)) {
                foreach ($childContainers as $child) {
                    $this->validateParentContainerId($child);
                }
            }
        }
    }

    private function validateCoordinate($container) {
        $coordinate = $container->getCoordinate();
        if (isset($coordinate)) {
            if (!((is_int($coordinate) || ctype_digit($coordinate)) && (int)$coordinate > 0)) {
                throw new \Invalid('Coordinate must be a positive integer.');
            }
            
            $parentContainerId = $container->getParentContainerId();
            if (!isset($parentContainerId)) {
                throw new \Invalid('Coordinate can not be set without a Parent
                                       Container.');
            }
            // TODO: Check that the coordinate value is within the container's 
            // dimension capacity.
        } 
    }
}
