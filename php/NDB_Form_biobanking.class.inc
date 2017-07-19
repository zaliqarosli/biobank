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
class NDB_Form_Biobanking extends NDB_Form
{
    function getDataTypes() {
        $db    =& Database::singleton();

        $colInfoUnformatted = $db->pselect(
            "select column_name, data_type 
              from information_schema.columns 
              where table_name =:tn",
            array('tn'=>'biospecimen')
        );
        $colInfo=array();
        foreach ($colInfoUnformatted as $key=>$row) {
            $colInfo[$row['column_name']]=$row['data_type'];
            return $colInfo;
        }
    }

//    private static $colInfo = getDataTypes();

    /**
     * Controls who has access to this page
     *
     * @return true if user has access, false otherwise.
     */
    function _hasAccess()
    {
        // create user object
        $user =& User::singleton();

        $hasAccess = $user->hasPermission('view_biobanking') || $user->hasPermission('edit_biobanking');
        return $hasAccess;
    }


    /**
     * Computes the initial values this page will be filled with.
     *
     * @return the default values for the initial state of this page.
     */
    function _getDefaults()
    {
        $defaults = array();

        $defaults['zepsom_id']           = '000000';
        $defaults['participant_consent'] = '';
        $defaults['consent_date']        = date('d-M-Y');
        $defaults['collection_date_iswab']   = date('d-M-Y');
        $defaults['collection_date_edta']    = date('d-M-Y');
        $defaults['collection_date_paxgene'] = date('d-M-Y');
        $defaults['collection_date_oragene'] = date('d-M-Y');
        $defaults['type_id_iswab']           = 'iSwab';
        $defaults['type_id_edta']            = 'Whole Blood (WB)';
        $defaults['type_id_paxgene']         = 'Paxgene';
        $defaults['type_id_oragene']         = 'Oragene';

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
        // create db object
        $db =& Database::singleton();

        $colInfo = $this->getDataTypes();

        $errors = array();

        foreach ($colInfo as $f => $t) {
            if ($t == 'number' || $t == 'date' || $t == 'time') {
                if (isset($values[$f]) && preg_match('/^\s*$/', $values[$f])) {
                    $values[$f] = null;
                }
            }
        }

        //unset non-submitted information
        unset($values['submenu']);
        unset($values['data']);
        unset($values['data2']);

        $zid=$values['zepsom_id'];
        $candINFO = $db->pselectRow(
            "SELECT ExternalID, PSCID, CandID FROM candidate WHERE ExternalID=:eid",
            array('eid'=>$zid)
        );
        if (empty($candINFO)) {
            throw new LorisException("The chosen candidate does not exist, please create candidate first.");
        }

        unset($values['zepsom_id']);

        //change consent date format
        if ($values['consent_date'] !== '') {
            $values['consent_date'] = date("Y-m-d", strtotime($values['consent_date']));
        }

        //change collection date format
        foreach ($colInfo as $f => $t) {
            if ($t === 'date') {
                foreach ($values as $k => $value) {
                    if (strstr($k, $f) !== false) {
                        // @todo Refactor this so there's no empty if block
                        if ($values[$k] . trim() == '') {
                            // Empty date: valid
                        } else {
                            $value = date("Y-m-d", strtotime($value));
                            $values[$k] = $value;
                        }
                    }
                }
            }
        }


        //META INFO PROCESSING

        //Saving Participant Consent
        $pStatus= $db->pselectRow(
            "SELECT * FROM participant_status WHERE CandID=:cid",
            array('cid'=>$candINFO['CandID'])
        );
        if (empty($pStatus)) {
            // INSERT
            $db->insert(
                'participant_status',
                array(
                    'CandID'=>$candINFO['CandID'],
                    'study_consent_biosamples' => $values['participant_consent'],
                    'study_consent_biosamples_date' => $values['consent_date'],
                    'study_consent_biosamples_sharing' => $values['participant_consent_biobank'],
                    'study_consent_biosamples_sharing_date' => $values['consent_date']
                )
            );
            $db->insert(
                'consent_info_history',
                array(
                    'CandID'=>$candINFO['CandID'],
                    'study_consent_biosamples' => $values['participant_consent'],
                    'study_consent_biosamples_date' => $values['consent_date'],
                    'study_consent_biosamples_sharing' => $values['participant_consent_biobank'],
                    'study_consent_biosamples_sharing_date' => $values['consent_date']
                )
            );
        } else {
            // UPDATE
            $db->update(
                'participant_status',
                array(
                    'study_consent_biosamples' => $values['participant_consent'],
                    'study_consent_biosamples_date' => $values['consent_date'],
                    'study_consent_biosamples_sharing' => $values['participant_consent_biobank'],
                    'study_consent_biosamples_sharing_date' => $values['consent_date']
                ),
                array('CandID' => $candINFO['CandID'])
            );
            $db->insert(
                'consent_info_history',
                array(
                    'CandID'=>$candINFO['CandID'],
                    'study_consent_biosamples' => $values['participant_consent'],
                    'study_consent_biosamples_date' => $values['consent_date'],
                    'study_consent_biosamples_sharing' => $values['participant_consent_biobank'],
                    'study_consent_biosamples_sharing_date' => $values['consent_date']
                )
            );
        }
        if ($values['participant_consent'] == '') {
            throw new LorisException("Consent must be set to proceed.");
        }
        unset($values['participant_consent']);
        unset($values['participant_consent_biobank']);
        unset($values['consent_date']);

        //Unset values that will not be submitted
        unset($values['dob']);
        unset($values['pscid']);


        // BIOSAMPLE PROCESSING
        $formatedData = array();
        foreach ($values as $k => $value) {
            $matches=array();
            $err = preg_match('/[^._]+(?=[^_]*$)/',$k,$matches);
            $column = preg_replace('/[^._]+(?=[^_]*$)/','',$k);
            $column = rtrim($column,"_");
            if ($column === 'nb_samples' && $value === '0') {
                continue;
            }
            if ($value === '') {
                continue;
            }
            $formatedData[$matches[0]][$column]=$value;
        };

        foreach ($formatedData as $type=>$vals) {
            $formatedData[$type]['zepsom_id']=$zid;
            $formatedData[$type]['specimen_type']=$type;
            $vals['zepsom_id']=$zid;
            $vals['specimen_type']=$type;

            print_r($vals);

            $success = $db->insert(
                'biospecimen',
                $vals
            );
//            $success = $db->insert(
//                'biospecimen',
//                $type
//            );
            $this->tpl_data['success'] = true;
        }
    }


    /**
     * Populates frontend Biospecimen fields
     */
    function addBiospecimen()
    {
        $config          = NDB_Config::singleton();
        $generateBarcode = $config->getSetting('generate_biospecimen_barcodes');
        $db =& Database::singleton();

        $query      = "SELECT ExternalID FROM candidate WHERE ExternalID IS NOT NULL ORDER By ExternalID";
        $rows       = $db->pselect($query, array());
        $externalId = array(null => '');
        foreach ($rows as $row) {
            $externalId[$row['ExternalID']] = $row['ExternalID'];
        }

        $query = "SELECT id, PSCID FROM candidate WHERE PSCID IS NOT NULL";
        $rows  = $db->pselect($query, array());
        $pscid = array();
        foreach ($rows as $row) {
            $pscid[$row['id']] = $row['PSCID'];
        }

//        $query = "SELECT id, type from biospecimen_type";
//        $rows  = $db->pselect($query, array());
//        $types = array();
//        foreach ($rows as $row) {
//            $types[$row['id']] = $row['type'];
//        }

        /*Set specimen types*/
        $specimenTypesUnformatted = $db->pselect(
            "SELECT * FROM biospecimen_type",
            array()
        );
        $specimenTypes=array();
        foreach ($specimenTypesUnformatted as $k=>$row){
            $specimenTypes[$row['specimen']]=$row['label'];
        }

        $query    = "SELECT id, status FROM biospecimen_status";
        $rows     = $db->pselect($query, array());
        $statuses = array();
        foreach ($rows as $row) {
            $statuses[$row['id']] = $row['status'];
        }

        //Get Candidate info for field autopopulation
        $candInfoFields = $db->pselect(
            "SELECT c.ExternalID, c.PSCID, c.DoB, ps.study_consent_biosamples, ps.study_consent_biosamples_sharing, ps.study_consent_biosamples_date 
            FROM candidate c 
            LEFT JOIN participant_status ps 
              ON (c.CandID=ps.CandID)", array()
        );
        $candInfoMapping = array();
        foreach ($candInfoFields as $row) {
            $candInfoMapping[$row['ExternalID']]['pscid'] = $row['PSCID'];
            $candInfoMapping[$row['ExternalID']]['dob'] = date("d-M-Y", strtotime($row['DoB'])); //convert fromat from "Y-m-d"
            $candInfoMapping[$row['ExternalID']]['participant_consent'] = $row['study_consent_biosamples'];
            $candInfoMapping[$row['ExternalID']]['participant_consent_biobank'] = $row['study_consent_biosamples_sharing'];
            $candInfoMapping[$row['ExternalID']]['consent_date'] = empty($row['study_consent_biosamples_date']) ? date("d-M-Y"):date("d-M-Y", strtotime($row['study_consent_biosamples_date'])); //convert format from "Y-m-d"
        }

        $this->addHidden('data', htmlspecialchars(json_encode($candInfoMapping)));

        $biospecimenFields = $db->pselect(
            "SELECT *
            FROM biospecimen", array()
        );
        $biospecimenMapping = array();
        foreach ($biospecimenFields as $row) {
            $biospecimenMapping[$row['zepsom_id']][$row['specimen_type']]['nb_samples'.'_'.$row['specimen_type']] = $row['nb_samples'];
        }

        $this->addHidden('data2', htmlspecialchars(json_encode($biospecimenMapping)));


        $dateOptions = array(
            'language'       => 'en',
            'format'         => 'YMd',
            'addEmptyOption' => true,
            'minYear'        => $config->getSetting('startYear'),
            'maxYear'        => $config->getSetting('endYear'),
        );

        //Get all RAs
        $raQuery = "SELECT id, name FROM biobanking_ra
                  WHERE active = 'Y'
                  AND role ='collection'";
        $raRows  = $db->pselect($raQuery, array());
        foreach ($raRows as $row) {
            $ras[$row['id']] = $row['name'];
        }

        //Get Freezer Options
        $freezerQuery = "SELECT id, type FROM freezer";
        $freezerRows  = $db->pselect($freezerQuery, array());
        $freezers = array(null => '');
        foreach ($freezerRows as $row) {
            $freezers[$row['id']] = $row['type'];
        }

        // Check if logged-in user is a valid research assistant.
        // If so, move their ra key-value pair to the front of the
        // array so that it becomes the default name while also
        // preserving the keys (which are numerical)
        $user =& User::singleton();
        $name = $user->getUsername();
        $id   = array_search($name, $ras);
        // array_search will return false if $name not present
        if ($id) {
            $ras = array_merge(array($id => $name) + $ras);
        }

        $this->tpl_data['biospecimenId'] = '';

//        FORM GLOBALS
        $this->addSelect(
            'zepsom_id',
            'Zepsom ID',
            $externalId,
            array(
                "required" => true,
                "onchange" => "zepsomAutoPopulate(); consentRequired(); biospecimenAutoPopulate();",
            )
        );

        $this->addBasicText(
            'pscid',
            'PSCID',
//            $pscid,
            array(
                'contenteditable' => false,
                'disabled' => true
            )

        );

        $this->addBasicText(
            'dob',
            'Date of Birth',
            array(
                'disabled' => true
            )
        );

        $this->addSelect(
            'participant_consent',
            'Zepsom Project Consent',
            array(
                null  => '',
                'yes' => 'Yes',
                'no'  => 'No',
            ),
            array(
                'required' => true,
                'onchange' => 'consentRequired()'

            )
        );

        $this->addSelect(
            'participant_consent_biobank',
            'Biobank Consent',
            array(
                null  => '',
                'yes' => 'Yes',
                'no'  => 'No',
            ),
            array(
                'required' => true,
                'disabled' => ''

            )
        );

        $this->addBasicText(
            'consent_date',
            'Date of Consent',
            $dateOptions,
            array(
                'required' => true
            )
        );


//        FORM GROUPS

//        HEADERS
        unset($group);
        foreach ($specimenTypes as $k=>$type) {
            $group[] = $this->createText(
                'type_id_'.$k,
                $type,
                array(
                    'class'    => 'form-inline form-control biobankingAddSpecimenHeader',
                    'disabled' => ''
                )
            );
        }
        $this->form->addGroup(
            $group,
            'type_id_group',
            'Sample Type',
            $this->_GUIDelimiter,
            false
        );

//        NUMBER OF SAMPLES
        unset($group);
        foreach ($specimenTypes as $k=>$type) {
            $group[] = $this->createSelect(
                'nb_samples_'.$k,
                '',
                array(
                    '0' => '0',
                    '1' => '1',
                ),
                array(
                    'class' => 'form-inline form-control input-sm biobankingAddSpecimen',
                    'onchange' => "sampleRequired('".$k."')",
                    'sampleType' => $k,
                )
            );
        }
        $this->form->addGroup(
            $group,
            'nb_samples_group',
            'Number of Samples',
            $this->_GUIDelimiter,
            false
        );

//        BIOSPECIMEN ID
        unset($group);
        foreach ($specimenTypes as $k => $type) {
            $group[] = $this->createText(
                'biospecimen_id_' . $k,
                '',
                array(
//                    'required' => true,
                    'class' => 'form-inline form-control input-sm biobankingAddSpecimen',
                    'required' => true,
                    'disabled' => true
                )

            );
        }
        $this->form->addGroup(
            $group,
            'biospecimen_id_group',
            'Biospecimen ID',
            $this->_GUIDelimiter,
            false
        );

//        BIOSPECIMEN STATUS
        unset($group);
        foreach ($specimenTypes as $k=>$type) {
            $group[] = $this->createSelect(
                'status_id_'.$k,
                '',
                $statuses,
                array(
                    'class' => 'form-inline form-control input-sm biobankingAddSpecimen',
//                    'required' => true,
                    'disabled' => ''
                )
            );
        }
        $this->form->addGroup(
            $group,
            'status_id_group',
            'Sample Status',
            $this->_GUIDelimiter,
            false
        );

//        RESEARCH ASSISTANT ID
        unset($group);
        foreach ($specimenTypes as $k=>$type) {
            $group[] = $this->createSelect(
                'collection_ra_id_'.$k,
                '',
                $ras,
                array(
                    'class' => 'form-inline form-control input-sm biobankingAddSpecimen',
//                    'required' => true,
                    'disabled' => ''
                )
            );
        }
        $this->form->addGroup(
            $group,
            'collection_ra_id_group',
            'Collection RA',
            $this->_GUIDelimiter,
            false
        );

//        COLLECTION DATE
        unset($group);
        foreach ($specimenTypes as $k=>$type) {
            $group[] = $this->createText(
                'collection_date_'.$k,
                'collection_date',
                array(
                    'class' => 'form-inline form-control input-sm biobankingAddSpecimen',
//                    'required' => true,
                    'disabled' => ''
                )
            );
        }
        $this->form->addGroup(
            $group,
            'collection_date_group',
            'Collection Date',
            $this->_GUIDelimiter,
            false
        );

//        TIME OF COLLECTION
        unset($group);
        $onInvalidMsg = "this.setCustomValidity('The time should be in HH:MM format')";
        foreach ($specimenTypes as $k=>$type) {
            $group[] = $this->createText(
                'collection_time_'.$k,
                '',
                array(
                    'placeholder' => 'HH:MM',
                    'class'     => 'form-inline form-control input-sm biobankingAddSpecimen',
//                    'required' => true,
                    'disabled' => '',
                    'oninvalid' => $onInvalidMsg,
                    'onchange'  => "this.setCustomValidity('')",
                    'pattern'   => "^\s*\d{2}:\d{2}\s*$",
                    'onfocus'   => "(this.type='date')"
                )
            );
        }
        $this->form->addGroup(
            $group,
            'collection_time_group',
            'Collection Time',
            $this->_GUIDelimiter,
            false
        );

//        FREEZER ID
        unset($group);
        foreach ($specimenTypes as $k=>$type) {
            $group[] = $this->createSelect(
                'freezer_id_'.$k,
                '',
                $freezers,
                array(
                    'class' => 'form-inline form-control input-sm biobankingAddSpecimen',
//                    'required' => true,
                    'disabled' => ''
                )
            );
        }
        $this->form->addGroup(
            $group,
            'freezer_id_group',
            'Freezer',
            $this->_GUIDelimiter,
            false
        );

//        BOX ID
        unset($group);
        foreach ($specimenTypes as $k=>$type) {
            $group[] = $this->createSelect(
                'box_id_'.$k,
                '',
                array(
                    null => '',
                    '1' => '1',
                    '2' => '2',
                    '3' => '3',
                    '4' => '4',
                    '5' => '5',
                ),
                array(
                    'class' => 'form-inline form-control input-sm biobankingAddSpecimen',
                    'disabled' => '',
//                    'required' => true,
                )
            );
        }
        $this->form->addGroup(
            $group,
            'box_id_group',
            'Box ID',
            $this->_GUIDelimiter,
            false
        );

//        BOX COORDINATES
        unset($group);
        foreach ($specimenTypes as $k=>$type) {
            $group[] = $this->createText(
                'box_coordinates_'.$k,
                '',
                array(
                    'class' => 'form-inline form-control input-sm biobankingAddSpecimen',
                    'disabled' => '',
//                    'required' => true,
                )
            );
        }
        $this->form->addGroup(
            $group,
            'box_coordinates_group',
            'Box Coordinates',
            $this->_GUIDelimiter,
            false
        );

//        COLLECTION NOTES
        unset($group);
        foreach ($specimenTypes as $k=>$type) {
            $group[] = $this->createText(
                'collection_notes_'.$k,
                '',
                array(
                    'class' => 'form-inline form-control input-sm biobankingAddSpecimen',
                    'disabled' => ''
                )
            );
        }
        $this->form->addGroup(
            $group,
            'collection_notes_group',
            'Collection Notes',
            $this->_GUIDelimiter,
            false
        );

        $this->form->addFormRule(array(&$this, '_validate'));
    }


    /**
     * This probably edits an existing sample. @todo update this comment
     *
     * @return void
     */
    function editBiospecimenCollection()
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
                'MRI10years'         => 'MRI 10 years',
            )
        );

        $db    =& Database::singleton();
        $query = "SELECT id, name from biobanking_ra
                  WHERE active = 'Y'
                  AND role ='collection'";
        $rows  = $db->pselect($query, array());

        // @todo Refactor RA query into a function
        $ras = array(null => '');
        foreach ($rows as $row) {
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


        $db    =& Database::singleton();
        $query = "SELECT id, label from biospecimen_type";
        $rows  = $db->pselect($query, array());

        $types = array();
        foreach ($rows as $row) {
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
                '10' => '10',
            )
        );

        $db    =& Database::singleton();
        $query = "SELECT id, status from biospecimen_status";
        $rows  = $db->pselect($query, array());

        $statuses = array();
        foreach ($rows as $row) {
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
                null   => '',
                'MM13' => 'MM13',
                'MM14' => 'MM14',
                'MM15' => 'MM15',
            )
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
        $rackNumValues = array(null => '');
        for ($i=1; $i<=20; $i++) {
            $rackNumValues[$i] = $i;
        }
        $this->addSelect(
            'rack_num',
            'Rack #',
            $rackNumValues
        );
        $this->addBasicText(
            'box_id',
            'Box ID'
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

        // @todo This should be LorisForm syntax (i.e. no "->form" needed?)
        $this->form->addFormRule(array(&$this, '_validate'));
    }

    /**
     * This also probably edits existing data
     *
     * @return void
     */
    function editBiospecimenExtraction()
    {
        $this->tpl_data['biospecimenId'] = $_REQUEST['identifier'];
        $this->addBasicText('id', 'Biospecimen ID', array('disabled' => true));
        $this->addBasicText('pscid', 'PSCID', array('disabled' => true));
        $this->addBasicText('dob', 'Date of Birth', array('disabled' => true));
        $this->addBasicText('participant_type', 'Participant Type', array('disabled' => true));
        $db    =& Database::singleton();
        $query = "SELECT id, label from biospecimen_type";
        $rows  = $db->pselect($query, array());

        $types = array();
        foreach ($rows as $row) {
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

        $db    =& Database::singleton();
        $query = "SELECT id, name from biobanking_ra
                  WHERE active = 'Y'
                  AND role ='extraction'";
        $rows  = $db->pselect($query, array());

        $ras = array(null => '');
        foreach ($rows as $row) {
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

    /**
     * Once again edits something @todo fill this in
     *
     * @return void
     */
    function editBiospecimenAnalysis()
    {
        $this->tpl_data['biospecimenId'] = $_REQUEST['identifier'];
        $this->addBasicText('id', 'Biospecimen ID', array('disabled' => true));
        $this->addBasicText('pscid', 'PSCID', array('disabled' => true));
        $this->addBasicText('dob', 'Date of Birth', array('disabled' => true));
        $this->addBasicText('participant_type', 'Participant Type', array('disabled' => true));
        $db    =& Database::singleton();
        $query = "SELECT id, label from biospecimen_type";
        $rows  = $db->pselect($query, array());

        $types = array();
        foreach ($rows as $row) {
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
        $db =& Database::singleton();
        $errors = array();

        // TODO: validate that the submitted biospecimen_id not empty backend/frontend - DONE
        // TODO: validate that the submitted biospecimen_id is unique in biospecimen table
        // TODO: validate that the submitted zepsom_id - sample_type_id combination is unique
        //

        $query      = "SELECT ExternalID FROM candidate WHERE ExternalID IS NOT NULL ORDER By ExternalID";
        $rows       = $db->pselect($query, array());
        $externalId = array();
        foreach ($rows as $row) {
            $externalId[$row['ExternalID']] = $row['ExternalID'];
        }

        $query      = "SELECT biospecimen_id FROM biospecimen";
        $rows       = $db->pselect($query, array());
        $biospecimenId = array();
        foreach ($rows as $row) {
            $biospecimenId[$row['biospecimen_id']] = $row['biospecimen_id'];
        }

        //zepsom ID validation
        if (empty($values['zepsom_id'])) {
            $errors['zepsom_id'] = "Zepsom ID is required.";
        } else {
            if (!in_array($values['zepsom_id'], $externalId)) {
                $errors['zepsom_id'] = "Not a valid Zepsom Id";
            }
        }

        //consent validation
        if ($values['participant_consent'] == '') {
            $errors['participant_consent'] = "You must enter a consent value to proceed.\n";
        }

        //consent date validation
        if (DateTime::createFromFormat('d-M-Y', $values['consent_date']) === false) {
            $errors['consent_date'] = "Not a valid consent date.\n";
        }

        //biospecimen id validation
        foreach ($values as $k => $value) {
            if ((strpos($k, 'biospecimen_id') !== false) && ($value == '' || $value > 32767)) {
                $errors[$k] = "Biospecimen ID is empty or invalid\n";
            }
            else {
                foreach ($biospecimenId as $id) {
                    if ($value == $id){
                        $errors[$k] = "Biospecimen ID is not unique.\n";
                    }
                }
            }

        }

        //collection date validation
        $colInfo = $this->getDataTypes();

        foreach ($colInfo as $f => $t) {
            if ($t === 'date') {
                foreach ($values as $k => $value) {
                    if (strstr($k, $f) !== false) {
                        // @todo Refactor this so there's no empty if block
                        if ($values[$k] . trim() == '') {
                            // Empty date: valid
                        } elseif (DateTime::createFromFormat('d-M-Y', $values[$k]) === false) {
                            $errors[$k] = "Not a valid date. You must enter a date of the form 01-Jan-2001\n";
                        }
                    }
                }
            }
        }

        //collection time validation
        foreach ($values as $k => $value) {
            if ((strpos($k, 'collection_time') !== false) &&
                (preg_match("/(2[0-3]|[01][0-9]):([0-5][0-9])/", $value) == false ||
                    $value == '')
            )
            {
                $errors[$k] = "Collection time entry is empty or invalid.\n";
            }
        }

        //freezer id validation
        foreach ($values as $k => $value) {
            if ((strpos($k, 'freezer') !== false) && ($value == '')) {
                $errors[$k] = "Freezer ID must be entered\n";
            }
        }

        //box id validation
        foreach ($values as $k => $value) {
            if ((strpos($k, 'box_id') !== false) && ($value == '')) {
                $errors[$k] = "Box ID must be entered\n";
            }
        }

        //box coordinates validation
        foreach ($values as $k => $value) {
            if ((strpos($k, 'box_coordinates') !== false) && ($value == '')) {
                $errors[$k] = "Box coordinates must be entered for\n";
            }
        }

        return $errors;
    }

    /**
     * Override base function to get biospecimen dependencies
     *
     * @return Array of JS files to include
     */
    function getJSDependencies()
    {
        $factory = NDB_Factory::singleton();
        $baseURL = $factory->settings()->getBaseURL();
        $deps    = parent::getJSDependencies();
        return array_merge(
            $deps,
            array(
                $baseURL . "/biobanking/js/biobanking_helper.js",
            )
        );
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
     * Create a LorisForm label element but does not add it to the form
     *
     * @param string $labelString The label to attach to the element
     * @param string $attr        @todo What is this?
     *
     * @return LorisForm Label element
     */
    function createLabel(
        $labelString,
        $attr=null
    ) {
        return $this->form->createElement(
            "static",
            null,
            null,
            $labelString,
            $attr
        );
    }
}
?>
