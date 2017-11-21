<?php

	include 'specimenDAO.php';
	
	class Test {
		
		function __construct() {
		}

		function testSpecimenDao() {
			$specimenDAO 	= new SpecimenDAO;
			$specimenVO 	= $specimenDAO->createSpecimenVOSetId(3);
			$specimenVO 	= $specimenDAO->displaySpecimenVO($specimenVO);
			print_r($specimenVO);
			print_r("\n");
		}
		
		function testContainerDao() {
			$containerDAO 	= new ContainerDAO;
			$containerVO 	= $containerDAO->createContainerVOSetId(3);
			$containerVO 	= $containerDAO->displayContainerVO($containerVO);
			print_r($containerVO);
			print_r("\n");

		}
	}	

	
	$test = new Test();
	$test->testContainerDao();
	$test->testSpecimenDao();		
?>
			
		
