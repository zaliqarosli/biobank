<?php


namespace LORIS\biobank;
include './specimendao.class.inc';
	
    class Test 
    {    
        //var $specimenDAO;
        //var  $containerDAO;
        //
        //function __construct() {
        //	$this->specimenDAO = new SpecimenDAO;
        //	$this->containerDAO 	= new ContainerDAO;
        //}
    
    function displaySpecimen() {
        $specimenVO    = SpecimenDAO::getSpecimenVOFromBarcode('mtlcode101');    
        $specimenArray = $specimenVO->toArray();
        print_r($specimenArray);

    }
        function displaySpecimenVO() 
        {
            $specimenDAO = new SpecimenDAO;
            $specimenVO  = $specimenDAO->displaySpecimenVO(['id' => 1]);
            print_r($specimenVO);
            print_r("\n");
        }
        
        function displaySpecimenValues() 
        {
            $specimenDAO   = new SpecimenDAO();
            //$specimenTypes = $specimenDAO->getSpecimenTypes();
	    //$specimenTypeAttributes = $specimenDAO->getSpecimenTypeAttributes(1);
            //$validate = $specimenDAO->validateSpecimenBarcode('mtlcode101');
	    //print_r($specimenTypes);
	    //print_r($specimenTypeAttributes);
	    print_r($validate);
	    
        }
        
        function displayContainerVO() 
	{
            $containerDAO = new ContainerDAO;
            $containerVO  = $containerDAO->createContainerVOFromArray(['id' => 3]);
            $containerVO  = $containerDAO->displayContainerVO($containerVO);
            print_r($containerVO);
            print_r("\n");
        
        }
        
        function displayContainerValues() 
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
    $test->displaySpecimen();
    //$test->displayContainerValues();
    //$test->displaySpecimenVO();
    //$test->displayContainerVO();		
?>
			
	
