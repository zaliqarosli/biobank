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
        $action = $request->getQueryParams()['action'];
        $data   = json_decode($request->getParsedBody()['data'], true);
        $db     = \Database::singleton();
        $user   = \User::singleton();
        $dao    = new PoolDAO($db);

        switch($action) {
        case 'savePool':
            $pool = $this->setPool($dao, $data);
            $this->validatePermission($user, $pool);
            return $this->response('application/json', 403, $e->getMessage());

            try {
                $this->validateData($dao, $pool);
            } catch (\Exception $e) {
                return $this->response('application/json', 400, $e->getMessage());
            }

            $dao->savePool($pool);

            return $this->response('text/html', 200);
            break;
        case 'getPools':
            $pools = $this->getPools();
            return $this->response('application/json', 200, $pools);
            break;
        default:
            // XXX: This should cause some sort of error.
        }
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
        // XXX: figure out if null coalesce is necessary.
        $label       = $data['label']       ?? null;
        $specimenIds = $data['specimenIds'] ?? null;
        $centerId    = $data['centerId']    ?? null;
        $date        = $data['date']        ?? null;
        $time        = $data['time']        ?? null;

        //Set persistence variables.
        $pool = $poolDAO->createPool();
        $pool->setLabel($label);
        $pool->setSpecimenIds($specimenIds);
        $pool->setCenterId($centerId);
        $pool->setDate($date);
        $pool->setTime($time);

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
    function validatePermission(\User $user, Pool $pool) : void
    {
        if (!$user->hasPermission('biobank_pool_create')) {
            $this->showError(403, 'You do not have permission to create Pools');
        }
    }

    /**
     * Validates Pool Object before being save
     *
     * @param PoolDAO $poolDAO Instance of Pool DAO used to validate the Pool
     * @param Pool    $pool    Pool to be validated
     *
     * @throws Exception if the provided Container does not meet validation
     *                   requirements
     *
     * @return void
     */
    function validateData(PoolDAO $poolDAO, Pool $pool) : void
    {
        //TODO: Make sure to check that containers are available.
        //TODO: Make sure to check there are atleast two items in the list

        $specimenDAO   = new SpecimenDAO($db);
        $containerDAO  = new ContainerDAO($db);
        $baseSpecimen  = $specimenDAO->getSpecimenFromId($specimenIds[0]);
        $baseContainer = $containerDAO->getContainerFromSpecimen($baseSpecimen);

        foreach($specimenIds as $specimenId) {
            $specimen  = $specimenDAO->getSpecimenFromId($specimenId);
            $container = $containerDAO->getContainerFromSpecimen($specimen);
            $barcode   = $container->getBarcode();

            if ($baseSpecimen->getCandidateId() !== $specimen->getCandidateId()) {
                throw new \Exception('Pooled specimens must belong to the same Candidate');
            }

            if ($baseSpecimen->getSessionId() !== $specimen->getSessionId()) {
                throw new \Exception('Pooled specimens must belong to the same Session');
            }

            if ($baseSpecimen->getTypeId() !== $specimen->getTypeId()) {
                throw new \Exception('Pooled specimens must be of the same Type');
            }

            if ($baseContainer->getCenterId() !== $container->getCenterId()) {
                throw new \Exception('Pooled specimens must be at the same Site');
            }

            if ($specimen->getQuantity() === 0 ) {
                throw new \Exception("Quantity of '$barcode' must be greater than '0'");
            }

            if ($specimen->getPoolId() !== null) {
                throw new \Exception("Specimen '$barcode' already belongs to a Pool");
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
    private function getPools() : string
    {
        $user  = \User::singleton();
        $pools = $this->getDataProvisioner()->execute($user);

        return json_encode($pools);
    }
}
