<?php declare(strict_types=1);
/**
 * This implements the Container endpoint class for the Biobank Module.
 *
 * PHP Version 7.2
 *
 * @category   API
 * @package    Loris
 * @subpackage Biobank
 * @author     Henri Rabalais <henri.rabalais@mcin.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.text GPLv3
 * @link       http://www.github.com/aces/Loris/
 */
namespace LORIS\biobank;
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Server\RequestHandlerInterface;
use \Psr\Http\Message\ResponseInterface;
require '/usr/bin/curl';

/**
 * A class for handling the /biobank/containers/ endpoint.
 *
 * PHP Version 7.2
 *
 * @category   API
 * @package    Loris
 * @subpackage Biobank
 * @author     Henri Rabalais <henri.rabalais@mcin.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.text GPLv3
 * @link       http://www.github.com/aces/Loris/
 */
class LabelEndpoint implements RequestHandlerInterface
{
    /**
     * Returns true if user has access to this endpoint.
     *
     * @param \User $user The user whose access is being checked
     *
     * @return bool
     */
    function _hasAccess(\User $user) : bool
    {
        return true;
    }

    /**
     * Return which methods are supported by this endpoint.
     *
HR 
     */
    protected function allowedMethods() : array
    {
        return array(
                'GET',
               );
    }

    /**
     * This function passes the request to the handler. This is necessary since
     * the Endpoint bypass the Module class.
     *
     * XXX: This function should be extracted to a parent class.
     *
     * @param ServerRequestInterface  $request The PSR7 request.
     * @param RequestHandlerInterface $handler The request handler.
     *
     * @return ResponseInterface The outgoing PSR7 response.
     */
    public function process(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler
    ) : ResponseInterface {
        return $handler->handle($request);
    }

    /**
     * Handles Endpoint requests.
     *
     * @param ServerRequestInterface $request The incoming PSR7 request
     *
     * @return ResponseInterface The outgoing PSR7 response
     */
    public function handle(ServerRequestInterface $request) : ResponseInterface
    {
        $db       = \Database::singleton();
        $user     = $request->getAttribute('user');
        $contCont = new ContainerController($db, $user);

        switch($request->getMethod()) {
        case 'GET':
            
            /* echo "Hello World!";
            $queryParams = $request->getQueryParams();
            $barcode = $queryParams['barcode'];
            $type = $queryParams['type'];
            $curl = \curl_init();
            $zpl = "^XA,,^FO20,20^BY2,^BCN,100,Y,Y,N,^FD$barcode^FS,^FO20,130,^FD$type,^XZ";
            //$curl = curl_init();
            // adjust print density (8dpmm), label width (4 inches), label height (6 inches), an$
            // exec('php labelPrint.class.inc');
            curl_setopt($curl, CURLOPT_URL, "http://api.labelary.com/v1/printers/8dpmm/labels/4x6/0/");
            curl_setopt($curl, CURLOPT_POST, TRUE);
            curl_setopt($curl, CURLOPT_POSTFIELDS, $zpl);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);
            $result = curl_exec($curl);
            if (curl_getinfo($curl, CURLINFO_HTTP_CODE) == 200) {
                $file = fopen("label.png", "w"); // change file name for PNG images
                fwrite($file, $result);
                fclose($file);
            } else {
                print_r("Error: $result");
            }
            curl_close($curl);
            */
            return new \LORIS\Http\Response\OK();
        case 'OPTIONS':
            return (new \LORIS\Http\Response())
                ->withHeader('Allow', $this->allowedMethods());
        }
    }
}
