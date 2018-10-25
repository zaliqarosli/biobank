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

        $action = $request->getQueryParams()['action'] ?? null;
        $body   = $request->getParsedBody();
        $data   = $body['data'] ?? null;
        $data   = json_decode($data, true);
        $files  = $body['files'] ?? null;
        try {
            switch($action) {
            case 'fetchSpecimens':
                $specCon = new SpecimenController($db, $user, $responder);
                $specimens = $specCon->getAll();
                return $responder->success($specimens);
                break;
            case 'fetchContainers':
                $contCon = new ContainerController($db, $user, $responder);
                $containers = $contCon->getAll();
                return $responder->success($containers);
                break;
            case 'fetchPools':
                $poolCon = new PoolController($db, $user, $responder);
                $pools = $poolCon->getAll();
                return $responder->success($pools);
                break;
            case 'fetchOptions':
                $options = $this->getOptions($db, $user, $responder);
                return $responder->success(json_encode($options));
                break;
            case 'createSpecimens':
                $specCon = new SpecimenController($db, $user, $responder);
                $specCon->create($data, $files);
                return $responder->success('Success');
                break;
            case 'createContainers':
                $contCon = new ContainerController($db, $user, $responder);
                $contCon->create($data);
                return $responder->success('Success');
                break;
            case 'createPool':
                $poolCon = new PoolController($db, $user, $responder);
                $poolCon->create($data);
                return $responder->success('Success');
                break;
            case 'updateSpecimen':
                $specCon = new SpecimenController($db, $user, $responder);
                $specCon->update($data, $files);
                return $responder->success('Success');
                break;
            case 'updateContainer':
                $contCon = new ContainerController($db, $user, $responder);
                $contCon->update($data);
                return $responder->success('Success');
                break;
            //todo: check that this actually works.
            case 'downloadFile':
                $file = $request->getQueryParams()['file'];
                $this->downloadFile($file, $user, $responder);
                return $responder->success('OK');
                break;
            default:
                // FIXME: This is causing an error because this exends NDB_Menu_Filter.
                // Change this class to extend NDB_Page.
                $this->setup();
                return (new \LORIS\Http\Response())
                    ->withBody(new \LORIS\Http\StringStream($this->display()));
            }
        } catch (\Invalid $e) {
            return $responder->badRequest($e->getMessage());
        } catch (\Forbidden $e) {
            return $responder->forbidden($e->getMessage());
        }
    }

    /**
     * Retrieves all options for populating forms and mapping front-end data.
     *
     * @param object $db Database instance
     *
     * @return array      All options required by the Biobank Module
     */
    function getOptions($db, $user, $responder)
    {
        $contCon = new ContainerController($db, $user, $responder);
        $specCon = new SpecimenController($db, $user, $responder);

        // TODO: figure out if these are options or data
        // XXX: This should eventually be replaced by a Candidate Controller
        $query      = 'SELECT CandID as id, PSCID as pscid FROM candidate';
        $candidates = $db->pselectWithIndexKey($query, array(), 'id');

        // XXX: This should eventually be replaced by Session Controller
        $query    = 'SELECT ID as id, Visit_label as label FROM session';
        $sessions = $db->pselectWithIndexKey($query, array(), 'id');

        // XXX: This should eventually be replaced by a Center Controller
        $centers = \Utility::getSiteList();
        foreach ($centers as $id => $center) {
            if ($user->hasCenter($id) === false) {
                unset($centers[$id]);
            }
        }

        // TODO: These are definitely options and should stay here.
        // XXX: This should eventually be replaced by a Session Controller
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
                'candidates'        => $candidates,
                'sessions'          => $sessions,
                'centers'           => $centers,
                'candidateSessions' => $candidateSessions,
                'sessionCenters'    => $sessionCenters,
                'container'         => $contCon->getOptions(),
                'specimen'          => $specCon->getOptions(),
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

