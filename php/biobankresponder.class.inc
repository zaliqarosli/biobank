<?php
/**
 * Biobank Responder
 *
 * Handles biobank responses.
 *
 * PHP Version 7.
 *
 * @category Loris
 * @package  Biobank
 * @author   Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://github.com/aces/Loris/
 */
namespace LORIS\biobank;
use \Psr\Http\Message\ResponseInterface;

/**
 * Biobank Responder.
 *
 * Handles biobank responses.
 *
 * PHP Version 7
 *
 * @category Loris
 * @package  Biobank
 * @author   Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license  htpp://ww.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://github.com/aces/Loris/
 */

//TODO: look into whether or not this should be an interface. Or if should extend
// Something.
class BiobankResponder
{    
    function __construct()
    {
    }

    /**
     * Wrapper for responses with status of 'OK'
     * Note: Contains return because handle method requires it.
     *
     * @param string $body message to be sent in response
     *
     * @return ResponseInterface The outgoing PSR7 response 
     */
    public function success(string $body) : ResponseInterface
    {
        return $this->response(200, $body);
    }


    /**
     * Wrapper for responses with status of 'Forbidden'
     *
     * @param string $body message to be sent in response
     *
     * @return ResponseInterface The outgoing PSR7 response
     */
    public function forbidden(string $body) : ResponseInterface
    {
        return $this->response(403, $body);
    }

    /**
     * Wrapper for responses with status of 'Internal Server Error'
     *
     * @param string $body message to be sent in response
     *
     * @return ResponseInterface The outgoing PSR7 response
     */
    public function iSE(string $body) : ResponseInterface
    {
        return $this->response(500, $body);
    }

    /**
     * Wrapper for responses with status of 'badRequest'
     *
     * @param string $body message to be sent in response
     *
     * @return ResponseInterface The outgoing PSR7 response
     */
    public function badRequest(string $body) : ResponseInterface
    {
        return $this->response(400, $body);
    }

    /**
     * Returns a PSR7 response to the handle to be sent to the front end.
     *
     * @param string $header
     * @param int    $status
     * @param string $body
     *
     * @return ResponseInterface The outgoing PSR7 response
     */
    private function response(int $status, string $body) : ResponseInterface
    {
        return (new \LORIS\Http\Response())
            ->withHeader("Content-Type", 'application/json')
            ->withStatus($status)
            ->withBody(new \LORIS\Http\StringStream($body));
    }
}
