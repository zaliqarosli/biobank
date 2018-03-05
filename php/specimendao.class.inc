<?php

/**
 *
 * PHP Version 5
 *
 * @category Loris
 * @package  Biobank
 * @author   Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/CCNA/
 */

namespace LORIS\biobank;
//include 'containerdao.class.inc';
//include 'specimento.class.inc';

/**
 * Specimen Data Access Object (DAO) Class
 * This class contains all database handling that is needed to
 * permanently store and retrieve Specimen Transfer Object instances
 *
 * @category Loris
 * @package  Biobank
 * @author   Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/CCNA/
 */

class SpecimenDAO {

    public $db;

    /**
     * Constructor
     */
    function __construct($database) {
        $this->db = $database;
    }

    /**
     * Function createSpecimen 
     * This method is used when the DAO class needs to create new Specimen 
	 * instance.
     * 
     * @return object SpecimenTO
     */
    private function createSpecimen()
    {
        return new SpecimenTO();
    }
   
    /** CURRENTLY NOT IN USE MAY BE DEPRECATED
	 * Function createSpecimenFromId
	 * This method is used to create a Specimen instance with a given $id
	 *
	 * @param int $id
	 * @return object $specimen
	 */ 
    private function createSpecimenFromId(int $id) {
        $specimen = $this->createSpecimen();
        $specimen->setId($id);

        return $specimen;
    }
    
	/**
	 * Function createSpecimenFromQuery
	 * This method creates a Specimen instance from the result of a database 
	 * query of the biobank_specimen table
	 *
	 * @param array $specimenData
	 * @return object $specimen
	 */
    private function createSpecimenFromQuery(array $specimenData) {
        $specimen = $this->createSpecimen();
        $this->fromSQL($specimen, $specimenData);
    	
        return $specimen;
    }
    
    /**
     * Function getSpecimenFromId
	 * This will load all specimen contents from database for a given $id
     *
     * @param int $id
     * @return object $specimen
     */
    public function getSpecimenFromId(int $id) {
        $query  = "SELECT bs.ID, bs.ContainerID, bs.TypeID, bs.Quantity, 
                     bs.UnitID, bs.ParentSpecimenID, bs.CandidateID, bs.SessionID, 
                     bsc.Quantity as CollectionQuantity, bsc.UnitID as CollectionUnitID, 
                     bsc.LocationID as CollectionLocationID, bsc.Date as CollectionDate, 
                     bsc.Time as CollectionTime, bsc.Comments as CollectionComments, 
                     bsc.Data as CollectionData, bsp.ProtocolID, bsp.LocationID as PreparationLocationID,
                     bsp.Date as PreparationDate, bsp.Time PreparationTime,
                     bsp.Comments as PreparationComments, bsp.Data as PreparationData,
                     bsa.LocationID as AnalysisLocationID, bsa.Date as AnalysisDate, 
                     bsa.Time as AnalysisTime, bsa.Comments as AnalysisComments,
                     bsa.Data as AnalysisData
                   FROM biobank_specimen bs
                   LEFT JOIN biobank_specimen_collection bsc ON bsc.SpecimenID=bs.ID
                   LEFT JOIN biobank_specimen_preparation bsp ON bsp.SpecimenID=bs.ID
                   LEFT JOIN biobank_specimen_analysis bsa ON bsa.SpecimenID=bs.ID
                   WHERE bs.ID=:i";
        $result = $this->db->pselectRow($query, array('i' => $id));
    
        $specimen = $this->createSpecimenFromQuery($result);
        
        return $specimen;
    }
   
	/**
	 * Function getSpecimenFromBarcode
	 * This will load all specimen contents from database for a given $barcode
	 *
	 * @param string $barcode
	 * @return object $specimen
	 */ 
    public function getSpecimenFromBarcode(string $barcode) 
    {
        $id       = $this->getSpecimenIdFromBarcode($barcode);
        $specimen = $this->getSpecimenFromId($id);
    
        return $specimen;
    }	

	/** NOT CURRENTLY IN USE
	 * Function selectSpecimens
	 * This will select all specimens from the database that match the 
	 * attribute values passed through $specimenData and will return an array
	 * of specimen objects
	 * 
	 * @param array $specimenData
	 * @return array $specimens
	 */
    public function selectSpecimens(array $specimenData) {
        $conditions = $this->db->_implodeWithKeys(' AND ', $specimenData);
    
        $query  = "SELECT * FROM biobank_specimen 
                   WHERE ".$conditions;
        $result = $this->db->pselect($query, array());
    
		$specimens = array();
        if(!empty($result)) {
        	foreach ($result as $row) {
        		$specimens[] = $this->createSpecimenFromQuery($row);
        	}
        }
        
        return $specimens;
    }	

	/**
	 * This function creates an instance of the parent specimen object of the
	 * specimen that is passed, if it exists.
	 *
	 * @param object $specimen
     *
	 * @return object $parentSpecimen
	 */
    public function getParentSpecimen(SpecimenTO $specimen) {
        $parentSpecimenId = $specimen->getParentSpecimenId();

        if (isset($parentSpecimenId)) {			
    	    $query 	= "SELECT * FROM biobank_specimen
                       WHERE ID=:i";
    	    $result = $this->db->pselectrow($query, array('i' => $parentSpecimenId));
    
    	    $parentSpecimen = $this->createSpecimenFromQuery($result);		

    	    return $parentSpecimen;
    	}
    }
    
	/**
	 * Queries all rows of the biobank_specimen_type table and returns a nested
	 * array with the id column as the index
	 *
	 * @return array $specimenTypes 
	 */
    public function getSpecimenTypes() {
        $query = "SELECT ID as id, Type as type, ParentTypeID as parentTypeId
                  FROM biobank_specimen_type";
        $specimenTypes = $this->queryToArray($query, 'id');
    
        return $specimenTypes;
    }

	/**
	 * Function getSpecimenProtocols
	 * Queries all rows of the biobank_specimen_protocol table and returns a nested
	 * array with the id column as the index
	 *
	 * @return array $specimenProtocols 
	 */
    public function getSpecimenProtocols() {
        $query = "SELECT ID as id, Protocol as protocol 
                  FROM biobank_specimen_protocol";
        $specimenProtocols = $this->queryToArray($query, 'id');
    
        return $specimenProtocols;
    }

	/**
	 * Function getSpecimenUnits
	 * Queries all rows of the biobank_unit table and returns a nested
	 * array with the id column as the index
	 *
	 * @return array $specimenUnits 
	 */
    public function getSpecimenUnits() {
        $query = "SELECT ID as id, Unit as unit 
                  FROM biobank_unit";
        $specimenUnits = $this->queryToArray($query, 'id');
    
        return $specimenUnits;
    }

    /** THIS FUNCTION SHOULD BE MOVED TO A CandidateDAO EVENTUALLY
     * Function getCandidateInfo
     * Queries a single row of the candidate table and returns a nested array
	 * with all the information concerning that candidate
	 *
	 * @param int $id
	 * @return array $candidateInfo
	 */
	public function getCandidateInfo(int $id) {
        $query  = "SELECT * FROM candidate
                   WHERE CandID=".$id;
        $candidateInfo = $this->queryToArray($query, 'CandID');

        return $candidateInfo;
    }

    /** THIS FUNCTION SHOULD BE MOVED TO A SessionDAO EVENTUALLY
     * Function getSessionInfo
     * Queries a single row of the session table and returns a nested array
	 * with all the information concerning that session
	 *
	 * @param int $id
	 * @return array $sessionInfo
	 */
	public function getSessionInfo(int $id) {
        $query  = "SELECT * FROM session
                   WHERE ID=".$id;
        $sessionInfo = $this->queryToArray($query, 'ID');

        return $sessionInfo;
    }
 
    public function getSpecimenTypeUnits() {
        $query = "SELECT bst.ID as typeId, bu.ID as unitId, bu.Unit as unit
                  FROM biobank_specimen_type_unit_rel bstu
                  JOIN biobank_specimen_type bst ON bst.ID=bstu.TypeID
                  JOIN biobank_unit bu ON bu.ID=bstu.UnitID";
        $result = $this->db->pselect($query, array());
        $specimenTypeUnits = array();
        foreach($result as $row) {
          foreach($row as $column=>$value) {
            $specimenTypeUnits[$row['typeId']][$row['unitId']][$column] = $value;
            unset($specimenTypeUnits[$row['typeId']][$row['unitId']]['typeId']);
            unset($specimenTypeUnits[$row['typeId']][$row['unitId']]['unitId']);
            // OR
            //$specimenTypeUnits[$row['typeId']][$row['unitId']]['unit'] = $row['unit']; 

          }
        }

        return $specimenTypeUnits;
    }

    /**
	 * Function getSpecimenTypeAttributes
	 * Queries all rows from the biobank_specimen_attribute table and returns
	 * an array stating whether an attribute is required or not for a given
	 * specimen type.  
     *
	 * @return array $array
	 */
    public function getSpecimenTypeAttributes() {
        $query = "SELECT bst.ID as typeId, bsa.ID as attributeId, bsa.Name as name, 
                    bsa.DatatypeID as datatypeId, bsa.ReferenceTableID as refTableId, 
                    bsta.Required as required
                  FROM biobank_specimen_type_attribute_rel bsta
                  JOIN biobank_specimen_type bst ON bst.ID=bsta.TypeID 
                  JOIN biobank_specimen_attribute bsa ON bsa.ID=bsta.AttributeID";
    
        $result = $this->db->pselect($query, array());
        $specimenTypeAttributes  = array();
        foreach($result as $row) {
          foreach($row as $column=>$value) {
            $specimenTypeAttributes[$row['typeId']][$row['attributeId']][$column] = $value;
            unset($specimenTypeAttributes[$row['typeId']][$row['attributeId']]['typeId']);
            unset($specimenTypeAttributes[$row['typeId']][$row['attributeId']]['attributeId']);
            //NOT SURE IF BELOW OR ABOVE IS BETTER OR IF SHOULD UNSET THOSE NOT USING
            //$specimenTypeAttributes[$row['typeId']][$row['attributeId']]['required'] = $row['required'];
            //$specimenTypeAttributes[$row['typeId']][$row['attributeId']]['datatypeId'] = $row['datatypeId'];
            //$specimenTypeAttributes[$row['typeId']][$row['attributeId']]['refTableId'] = $row['refTableId'];
            //$specimenTypeAttributes[$row['typeId']][$row['attributeId']]['required'] = $row['required    '];
          }
        }
    
        return $specimenTypeAttributes;
    }

    /**
	 * Function getSpecimenProtocolAttributes
	 * Queries all rows from the biobank_specimen_attribute table and returns
	 * an array stating whether an attribute is required or not for a given
	 * specimen protocol.  
     *
	 * @return array $array
	 */
    public function getSpecimenProtocolAttributes() {
        $query = "SELECT bsp.ID as protocolId, bsp.TypeID as typeId, bsa.ID as attributeId, 
                    bsa.Name as name, bsa.DatatypeID as datatypeId, bsa.ReferenceTableID as refTableId, 
                    bspa.Required as required
                  FROM biobank_specimen_protocol_attribute_rel bspa
                  JOIN biobank_specimen_protocol bsp ON bsp.ID=bspa.ProtocolID 
                  JOIN biobank_specimen_attribute bsa ON bsa.ID=bspa.AttributeID";
    
        $result = $this->db->pselect($query, array());
        $specimenProtocolAttributes  = array();
        foreach($result as $row) {
          foreach($row as $column=>$value) {
            $specimenProtocolAttributes[$row['typeId']][$row['protocolId']][$row['attributeId']][$column] = $value;
            unset($specimenProtocolAttributes[$row['typeId']][$row['protocolId']][$row['attributeId']]['protocolId']);
            unset($specimenProtocolAttributes[$row['typeId']][$row['protocolId']][$row['attributeId']]['attributeId']);
            //NOT SURE IF BELOW OR ABOVE IS BETTER OR IF SHOULD UNSET THOSE NOT USING
            //$specimenProtocolAttributes[$row['protocolId']][$row['attributeId']]['required'] = $row['required'];
            //$specimenProtocolAttributes[$row['protocolId']][$row['attributeId']]['datatypeId'] = $row['datatypeId'];
            //$specimenProtocolAttributes[$row['protocolId']][$row['attributeId']]['refTableId'] = $row['refTableId'];
            //$specimenProtocolAttributes[$row['protocolId']][$row['attributeId']]['required'] = $row['required    '];
          }
        }
    
        return $specimenProtocolAttributes;
    }


    public function getAttributeDatatypes() {
        $query = "SELECT ID as id, Datatype as datatype 
                  FROM biobank_datatype";
        $attributeDatatypes = $this->queryToArray($query, 'id');
        
        return $attributeDatatypes;
    }
 
	/** This will be replaced by pselectwithIndexKey
	 * Function queryToArray
	 * Queries each row of a table specified by the $query and a returns a
	 * nested array with the id column of the table as index for each row
	 *
	 * @param string $query
	 * @param string $primaryKey
	 * @return array $info
	 */
    private function queryToArray(string $query, string $primaryKey) {
        $result = $this->db->pselect($query, array());

        $info = array();
        foreach($result as $row) {
            $info[$row[$primaryKey]] = $row;
            unset($info[$row[$primaryKey]][$primaryKey]);
        }
    
        return $info;
    }
    
    /**
     * insertSpecimen-method. This will create new row in database according to supplied
     * specimen contents. Make sure that values for all NOT NULL columns are
     * correctly specified. Also, if this table does not use automatic surrage-keys
     * the primary-key must be specified. After INSERT command this method will
     * read the generated primary-key back to specimen if automatic surrage-keys
     * were used.
     *
     * @param specimen 	This parameter containes the class instance to be create.
     *				If automatic surrogate-keys are not used the Primary-key
     *				field must be set for this to work properly.
     */
    private function insertSpecimen(SpecimenTO $specimen) {
    	$specimenData = $this->toSQL($specimen);
    	//handle json data object here
    	$this->db->insert('biobank_specimen', $specimenData);
    
    	//should return false if insert is not succesful
        return true;
    }
    
    /**
     * updateSpecimen-method. This method will save the current state of specimen to database.
     * Save can not be used to create new instances in database, so upper layer must
     * make sure that the primary-key is correctly specified. Primary-key will indicate
     * which instance is going to be updated in database. If save can not find matching
     * row, NotFoundException will be thrown.
     *
     * @param specimen This parameter contains the class instance to be saved.
     *		Primary-key field must be set to work properly.
     */
    private function updateSpecimen(SpecimenTO $specimen) {
    	$specimenData = $this->toSQL($specimen);
    	$this->db->update('biobank_specimen', $specimenData, array('id' => $specimen->getId()));
    
    	//should return false if did not work
    	return true;
    }
    
    //create public save function {but $specimen->toArray(); here}
    
    public function getSpecimenIdFromBarcode(string $barcode)
    {
        if (!isset($barcode) || empty($barcode)) {
    		return false;
        }     
    
        $containerDAO = new ContainerDAO($this->db);
        $containerId  = $containerDAO->getContainerIdFromBarcode($barcode);
    
        $query  = "SELECT ID FROM biobank_specimen bs
                   WHERE ContainerID=:cid";
        $specimenId = $this->db->pselectOne($query, array('cid'=>$containerId));
        
        if (empty($specimenId)) {
        	return false;
        }
             
        return $specimenId; 
    }
    
    public function getBarcodeFromSpecimenId(int $id) 
    {
        if (!isset($id) || empty($id)) {
    		return false;
        }

        $query  = "SELECT ContainerID FROM biobank_specimen bs
                   WHERE ID=:i";
        $containerId = $this->db->pselectOne($query, array('i'=>$id));
    
        $containerDAO = new ContainerDAO($this->db);
        $barcode      = $containerDAO->getBarcodeFromContainerId($containerId); 
    
        return $barcode;
    }
	
	/*
     * toArray will return an Array representing the statof the Specimen TO.
     * This is useful
     */
    private function toSQL(SpecimenTO $specimen) 
    {
        $specimenData = array();
        if (isset($specimen->getId)) {
            $specimenData['ID']                 = $specimen->getId;
        }
        if (isset($specimen->getContainerId)) {  
            $specimenData['ContainerID']       = $specimen->getContainerId;
        }
        if (isset($specimen->getTypeId)) {
            $specimenData['TypeID']            = $specimen->getTypeId;
        }
        if (isset($specimen->getQuantity)) {
            $specimenData['Quantity']           = $specimen->getQuantity;
        }
        if (isset($specimen->getUnitId)) {
            $specimenData['UnitID']           = $specimen->getUnitId;
        }
        if (isset($specimen->getParentSpecimenId)) {
            $specimenData['ParentSpecimenID'] = $specimen->getParentSpecimenId;
        }
        if (isset($specimen->getCandidateId)) {   
            $specimenData['CandidateID']      = $specimen->getCandidateId;
        }
        if (isset($specimen->getSessionid)) {
            $specimenData['SessionID']        = $specimen->getSessionid;
        }
        if (isset($specimen->getDateTimeUpdate)) {
            $specimenData['DateTimeUpdate']   = $specimen->getDateTimeUpdate;
        }
        if (isset($this->data)) {
            //converts json object into array
       	    $jsonData = $specimen->getData;
            $jsonData = json_decode($jsonData, TRUE);

             $specimenData['Data']            = $jsonData;
        }
        
        return $specimenData;
    }

	//may just need to put if statements for values that can be null
	private function fromSQL(SpecimenTO $specimen, array $specimenData)
    {
        //Construct Global Persistence Variables
		if (isset($specimenData['ID'])) {
        	$specimen->setId($specimenData['ID']);
		}
        if (isset($specimenData['ContainerID'])) {
			$specimen->setContainerId($specimenData['ContainerID']);
		}
        if (isset($specimenData['TypeID'])) {
			$specimen->setTypeId($specimenData['TypeID']);
		}
        if (isset($specimenData['Quantity'])) {
			$specimen->setQuantity($specimenData['Quantity']);
		}
        if (isset($specimenData['UnitID'])) {
			$specimen->setUnitId($specimenData['UnitID']);
		}
        if (isset($specimenData['ParentSpecimenID'])) {
			$specimen->setParentSpecimenId($specimenData['ParentSpecimenID']);
		}
        if (isset($specimenData['CandidateID'])) {
			$specimen->setCandidateId($specimenData['CandidateID']);
		}
        if (isset($specimenData['SessionID'])) {
			$specimen->setSessionId($specimenData['SessionID']);
		}
        if (isset($specimenData['DateTimeUpdate'])) {
			$specimen->setDateTimeUpdate($specimenData['DateTimeUpdate']);
		}
        
        //Construct Collection Persistence Variable 
		$collection = array();
        if (isset($specimenData['CollectionQuantity'])) {
          $collection['quantity']   = $specimenData['CollectionQuantity'];
        }
        if (isset($specimenData['CollectionUnitID'])) {
          $collection['unitId']     = $specimenData['CollectionUnitID'];
        }
        if (isset($specimenData['CollectionLocationID'])) {
          $collection['locationId'] = $specimenData['CollectionLocationID'];
        }
        if (isset($specimenData['CollectionDate'])) {
          $collection['date']       = $specimenData['CollectionDate'];
        }
        if (isset($specimenData['CollectionTime'])) {
          $collection['time']       = $specimenData['CollectionTime'];
        }
        if (isset($specimenData['CollectionComments'])) {
          $collection['comments']   = $specimenData['CollectionComments'];
        }
        if (isset($specimenData['CollectionData'])) {
          $data = json_decode($specimenData['CollectionData'], TRUE);
          $collection['data']       = $data;
        }
        if (!empty($collection)) { 
          $specimen->setCollection($collection);
        }

        //Construct Preparation Persistence Variable
        $preparation = array();
        if (isset($specimenData['ProtocolID'])) {
          $preparation['protocolId'] = $specimenData['ProtocolID'];
        }
        if (isset($specimenData['PreparationLocationID'])) {
          $preparation['locationId']  = $specimenData['PreparationLocationID'];
        }
        if (isset($specimenData['PreparationDate'])) {
          $preparation['date']       = $specimenData['PreparationDate'];
        }
        if (isset($specimenData['PreparationTime'])) {
          $preparation['time']       = $specimenData['PreparationTime'];
        }
        if (isset($specimenData['PreparationComments'])) {
          $preparation['comments']   = $specimenData['PreparationComments'];
        }
        if (isset($specimenData['PreparationData'])) {
          $data = json_decode($specimenData['PreparationData'], TRUE);
          $preparation['data']       = $data;
        }
        if (!empty($preparation)) {
          $specimen->setPreparation($preparation);
        }

        //Construct Analysis Persitence Variable
        $analysis = array();
        if (isset($specimenData['AnalysisLocationID'])) {
          $analysis['locationId'] = $specimenData['AnalysisLocationID'];
        }
        if (isset($specimenData['AnalysisDate'])) {
          $analysis['date']         = $specimenData['AnalysisDate'];
        }
        if (isset($specimenData['AnalysisTime'])) {
          $analysis['time']         = $specimenData['AnalysisTime'];
        }
        if (isset($specimenData['AnalysisComments'])) {
          $analysis['comments']     = $specimenData['AnalysisComments'];
        }
        if (isset($specimenData['AnalysisData'])) {
          $data = json_decode($specimenData['AnalysisData'], TRUE);
          $analysis['data']         = $data;
        }
        if (!empty($analysis)) {
          $specimen->setAnalysis($analysis);
        }
    }
}
