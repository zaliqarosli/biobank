<?php

namespace LORIS\biobank;

/**
 * Specimen Data Access Object (DAO) Class
 * This class contains all database handling that is needed to
 * permanently store and retrieve Specimen Transfer Object instances
 *
 * PHP Version 7.0
 *
 * @category Loris
 * @package  Biobank
 * @author   Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris/
 */

class SpecimenDAO 
{

    /**
     * Global variable $db
     *
     * @access public
     */
    public $db;

    /**
     * Initializes a new instance of the SpecimenDAO Class
     *
     * @param object $database Instance of the LORIS Database class
     */
    function __construct($database) {
        $this->db = $database;
    }

    /**
     * This method is used when the DAO class needs to create new Specimen 
     * instance.
     * 
     * @return object SpecimenTO
     */
    public function createSpecimen() : SpecimenTO
    {
        return new SpecimenTO();
    }
   
    /**
     * This method creates a Specimen instance from the result of a database 
     * query of the biobank_specimen table. 
     *
     * @param  array  $specimenData Array from which a SpecimenTO will be instantiated
     * @return object $specimen
     */
    private function createSpecimenFromQuery(array $specimenData) : SpecimenTO
    {
        $specimen = $this->createSpecimen();
        $this->fromSQL($specimen, $specimenData);
    	
        return $specimen;
    }
    
    /**
     * This will load all specimen persistence variables from the database for a
     * given $id into a SpecimenTO object, and return the object.
     *
     * @param  int    $id       Value of the $id for the SpecimenTO that will be
     *                          instantiated
     * @return object $specimen Instance of SpecimenTO class
     */
    public function getSpecimenFromId(int $id) : SpecimenTO
    {
        $query = "SELECT bs.SpecimenID,
                         bs.ContainerID,
                         bs.SpecimenTypeID,
                         bs.Quantity, 
                         bs.UnitID,
                         bsf.FreezeThawCycle,
                         bspa.ParentSpecimenID,
                         bs.CandidateID,
                         bs.SessionID, 
                         bsc.Quantity as CollectionQuantity,
                         bsc.UnitID as CollectionUnitID, 
                         bsc.CenterID as CollectionCenterID,
                         bsc.Date as CollectionDate, 
                         DATE_FORMAT(bsc.Time, '%H:%i') as CollectionTime,
                         bsc.Comments as CollectionComments, 
                         bsc.Data as CollectionData,
                         bsp.SpecimenProtocolID, 
                         bsp.CenterID as PreparationCenterID,
                         bsp.Date as PreparationDate,
                         DATE_FORMAT(bsp.Time, '%H:%i') as PreparationTime,
                         bsp.Comments as PreparationComments,
                         bsp.Data as PreparationData,
                         bsa.SpecimenMethodID,
                         bsa.CenterID as AnalysisCenterID,
                         bsa.Date as AnalysisDate, 
                         DATE_FORMAT(bsa.Time, '%H:%i') as AnalysisTime,
                         bsa.Comments as AnalysisComments,
                         bsa.Data as AnalysisData
                  FROM biobank_specimen bs
                  LEFT JOIN biobank_specimen_parent bspa
                    USING (SpecimenID)
                  LEFT JOIN biobank_specimen_freezethaw bsf
                    USING (SpecimenID)
                  LEFT JOIN biobank_specimen_collection bsc
                    USING (SpecimenID)
                  LEFT JOIN biobank_specimen_preparation bsp
                    USING (SpecimenID)
                  LEFT JOIN biobank_specimen_analysis bsa
                    USING (SpecimenID)
                  WHERE bs.SpecimenID=:i";
        $result = $this->db->pselectRow($query, array('i' => $id));
        $specimen = $this->createSpecimenFromQuery($result);
        
        return $specimen;
    }
   
    //TODO: This may be deprecated since this is now being done on the front end.
    /**
     * This method loads all specimen contents from the database for a given $barcode.
     *
     * @param  string $barcode  Value of the $barcode for the container of the 
     *                          SpecimenTO that will be instantiated
     * @return object $specimen
     */ 
    public function getSpecimenFromBarcode(string $barcode) : SpecimenTO
    {
        $id       = $this->getSpecimenIdFromBarcode($barcode);
        $specimen = $this->getSpecimenFromId($id);
    
        return $specimen;
    }	

	/** NOT CURRENTLY IN USE - DEPRECATED
	 * This will select all specimens from the database that match the 
	 * attribute values passed through $specimenData and will return an array
	 * of specimen objects.
	 * 
	 * @param  array $specimenData
	 * @return array $specimens
	 */
    public function selectSpecimens(array $conditions = null) : array
    {
        $query = 'SELECT SpecimenID
                  FROM biobank_specimen';
        $query .= $conditions ? ' WHERE '.$this->db->implodeWithKeys(' AND ', $conditions) : '';

        $result = $this->db->pselect($query, array());
        $specimens = array();
        if (!empty($result)) {
            foreach($result as $row) {
                $id = $row['SpecimenID'];
                $specimen = $this->getSpecimenFromId($id);
                $specimens[$id] = $specimen;
            }
        }
        
        return $specimens;
    }

    /**
     * This function creates an instance of the parent specimen object of the
     * specimen that is passed, if it exists.
     *
     * @param  object $specimen       SpecimenTO instance from which to which retrieve
                                        a parentSpecimenTO
     * @return object $parentSpecimen
     */
    public function getParentSpecimen(SpecimenTO $specimen) {
        $parentSpecimenId = $specimen->getParentSpecimenId();

        if (isset($parentSpecimenId)) {			
            $parentSpecimen = $this->getSpecimenFromId($parentSpecimenId);

            return $parentSpecimen;
    	  }
    }
    
	/**
	 * Queries all rows of the biobank_specimen_type table and returns a nested
	 * array with the ID field as the index.
	 *
	 * @return array $specimenTypes 
	 */
    public function getSpecimenTypes() {
        $query = "SELECT SpecimenTypeID as id,
                         Label as type,
                         ParentSpecimenTypeID as parentTypeId,
                         FreezeThaw as freezeThaw,
                         Regex as regex
                  FROM biobank_specimen_type";
        $specimenTypes = $this->db->pselectWithIndexKey($query, array(), 'id');
    
        return $specimenTypes;
    }

	/**
	 * Queries all rows of the biobank_specimen_protocol table and returns a nested
	 * array with the ID field as the index.
	 *
	 * @return array $specimenProtocols 
	 */
    public function getSpecimenProtocols() {
        $query = "SELECT SpecimenProtocolID as id,
                         Label as protocol, 
                         SpecimenTypeID as typeId
                  FROM biobank_specimen_protocol";
        $specimenProtocols = $this->db->pselectWithIndexKey($query, array(), 'id');
    
        return $specimenProtocols;
    }

    /**
     * Queries all rows of the biobank_specimen_methods table and returns a nested
     * array with the ID field as the index.
     *
     * @return array $specimenMethods
     */
    public function getSpecimenMethods() {
        $query = "SELECT SpecimenMethodID as id,
                         Label as method,
                         SpecimenTypeID as typeId
                  FROM biobank_specimen_method";
        $specimenMethods = $this->db->pselectWithIndexKey($query, array(), 'id');
    
        return $specimenMethods;
    }

    /**
     * Queries all rows of the biobank_unit table and returns a nested
     * array with the ID field as the index.
     *
     * @return array $specimenUnits 
     */
    public function getSpecimenUnits() {
        $query = "SELECT UnitID as id,
                         Label as unit 
                  FROM biobank_unit";
        $specimenUnits = $this->db->pselectWithIndexKey($query, array(), 'id');
    
        return $specimenUnits;
    }
 
   /**
    * Queries all rows of the biobank_specimen_type_unit_rel table and returns a nested
    * array with the TypeID field as the first index, and the UnitID field as the second
    * index.
    *
    * @return array $specimenTypeUnits 
    */
    public function getSpecimenTypeUnits() {
        $query = "SELECT bst.SpecimenTypeID as typeId, bu.UnitID as unitId, bu.Label as unit
                  FROM biobank_specimen_type_unit_rel bstu
                  JOIN biobank_specimen_type bst USING (SpecimenTypeID)
                  JOIN biobank_unit bu USING (UnitID)";
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
	 * Queries all rows from the biobank_specimen_attribute table and returns
	 * a nested array with the TypeID field as the first index, and the AttributeID
     * as the second index.
     *
	 * @return array $specimenTypeAttributes
	 */
    public function getSpecimenTypeAttributes() {
        $query = "SELECT bst.SpecimenTypeID as typeId,
                         bsa.SpecimenAttributeID as attributeId,
                         bsa.Label as name, 
                         bsa.DatatypeID as datatypeId,
                         bsa.ReferenceTableID as refTableId, 
                         bsta.Required as required
                  FROM biobank_specimen_type_attribute_rel bsta
                  JOIN biobank_specimen_type bst USING (SpecimenTypeID)
                  JOIN biobank_specimen_attribute bsa USING (SpecimenAttributeID)";
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
    * Queries all rows from the biobank_specimen_protocol_attribute_rel table and returns
    * a nested array with the TypeID field as the first index, and the AttributeID
    * as the second index.
    *
    * @return array $array
    */
    public function getSpecimenProtocolAttributes()
    {
        $query = "SELECT bsp.SpecimenProtocolID as protocolId,
                         bsa.SpecimenAttributeID as attributeId,
                         bsa.Label as name,
                         bsa.DatatypeID as datatypeId,
                         bsa.ReferenceTableID as refTableId,
                         bspa.Required as required
                  FROM biobank_specimen_protocol_attribute_rel bspa
                  LEFT JOIN biobank_specimen_protocol bsp
                    USING (SpecimenProtocolID)
                  LEFT JOIN biobank_specimen_attribute bsa
                    USING (SpecimenAttributeID)";
        $result = $this->db->pselect($query, array());
        $specimenProtocolAttributes  = array();
        foreach($result as $row) {
            foreach($row as $column=>$value) {
                $specimenProtocolAttributes[$row['protocolId']][$row['attributeId']][$column] = $value;
                unset($specimenProtocolAttributes[$row['protocolId']][$row['attributeId']]['protocolId']);
                unset($specimenProtocolAttributes[$row['protocolId']][$row['attributeId']]['attributeId']);
          }
        }

        return $specimenProtocolAttributes;
    }

   /**
    * Queries all rows from the biobank_specimen_method_attribute_rel table and returns
    * a nested array with the TypeID field as the first index, and the AttributeID
    * as the second index.
    *
    * @return array $array
    */
    public function getSpecimenMethodAttributes()
    {
        $query = "SELECT bsm.SpecimenMethodID as methodId,
                         bsa.SpecimenAttributeID as attributeId,
                         bsa.Label as name,
                         bsa.DatatypeID as datatypeId,
                         bsa.ReferenceTableID as refTableId,
                         bsma.Required as required
                  FROM biobank_specimen_method_attribute_rel bsma
                  JOIN biobank_specimen_method bsm
                    USING (SpecimenMethodID)
                  JOIN biobank_specimen_attribute bsa
                    USING (SpecimenAttributeID)";
        $result = $this->db->pselect($query, array());
        $specimenMethodAttributes  = array();
        foreach($result as $row) {
            foreach($row as $column=>$value) {
                $specimenMethodAttributes[$row['methodId']][$row['attributeId']][$column] = $value;
                unset($specimenMethodAttributes[$row['methodId']][$row['attributeId']]['methodId']);
                unset($specimenMethodAttributes[$row['methodId']][$row['attributeId']]['attributeId']);
          }
        }

        return $specimenMethodAttributes;
    }

    public function getAttributeDatatypes() 
    {
        $query = 'SELECT DatatypeID as id,
                         Datatype as datatype 
                  FROM biobank_datatype';
        $attributeDatatypes = $this->db->pselectWithIndexKey($query, array(), 'id');
        
        return $attributeDatatypes;
    }
 
    public function getAttributeOptions()
    {
        $query = 'SELECT ReferenceTableID as id,
                         TableName as tableName,
                         ColumnName as columnName
                  FROM biobank_reference_table';
        $attributeOptionsReferences = $this->db->pselect($query, array());

        $attributeOptions = array();
        foreach($attributeOptionsReferences as $reference) {
          $query = 'SELECT '.$reference['columnName'].' FROM '.$reference['tableName'];
          $result = $this->db->pselect($query, array());
         
          $options = array();
          foreach ($result as $row) {
            $options[$row[$reference['columnName']]] = $row[$reference['columnName']];
          }

          $attributeOptions[$reference['id']] = $options;
        }

        return $attributeOptions;
    }

    // TODO: This is only in use in the specimen.class.inc file and should perhaps be revisited
    // as to whether or not it is necessary. It seems that a lot of these cascading functions
    // are only used in one location and could be condensed or replaced.
    public function getSpecimenIdFromBarcode(string $barcode)
    {
        if (!isset($barcode) || empty($barcode)) {
    		return false;
        }     
    
        $containerDAO = new ContainerDAO($this->db);
        $containerId  = $containerDAO->getContainerIdFromBarcode($barcode);
    
        $query  = "SELECT SpecimenID FROM biobank_specimen bs
                   WHERE ContainerID=:cid";
        $specimenId = $this->db->pselectOne($query, array('cid'=>$containerId));
        
        if (empty($specimenId)) {
        	return false;
        }
             
        return $specimenId; 
    }
    
    // TODO: I cannot find where this function is currently used and there may in face be no
    // need for it.
    public function getBarcodeFromSpecimenId(int $id) 
    {
        if (!isset($id) || empty($id)) {
    		return false;
        }

        $query  = "SELECT ContainerID FROM biobank_specimen bs
                   WHERE ContainerID=:i";
        $containerId = $this->db->pselectOne($query, array('i'=>$id));
    
        $containerDAO = new ContainerDAO($this->db);
        $barcode      = $containerDAO->getBarcodeFromContainerId($containerId); 
    
        return $barcode;
    }
	
    public function saveSpecimen(SpecimenTO $newSpecimen)
    {
        $data = $this->toSQL($newSpecimen);

        $this->db->insertOnDuplicateUpdate(
            'biobank_specimen',
            $data['biobank_specimen']
        );

        $specimenId = $newSpecimen->getId();
        if (isset($specimenId)) {
            $oldSpecimen = $this->getSpecimenFromId($specimenId);

        } else {
            $specimenId = $this->db->getLastInsertId();
            $data['biobank_specimen_parent']['SpecimenID']      = $specimenId;
            $data['biobank_specimen_freezethaw']['SpecimenID']  = $specimenId;
            $data['biobank_specimen_collection']['SpecimenID']  = $specimenId;
            $data['biobank_specimen_preparation']['SpecimenID'] = $specimenId;
            $data['biobank_specimen_analysis']['SpecimenID']    = $specimenId;
        }


        $this->db->unsafeInsertOnDuplicateUpdate(
            'biobank_specimen_collection',
            $data['biobank_specimen_collection']
        );

        if (isset($data['biobank_specimen_preparation']['SpecimenProtocolID'])) {
            $this->db->unsafeInsertOnDuplicateUpdate(
                'biobank_specimen_preparation',
                $data['biobank_specimen_preparation']
            );
        }

        if (isset($data['biobank_specimen_analysis']['SpecimenMethodID'])) {
            $this->db->unsafeInsertOnDuplicateUpdate(
                'biobank_specimen_analysis',
                $data['biobank_specimen_analysis']
            );
        }

        $parentSpecimenId = $newSpecimen->getParentSpecimenId();
        if (isset($parentSpecimenId)) {
            $this->db->insertOnDuplicateUpdate(
              'biobank_specimen_parent',
               $data['biobank_specimen_parent']
            );
        }

        $fTCycle = $newSpecimen->getFTCycle();
        if (isset($fTCycle)) {
            $this->db->insertOnDuplicateUpdate(
              'biobank_specimen_freezethaw',
              $data['biobank_specimen_freezethaw']
            );
        }
    } 

    private function toSQL(SpecimenTO $specimen) 
    {
        $specimenData = array(
            'SpecimenID'     => $specimen->getId(),
            'ContainerID'    => $specimen->getContainerId(),
            'SpecimenTypeID' => $specimen->getTypeId(),
            'Quantity'       => $specimen->getQuantity(),
            'UnitID'         => $specimen->getUnitId(),
            'CandidateID'    => $specimen->getCandidateId(),
            'SessionID'      => $specimen->getSessionid(),
        );

        $parentData = array(
            'SpecimenID'       => $specimen->getId(), 
            'ParentSpecimenID' => $specimen->getParentSpecimenId(),
        );

        $freezeThawData = array(
            'SpecimenID' => $specimen->getId(),
            'FreezeThawCycle' => $specimen->getFTCycle(),
        );

        $collection = $specimen->getCollection();
        $collectionData = array(
            'SpecimenID' => $specimen->getId(),
            'Quantity'   => $collection['quantity'],
            'UnitID'     => $collection['unitId'],
            'CenterID'   => $collection['centerId'],
            'Date'       => $collection['date'],
            'Time'       => $collection['time'],
            'Comments'   => $collection['comments'],
            'Data'       => json_encode($collection['data']),
        );
        $collectionData['Data'] = $collection['data'] ? json_encode($collection['data']) : null;

        $preparation = $specimen->getPreparation();
        $preparationData = array(
            'SpecimenID'         => $specimen->getId(),
            'SpecimenProtocolID' => $preparation['protocolId'],
            'CenterID'           => $preparation['centerId'],
            'Date'               => $preparation['date'],
            'Time'               => $preparation['time'],
            'Comments'           => $preparation['comments'],
        );
        $preparationData['Data'] = $preparation['data'] ? json_encode($preparation['data']) : null;
 
        $analysis = $specimen->getAnalysis();
        $analysisData = array(
            'SpecimenID'       => $specimen->getId(),
            'SpecimenMethodID' => $analysis['methodId'],
            'CenterID'         => $analysis['centerId'],
            'Date'             => $analysis['date'],
            'Time'             => $analysis['time'],
            'Comments'         => $analysis['comments'],
        );
        $analysisData['Data'] = $analysis['data'] ? json_encode($analysis['data']) : null;

        return $data = array(
            'biobank_specimen'             => $specimenData,
            'biobank_specimen_parent'      => $parentData,
            'biobank_specimen_freezethaw'  => $freezeThawData,
            'biobank_specimen_collection'  => $collectionData,
            'biobank_specimen_preparation' => $preparationData,
            'biobank_specimen_analysis'    => $analysisData,
        );
    }

	  //may just need to put if statements for values that can be null
    private function fromSQL(SpecimenTO $specimen, array $specimenData)
    {
        //Construct Global Persistence Variables
	    	if (isset($specimenData['SpecimenID'])) {
            $specimen->setId($specimenData['SpecimenID']);
	    	}
        if (isset($specimenData['ContainerID'])) {
	    	    $specimen->setContainerId($specimenData['ContainerID']);
	    	}
        if (isset($specimenData['SpecimenTypeID'])) {
	    	    $specimen->setTypeId($specimenData['SpecimenTypeID']);
	    	}
        if (isset($specimenData['Quantity'])) {
	    	    $specimen->setQuantity($specimenData['Quantity']);
	    	}
        if (isset($specimenData['UnitID'])) {
	    	    $specimen->setUnitId($specimenData['UnitID']);
	    	}
        if (isset($specimenData['FreezeThawCycle'])) {
	    	    $specimen->setFTCycle($specimenData['FreezeThawCycle']);
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
        if (isset($specimenData['CollectionCenterID'])) {
          $collection['centerId'] = $specimenData['CollectionCenterID'];
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
        if (isset($specimenData['SpecimenProtocolID'])) {
          $preparation['protocolId'] = $specimenData['SpecimenProtocolID'];
        }
        if (isset($specimenData['PreparationCenterID'])) {
          $preparation['centerId']  = $specimenData['PreparationCenterID'];
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
        if (isset($specimenData['SpecimenMethodID'])) {
          $analysis['methodId'] = $specimenData['SpecimenMethodID'];
        }
        if (isset($specimenData['AnalysisCenterID'])) {
          $analysis['centerId'] = $specimenData['AnalysisCenterID'];
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
