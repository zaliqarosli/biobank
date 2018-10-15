<?php
/**
 * This class features the code that enables access to the LORIS Biobank Module.
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

//TODO: Make this extend NDB_Page rather than NDB_Menu_Filter.
class Biobank extends \NDB_Menu_Filter
{
    /**
     * Determine whether the user has permission to view this page.
     *
     * @return bool whether the user has access
     */
    function _hasAccess()
    {
        $user = \User::singleton();
        return $user->hasPermission('biobank_access');
    }

    /**
     * Set up the variables required by for construction of page
     *
     * @return void
     */
    function _setupVariables()
    {
        $this->skipTemplate = true;
        $this->AjaxModule   = true;
    }

    /**
     * This acts as an Ajax endpoint that returns all options for populating
     * forms and for mapping front-end data in the Biobank Module
     *
     * @param ServerRequestInterface $request The incoming PSR7 request
     *
     * @return ResponseInterface The outgoing PSR7 response
     */
    public function handle(ServerRequestInterface $request) : ResponseInterface
    {
        $db        = \Database::singleton();
        $user      = $request->getAttribute('user');
        $responder = new BiobankResponder();

        $action  = $request->getQueryParams()['action'];
        $data    = json_decode($request->getParsedBody()['data'], true);
        switch($action) {
        case 'fetchContainers':
            $contCon = new ContainerController($db, $user, $responder);
            $containers = $contCon->fetchContainers();
            return $responder->success($containers);
        case 'updateContainer':
            $contCon = new ContainerController($db, $user, $responder);
            $contCon->updateContainer($data);
            return $responder->success('Success');
        case 'createContainers':
            $contCon = new ContainerController($db, $user, $responder);
            $contCon->createContainers($data);
            return $responder->success('Success');
        case 'fetchOptions':
            $options = $this->getOptions($db);
            return $responder->success(json_encode($options));
        case 'fetchPools':
            $poolCon = new PoolController($db, $user, $responder);
            $pools = $poolCon->fetchPools();
            return $responder->success($pools);
        case 'createPool':
            $poolCon = new PoolController($db, $user, $responder);
            $poolCon->createPool($data);
            return $responder->success('Success');
        //todo: check that this actually works.
        case 'downloadFile':
            $file = $request->getQueryParams()['file'];
            $this->downloadFile($file, $user, $responder);
            return $responder->success('OK');
        default:
            $this->setup();
            return (new \LORIS\Http\Response())
                ->withBody(new \LORIS\Http\StringStream($this->display()));
        }
    }

    /**
     * Retrieves all options for populating forms and mapping front-end data.
     *
     * @param object $db Database instance
     *
     * @return array      All options required by the Biobank Module
     */
    function getOptions($db)
    {
        $specimenDAO  = new SpecimenDAO($db);
        $containerDAO = new ContainerDAO($db);
        $poolDAO      = new PoolDAO($db);

        // XXX: This should eventually be replaced by a Candidate DAO
        $query      = 'SELECT CandID as id, PSCID as pscid FROM candidate';
        $candidates = $db->pselectWithIndexKey($query, array(), 'id');

        // XXX: This should eventually be replaced by Session DAO
        $query    = 'SELECT ID as id, Visit_label as label FROM session';
        $sessions = $db->pselectWithIndexKey($query, array(), 'id');

        // XXX: This should eventually be replaced by a Center DAO
        $centers = \Utility::getSiteList();

        // XXX: This should eventually be replaced by a Session DAO
        $query  = 'SELECT c.CandID as candidateId,
                         s.ID sessionId,
                         s.Visit_label as label,
                         s.CenterID as centerId
                 FROM candidate c
                 LEFT JOIN session s
                   USING(CandID)';
        $result = $db->pselect($query, array());
        $candidateSessions = array();
        $sessionCenters    = array();
        foreach ($result as $row) {
            foreach($row as $column=>$value) {
                $candidateSessions[$row['candidateId']][$row['sessionId']]['label'] = $row['label'];
                $sessionCenters[$row['sessionId']]['centerId'] = $row['centerId'];
            }
        }

        return array(
                'candidates'                 => $candidates,
                'sessions'                   => $sessions,
                'centers'                    => $centers,
                'candidateSessions'          => $candidateSessions,
                'sessionCenters'             => $sessionCenters,
                'specimenTypes'              => $specimenDAO->getSpecimenTypes(),
                'specimenTypeUnits'          => $specimenDAO->getSpecimenTypeUnits(),
                'specimenProtocols'          => $specimenDAO->getSpecimenProtocols(),
                'specimenProtocolAttributes' => $specimenDAO->getSpecimenProtocolAttributes(),
                'specimenMethods'            => $specimenDAO->getSpecimenMethods(),
                'specimenMethodAttributes'   => $specimenDAO->getSpecimenMethodAttributes(),
                'containerTypes'             => $containerDAO->getContainerTypes(),
                'containerTypesPrimary'      => $containerDAO->getContainerTypes(['Primary' => 1]),
                'containerTypesNonPrimary'   => $containerDAO->getContainerTypes(['Primary' => 0]),
                'containerDimensions'        => $containerDAO->getContainerDimensions(),
                'containerCoordinates'       => $containerDAO->getContainerCoordinates(),
                'containerStati'             => $containerDAO->getContainerStati(),
                'specimenUnits'              => $specimenDAO->getSpecimenUnits(),
                'specimenTypeAttributes'     => $specimenDAO->getSpecimenTypeAttributes(),
                'attributeDatatypes'         => $specimenDAO->getAttributeDatatypes(),
                'attributeOptions'           => $specimenDAO->getAttributeOptions(),
               );
    }

    function downloadFile($file, $user, $responder)
    {
        if (!$user->hasPermision('biobank_specimen_view')) {
            $responder->forbidden('Permission to download file is denied');
        }

        $fileName = basename($file);
        $config = \NDB_Config::singleton();
        $path = $config->getSetting('mediaPath');
        $filePath = $path . $fileName;

        if (!file_exist($filePath)) {
            error_log('ERRO: File'.$filePath.' does not exist');
            $responder->iSE('File was not found');
        }

        return (new \LORIS\Http\Response())
            ->withHeader('Content-Type', 'image/jpeg')
            ->withHeaer('Content-Length', (string) filesize($file))
            ->withBody(new \LORIS\Http\StringStream($filePath));
    }

    /**
     * Include additional CSS files:
     *
     * @return array of javascript to be inserted
     */
    function getCSSDependencies()
    {
        $factory = \NDB_Factory::singleton();
        $baseURL = $factory->settings()->getBaseURL();
        $deps    = parent::getCSSDependencies();
        return array_merge(
            $deps,
            [$baseURL . "/biobank/css/biobank.css"]
        );
    }

    /**
     * Include additional JS files
     *
     * @return array of javascript to be inserted
     */
    function getJSDependencies()
    {
        $factory = \NDB_Factory::singleton();
        $baseURL = $factory->settings()->getBaseURL();
        $deps    = parent::getJSDependencies();
        return array_merge(
            $deps,
            [$baseURL . "/biobank/js/biobankIndex.js"]
        );
    }
}

