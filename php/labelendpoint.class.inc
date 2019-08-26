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
     * Methods allowed
     *
     * @return which methods are supported by this endpoint.
     */
    protected function allowedMethods() : array
    {
        return array(
                'GET',
                'PUT',
                'POST',
                'OPTIONS',
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
        switch($request->getMethod()) {
        case 'POST':
            $params = json_decode($request->getBody()->getContents(), true);;
            foreach ($params as $param) {
                $barcode = $param['barcode'];
                $type = $param['type'];
                
                $zpl = "^XA,^FO330,80^BY1,^BCN,100,Y,Y,N,^CFA,20^A0N,30,29^BCN,100,Y,Y,N^FD$barcode^FS,^FO323,190,^CFA,20^A0N,30,29^FD$type^XZ";
                $fp = fopen('/data/print/barcode.zpl', 'w');
                fwrite($fp, $zpl);
                fclose($fp);
                $output = shell_exec('lp -d ZDesigner -o raw /data/print/barcode.zpl');

                echo "<pre>$output</pre>";
            }
            return new \LORIS\Http\Response\OK(); 
        }
    }
}