<?php declare(strict_types=1);
/**
 * This class features the code that enables access to the LORIS Biobank Module.
 *
 * PHP Version 7.2
 *
 * @category   Page
 * @package    Loris
 * @subpackage Biobank
 * @author     Henri Rabalais <henri.rabalais@mcin.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.text GPLv3
 * @link       http://www.github.com/aces/Loris/
 */
namespace LORIS\biobank;
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;

/**
 * This class features the code that enables access to the LORIS Biobank Module.
 *
 * PHP Version 7.2
 *
 * @category   Page
 * @package    Loris
 * @subpackage Biobank
 * @author     Henri Rabalais <henri.rabalais@mcin.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.text GPLv3
 * @link       http://www.github.com/aces/Loris/
 */
class Biobank extends \NDB_Page
{
    /**
     * Determine whether the user has permission to view this page.
     *
     * @param User $user to be checked.
     *
     * @return bool whether the user has access.
     */
    function _hasAccess(\User $user) : bool
    {
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
        $db     = \Database::singleton();
        $user   = $request->getAttribute('user');
        $action = $request->getQueryParams()['action'] ?? null;

        try {
            switch($action) {
            case 'fetchOptions':
                $options = $this->getOptions($db, $user);
                return new \LORIS\Http\Response\OK(json_encode($options));
                break;
            case 'downloadFile':
                $file = $request->getQueryParams()['file'];
                $this->downloadFile($file, $user, $responder);
                return new \LORIS\Http\Response\OK();
                break;
            default:
                $this->setup();
                return (new \LORIS\Http\Response())
                    ->withBody(new \LORIS\Http\StringStream($this->display()));
            }
        } catch (\Invalid $e) {
            return \LORIS\Http\Response\BadRequest($e->getMessage());
        } catch (\Forbidden $e) {
            return \LORIS\Http\Response\Forbidden($e->getMessage());
        }
    }

    /**
     * Retrieves all options for populating forms and mapping front-end data.
     *
     * @param Database $db   Database instance
     * @param User     $user User instance
     *
     * @return array All options required by the Biobank Module
     */
    function getOptions($db, $user)
    {
        $contCont = new ContainerController($db, $user);
        $specCont = new SpecimenController($db, $user);

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
            foreach ($row as $column=>$value) {
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
                'container'         => $contCont->getOptions(),
                'specimen'          => $specCont->getOptions(),
               );
    }

    /**
     * Allows files to be downloaded
     *
     * @param file $file File to be downloaded
     * @param user $user User to be checked for permission
     *
     * @return ResponseInterface the outgoing PSR7 response.
     */
    function downloadFile($file, $user) : ResponseInterface
    {
        if (!$user->hasPermission('biobank_specimen_view')) {
            throw new \Forbidden('Permission to download file is denied');
        }

        $fileName = basename($file);
        $config   = \NDB_Config::singleton();
        $path     = $config->getSetting('mediaPath');
        $filePath = $path . $fileName;

        if (!file_exist($filePath)) {
            error_log('ERRO: File'.$filePath.' does not exist');
            throw new \BadRequest('File was not found');
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

