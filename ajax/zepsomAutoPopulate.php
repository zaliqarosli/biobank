<?php
/**
 * Created by PhpStorm.
 * User: hrabalais
 * Date: 06/07/17
 * Time: 10:53 AM
 */
error_log("ddflsdjfk");
$identifier = $_POST["identifier"];
$DB = Database::singleton();

$fields = $DB->pselect("SELECT PSCID, DoB FROM candidate WHERE ExternalID:=ID", array('ID'=>$identifier));
error_log(json_encode($fields));
echo json_encode($fields);

