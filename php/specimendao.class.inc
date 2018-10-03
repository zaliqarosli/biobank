<?php

namespace LORIS\biobank;

/**
 * Specimen Data Access Object (DAO) Class
 * This class contains all database handling that is needed to
 * permanently store and retrieve Specimen Object instances
 *
 * PHP Version 7.2
 *
 * @category Loris
 * @package  Biobank
 * @author   Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris/
 */

// XXX: Since we are in the SpecimenDAO class, it may be wise to remove all
// references to 'Specimen', since they are implied. 
// e.g.: createSpecimen(), selectSpecimens(), etc.
class SpecimenDAO extends \LORIS\Data\ProvisionerInstance
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
    function __construct($database)
    {
        $this->db = $database;
    }

    /**
     * This method is used when the DAO class needs to create a new Specimen 
     * instance.
     * 
     * @return object Specimen
     */
    public function createSpecimen() : Specimen
    {
        return new Specimen();
    }

    /**
     * This method creates a Specimen instance from the result of a database 
     * query of the biobank_specimen table. 
     *
     * @param  array  $specimenData Array from which a Specimen will be instantiated
     * @return object $specimen
     */
    private function createSpecimenFromQuery(array $specimenData) : Specimen
    {
        $specimen = $this->createSpecimen();
        $this->fromSQL($specimen, $specimenData);
    	
        return $specimen;
    }
    
    /**
     * This will load all specimen persistence variables from the database for a
     * given $id into a Specimen object, and return the object.
     *
     * @param  int    $id       Value of the $id for the Specimen that will be
     *                          instantiated
     * @return object $specimen Instance of Specimen Object
     */
    public function getSpecimenFromId(int $id) : Specimen
    {
        $query = "SELECT bs.SpecimenID,
                         bs.ContainerID,
                         bs.SpecimenTypeID,
                         bs.Quantity, 
                         bs.UnitID,
                         bsf.FreezeThawCycle,
                         bs.CandidateID,
                         bs.SessionID, 
                         bspr.PoolID,
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
                  LEFT JOIN biobank_specimen_freezethaw bsf
                    USING (SpecimenID)
                  LEFT JOIN biobank_specimen_pool_rel bspr
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

        // XXX: It seems a bit clumsy to be loading the Parent Specimen IDs here.
        // I can't help but feel that there is a better place to be doing this.
        // Perhaps in createSpecimenFromQuery?
        
        // Loading Parent Specimen IDs into the Specimen Object, if they exist.
        $parentSpecimenIds = $this->getParentSpecimenIds($specimen);
        if (!empty($parentSpecimenIds)) {
            $specimen->setParentSpecimenIds($parentSpecimenIds);
        }
        
        return $specimen;
    }

    /**
     * This retrieves an array of all the Parent Specimen IDs associated with 
     * the given Specimen Object from the biobank_specimen_parent table.
     *
     * @param  object $specimen          Instance of Specimen Object
     *
     * @return array  $parentSpecimenIds List of Specimen Object IDs that are 
     *                                   parents of the Specimen Object 
     */
    public function getParentSpecimenIds(Specimen $specimen) : array
    {
        $specimenId = $specimen->getId();
        $query = 'SELECT ParentSpecimenID
                  FROM biobank_specimen_parent
                  WHERE SpecimenID=:i';
        $parentSpecimenIds = $this->db->pselectcol($query, array('i'=>$specimenId));

        return $parentSpecimenIds;
    }
   
   // XXX: Currently this function is never used with any conditions passed as
   // parameters. Decide if this is a necessary feature.
   /**
    * This will select all specimens from the database that match the 
    * attribute values passed by $conditions and will return an array
    * of specimen objects.
    * 
    * @param  array $conditions Conditions to be met by the query
    *
    * @return array $specimens  List of Specimen Objects that match the query
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
     * Queries all rows of the biobank_specimen_type table and returns a nested
     * array with the ID field as the index.
     *
     * @return array $specimenTypes All data concerning each specimen type
     */
    public function getSpecimenTypes() : array
    {
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
     * @return array $specimenProtocols All data concerning each specimen protocol
     */
    public function getSpecimenProtocols() : array
    {
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
     * @return array $specimenMethods All data concerning each specimen method
     */
    public function getSpecimenMethods() : array
    {
        $query = "SELECT SpecimenMethodID as id,
                         Label as method,
                         SpecimenTypeID as typeId
                  FROM biobank_specimen_method";
        $specimenMethods = $this->db->pselectWithIndexKey($query, array(), 'id');
    
        return $specimenMethods;
    }

    // TODO: Change the name of this function to getSpecimenAttributeDatatypes
    // TODO: Change name of table 'biobank_datatype' to 
    // 'biobank_specimen_attribute_datatype'
    /**
     * Queries all rows of the biobank_datatype table and returns a nested array
     * with the ID field as the index
     *
     * @return array $attributeDatatypes All data concerning each attribute datatype
     */
    public function getAttributeDatatypes() : array
    {
        $query = 'SELECT DatatypeID as id,
                         Datatype as datatype 
                  FROM biobank_datatype';
        $attributeDatatypes = $this->db->pselectWithIndexKey($query, array(), 'id');
        
        return $attributeDatatypes;
    }
 
    // TODO: Change the name of this function to getSpecimenAttributeReferenceTableOptions
    // TODO: Change name of table 'biobank_reference_table' to 
    // 'biobank_specimen_attribute_referencetable'
    /**
     * Queries all rows the biobank_reference_table table. This data is
     * used to query the referenced tables and columns and build a nested array
     * of reference table option values, with the Reference Table ID as the index.
     *
     * @return array $attributeOptions A nested array of attribute reference
     *                                 table options indexed by Reference Table
     *                                 ID
     */
    public function getAttributeOptions() : array
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


    /**
     * Queries all rows of the biobank_unit table and returns a nested
     * array with the ID field as the index.
     *
     * @return array $specimenUnits All data concerning each unit
     */
    public function getSpecimenUnits() : array
    {
        $query = "SELECT UnitID as id,
                         Label as unit 
                  FROM biobank_unit";
        $specimenUnits = $this->db->pselectWithIndexKey($query, array(), 'id');
    
        return $specimenUnits;
    }
 
   /**
    * Queries all rows of the biobank_specimen_type_unit_rel table and returns
    * a nested array of specimen unit values, with the Type ID as the first index,
    * and the Unit ID as the second index.
    *
    * @return array $specimenTypeUnits A nested array of unit values index by 
    *                                  Type ID and Unit ID
    */
    public function getSpecimenTypeUnits() : array
    {
        $query = "SELECT bst.SpecimenTypeID as typeId, bu.UnitID as unitId, bu.Label as unit
                  FROM biobank_specimen_type_unit_rel bstu
                  JOIN biobank_specimen_type bst USING (SpecimenTypeID)
                  JOIN biobank_unit bu USING (UnitID)";
        $result = $this->db->pselect($query, array());
        $specimenTypeUnits = array();
        foreach($result as $row) {
          foreach($row as $column=>$value) {
            $specimenTypeUnits[$row['typeId']][$row['unitId']]['unit'] = $row['unit'];
          }
        }

        return $specimenTypeUnits;
    }

    /**
     * Queries all rows from the biobank_specimen_type_attribute_rel table and
     * returns a nested array of specimen-type-specific attribute data with the
     * Type ID as the first index, and the Attribute ID as the second index.
     *
     * @return array $specimenTypeAttributes A nested array of attribute data
     *                                       indexed by Type ID and Attribute ID
     */
    public function getSpecimenTypeAttributes() : array
    {
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
                $specimenTypeAttributes[$row['typeId']][$row['attributeId']]['required']   = $row['required'];
                $specimenTypeAttributes[$row['typeId']][$row['attributeId']]['datatypeId'] = $row['datatypeId'];
                $specimenTypeAttributes[$row['typeId']][$row['attributeId']]['refTableId'] = $row['refTableId'];
                $specimenTypeAttributes[$row['typeId']][$row['attributeId']]['required']   = $row['required'];
            }
        }
    
        return $specimenTypeAttributes;
    }

   /**
    * Queries all rows from the biobank_specimen_protocol_attribute_rel table
    * and returns a nested array of specimen-protocol-specific attribute data 
    * with the Protocol ID as the first index, and the Attribute ID as the 
    * second index.
    *
    * @return array $sPA A nested array of attribute data indexed by Protocol
    *                    ID and Attribute ID
    */
    public function getSpecimenProtocolAttributes() : array
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
        $sPA    = array(); //specimenProtocolAttributes
        foreach($result as $row) {
            foreach($row as $column=>$value) {
                $sPA[$row['protocolId']][$row['attributeId']]['required']   = $row['required'];
                $sPA[$row['protocolId']][$row['attributeId']]['datatypeId'] = $row['datatypeId'];
                $sPA[$row['protocolId']][$row['attributeId']]['refTableId'] = $row['refTableId'];
                $sPA[$row['protocolId']][$row['attributeId']]['required']   = $row['required'];
            }
        }

        return $sPA;
    }

   /**
    * Queries all rows from the biobank_specimen_method_attribute_rel table
    * and returns a nested array of specimen-method-specific attribute data 
    * with the Method ID as the first index, and the Attribute ID as the 
    * second index.
    *
    * @return array $specimenMethodAttributes A nested array of attribute data
    *                                         indexed by Method ID and Attribute
    *                                         ID
    */
    public function getSpecimenMethodAttributes() : array
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
                $specimenMethodAttributes[$row['methodId']][$row['attributeId']]['required']   = $row['required'];
                $specimenMethodAttributes[$row['methodId']][$row['attributeId']]['datatypeId'] = $row['datatypeId'];
                $specimenMethodAttributes[$row['methodId']][$row['attributeId']]['refTableId'] = $row['refTableId'];
                $specimenMethodAttributes[$row['methodId']][$row['attributeId']]['required']   = $row['required'];
          }
        }

        return $specimenMethodAttributes;
    }

    /**
     * This function receives a Specimen Object, converts it into a SQL format
     * and inserts it into all relevant tables in the database.
     *
     * @param  object $newSpecimen The Specimen Object to be inserted into the 
     *                            database.
     *
     * @return void
     */
    public function saveSpecimen(Specimen $newSpecimen)
    {
        // Converts Specimen Object into SQL format.
        $data = $this->toSQL($newSpecimen);

        // Inserts or Updates the biobank_specimen table with respective data.
        $this->db->insertOnDuplicateUpdate(
            'biobank_specimen',
            $data['biobank_specimen']
        );

        $specimenId = $newSpecimen->getId();
        // If update:
        if (isset($specimenId)) {
            // XXX: Logic will likely eventually go here.
        // If insert:
        } else {
            $specimenId = $this->db->getLastInsertId();
            // set the respective data array index to the value of the new
            // specimen ID 
            $parentSpecimenIds = $newSpecimen->getParentSpecimenIds();
            foreach ($parentSpecimenIds as $id) {
                $data['biobank_specimen_parent'][$id] = array(
                    'SpecimenID'       => $specimenId, 
                    'ParentSpecimenID' => $id,
                );
            }
            $data['biobank_specimen_freezethaw']['SpecimenID']  = $specimenId;
            $data['biobank_specimen_collection']['SpecimenID']  = $specimenId;
            $data['biobank_specimen_preparation']['SpecimenID'] = $specimenId;
            $data['biobank_specimen_analysis']['SpecimenID']    = $specimenId;
        }

        // Insert or update biobank_specimen_collection with respective data.
        $this->db->unsafeInsertOnDuplicateUpdate(
            'biobank_specimen_collection',
            $data['biobank_specimen_collection']
        );

        // If protocol exists, insert or update biobank_specimen_preparation 
        // with respective data.
        if (isset($data['biobank_specimen_preparation']['SpecimenProtocolID'])) {
            $this->db->unsafeInsertOnDuplicateUpdate(
                'biobank_specimen_preparation',
                $data['biobank_specimen_preparation']
            );
        }

        // If method exists, insert or update biobank_specimen_analysis 
        // with respective data.
        if (isset($data['biobank_specimen_analysis']['SpecimenMethodID'])) {
            $this->db->unsafeInsertOnDuplicateUpdate(
                'biobank_specimen_analysis',
                $data['biobank_specimen_analysis']
            );
        }

        // If parent exists, insert or update biobank_specimen_parent
        // with respective data.
        if (isset($data['biobank_specimen_parent'])) {
          foreach($data['biobank_specimen_parent'] as $insert) {
            $this->db->insertOnDuplicateUpdate(
              'biobank_specimen_parent',
               $insert
            );
          }
        }

        // If F/T Cycle exists, insert or update biobank_specimen_freezethaw
        // with respective data.
        $fTCycle = $newSpecimen->getFTCycle();
        if (isset($fTCycle)) {
            $this->db->insertOnDuplicateUpdate(
              'biobank_specimen_freezethaw',
              $data['biobank_specimen_freezethaw']
            );
        }
    } 

    /**
     * This function takes a Specimen Object and prepares the data to be 
     * inserted into the database by converting it to a data array.
     *
     * @param  object $specimen Specimen Object to be converted
     *
     * @return array  $data     Array containing the data to be inserted
     */
    private function toSQL(Specimen $specimen) : array
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

        $freezeThawData = array(
            'SpecimenID'      => $specimen->getId(),
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

    /**
     * This function takes an empty Specimen Object and assigns the values
     * in $data.
     *
     * @param object $specimen Specimen Object to be assigned $data values
     * @param array  $data     Values to be assigned to $specimen
     *
     * @return void
     */
    private function fromSQL(Specimen $specimen, array $data)
    {
        // Construct Global Persistence Variables
	    	$specimen->setId($data['SpecimenID']);
        $specimen->setContainerId($data['ContainerID']);
        $specimen->setTypeId($data['SpecimenTypeID']);
        $specimen->setQuantity($data['Quantity']);
        $specimen->setUnitId($data['UnitID']);
        $specimen->setFTCycle($data['FreezeThawCycle']);
        $specimen->setCandidateId($data['CandidateID']);
        $specimen->setSessionId($data['SessionID']);
        $specimen->setPoolId($data['PoolID']);

        // Construct Collection Persistence Variable 
	    	$collection = array();
        $collection['quantity'] = $data['CollectionQuantity'];
        $collection['unitId']   = $data['CollectionUnitID'];
        $collection['centerId'] = $data['CollectionCenterID'];
        $collection['date']     = $data['CollectionDate'];
        $collection['time']     = $data['CollectionTime'];
        $collection['comments'] = $data['CollectionComments'];
        $collection['data']     = json_decode($data['CollectionData'], TRUE);
        $specimen->setCollection($collection);

        // Construct Preparation Persistence Variable
        $preparation = array();
        $preparation['protocolId'] = $data['SpecimenProtocolID'];
        $preparation['centerId']   = $data['PreparationCenterID'];
        $preparation['date']       = $data['PreparationDate'];
        $preparation['time']       = $data['PreparationTime'];
        $preparation['comments']   = $data['PreparationComments'];
        $preparation['data']       = json_decode($data['PreparationData'], TRUE);
        // If array items are not all null, set array to specimen preparation
        array_filter($preparation) && $specimen->setPreparation($preparation);

        // Construct Analysis Persistence Variable
        $analysis = array();
        $analysis['methodId'] = $data['SpecimenMethodID'];
        $analysis['centerId'] = $data['AnalysisCenterID'];
        $analysis['date']     = $data['AnalysisDate'];
        $analysis['time']     = $data['AnalysisTime'];
        $analysis['comments'] = $data['AnalysisComments'];
        $analysis['data']     = json_decode($data['AnalysisData'], TRUE);
        // If array items are not all null, set array to specimen analysis
        array_filter($analysis) && $specimen->setAnalysis($analysis);
    }

    /**
     * Instantiates an ArrayIterator class that is composed of all the Specimens
     * Objects.
     *
     * @return traversable Iterator of Specimen Objects
     */
    protected function getAllInstances() : \Traversable
    {
        // XXX: Look into whether permissions should be checked here, or by the
        // controller. It is likely the role of the filter to be deciding what
        // provision, but I can't get the filter to work.
        $user = \User::singleton();
        if ($user->hasPermission('biobank_specimen_view')) {
            return new \ArrayIterator($this->selectSpecimens());
        } else {
            return new \ArrayIterator();
        }
    }
}
