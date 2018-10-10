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
class BiobankValidate
{

    public static function isNegativeInt($param)
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

    public static function required(array $fields)
    {
        foreach($fields as $key=>$value) {
            if (is_null($value)) {
                throw new \Exception("$key value must be provided");
            }
        }
    }

    public static function positiveInt(array $fields)
    {
        foreach ($fields as $key=>$value) {
            if (self::isNegativeInt($value) && !is_null($value)) {
                throw new \Exception("$key should be a positive integer.");
            }
        }
    }

    public static function string(array $fields)
    {
        foreach ($fields as $key=>$value) {
            if (!is_string($value) && !is_null($value)) {
                return "$key must be a string.";
            }
        }
    }

    public static function float(array $fields)
    {
        foreach ($fields as $key=>$value) {
            if (!(is_numeric($value) && is_float(floatval($value)))) {
                throw new \Exception("$key must be a number.");
            }
        }
    }

    public static function array(array $fields)
    {
        foreach ($fields as $key=>$value) {
            if (!is_array($value) && !is_null($value)) {
                $this->showError(400, "$key must be an array.");
            }
        }
    }

    public static function parentContainer($containerDAO, $container, $parentId)
    {
        if ($container->getId() == $parentId) {
                $this->showError(
                    400,
                    'A container can not be placed within itself or
                    within one of its descendant containers.'
                );
        }
        $childContainers = $containerDAO->getChildContainers($container);
        if (isset($childContainers)) {
            foreach ($childContainers as $child) {
                $this->validateParentContainer($containerDAO, $child, $parentId);
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
