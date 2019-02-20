<?php
/**
 * This file provides an implementation of the Primary Container Filter.
 *
 * PHP Version 7
 *
 * @category   Filter
 * @package    Loris
 * @subpackage Biobank
 * @author     Henri Rabalais <henri.rabalais@mcin.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link       https://www.github.com/aces/Loris/
 */
namespace LORIS\biobank;

/**
 * PrimaryContainerFilter filters out any containers that are not of type
 * primary.
 *
 * @category   Filter
 * @package    Loris
 * @subpackage Biobank
 * @author     Henri Rabalais <henri.rabalais@mcin.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link       https://www.github.com/aces/Loris/
 */
class PrimaryContainerFilter implements \LORIS\Data\Filter
{
    /**
     * Implements the \LORIS\Data\Filter interface
     *
     * @param User      $user      The user that the data is being filtered for.
     * @param Container $container The container being filtered.
     *
     * @return bool true if the container is of type primary.
     */
    public function filter(\User $user, \Loris\Data\DataInstance $container) : bool
    {
        $db           = \Database::singleton();
        $containerDAO = new ContainerDAO($db);
        $containerTypes = $containerDAO->getContainerTypes();
        if ($containerTypes[$container['typeId']]['primary'] === 0) {
            return false;
        }
        return true;
    }
}
