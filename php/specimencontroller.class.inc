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
        $action = $request->getQueryParams()['action'];
        $data   = json_decode($request->getParsedBody()['data'], true);
        $files  = $request->getUploadedFiles()['files'];
        $db     = \Database::singleton();
        $user   = \User::singleton();
        $dao    = new SpecimenDAO($db);

        switch($action) {
        case 'saveSpecimenList':
            $this->submitSpecimenList($db, $user, $data);
        case 'saveSpecimen':
            $specimen = $this->instantiateSpecimen($dao, $data);

            // XXX: These tries should probably be grouped together!
            try {
                $this->checkPermission($user, $specimen);
            } catch (\Exception $e) {
                $this->response('application/json', 403, $e->getMessage());
            }

            try {
                $this->validateSpecimen($dao, $specimen);
                if (isset($files)) {
                    $this->validateFiles($files);
                }
            } catch (\Exception $e) {
                return $this->response('application/json', 400, $e->getMessage());
            }

            // XXX: this should also be wrapped in a try block.
            $dao->saveSpecimen($specimen);
            return $this->response('text/html', 200);
            break;
        case 'getSpecimens':
            $specimens = $this->fetchSpecimens();
            return $this->response('application/json', 200, $specimens);
            break;
        }
    }

    /**
     * Instatiates a Specimen Object using the values sent from the front-end.
     *
     * @param SpecimenDAO $dao  DAO instance used to create the Specimen Object.
     * @param array       $data Data to be used to create the Specimen Object.
     *
     * @return Specimen   $specimen Instantiated Specimen Object
     */
    public function instantiateSpecimen(SpecimenDAO $specimenDAO, array $data) : Specimen
    {
        // XXX: check if null coalesce is necessary
        // If not, remove all this unnecessary variable setting
        $id          = $data['id'] ?? null;
        $containerId = $data['containerId'] ?? null;
        $typeId      = $data['typeId'] ?? null;
        $quantity    = $data['quantity'] ?? null;
        $unitId      = $data['unitId'] ?? null;
        $fTCycle     = $data['fTCycle'] ?? null;
        $parentSpecimenIds = $data['parentSpecimenIds'] ?? null;
        $candidateId       = $data['candidateId'] ?? null;
        $sessionId         = $data['sessionId'] ?? null;
        $collection        = $data['collection'] ?? null;
        $preparation       = $data['preparation'] ?? null;
        $analysis          = $data['analysis'] ?? null;

        $specimen = $specimenDAO->createSpecimen();
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
     * @param User     $user     User to be checked
     * @param Specimen $specimen Specimen to be checked
     *
     * @throws Exception if the User does not meet permission requirements for
     *                   the given action
     * @return void
     */
    function checkPermission(\User $user, Specimen $specimen) : void
    {
        $id = $specimen->getId();
        if (isset($id)) {
            if (!$user->hasPermission('biobank_specimen_update')) {
                throw new \Exception('You do not have permission to update Specimens');
            }
        } else {
            if (!$user->hasPermission('biobank_specimen_create')) {
                throw new \Exception('You do not have permission to create Specimens');
            }
        }
    }

    /**
     * Validates Specimen Object before being saved
     *
     * @param SpecimenDAO $specimenDAO Instance of Specimen DAO used to validate
     *                                 Specimen
     * @param Specimen    $specimen    Specimen to be validated.
     *
     * @throws Exception if the provided Specimen does not meet validation
     *                   requirements.
     * @return void
     */
    function validateSpecimen(SpecimenDAO $dao, Specimen $specimen) : void
    {
        // Validate required fields
        $required    = [
                        'Container'              => $specimen->getContainerId(),
                        'Type'                   => $specimen->getTypeId(),
                        'Quantity'               => $specimen->getQuantity(),
                        'Unit'                   => $specimen->getUnitId(),
                        'PSCID'                  => $specimen->getCandidateId(),
                        'Visit Label'            => $specimen->getSessionId(),
                        'Collection Information' => $specimen->getCollection(),
                       ];
        $positiveInt = ['F/T Cycle' => $specimen->getFTCycle()];
        $floats      = ['Quantity' => $specimen->getQuantity()];

        //TODO: Check that if there are multiple parentSpecimens, that each of those
        //specimens come from the same candidate, session, type and origin centerId.

        \LORIS\biobank\BiobankValidate::required($required);
        \LORIS\biobank\BiobankValidate::positiveInt($positiveInt);
        \LORIS\biobank\BiobankValidate::float($floats);

        // Validate Collection
        $collection  = $specimen->getCollection();
        $required    = [
                        'Collection Quantity'  => $collection['quantity'],
                        'Collection Unit ID'   => $collection['unitId'],
                        'Collection Center ID' => $collection['centerId'],
                        'Collection Date'      => $collection['date'],
                        'Collection Time'      => $collection['time'],
                       ];
        $float       = ['Collection Quantity' => $collection['quantity']];
        $positiveInt = ['Collection Quantity' => $collection['quantity']];

        // TODO: data needs to also be properly validated based on the given
        // validation criteria from the back end which needs to be queried.
        // This includes:
        //   - making sure all the keys are integers
        //   - finding the datatype that corresponds to that attribute
        //   - validating for that datatype

        \LORIS\biobank\BiobankValidate::required($required);
        \LORIS\biobank\BiobankValidate::float($float);
        \LORIS\biobank\BiobankValidate::positiveInt($positiveInt);
        // TODO: validation for date and time should go here

        // Validate Preparation
        $preparation = $specimen->getPreparation();
        if (isset($preparation)) {
            $required = [
                         'Preparation Protocol'  => $preparation['protocolId'],
                         'Preparation Center ID' => $preparation['centerId'],
                         'Preparation Date'      => $preparation['date'],
                         'Preparation Time'      => $preparation['time'],
                        ];
            \LORIS\biobank\BiobankValidate::required($required);
            //TODO: validation for date and time should go here
        }

        // Validate Analysis
        $analysis = $specimen->getAnalysis();
        if (isset($analysis)) {
            $required = [
                         'Analysis Method'   => $analysis['methodId'],
                         'Analysis CenterID' => $analysis['centerId'],
                         'Analysis Date'     => $analysis['date'],
                         'Analysis Time'     => $analysis['time'],
                        ];
            \LORIS\biobank\BiobankValidate::required($required);
            //TODO: validation for date and time should go here
        }
    }

    /**
     * Validates Uploaded Files
     *
     * @param array $files files to be validated
     *
     * @throws Exception if the provided files do not meet validation
     *                   requirements.
     * @return void
     */
    function validateFiles(array $files) : void
    {
        if (!empty($files)) {
            $config    = \NDB_Config::singleton();
            $mediaPath = $config->getSetting('mediaPath');

            if (!isset($mediaPath)) {
                throw new \Exception('Error! Media path is not set in Loris Settings!');
            }

            if (!file_exists($mediaPath)) {
                throw new \Exception("Error! The upload folder '.$mediaPath.' does not exist!");
            }

            foreach($files as $file) {
                $fileName  = $file['name'];
                $extension = pathinfo($fileName)['extension'];

                if (!isset($extension)) {
                    throw new \Exception(400, 'Please make sure your file has a valid extension.');
                }

                // XXX: Decide if the file should wait to be uploaded, until it's
                // guaranteed that the specimen can be updated.
                if (move_uploaded_file($file['tmp_name'], $mediaPath . $fileName)) {
                    //TODO: look into NDB_notifier?
                } else {
                    throw new \Exception('Could not upload the file. Please try again!');
                }
            }
        }
    }

    /**
     * Returns a PSR7 response to the handler to be sent to the front end.
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
                    $this->showError(
                        400,
                        'Barcode is not of proper format for the 
                            selected specimen type'
                    );
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
    private function fetchSpecimens() : String
    {
        $user      = \User::singleton();
        $specimens = $this->getDataProvisioner()->execute($user);

        return json_encode($specimens);
    }
}
