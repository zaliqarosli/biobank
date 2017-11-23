<?php

	include 'specimenDAO.php';
	
    class Test 
    {    
        //var $specimenDAO;
        //var  $containerDAO;
        //
        //function __construct() {
        //	$this->specimenDAO = new SpecimenDAO;
        //	$this->containerDAO 	= new ContainerDAO;
        //}
        
        function displaySpecimenVO() 
        {
            $specimenDAO = new SpecimenDAO;
            $specimenVO  = $specimenDAO->createSpecimenVOSetId(3);
            $specimenVO  = $specimenDAO->displaySpecimenVO($specimenVO);
            print_r($specimenVO);
            print_r("\n");
        }
        
        function displaySpecimenTypes() 
        {
            $specimenDAO   = new SpecimenDAO;
            $specimenTypes = $specimenDAO->getSpecimenTypes();
            print_r($specimenTypes);
        }
        
        function displayContainerVO() 
	{
            $containerDAO = new ContainerDAO;
            $containerVO  = $containerDAO->createContainerVOSetId(3);
            $containerVO  = $containerDAO->displayContainerVO($containerVO);
            print_r($containerVO);
            print_r("\n");
        
        }
        
        function displayContainerTypes() 
	{
            $containerDAO 	 = new ContainerDAO;
            $containerTypes 	 = $containerDAO->getContainerTypes();
            $containerCapacities = $containerDAO->getContainerCapacities();
            $containerDimensions = $containerDAO->getContainerDimensions();
            $containerStati 	 = $containerDAO->getContainerStati();
            $containerLoci 	 = $containerDAO->getContainerLoci();
            print_r('containerTypes');
            print_r($containerTypes);
	    print_r("\n");
            print_r('containerCapacities');
            print_r($containerCapacities);
	    print_r("\n");
            print_r('containerDimensions');
            print_r($containerDimensions);
	    print_r("\n");
            print_r('$containerStati');
            print_r($containerStati);
	    print_r("\n");
            print_r('containerLoci');
            print_r($containerLoci);
	    print_r("\n");
        }
    }	
	
    $test = new Test();
    $test->displaySpecimenTypes();
    $test->displayContainerTypes();
    $test->displaySpecimenVO();
    $test->displayContainerVO();		
?>
			
	
