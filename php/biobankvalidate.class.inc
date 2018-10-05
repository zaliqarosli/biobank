<?php
/**
 * Biobank Validate
 *
 * Handles biobank validation requests
 *
 * PHP Version 7
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
class Biobank Validate
{

    public static function isNegativeInt($param) {
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
    
    public static function validateRequired(array $fields) {
        foreach($fields as $key=>$value) {
            if (is_null($value)) {
                $this->showError(400, "$key value must be provided");
            }
        }
    }
    
    public static function validatePositiveInt(array $fields) {
        foreach ($fields as $key=>$value) {
            if ($this->isNegativeInt($value) && !is_null($value)) {
                $this->showError(400, "$key should be a positive integer.");
            }
        }
    }
    
    public static function validateStrings(array $fields) {
        foreach ($fields as $key=>$value) {
            if (!is_string($value) && !is_null($value)) {
                $this->showError(400, "$key must be a string.");
            }
        }
    }
    
    public static function validateFloats(array $fields) {
        foreach ($fields as $key=>$value) {
            if (!(is_numeric($value) && is_float(floatval($value)))) {
                $this->showError(400, "$key must be a number.");
            }
        }
    }
    
    public static function validateArrays(array $fields) {
        foreach ($fields as $key=>$value) {
            if (!is_array($value) && !is_null($value)) {
                $this->showError(400, "$key must be an array.");
            }
        }
    }
    
    public static function validateParentContainer($containerDAO, $container, $parentId) {
        if ($container->getId() == $parentId) {
                $this->showError(400, 'A container can not be placed within itself or
                    within one of its descendant containers.');
        }
        $childContainers = $containerDAO->getChildContainers($container);
        if (isset($childContainers)) {
            foreach ($childContainers as $child) {
                $this->validateParentContainer($containerDAO, $child, $parentId);
            }
        }
    }
    
    public static function validateBarcode($containerDAO, $barcode) {
        $containerList = $containerDAO->selectContainers();
        foreach ($containerList as $container) {
            $b = $container->getBarcode();
            if ($b === $barcode) {
                $this->showError(400, 'Barcode must be unique');
            }
        }
    }
    
    public static function showError($code, $message)
    {
        if (!isset($message)) {
            $message = 'An unknown error occurred!';
        }
    
        http_response_code($code);
        header('Content-Type: application/json; charset=UTF-8');
        exit(json_encode(['message' => $message]));
    }
}
