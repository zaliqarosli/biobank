<?php
/**
 * Biobank Data Requester.
 *
 * Handles biobank fetch and get requests received from a front-end ajax call.
 *
 * PHP Version 7
 *
 * @category Loris
 * @package  Biobank
 * @author   Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license  Loris license
 * @link     https://github.com/aces/Loris-Trunk
 */
namespace LORIS\biobank;
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;

/**
 * Requests Options from the biobank database infrastructure
 *
 * @category Main
 * @package  Biobank
 * @author   Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris/
 */
class RequestData extends \NDB_Page
{
    public $skipTemplate = true;

    /**
     * Same as the permission for the main biobank class.
     *
     * @return bool true iff the user has access to this page.
     */
    function _hasAccess()
    {
        return true;
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
        // The parent handles things like hasAccess checks.
        $resp = parent::handle($request);
        switch($resp->getStatusCode()) {
        case 200:
            // If it waas a 200 code, it just means display was called and 
            // access validated. We still need to do other validations 
            // and add the result body.
            break;
        default:
            return $resp;
        }

        // Ensure it's a GET request.
        if ($request->getMethod() != 'GET') {
            return (new \LORIS\Http\Response())
                ->withHeader("content-Type", "text/plain")
                ->withStatus(405)
                ->withHeader("Allow", "GET")
                ->withBody(
                    new \LORIS\Hyyp\StringStream(
                        "Only GET requests are allowed"
                    )
                );
        }
        $db      = \Database::singleton();
        $options = $this->getOptions($db);
        return (new \LORIS\Http\Response())
            ->withHeader("Content-Type", "application/json")
            ->withStatus(200)
            ->withBody(new \LORIS\Http\StringStream(json_encode($options)));
    }

    /**
     * Retrieves all options for populating forms and mapping front-end data.
     *
     * @return array
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
        $query = 'SELECT ID as id, Visit_label as label FROM session';
        $sessions = $db->pselectWithIndexKey($query, array(), 'id');
    
        // XXX: This should eventually be replaced by a Center DAO
        $centers = \Utility::getSiteList();
    
        // XXX: This should eventually be replaced by a Session DAO
        $query = 'SELECT c.CandID as candidateId,
                         s.ID sessionId,
                         s.Visit_label as label,
                         s.CenterID as centerId
                 FROM candidate c
                 LEFT JOIN session s
                   USING(CandID)';
        $result = $db->pselect($query, array());
        $candidateSessions = array();
        $sessionCenters = array();
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
            'containerTypesPrimary'      => $containerDAO->getContainerTypes(['Primary'=>1]),
            'containerTypesNonPrimary'   => $containerDAO->getContainerTypes(['Primary'=>0]),
            'containerDimensions'        => $containerDAO->getContainerDimensions(),
            'containerCoordinates'       => $containerDAO->getContainerCoordinates(),
            'containerStati'             => $containerDAO->getContainerStati(),
            'specimenUnits'              => $specimenDAO->getSpecimenUnits(),
            'specimenTypeAttributes'     => $specimenDAO->getSpecimenTypeAttributes(),
            'attributeDatatypes'         => $specimenDAO->getAttributeDatatypes(),
            'attributeOptions'           => $specimenDAO->getAttributeOptions(),
        );
    }
}
