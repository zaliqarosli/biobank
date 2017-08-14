<?php
/**
 * NDB_Form_Biobanking class file
 *
 * PHP Version 7
 *
 * @category Biobank
 * @package  Biobank
 * @author   Loris Team <loris.mni@bic.mni.mcgill.ca>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris/
 */

/**
 * NDB_Form_Biobanking Class
 *
 * @category Main
 * @package  User_Account
 * @author   Loris Team <loris.mni@bic.mni.mcgill.ca>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris/
 */
class NDB_Menu_Filter_Form_Upload_Biospecimens extends NDB_Menu_Filter_Form
{
	var $COL_COUNT = array(
	    'iswab'   => array(
	        'stock'      => 25,
	        'dilution'   => 10,
	    ),
	);
	
	var $FILE_TYPES = array('stock', 'dilution', 'bioanalizer');
	
	var $POS_IDX   = 0;
	var $REGEX_IDX = 1;
	var $ISWAB_FIELDS = array(
	    'sample'                   => array(0, '/^\d+ \d+*$/'),
	    'A260/A280'                => array(6, '/^.*$/'),
	    'A260/A230'                => array(7, '/^.*$/'),
	    'stock concentration'      => array(8, '/^.*$/'),
	    'ul for Kobar lab'         => array(10, '/^.*$/'),
	    'ul ATE'                   => array(11, '/^.*$/'),
	    'elution volume'           => array(12, '/^.*$/'),
	    'extraction date'          => array(13, '/^.*$/'),
	    'collection date'          => array(14, '/^.*$/'),
	    'stock freezer'            => array(15, '/^.*$/'),
	    'stock box id'             => array(16, '/^.*$/'),
	    'stock box coordinates'    => array(17, '/^.*$/'),
	    'stock box id'             => array(18, '/^.*$/'),
	    'diltiuon freezer'         => array(19, '/^.*$/'),
	    'dilution box id'          => array(20, '/^.*$/'),
	    'dilution box coordinates' => array(21, '/^.*$/'),
	    'comments'                 => array(22, '/^.*$/')
	);
	
    /**
     * Returns true if the user has permission to access
     * the conflict resolver module
     *
     * @return true if user has permission
     */
    function _hasAccess()
    {
        $user =& User::singleton();
        $this->tpl_data['create_biobanking']
            = $user->hasPermission('create_biobanking');
        return $user->hasPermission('upload_biobanking');

    }

    /**
     * Processes the conflicts that were submitted for resolution and re-runs
     * the appropriate scoring algorithm
     *
     * @param array $values The values submitted from the form
     *
     * @return none
     */
    function _process($values)
    {
		if($values['specimenType'] == 'iswab') {
			$this->processIswab($values);
		} else if($values['specimenType'] == 'oragene') {
			$this->processOragene($values);
		} else if($values['specimenType'] == 'wb') {
			$this->processWholeBlood($values);
		} else if($values['specimenType'] == 'paxgene1') {
			$this->processPaxgene1($values);
		} else if($values['specimenType'] == 'paxgene2') {
			$this->processPaxgene2($values);
		}
	}
	
    function processIswab($values)
    {
		$lines = array();
		foreach($this->FILE_TYPES as $type) {
			$lines[$type] = array();
            $errors = $this->parseCsvFile(
                $_FILES[$type]['name'], 
                $_FILES[$type]['tmp_name'], 
                $this->COL_COUNT[$values['specimenType']][$type],
                $lines[$type]
            );
            
            if(!is_null($errors)) {
    			$this->tpl_data['errors'] = $errors;
    			return;
		    }
		}
		
		if(!$this->validIswabFiles($lines)) {
  			$this->tpl_data['errors'] = $errors;
  			return;
	    }
	           
	    $iswabSamples = $this->getIswabSampleList($lines);
	    $this->insertSamplesInDb($iswabSamples);
    }
    
    function validIswabFiles($lines) {
        if(!$this->validIswabDilutionFile($lines['dilution'], $errors)) {
  	        $this->tpl_data['errors'] = $errors;
  		    return false;
	    }
	    
	    if(!$this->validIswabStockFile($lines['stock'], $lines['dilution'], $errors)) {
  	        $this->tpl_data['errors'] = $errors;
  		    return false;
	    }	    
	    
        return true;
    }
	
	function validIswabStockFile($stockLines, $dilutionLines, &$errors) 
	{
		$nbLine = 0;
		foreach($stockLines as $line) {
			$line = trim($line, "\n\r");
			
			if(preg_match('/^\s*$/', $line)) {
				continue;
			}
				
			if($nbLine == 0) {
			    $nbLine++;
				continue;
			}
			
			$fields = explode("\t", $line);
			$file = $_FILES['main']['name'];
			foreach($ISWAB_FIELDS as $f=>$props) {
				$this->checkValue(
				    $file, $line, $f, $ISWAB_FIELDS, $fields, $errors
				);
			}
			$iswabData[] = $fields;
		}
		
		if(!empty($errors)) {
			return false;
		}
		
		//-----------------------------------------
		// All validations that require DB access
		// should be done here
		//-----------------------------------------
		if(!allParentsExist($iswabData, $ISWAB_FIELDS, 'iswab', 'Available', $errors)
	        || idExists($iswabData, $ISWAB_FIELDS, $errors)
		    || locationExists($iswabData, $ISWAB_FIELDS, $errors)
		    || stockAlreadyExists($iswabData, $ISWAB_FIELDS, $errors)
		    || dilutionAlreadyExists($iswabData, $ISWAB_FIELDS, $errors)
		) {
			return false;
		}
		
        return true;
	}
	
	function allParentsExist($data, $fieldSpecs, $type, $status, &$errors)
	{
		$i=0;
		foreach($data as $row) {
			$sampleId = $row[$fieldSpec['sample'][$POS_IDX]];
			$sampleIdParts = explode(' ', $sampleId);
			$pscId = $sampleIdParts[0];
			$doc = $row[$fieldSpec['collection date'][$POS_IDX]];
			
			$wherePart = "(SELECT COUNT(*) "
			    . " FROM biospecimen b$i"
			    . " WHERE b$i.biospecimen_id = b.biospecimen_id"
			    . " AND zepsom_id"
			    . " AND b$i.type = $type"
			    . " AND status_id = 1";
			if(!empty($doc)) {
				$wherePart .= " AND DATE_FORMAT(";
			}
			$wherePart .= ") = 1";
			$i++;   
		}
	}
    
    function checkValue($fname, $line, $fId, $specimenFields, $fields, &$errors)
    {
		if(!isset($specimenFields[$fId])) {
		    throw new IllegalArgumentException(
		        "Invalid arguments $fId passed to checkValue function"
		    );
		}
		
		$pos   = $specimenFields[$fId][$POS_IDX];
		$field = $fields[$pos];
		$regex = $specimenFields[$fId][$REGEX_IDX];
		if(!preg_match($regex, $field)) {
	        $error[] = "File $file: invalid value $field for field $fId on line $line";
		}
		
		// Additional validation for specific fields should be done here
		// Validate as much as you can without accessing the DB
	}
	
    /**
     * Sets up the class variables required to render the query for the
     * conflict resolver
     *
     * @return none
     */
    function _setupVariables()
    {
        //Get Freezer Options
        $uploadId = isset($_REQUEST['upload_id']) ? $_REQUEST['upload_id'] : null;
        if(!is_null($uploadId)) {
            $this->tpl_data['upload_id'] = $uploadId;
		}
        
        $db           =& Database::singleton();
        $freezerRows  = $db->pselect(
            "SELECT id, type FROM freezer",
            array()
        );
        $freezers = array('');
        foreach ($freezerRows as $row) {
            $freezers[] = $row['type'];
        }
        $this->tpl_data['freezers'] = $freezers;
		
       // set the class variables
       // this is everything that will appear in the 'Snapshot' view
       $this->columns = array(
           'b.biospecimen_id',
           'b.specimen_type',
           'b.zepsom_id',
           'b.nb_samples',
           'CONCAT(b.collection_date, b.collection_time) as collection_ts',
           'CONCAT(b.freezer_id, b.box_id, b.box_coordinates) as location'
       );
       
       $this->headers = array(
           'Biospecimen ID',
           'Type',
           'Zepsom ID',
           'Qty.',
           'Collected On',
           'Extracted On',
           'Location',
       );
       
       $this->formToFilter = array(
       );

       $this->validFilters = array(
           'biospecimen_type'
       );
       
       $this->query =   " FROM biobanking_uploads bu"
                      . " JOIN biobanking_uploads_biospecimen_rel br ON (bu.id=br.upload_id)"
                      . " JOIN biospecimen b ON (br.biospecimen_id=b.biospecimen_id)"
                      . " JOIN biospecimen_type bt ON (bt.specimen=b.specimen_type)"
                      . " JOIN freezer f ON (b.freezer_id=f.id)"
                      . " WHERE bu.id = "
                      . (is_null($uploadId) ? " NULL" : $uploadId);
    }
    
    /**
     * Sets up the smarty menu filter items for the conflict resolver
     *
     * @return none
     */
    function _setFilterForm()
    {
		$this->addSelect(
            'specimenType',
            'Upload specimens of type:',
            array(
                'iswab'   => 'iSwab',
            )
        );
        
        //======================================
        // Widgtets for the iSwab-related panel
        //======================================
        $this->addFile('stock'      , 'Nanophotometer stock file:', array('required' => true));
        $this->addFile('dilution'   , 'Nanophotometer dilution file:');
        $this->addFile('bioanalizer', 'Bioanalizer file (optional):');

        $this->form->addTextArea(
            'uploadStatusTextArea',
            '',
            array(
             'class'    => 'upload-status-text-area',
             'disabled' => true
            )
        );
    }
    
    function parseCsvFile($localFile, $serverFile, $colCount, &$lines) 
    {
		$errors = null;
	    $fileHandle = fopen("$serverFile", "r");
        if ($fileHandle) {
			$lineNb = 0;
            while (($line = fgets($fileHandle)) !== false) {
				$line = trim($line, "\n\r");
				if(!preg_match('/^\s*$/', $line)) {
					if($lineNb == 0) {
						// Assume header is fine and skip
						$lineNb++;
					} else {
						$fields = explode("\t", $line);
						if(count($fields) != $colCount) {
							$errors[] = "Number of tab separated fields invalid "
							    . "for line '$line': expected $colCount "
							    . " but got " . count($fields);
						} else {
							$lines[] = $fields;
						}
					}
				}
            }

            fclose($fileHandle);
        } else {
            $error = error_get_last();
            $errors[] = "File $localFile could not be read: " . $error['message'];
        } 	
        
        return $errors;
	}
    	
    /**
     * Override base function to get biospecimen dependencies
     *
     * @return Array of CSS files to include
     */
    function getCSSDependencies()
    {
        $factory = NDB_Factory::singleton();
        $baseURL = $factory->settings()->getBaseURL();
        $deps    = parent::getCSSDependencies();
        return array_merge(
            $deps,
            array($baseURL . "/biobanking/css/biobanking.css")
        );
    }
    
    /**
     * Include the column formatter required to display the feedback link colours
     * in the candidate_list menu
     *
     * @return array of javascript to be inserted
     */
    function getJSDependencies()
    {
        $factory = NDB_Factory::singleton();
        $baseURL = $factory->settings()->getBaseURL();
        $deps    = parent::getJSDependencies();
        return array_merge(
            $deps,
            array(
             $baseURL . "/biobanking/js/uploadBiospecimensColumnFormatter.js",
            )
        );
    }
}
