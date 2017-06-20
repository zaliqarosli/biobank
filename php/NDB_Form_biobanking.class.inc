<?php
/**
* The user account page
*
* PHP Version 5
*/



/**
* Implements the user account page
*
* @category Main
* @package  User_Account
* @author   Loris Team <loris.mni@bic.mni.mcgill.ca>
* @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
* @link     https://www.github.com/aces/Loris/
*/
class NDB_Form_biobanking extends NDB_Form
{
    private static $FIELD_TYPES = array(
        'id'                       => 'number',
        'pscid'                    => 'text',
        'dob'                      => 'dob',
        'participant_type'         => 'text',
        'collection_date'          => 'date',
        'collection_ra_id'         => 'number',
        'timepoint'                => 'text',
        'sample_type_id'           => 'number',
        'nb_samples'               => 'number',
        'time'                     => 'time',
        'woke'                     => 'time',
        'sample_status_id'         => 'number',
        'freezer_id'               => 'text',
        'bag_name'                 => 'text',
        'buccal_rack_id'           => 'number',
        'buccal_rack_coordinates'  => 'text',
        'shelf_num'                => 'number',
        'rack_num'                 => 'number',
        'box_name'                 => 'text',
        'box_coordinates'          => 'text',
        'collection_notes'         => 'text',
        'extraction_date'          => 'date',
        'batch_name'               => 'text',
        'protocol'                 => 'text',
        'elution_volume'           => 'number',
        'pass_fail'                => 'text',
        'lab_ra_id'                => 'number',
        'dna_concentration'        => 'number',
        'two_sixty_two_eighty'     => 'number',
        'two_sixty_two_thirty'     => 'number',
        'available_sample_volume'  => 'number',
        'dna_amount'               => 'number',
        'technical_batch_num'      => 'number',
        'extraction_notes'         => 'text',
        'shipment_date'            => 'date',
        'ul_for_kobar_lab'         => 'number',
        'analysis_type'            => 'text',
        'experimental_name'        => 'text',
        'technical_batch_num'      => 'number',
        'sample_name'              => 'text',
        'chip_position'            => 'text', 
        'sentrix_id'               => 'text',
        'analysis_notes'           => 'text',
    );

    /**
     * Controls who's got access to this page, namely those who have the
     * 'user_accounts' and who either have permission
     * 'user_accounts_multisite' or whose site matches the site of the user they
     * are trying to edit.
     *
     * @return true if user has access, false otherwise.
     */
    function _hasAccess()
    {
        // create user object
        $user =& User::singleton();

        // User can always access My Preferences page
        return $user->hasPermission('view_biobanking') || $user->hasPermission('edit_biobanking');
    }

    /**
     * Computes the initial values this page will be filled with.
     *
     * @return the default values for the initial state of this page.
     */
    function _getDefaults()
    {
        $defaults = array();
   
        // Note that the DATE_FORMAT parts need to occur *after* the main SELECT b.* so that 
        // all date formats are as expected
        if(isset($_REQUEST['identifier'])) {
            $db =& Database::singleton();
            $query = "SELECT b.*, 
                             IF(b.subject_id LIKE '%M', 'Mother', 'Child') as participant_type,
                             DATE_FORMAT(b.collection_date, '%d-%b-%Y') as collection_date,
                             DATE_FORMAT(b.extraction_date, '%d-%b-%Y') as extraction_date,
                             DATE_FORMAT(b.subject_dob, '%d-%b-%Y') as subject_dob,
                             DATE_FORMAT(b.shipment_date, '%d-%b-%Y') as shipment_date
                      FROM biospecimen b
                      WHERE b.id=:id";
            $row = $db->pselect($query, array('id' => $_REQUEST['identifier']));

            if(count($row) > 0) {
                $defaults['id']                      = $row[0]['id'];
                $defaults['pscid']                   = $row[0]['subject_id'];
                $defaults['dob']                     = $row[0]['subject_dob'];
                $defaults['participant_type']        = $row[0]['participant_type'];
                $defaults['collection_date']         = $row[0]['collection_date'];
                $defaults['collection_ra_id']        = $row[0]['collection_ra_id'];
                $defaults['timepoint']               = $row[0]['timepoint'];
                $defaults['type_id']                 = $row[0]['type_id'];
                $defaults['nb_samples']              = $row[0]['nb_samples'];
                $defaults['time']                    = $row[0]['time'];
                $defaults['woke']                    = $row[0]['woke'];
                $defaults['status_id']               = $row[0]['status_id'];
                $defaults['freezer_id']              = $row[0]['freezer_id'];
                $defaults['bag_name']                = $row[0]['bag_name'];
                $defaults['buccal_rack_id']          = $row[0]['buccal_rack_id'];
                $defaults['buccal_rack_coordinates'] = $row[0]['buccal_rack_coordinates'];
                $defaults['shelf_num']               = $row[0]['shelf_num'];
                $defaults['rack_num']                = $row[0]['rack_num'];
                $defaults['box_name']                = $row[0]['box_name'];
                $defaults['box_coordinates']         = $row[0]['box_coordinates'];
                $defaults['oragene_location']        = $row[0]['oragene_location'];
                $defaults['collection_notes']        = $row[0]['collection_notes'];
                $defaults['extraction_date']         = $row[0]['extraction_date'];
                $defaults['batch_name']              = $row[0]['batch_name'];
                $defaults['protocol']                = $row[0]['protocol'];
                $defaults['elution_volume']          = $row[0]['elution_volume'];
                $defaults['pass_fail']               = $row[0]['pass_fail'];
                $defaults['lab_ra_id']               = $row[0]['lab_ra_id'];
                $defaults['dna_concentration']       = $row[0]['dna_concentration'];
                $defaults['two_sixty_two_eighty']    = $row[0]['two_sixty_two_eighty'];
                $defaults['two_sixty_two_thirty']    = $row[0]['two_sixty_two_thirty'];
                $defaults['available_sample_volume'] = $row[0]['available_sample_volume'];
                $defaults['dna_amount']              = $row[0]['dna_amount'];
                $defaults['shipment_date']           = $row[0]['shipment_date'];
                $defaults['extraction_notes']        = $row[0]['extraction_notes'];
                $defaults['analysis_type']           = $row[0]['analysis_type'];
                $defaults['experimental_name']       = $row[0]['experimental_name'];
                $defaults['technical_batch_num']     = $row[0]['technical_batch_num'];
                $defaults['sample_name']             = $row[0]['sample_name'];
                $defaults['chip_position']           = $row[0]['chip_position'];
                $defaults['sentrix_id']              = $row[0]['sentrix_id'];
                $defaults['analysis_notes']          = $row[0]['analysis_notes'];
            }
        }

        return $defaults;
    }

    /**
     * Processes the data entered in the form.
     *
     * @param array $values values entered in the form.
     *
     * @return void
     */
    function _process($values)
    {
        // create DB object
        $DB =& Database::singleton();

        foreach(self::$FIELD_TYPES as $f => $t) {
            if($t == 'number' || $t == 'date' || $t == 'time') {
                if(isset($values[$f]) && preg_match('/^\s*$/', $values[$f])) {
                    $values[$f] = NULL;
                }
            }
        }

        unset($values['submenu']);
        
        if(isset($values['collection_date'])) {
			if($values['collection_date'].trim() == '') {
				$values['collection_date'] = null;
			} else {
				$dt = DateTime::createFromFormat('d-M-Y', $values['collection_date']);
				$values['collection_date'] = $dt->format('Y-m-d');
			}
		}

        if(isset($values['extraction_date'])) {
			if($values['extraction_date'].trim() == '') {
				$values['extraction_date'] = null;
			} else {
				$dt = DateTime::createFromFormat('d-M-Y', $values['extraction_date']);
				$values['extraction_date'] = $dt->format('Y-m-d');
			}
		}
		
        if(isset($values['shipment_date'])) {
			if($values['shipment_date'].trim() == '') {
				$values['shipment_date'] = null;
			} else {
				$dt = DateTime::createFromFormat('d-M-Y', $values['shipment_date']);
				$values['shipment_date'] = $dt->format('Y-m-d');
			}
		}
		
        $success = $DB->update(
            'biospecimen',
            $values,
            array('id' => $_REQUEST['identifier'])
        );
        $this->tpl_data['success'] = true;
    }
    
    function add_biospecimen()
    {
        $this->tpl_data['biospecimenId'] = '';
        
        
		$config =& NDB_Config::singleton();
		$generateBarcode = $config->getSetting('generate_biospecimen_barcodes');

      	if($generateBarcode == 'yes') {
            $this->addBasicText('id', 'Biospecimen ID', array('disabled' => true));
		} else {
            $this->addBasicText('id', 'Biospecimen ID');
		}
		
        $this->addBasicText('pscid', 'PSCID');
        $this->addBasicText('dob', 'Date of Birth', array('disabled' => true));
        $this->addBasicText('participant_type', 'Participant Type', array('disabled' => true));

        $this->addBasicText('collection_date', 'Date of Collection');
        $this->addSelect(
            'timepoint',
            'Timepoint',
            array(
              null                 => '',
              'dna_methylation'    => 'DNA Methylation',
              'dna_methylation_T2' => 'DNA Methylation T2',
              'dna_methylation_T3' => 'DNA Methylation T3',
              'dna_methylation_T3' => 'DNA Methylation T4',
              'MRI10years'         => 'MRI 10 years'
           )
        );

        $db =& Database::singleton();
        $query = "SELECT id, name from biobanking_ra 
                  WHERE active = 'Y' 
                  AND role ='collection'";
        $rows = $db->pselect($query, array());

        $ras = array(null => '');
        foreach($rows as $row) {
            $ras[$row['id']] = $row['name'];
        }
        $this->addSelect(
             'collection_ra_id',
             'Collection RA',
             $ras
        );
        $onInvalidMsg = "this.setCustomValidity('The time should be in HH:MM format')";
        $this->addBasicText(
            'time',
            'Time',
            array(
             'oninvalid' => $onInvalidMsg,
             'onchange'  => "this.setCustomValidity('')",
             'pattern'   => '^\s*\d{2}:\d{2}\s*$',
            )
        );
        $onInvalidMsg = "this.setCustomValidity('The woke should be in HH:MM format')";
        $this->addBasicText(
            'woke',
            'Woke',
            array(
             'oninvalid' => $onInvalidMsg,
             'onchange'  => "this.setCustomValidity('')",
             'pattern'   => '^\s*\d{2}:\d{2}\s*$',
            )
        );

        $db =& Database::singleton();
        $query = "SELECT id, type from biospecimen_type";
        $rows = $db->pselect($query, array());

        $types = array();
        foreach($rows as $row) {
            $types[$row['id']] = $row['type'];
        }
        $this->addSelect(
            'type_id',
            'Sample Type',
            $types
        );

        $this->addSelect(
            'nb_samples',
            'Number of Samples',
            array(
             ''   => '',
             '1'  => '1',
             '2'  => '2',
             '3'  => '3',
             '4'  => '4',
             '5'  => '5',
             '6'  => '6',
             '7'  => '7',
             '8'  => '8',
             '9'  => '9',
             '10' => '10'
            )
        );

        $db =& Database::singleton();
        $query = "SELECT id, status from biospecimen_status";
        $rows = $db->pselect($query, array());

        $statuses = array();
        foreach($rows as $row) {
            $statuses[$row['id']] = $row['status'];
        }

        $this->addSelect(
            'status_id',
            'Sample Status',
            $statuses
        );

        $this->addSelect(
            'freezer_id',
            'Freezer',
            array(
             null    => '',
             'MM13'  =>  'MM13',
             'MM14'  =>  'MM14',
             'MM15'  =>  'MM15',
            )
        );
        $this->addBasicText(
            'bag_name',
            'Bag Name'
        );
        $this->addBasicText(
            'buccal_rack_id',
            'Buccal Rack ID'
        );
        $this->addBasicText(
            'buccal_rack_coordinates',
            'Buccal Rack Coordinates'
        );
        $this->addSelect(
            'shelf_num',
            'Shelf #',
            array(
             null => '',
             '1'  => '1',
             '2'  => '2',
             '3'  => '3',
             '4'  => '4',
             '5'  => '5',
            )
        );

        $this->addBasicText(
            'rack_num',
            'Rack #'
        );
        $rackNumValues = array(null=>'');
        for($i=1; $i<=20; $i++) {
			$rackNumValues[$i] = $i;
		}
        $this->addSelect(
            'rack_num',
            'Rack #',
            $rackNumValues
        );
        $this->addBasicText(
            'box_name',
            'Box Name'
        );
        $this->addBasicText(
            'box_coordinates',
            'Box Coordinates'
        );
        $this->addSelect(
            'oragene_location',
            'Oragene Location',
            array(
             null     => '',
             'E-4104' => 'E-4104',
            )
        );
        $this->addBasicText('collection_notes', 'Collection Notes');

        $this->form->addFormRule(array(&$this, '_validate'));
    }


    function edit_biospecimen_collection()
    {
        $this->tpl_data['biospecimenId'] = $_REQUEST['identifier'];
        $this->addBasicText('id', 'Biospecimen ID', array('disabled' => true));
        $this->addBasicText('pscid', 'PSCID', array('disabled' => true));
        $this->addBasicText('dob', 'Date of Birth', array('disabled' => true));
        $this->addBasicText('participant_type', 'Participant Type', array('disabled' => true));

        $this->addBasicText('collection_date', 'Date of Collection');
        $this->addSelect(
            'timepoint',
            'Timepoint',
            array(
              null                 => '',
              'dna_methylation'    => 'DNA Methylation',
              'dna_methylation_T2' => 'DNA Methylation T2',
              'dna_methylation_T3' => 'DNA Methylation T3',
              'dna_methylation_T3' => 'DNA Methylation T4',
              'MRI10years'         => 'MRI 10 years'
           )
        );

        $db =& Database::singleton();
        $query = "SELECT id, name from biobanking_ra 
                  WHERE active = 'Y' 
                  AND role ='collection'";
        $rows = $db->pselect($query, array());

        $ras = array(null => '');
        foreach($rows as $row) {
            $ras[$row['id']] = $row['name'];
        }
        $this->addSelect(
             'collection_ra_id',
             'Collection RA',
             $ras
        );
        $onInvalidMsg = "this.setCustomValidity('The time should be in HH:MM format')";
        $this->addBasicText(
            'time',
            'Time',
            array(
             'oninvalid' => $onInvalidMsg,
             'onchange'  => "this.setCustomValidity('')",
             'pattern'   => '^\s*\d{2}:\d{2}\s*$',
            )
        );
        $onInvalidMsg = "this.setCustomValidity('The woke should be in HH:MM format')";
        $this->addBasicText(
            'woke',
            'Woke',
            array(
             'oninvalid' => $onInvalidMsg,
             'onchange'  => "this.setCustomValidity('')",
             'pattern'   => '^\s*\d{2}:\d{2}\s*$',
            )
        );

        $db =& Database::singleton();
        $query = "SELECT id, type from biospecimen_type";
        $rows = $db->pselect($query, array());

        $types = array();
        foreach($rows as $row) {
            $types[$row['id']] = $row['type'];
        }
        $this->addSelect(
            'type_id',
            'Sample Type',
            $types
        );

        $this->addSelect(
            'nb_samples',
            'Number of Samples',
            array(
             ''   => '',
             '1'  => '1',
             '2'  => '2',
             '3'  => '3',
             '4'  => '4',
             '5'  => '5',
             '6'  => '6',
             '7'  => '7',
             '8'  => '8',
             '9'  => '9',
             '10' => '10'
            )
        );

        $db =& Database::singleton();
        $query = "SELECT id, status from biospecimen_status";
        $rows = $db->pselect($query, array());

        $statuses = array();
        foreach($rows as $row) {
            $statuses[$row['id']] = $row['status'];
        }

        $this->addSelect(
            'status_id',
            'Sample Status',
            $statuses
        );

        $this->addSelect(
            'freezer_id',
            'Freezer',
            array(
             null    => '',
             'MM13'  =>  'MM13',
             'MM14'  =>  'MM14',
             'MM15'  =>  'MM15',
            )
        );
        $this->addBasicText(
            'bag_name',
            'Bag Name'
        );
        $this->addBasicText(
            'buccal_rack_id',
            'Buccal Rack ID'
        );
        $this->addBasicText(
            'buccal_rack_coordinates',
            'Buccal Rack Coordinates'
        );
        $this->addSelect(
            'shelf_num',
            'Shelf #',
            array(
             null => '',
             '1'  => '1',
             '2'  => '2',
             '3'  => '3',
             '4'  => '4',
             '5'  => '5',
            )
        );

        $this->addBasicText(
            'rack_num',
            'Rack #'
        );
        $rackNumValues = array(null=>'');
        for($i=1; $i<=20; $i++) {
			$rackNumValues[$i] = $i;
		}
        $this->addSelect(
            'rack_num',
            'Rack #',
            $rackNumValues
        );
        $this->addBasicText(
            'box_name',
            'Box Name'
        );
        $this->addBasicText(
            'box_coordinates',
            'Box Coordinates'
        );
        $this->addSelect(
            'oragene_location',
            'Oragene Location',
            array(
             null     => '',
             'E-4104' => 'E-4104',
            )
        );
        $this->addBasicText('collection_notes', 'Collection Notes');

        $this->form->addFormRule(array(&$this, '_validate'));
    }

    function edit_biospecimen_extraction()
    {
        $this->tpl_data['biospecimenId'] = $_REQUEST['identifier'];
        $this->addBasicText('id', 'Biospecimen ID', array('disabled' => true));
        $this->addBasicText('pscid', 'PSCID', array('disabled' => true));
        $this->addBasicText('dob', 'Date of Birth', array('disabled' => true));
        $this->addBasicText('participant_type', 'Participant Type', array('disabled' => true));
        $db =& Database::singleton();
        $query = "SELECT id, type from biospecimen_type";
        $rows = $db->pselect($query, array());

        $types = array();
        foreach($rows as $row) {
            $types[$row['id']] = $row['type'];
        }
        $this->addSelect(
            'type_id',
            'Sample Type',
            $types,
            array('disabled' => true)
        );

        $this->addBasicText('extraction_date', 'Date of Extraction');
        $this->addBasicText('batch_name', 'Batch Name');
        $this->addBasicText('protocol', 'Protocol');
        $this->addBasicText('elution_volume', 'Elution Volume (&micro;l)');
        $this->addBasicText('pass_fail', 'Pass/Fail');

        $db =& Database::singleton();
        $query = "SELECT id, name from biobanking_ra 
                  WHERE active = 'Y' 
                  AND role ='extraction'";
        $rows = $db->pselect($query, array());

        $ras = array(null => '');
        foreach($rows as $row) {
            $ras[$row['id']] = $row['name'];
        }
        $this->addSelect(
            'lab_ra_id',
            'Lab RA',
            $ras
        );
        $this->addBasicText('dna_concentration', 'DNA Concentration (ng/&micro;l)');
        $this->addBasicText('two_sixty_two_eighty', '260/280');
        $this->addBasicText('two_sixty_two_thirty', '260/230');
        $this->addBasicText('available_sample_volume', 'Available Sample Volume');
        $this->addBasicText('dna_amount', 'Total Volume of DNA (ng)');
        $this->addBasicText('shipment_date', 'Shipment Date');
        $this->addBasicText('ul_for_kobar_lab', '&micro;l Sent to Kobar Lab');
        $this->addBasicText('extraction_notes', 'Extraction Notes');

        $this->form->addFormRule(array(&$this, '_validate'));
    }

    function edit_biospecimen_analysis()
    {
        $this->tpl_data['biospecimenId'] = $_REQUEST['identifier'];
        $this->addBasicText('id', 'Biospecimen ID', array('disabled' => true));
        $this->addBasicText('pscid', 'PSCID', array('disabled' => true));
        $this->addBasicText('dob', 'Date of Birth', array('disabled' => true));
        $this->addBasicText('participant_type', 'Participant Type', array('disabled' => true));
        $db =& Database::singleton();
        $query = "SELECT id, type from biospecimen_type";
        $rows = $db->pselect($query, array());

        $types = array();
        foreach($rows as $row) {
            $types[$row['id']] = $row['type'];
        }
        $this->addSelect(
            'type_id',
            'Sample Type',
            $types,
            array('disabled' => true)
        );

        $this->addBasicText('analysis_type', 'Analysis Type');
        $this->addBasicText('experimental_name', 'Experimental Name');
        $this->addBasicText('technical_batch_num', 'Technical Batch Number');
        $this->addBasicText('sample_name', 'Sample Name');
        $this->addBasicText('chip_position', 'Chip Position');
        $this->addBasicText('sentrix_id', 'Sentrix ID');
        $this->addBasicText('analysis_notes', 'Analysis Notes');

        $this->form->addFormRule(array(&$this, '_validate'));
    }

    /**
     * Validates the data entered in the edit user form.
     *
     * @param array $values what the user entered on the form.
     *
     * @return array $errors all the errors found.
     */
    function _validate($values)
    {
        $errors = array();

        foreach(self::$FIELD_TYPES as $f => $t) {
            if($t == 'date') {
                if ($values[$f].trim() == '') {
					// Empty date: valid
                } elseif(DateTime::createFromFormat('d-M-Y', $values[$f]) === FALSE) {
					error_log("Field $f is not good.........................................");
                    $errors[$f] = "Not a valid date. You must enter a date of the form 13-Aug-2011\n";
                }
			}
		}

        return $errors;
    }
}
?>
