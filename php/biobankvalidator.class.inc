<?php
/**
 * Biobank Validate
 *
 * Handles biobank validation requests
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

/**
 * Biobank Validate.
 *
 * Handles biobank validation requests
 *
 * PHP Version 7
 *
 * @category Loris
 * @package  Biobank
 * @author   Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license  htpp://ww.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://github.com/aces/Loris/
 */
class BiobankValidator
{    
    public $responder;
    public $dao;

    function __construct($responder, $dao)
    {
        $this->responder = $responder;
        $this->dao       = $dao;
    }
     
    public function isNegativeInt($param)
    {
        if (is_null($param)) {
            return false;
        }

        if (!is_numeric($param)) {
            return false;
        }

        if (intval($param) >= 0) {
            return false;
        }

        return true;
    }

    public function required($label, $value)
    {
        if (is_null($value)) {
            $this->responder->iSE("$label value must be set.");
        }
    }

    public function positiveInt(array $fields)
    {
        foreach ($fields as $key=>$value) {
            if (self::isNegativeInt($value) && !is_null($value)) {
                $this->responder->iSE("$key should be a positive integer.");
            }
        }
    }

    public function string(array $fields)
    {
        foreach ($fields as $key=>$value) {
            if (!is_string($value) && !is_null($value)) {
                $this->responder->iSE("$key must be a string.");
            }
        }
    }

    public function float($label, $value)
    {
        if (!(is_numeric($value) && is_float(floatval($value)))) {
            $this->responder->iSE("$label must be a number.");
        }
    }

    public function array(array $fields)
    {
        foreach ($fields as $key=>$value) {
            if (!is_array($value) && !is_null($value)) {
                $this->responder->iSE(400, "$key must be an array.");
            }
        }
    }

    /* Container Validation */
    public function barcode($container)
    {
        $this->required('Barcode', $container->getBarcode());
        $id = $container->getId();
        if (!isset($id)) {
            $containerList = $this->dao->selectContainers();
            $barcode       = $container->getBarcode();
            foreach ($containerList as $c) {
                $b = $c->getBarcode();
                if ($b === $barcode) {
                    $this->responder->iSE('Barcode must be unique');
                }
            }
        }
        //TODO: Regex check on Barcode.
    }

    public function type($container) {
        $this->required('Container Type', $container->getTypeId());
    }

    public function temperature($container) {
        $this->required('Temperature', $container->getTemperature());
        $this->float('Temperature', $container->getTemperature());

        if ($temperature < -273 || $temperature > 999) {
            $this->responder->iSE('Temperature must be between -273.15 and 1000.');
        }
    }

    public function status($container) {
        $this->required('Status', $container->getStatusId());
    }

    public function center($container) {
        $this->required('Center', $container->getCenterId());
    }

    /**
     * Recursive functino that checks if the Parent Container is a child of the
     * Container Object
     *
     * @param Container    $container Container to be validated
     *
     * @return void
     */
    public function parentContainer($container)
    {
        $parentContainerId = $container->getParentContainerId();
        if (isset($parentContainerId)) {
            if ($container->getId() == $parentContainerId) {
                    $this->responder->iSE(
                        'A container can not be placed within itself or
                        within one of its descendant containers.'
                    );
            }
            $childContainers = $this->dao->getChildContainers($container);
            if (isset($childContainers)) {
                foreach ($childContainers as $child) {
                    $this->parentContainer($child);
                }
            }
        }
    }

    public function coordinate($container) {
        $coordinate = $container->getCoordinate();
        if (isset($coordinate)) {
            if (!((is_int($coordinate) || ctype_digit($coordinate)) && (int)$coordinate > 0)) {
                $this->responder('Coordinate must be a positive integer.');
            }
            
            $parentContainerId = $container->getParentContainerId();
            if (!isset($parentContainerId)) {
                $this->responder->iSE('Coordinate can not be set without a Parent
                                       Container.');
            }
            // TODO: Check that the coordinate value is within the container's 
            // dimension capacity.
        } 
    }
}
