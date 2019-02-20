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
use \Psr\Http\Message\ResponseInterface;

/**
 * A class for handling the /biobank/containerendpoint/ endpoint.
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
class ContainerEndpoint extends \LORIS\Api\Endpoint
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
     * @return array supported HTTP methods
     */
    protected function allowedMethods() : array
    {
        return [
                'GET',
                'PUT',
                'POST',
               ];
    }

    /**
     * Versions of LORIS API which are supported by this endpoint.
     *
     * @return array a list of supported API versions.
     */
    protected function supportedVersions() : array
    {
        return [
                'v0.0.1',
                'v0.0.2',
                'v0.0.3-dev',
               ];
    }

    /**
     * Handles Controller requests.
     *
     * @param ServerRequestInterface $request The incoming PSR7 request
     *
     * @return ResponseInterface The outgoing PSR7 response
     */
    public function handle(ServerRequestInterface $request) : ResponseInterface
    {
        $db            = \Database::singleton();
        $user          = $request->getAttribute('user');
        $containerCont = new ContainerController($db, $user);

        try {
            switch($request->getMethod()) {
            case 'GET':
                $containers = $containerCont->getInstances();
                return new \LORIS\Http\Response\OK($containers);
            case 'POST':
                $containers = json_decode($request->getBody()->getContents(), true);
                $containerCont->createInstances($containers);
                return new \LORIS\Http\Response\OK();
            case 'PUT':
                $containers = json_decode($request->getBody()->getContents(), true);
                $containerCont->updateInstance($containers);
                return new \LORIS\Http\Response\OK();
            case 'OPTIONS':
                return (new \LORIS\Http\Response())
                    ->withHeader('Allow', $this->allowedMethods());
            }
        } catch (\BadRequest $e) {
            return new \LORIS\Http\Response\BadRequest($e->getMessage());
        } catch (\Forbidden $e) {
            return new \LORIS\Http\Response\Forbidden($e->getMessage());
        }
    }
}
