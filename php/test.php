<?php

	include 'specimenDAO.php';
	
	class Test {
		
		function __construct() {
		}

		function testDao() {
			$specimenDAO = new SpecimenDAO;
			$specimenVO = $specimenDAO->createSpecimenSetType(1);
			$specimenStrings = $specimenDAO->displaySpecimenAsString($specimenVO);
			foreach ($specimenStrings as $specimenString) {
				echo $specimenString;
			}
		}
	}	

	
	$test = new Test();
	$test->testDao();
		
?>
			
		
