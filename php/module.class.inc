<?php
/**
 * This serves as a hint to LORIS that this module is a real module.
 * It does nothing but implement the module class in the module's namespace.
 *
 * PHP Version 5
 *
 * @category   Behavioural
 * @package    Main
 * @subpackage Biobank
 * @author     Dave MacFarlane <david.macfarlane2@mcgill.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link       https://www.github.com/aces/Loris-Trunk/
 */
namespace LORIS\biobank;

/**
 * Class module implements the basic LORIS module functionality
 *
 * @category   Behavioural
 * @package    Main
 * @subpackage Biobank
 * @author     Henri Rabalais <henri.rabalais@mcgill.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link       https://www.github.com/aces/Loris-Trunk/
 */
class Module extends \Module
{
    /**
     * The default handler for a module routes to a page of the first component of
     * the URL's name, or the same name as the module if serving the root of the
     * module.
     *
     * Modules extend PrefixRouter, so that the parent handler knows that the
     * css, static, and js routes should be routed through the file system to
     * retrieve the files before trying to load any specific pages.
     *
     * @param ServerRequestInterface $request The incoming PSR7 request
     *
     * @return ResponseInterface the outgoing PSR7 response
     */
        public function handle(\Psr\Http\Message\ServerRequestInterface $request) : \Psr\Http\Message\ResponseInterface
    {
        $resp = \LORIS\Router\PrefixRouter::handle($request);
        if ($resp->getStatusCode() != 404) {
            return $resp;
        }

        $pagename = $this->getName();
        $path     = trim($request->getURI()->getPath(), "/");
        if (false) {
            // There is a subpage
            $pagename = explode("@", $path)[0];
        }

        try {
            $page = $this->loadPage($pagename);
            // FIXME: Hack required for breadcrumbs. This should be removed,
            // but some tests depend on it.
            if ($this->getName() === $pagename) {
                $_REQUEST['test_name'] = $pagename;
            } else {
                $_REQUEST['subtest'] = $pagename;
            }

            if ($page->_hasAccess() !== true) {
                return (new \LORIS\Middleware\PageDecorationMiddleware(
                    $request->getAttribute("user") ?? new \LORIS\AnonymousUser()
                ))->process(
                    $request,
                    new \LORIS\Router\NoopResponder(
                        new \LORIS\Http\Error(
                            $request,
                            403,
                            "You do not have access to this page."
                        )
                    )
                );
            }
        } catch (\NotFound $e) {
            return (new \LORIS\Middleware\PageDecorationMiddleware(
                $request->getAttribute("user") ?? new \LORIS\AnonymousUser()
            ))->process(
                $request,
                new \LORIS\Router\NoopResponder(
                    new \LORIS\Http\Error(
                        $request,
                        404,
                        "File not found: " . $request->getURI()->__toString()
                    )
                )
            );
        }

        return $page->process($request, $page);
    }
}
