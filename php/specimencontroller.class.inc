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
class SpecimenController
{
    /**
     * Global variables initialized at construction.
     *
     * @access private
     */
    private $responder;
    private $dao;
    private $db;
    private $user;

    /**
     * Initializes a new instance of the SpecimenController CLass
     *
     * @param Database         $db
     * @param User             $user
     * @param BiobankResponder $responder
     */
    function __construct($db, $user, $responder)
    {
        $this->db        = $db;
        $this->dao       = new SpecimenDAO($db);
        $this->user      = $user;
        $this->responder = $responder;
    }

    /**
     * Get all Specimen Objects permitted by the Specimen Data Provisioner (DAO).
     *
     * @return string a json encoded string of all permissable Specimen Objects.
     */
     //TODO: perhaps introduce a function that gets specific subsets of specimens.
     //This could allow an array to be passed perhaps that would filter the provisioner.
    public function getAll() : String
    {
        $specimens = [];
        $specimenIt = $this->getDataProvisioner()->execute($this->user);
        foreach ($specimenIt as $id => $specimen) {
            $specimens[$id] = $specimen;
        }

        return json_encode($specimens);
    }

    /**
     * Get all data associated with the Specimen Entity. This will be used for 
     * front-end mapping and populating form options.
     *
     * @return array Associative array of option data.
     */
    public function getOptions() : array
    {
        $this->validatePermission('view');
        return array(
            'types'              => $this->dao->getTypes(),
            'typeUnits'          => $this->dao->getTypeUnits(),
            'protocols'          => $this->dao->getProtocols(),
            'protocolAttributes' => $this->dao->getProtocolAttributes(),
            'methods'            => $this->dao->getMethods(),
            'methodAttributes'   => $this->dao->getMethodAttributes(),
            'units'              => $this->dao->getUnits(),
            'typeAttributes'     => $this->dao->getTypeAttributes(),
            'attributeDatatypes' => $this->dao->getAttributeDatatypes(),
            'attributeOptions'   => $this->dao->getAttributeOptions(),
        );
    }

    /**
     * This method takes in a list of specimen and container arrays from the 
     * front-end, validates them, instantiates them and then sends them to their
     * respective DAOs to be saved to the database.
     *
     * @param array $list a list of specimen and container arrays to be created.
     *
     * @return void
     */
    public function create(array $list, $files) : void
    {
        $this->validatePermission('create');
        $contCon = new ContainerController($this->db, $this->user, $this->responder);

        foreach ($list as $i=>$item) {
            $container = $contCon->getInstancefromArray($item['container']);
            $contCon->validateInstance($container);
            $specimen  = $this->prepare($item['specimen'], $files);
            $list[$i]['container'] = $container;
            $list[$i]['specimen']  = $specimen;
        }

        //TODO: I don't like how the Specimen Controller has to access the 
        //Container DAO. It should be able to do this operation by solely 
        //accessing the ContainerController.
        foreach ($list as $item) {
            print_r($item);
            $container = $item['container'];
            $specimen  = $item['specimen'];
            $containerId = $contCon->dao->saveInstance($container);
            $specimen->setContainerId($containerId);
            $this->dao->saveInstance($specimen);
            //TODO: if save specimen fails, it should delete the container it is
            //associated to.
        }
    }

    /**
     * This method takes in a specimen array from the front-end, validates them,
     * instantiates them and then sends them to the DAO to be saved to the 
     * database.
     *
     * @param array $data  specimen array to be created
     * @param array $files files to be saved
     *
     * @return void
     */
    public function update(array $data, $files) : void
    {
        $this->validatePermission('update');
        $specimen = $this->prepare($data, $files);
        $this->dao->saveInstance($specimen);
    }

    /**
     * Treats the Specimen DAO as a Provisioner that can be iteratated
     * through to provide the permissable Specimen Objects for the current User.
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

        return $provisioner;
    }


    // TODO: Decide if this function is necessary. I now kind of like it.
    /**
     * Prepares Specimen for Submission into the Database.
     *
     * @param array        $data
     *
     * @return Specimen $specimen to be submitted
     */
    private function prepare(array $data, array $files = null) : Specimen
    {
        $specimen = $this->dao->getInstanceFromArray($data);
        $this->validateInstance($specimen);
        $this->validateFiles($files);

        return $specimen;
    }

    /**
     * Checks User Permissions for creating or updating Specimen Objects.
     *
     * @param string $action User requested action
     *
     * @return void
     */
    private function validatePermission(string $action) : void
    {
        switch($action) {
        case 'view':
            if (!$this->user->hasPermission('biobank_specimen_view')) {
                $this->responder->forbidden('Specimen: View Permission Denied');
            }
        case 'update':
            if (!$this->user->hasPermission('biobank_specimen_update')) {
                $this->responder->forbidden('Specimen: Update Permission Denied');
            }
        case 'create':
            if (!$this->user->hasPermission('biobank_specimen_create')) {
                $this->responder->forbidden('Specimen: Create Permission Denied');
            }
        }
    }

    /**
     * Validates Specimen Data before being saved
     *
     * @param Specimen $specimen Specimen to be validated.
     *
     * @return void
     */
    private function validateInstance(Specimen $specimen) : void
    {
        $this->validateTypeId($specimen);
        $this->validateQuantity($specimen);
        $this->validateUnitId($specimen);
        $this->validateFTCycle($specimen);
        $this->validateParentSpecimenIds($specimen);
        $this->validateCandidateId($specimen);
        $this->validateSessionId($specimen);
        $this->validateCollection($specimen);
        $this->validatePreparation($specimen);
        $this->validateAnalysis($specimen);
    }

    private function validateTypeId(Specimen $specimen) : void
    {
        if (is_null($specimen->getTypeId())) {
            $this->responder->iSE("Specimen Type value must be set");
        }
    }

    private function validateQuantity(object $specimen) : void
    {
        $quantity = $specimen->getQuantity();
        if (is_null($quantity)) {
            $this->responder->iSE('Specimen Quantity value must be set');
        }
        if (!(is_numeric($quantity) && is_float(floatval($quantity)))) {
            $this->responder->iSE('Specimen Quantity value must be a number');
        }
        //TODO: This is where a capacity check would go, i.e. $quantity > $capacity.
        if ($quantity < 0) {
            $this->responder->iSE('Specimen Quantity cannot be less than 0');
        }
    }

    private function validateUnitId(object $object) : void
    {
        if (is_null($object->getUnitId())) {
            $this->responder->iSE("Specimen Unit value must be set");
        }
    }

    private function validateFTCycle(Specimen $specimen) : void
    {
        $fTCycle = $specimen->getFTCycle();
        if (isset($fTCycle)) {
            if (!is_numeric($fTCycle) || intval($fTCycle) <= 0) {
                $this->responder->iSE("F/T Cycle must be an integer greater than 0");
            }
        }
    }

    private function validateParentSpecimenIds(Specimen $specimen) : void
    {
        // Nothing here yet.
        // TODO: check that parent are of the proper specimen type?
    }

    private function validateCandidateId(Specimen $specimen) : void
    {
        if (is_null($data['candidateId'])) {
            $this->responder->iSE("PSCID value must be set");
        }
    }

    private function validateSessionId(Specimen $specimen) : void
    {
        if (is_null($specimen->getSessionId())) {
            $this->responder->iSE("Visit Label value must be set");
        }
    }

    private function validateCollection(Specimen $specimen) : void
    {
        $collection  = $specimen->getCollection();
        $this->validateQuantity($collection);
        $this->validateUnitId($collection);
        $this->validateCenterId($collection);
        $this->validateDate($collection);
        $this->validateTime($collection);
        $this->validateData($collection);
    }

    private function validatePreparation(Specimen $specimen) : void
    {
        // Validate Preparation
        $preparation = $specimen->getPreparation();
        if (isset($preparation)) {
            $this->validateProtocolId($preparation);
            $this->validateCenterId($preparation);
            $this->validateDate($preparation);
            $this->validateTime($preparation);
            $this->validateData($preparation);
        }
    }

    private function validateProtocolId(Preparation $preparation) : void
    {
    }

    private function validateAnalysis(Specimen $specimen) : void
    {
        // Validate Analysis
        $analysis = $specimen->getAnalysis();
        if (isset($analysis)) {
            $this->validateMethodId($analysis);
            $this->validateCenterId($analysis);
            $this->validateDate($analysis);
            $this->validateTime($analysis);
            $this->validateData($analysis);
        }
    }

    private function validateMethodId(Analysis $analysis) : void
    {
    }

    private function validateCenterId(object $centerId) : void
    {
    }

    private function validateDate(object $data) : void
    {
        // TODO: validate date here.
        // Check exists
        // Check regex format
    }

    private function validateTime(object $data) : void
    {
        // TODO: validate time here.
        // Check exists
        // Check regex format
    }

    private function validateData(object $process) : void
    {
        $data = $process->getData();
        // TODO: data needs to also be properly validated based on the given
        // validation criteria from the back end which needs to be queried.
        // This includes:
        //   - making sure all the keys are integers
        //   - finding the datatype that corresponds to that attribute
        //   - validating for that datatype
    }

    // TODO: Take a look at this validation function because it was simply taken
    // From media.
    // TODO: Make sure to use PSR7 standards for upload.
    /**
     * Validates Uploaded Files
     *
     * @param array $files files to be validated
     *
     * @throws Exception if the provided files do not meet validation
     *                   requirements.
     * @return void
     */
    private function validateFiles(array $files = null) : void
    {
        if (!empty($files)) {
            $config    = \NDB_Config::singleton();
            $mediaPath = $config->getSetting('mediaPath');

            if (!isset($mediaPath)) {
                $this->responder->iSE('Error! Media path is not set in Loris Settings!');
            }

            if (!file_exists($mediaPath)) {
                $this->responder->iSE("Error! The upload folder '.$mediaPath.' does not exist!");
            }

            foreach($files as $file) {
                $fileName  = $file['name'];
                $extension = pathinfo($fileName)['extension'];

                if (!isset($extension)) {
                    $this->responder->iSE('Please make sure your file has a valid extension.');
                }

                // XXX: Decide if the file should wait to be uploaded, until it's
                // guaranteed that the specimen can be updated.
                if (move_uploaded_file($file['tmp_name'], $mediaPath . $fileName)) {
                    //TODO: look into NDB_notifier?
                } else {
                    $this->responder->iSE('Could not upload the file. Please try again!');
                }
            }
        }
    }
}
