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
class DownloadFile extends \NDB_Page
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
        $db   = \Database::singleton();
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

        $options = $this->getOptions($db);

        return (new \LORIS\Http\Response())
            ->withHeader("Content-Type", "application/json")
            ->withStatus(200)
            ->withBody(new \LORIS\Http\StringStream(json_encode($options)));
    }

    //XXX: This was taken directly from Media, but may need some changes.
    function downloadFile()
    {

        $user = \User::singleton();
        if (!$user->hasPermission('media_write')) {
            showError(403, 'Permission to download file is denied');
            exit;
        }

        // Make sure that the user isn't trying to break out of the $path
        // by using a relative filename.
        $file     = basename($_GET['file']);
        $config   = \NDB_Config::singleton();
        $path     = $config->getSetting('mediaPath');
        $filePath = $path . $file;

        if (!file_exists($filePath)) {
            error_log('ERROR: File'.$filePath.' does not exist');
            showError(404, 'File was not found');
            exit(1);
        }

        // Output file in downloadable format
        header('Content-Description: File Transfer');
        header('Content-Type: application/force-download');
        header("Content-Transfer-Encoding: Binary");
        header("Content-disposition: attachment; filename=\"" . basename($filePath) . "\"");
        readfile($filePath);
    }
}
