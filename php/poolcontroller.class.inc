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
class PoolController extends \NDB_Menu_Filter
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
        $dao       = new PoolDAO($db);
        $responder = new BiobankResponder();

        switch($action) {
        case 'fetchPools':
            $pools = $this->fetchPools();
            return $responder->success($pools);
            break;
        case 'savePool':
            $pool = $this->prepPool($dao, $data, $user, $responder);
            $dao->savePool($pool);
            return $responder->success('Success!');
            break;
        default:
            return $responder->badRequest('The request made to the server is invalid');
        }
    }

    /**
     * Converts the results of this menu filter to a JSON format to be retrieved
     * with ?format=json
     *
     * @return string a json encoded string of the headers and data from this table
     */
    private function fetchPools() : string
    {
        $user  = \User::singleton();
        $pools = $this->getDataProvisioner()->execute($user);

        return json_encode($pools);
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
     * Prepares Pool for Submission into the Database.
     *
     * @param PoolDAO $dao
     * @param array        $data
     * @param User         $user
     * ADD RESPONDER
     *
     * @return Pool $pool to be submitted
     */
    public function prepPool(PoolDAO $dao, array $data, \User $user, BiobankResponder $responder) : Pool
    {
        $pool = $this->setPool($dao, $data);
        $this->validatePermission($user, $pool, $dao, $responder);
        $this->validateData($dao, $pool, $responder);

        return $pool;
    }

    /**
     * Instatiates a Pool Object using the values sent from the front-end.
     *
     * @param PoolDAO $dao  DAO instance used to create the Pool Object
     * @param array   $data Data to be used to create the Pool Object
     *
     * @return Pool   $pool Instantiated Pool Object
     */
    public function setPool(PoolDAO $poolDAO, array $data) : Pool
    {
        //Set persistence variables.
        $pool = $poolDAO->createPool();
        $pool->setLabel($data['$label']);
        $pool->setSpecimenIds($data['specimenIds']);
        $pool->setCenterId($data['centerId']);
        $pool->setDate($data['date']);
        $pool->setTime($data['time']);

        return $pool;
    }

    /**
     * Checks User Permission creating pools.
     *
     * @param User $user User to be checked
     * @param Pool $pool Pool to be checked
     *
     * @throws Exception if the user does not meet permission requirment for the
     *                   given action
     * @return void
     */
    function validatePermission(\User $user, Pool $pool, BiobankResponder $responder) : void
    {
        if (!$user->hasPermission('biobank_pool_create')) {
            $responder->forbidden('Pool: Create Permission Denied');
        }
    }

    /**
     * Validates Pool Object before being saved
     *
     * @param PoolDAO $poolDAO Instance of Pool DAO used to validate the Pool
     * @param Pool    $pool    Pool to be validated
     *
     * @throws Exception if the provided Container does not meet validation
     *                   requirements
     *
     * @return void
     */
    function validateData(PoolDAO $poolDAO, Pool $pool, BiobankResponder $responder) : void
    {

        //TODO: Validate Label with Regex and required

        // Validate Specimen Ids required.
        // Validate Specimen Ids
        // TODO: find a way to access $db here. Instance variable?
        $specimenDAO   = new SpecimenDAO($db);
        $containerDAO  = new ContainerDAO($db);
        $baseSpecimen  = $specimenDAO->getSpecimenFromId($specimenIds[0]);
        $baseContainer = $containerDAO->getContainerFromSpecimen($baseSpecimen);

        foreach($specimenIds as $specimenId) {
            //TODO: Make sure to check that containers are available.
            //TODO: Make sure to check there are atleast two items in the list
            $specimen  = $specimenDAO->getSpecimenFromId($specimenId);
            $container = $containerDAO->getContainerFromSpecimen($specimen);
            $barcode   = $container->getBarcode();

            if ($baseSpecimen->getCandidateId() !== $specimen->getCandidateId()) {
                $responder->iSE('Pooled specimens must belong to the same Candidate');
            }

            if ($baseSpecimen->getSessionId() !== $specimen->getSessionId()) {
                $responder->iSE('Pooled specimens must belong to the same Session');
            }

            if ($baseSpecimen->getTypeId() !== $specimen->getTypeId()) {
                $responder->iSE('Pooled specimens must be of the same Type');
            }

            if ($baseContainer->getCenterId() !== $container->getCenterId()) {
                $responder->iSE('Pooled specimens must be at the same Site');
            }

            if ($specimen->getQuantity() === 0 ) {
                $responder->iSE("Quantity of '$barcode' must be greater than '0'");
            }

            if ($specimen->getPoolId() !== null) {
                $responder->iSE("Specimen '$barcode' already belongs to a Pool");
            }
        }

        //TODO: Validate CenterId required.
        //TODO: validate Date datatype and required
        //TODO: validate Time datatype and required
    }
}
