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
class SpecimenController extends \NDB_Menu_Filter
{
    var $responder;
    var $dao;
    var $db;
    var $user;

    /**
     * Set up the variables required by NDB_Menu_Filter class for construction
     * a query
     *
     * @return void
     */
    function _setupVariables() : void
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
        $action    = $request->getQueryParams()['action'];
        $files     = $request->getUploadedFiles()['files'];
        $data      = json_decode($request->getBody(), true);
        $this->db        = \Database::singleton();
        $this->user      = \User::singleton();
        $this->dao       = new SpecimenDAO($this->db);
        $this->responder = new BiobankResponder();

        switch($action) {
        case 'fetchSpecimens':
            $specimens = $this->fetchSpecimens();
            return $this->responder->success($specimens);
            break;
        case 'saveSpecimen':
            // Prepare Specimen
            $this->validatePermission($action);
            $specimen = $this->prepSpecimen($data, $files);
            // Save Specimen
            $this->dao->saveSpecimen($specimen);
            return $this->responder->success('Success!');
            break;
        case 'saveSpecimenList':
            $this->validatePermission($action);
            //TODO: figure out how to send a request to ContainerController,
            //or how to use the ContainerController from the SpecimenController;
            $containerDAO        = new ContainerDAO($this->db);
            $containerController = new ContainerController($containerDAO, $this->user, $this->responder);

            $list = array();
            foreach ($data as $i=>$item) {
                $container = $containerController->prepContainer($item['container']);
                $specimen  = $this->prepSpecimen($item['specimen']);
                $list[$i]['container'] = $container;
                $list[$i]['specimen']  = $specimen;
            }

            foreach ($list as $item) {
                $containerId = $containerDAO->saveContainer($container);
                $specimen->setContainerId($containerId);
                $this->dao->saveSpecimen($specimen);
                //TODO: if save specimen fails, it should delete the container it is
                //associated to.
                return $this->responder->success('Success!');
            }
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
    private function fetchSpecimens() : String
    {
        $specimens = $this->getDataProvisioner()->execute($this->user);

        return json_encode($specimens);
    }

    /**
     * Gets the data source for this menu filter.
     *
     * @return \LORIS\Data\Provisioner
     */
    function getDataProvisioner() : \LORIS\Data\Provisioner
    {
        $provisioner = new SpecimenDAO($this->db);

        // XXX: I am still unsure if this filter is working properly. Ask Dave
        // about the details of getting it to work.
        if ($this->user->hasPermission('access_all_profiles') == false) {
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
     * Prepares Specimen for Submission into the Database.
     *
     * @param array        $data
     *
     * @return Specimen $specimen to be submitted
     */
    public function prepSpecimen(array $data, array $files = null) : Specimen
    {
        $this->validateSpecimen($data);
        $this->validateFiles($files);
        $specimen = $this->setSpecimen($data);

        return $specimen;
    }


    /**
     * Instatiates a Specimen Object using the values sent from the front-end.
     *
     * @param array       $data Data to be used to create the Specimen Object.
     *
     * @return Specimen   $specimen Instantiated Specimen Object
     */
    public function setSpecimen(array $data) : Specimen
    {
        $specimen = $this->dao->createSpecimen();
        $specimen->setId($data['id']);
        $specimen->setContainerId($data['containerId']);
        $specimen->setTypeId($data['typeId']);
        $specimen->setQuantity($data['quantity']);
        $specimen->setUnitId($data['unitId']);
        $specimen->setFTCycle($data['fTCycle']);
        $specimen->setParentSpecimenIds($data['parentSpecimenIds']);
        $specimen->setCandidateId($data['candidateId']);
        $specimen->setSessionId($data['sessionId']);
        $specimen->setCollection($data['collection']);
        $specimen->setPreparation($data['preparation']);
        $specimen->setAnalysis($data['analysis']);

        return $specimen;
    }

    /**
     * Checks User Permissions for creating or updating Specimen Objects.
     *
     * @param string $action User requested action
     *
     * @throws Exception if the User does not meet permission requirements for
     *                   the given action
     * @return void
     */
    function validatePermission(string $action) : void
    {
        switch($action) {
        case 'saveSpecimen':
            if (!$this->user->hasPermission('biobank_specimen_update')) {
                $this->responder->forbidden('Specimen: Update Permission Denied');
            }
        case 'saveSpecimenList':
            if (!$this->user->hasPermission('biobank_specimen_create')) {
                $this->responder->forbidden('Specimen: Create Permission Denied');
            }
        }
    }

    /**
     * Validates Specimen Data before being saved
     *
     * @param Specimen    $specimen    Specimen to be validated.
     *
     * @throws Exception if the provided Specimen does not meet validation
     *                   requirements.
     * @return void
     */
    function validateSpecimen(array $specimen) : void
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

    private function validateTypeId(array $data)
    {
        if (is_null($data['typeId'])) {
            $this->responder->iSE("Specimen Type value must be set");
        }
    }

    private function validateQuantity(array $data)
    {
        $quantity = $data['Quantity'];
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

    private function validateUnitId(array $data)
    {
        if (is_null($data['unitId'])) {
            $this->responder->iSE("Specimen Unit value must be set");
        }
    }

    private function validateFTCycle(array $data) : void
    {
        $fTCycle = $data['fTCycle'];
        if (isset($fTCycle)) {
            if (!is_numeric($fTCycle) || intval($fTCycle) <= 0) {
                $this->responder->iSE("F/T Cycle must be an integer greater than 0");
            }
        }
    }

    private function validateParentSpecimenIds(array $data)
    {
        // Nothing here yet.
        // TODO: check that parent are of the proper specimen type?
    }

    private function validateCandidateId(array $data)
    {
        if (is_null($data['candidateId'])) {
            $this->responder->iSE("PSCID value must be set");
        }
    }

    private function validateSessionId(array $data)
    {
        if (is_null($data['sessionId'])) {
            $this->responder->iSE("Visit Label value must be set");
        }
    }

    private function validateCollection(array $data)
    {
        $collection  = $data['collection'];
        $this->validateQuantity($collection);
        $this->validateUnitId($collection);
        $this->validateCenterId($collection);
        $this->validateDate($collection);
        $this->validateTime($collection);
        $this->validateData($collection);
    }

    private function validatePreparation(array $data)
    {
        // Validate Preparation
        $preparation = $data['preparation'];

        if (isset($preparation)) {
            $this->validateProtocolId($preparation);
            $this->validateCenterId($preparation);
            $this->validateDate($preparation);
            $this->validateTime($preparation);
            $this->validateData($preparation);
        }
    }

    private function validateProtocolId(array $data)
    {
    }

    private function validateAnalysis(array $analysis)
    {
        // Validate Analysis
        $analysis = $data['analysis'];
        if (isset($analysis)) {
            $this->validateMethodId($analysis);
            $this->validateCenterId($analysis);
            $this->validateDate($analysis);
            $this->validateTime($analysis);
            $this->validateData($analysis);
        }
    }

    private function validateMethodId(array $data)
    {
    }

    private function validateCenterId(array $data)
    {
    }

    private function validateDate(array $data)
    {
        // TODO: validate date here.
        // Check exists
        // Check regex format
    }

    private function validateTime(array $data)
    {
        // TODO: validate time here.
        // Check exists
        // Check regex format
    }

    private function validateData(array $data)
    {
        $data = $data['data'];
        // TODO: data needs to also be properly validated based on the given
        // validation criteria from the back end which needs to be queried.
        // This includes:
        //   - making sure all the keys are integers
        //   - finding the datatype that corresponds to that attribute
        //   - validating for that datatype
    }

    // TODO: Take a look at this validation function because it was simply taken
    // From media.
    /**
     * Validates Uploaded Files
     *
     * @param array $files files to be validated
     *
     * @throws Exception if the provided files do not meet validation
     *                   requirements.
     * @return void
     */
    function validateFiles(array $files = null) : void
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
