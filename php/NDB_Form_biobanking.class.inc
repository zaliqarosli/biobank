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
 * @author   Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris/
 */
class NDB_Form_Biobanking extends NDB_Form
{
    var $biospecimenID;

    /**
     * Gets Data Types for Use in the Class
     *
     * @return array with data type of each column in table biospecimen
     */
    function getDataTypes()
    {
        $db =& Database::singleton();

        $colInfoUnformatted = $db->pselect(
            "SELECT column_name, data_type 
             FROM   information_schema.columns 
             WHERE  table_name =:tn",
            array('tn' => 'biospecimen')
        );
        $colInfo            = array();
        foreach ($colInfoUnformatted as $key=>$row) {
            $colInfo[$row['column_name']] = $row['data_type'];
            return $colInfo;
        }
    }

    /**
     * Controls who has access to this page
     *
     * @return true if user has access, false otherwise.
     */
    function _hasAccess()
    {
        // create user object
        $user =& User::singleton();

        if ($this->page == 'addBiospecimen') {
            $hasAccess = $user->hasPermission('create_biobanking');
        }
        if ($this->page == 'viewBiospecimen') {
            $hasAccess = $user->hasPermission('view_biobanking');
        }
        if ($this->page == 'editBiospecimen') {
            $hasAccess = $user->hasPermission('edit_biobanking');
        }

        $this->tpl_data['view_biobanking']
            = $user->hasPermission('view_biobanking');
        $this->tpl_data['create_biobanking']
            = $user->hasPermission('create_biobanking');
        $this->tpl_data['upload_biobanking']
            = $user->hasPermission('upload_biobanking');
        $this->tpl_data['edit_biobanking']
            = $user->hasPermission('edit_biobanking');

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
        $db       =& Database::singleton();

        if ($this->page == 'addBiospecimen') {
            $defaults['consent_date'] = date('d-M-Y');
            $query = "SELECT label, specimen FROM biospecimen_type";
            $rows  = $db->pselect($query, array());
            foreach ($rows as $k=>$row) {
                $defaults['type_id_'.$row['specimen']]         = $row['label'];
                $defaults['collection_date_'.$row['specimen']] = date('d-M-Y');
            }
        } else if ($this->page == 'editBiospecimen' || 'viewBiospecimen' ) {
            $bid =$this->biospecimenID;

            $query = "SELECT c.PSCID as pscid, 
                             c.DoB as dob, 
                             b.biospecimen_id, 
                             b.zepsom_id, 
                             bt.label as specimen_label,
                             bs.status,
                             b.status_id, 
                             b.collection_date, 
                             bra.name,
                             b.collection_ra_id, 
                             b.collection_time, 
                             f.type,
                             b.freezer_id, 
                             b.box_id,
                             b.box_coordinates, 
                             b.collection_notes 
                      FROM 
                             biospecimen b 
                      INNER JOIN 
                             candidate c ON b.zepsom_id=c.ExternalID
                      INNER JOIN 
                             biospecimen_type bt ON b.specimen_type=bt.specimen
                      INNER JOIN 
                             biospecimen_status bs ON b.status_id=bs.id
                      INNER JOIN 
                             biobanking_ra bra ON b.collection_ra_id=bra.id
                      INNER JOIN
                             freezer f ON b.freezer_id=f.id
                      WHERE 
                             b.biospecimen_id=:bid";
            $rows  = $db->pselectRow($query, array('bid' => $bid));
            foreach ($rows as $k=>$row) {

                if ($k == 'dob') {
                    $row = date("d-M-Y", strtotime($row));
                } else if ($k == 'collection_date') {
                    $row = date("d-M-Y", strtotime($row));
                } else if ($k == 'collection_time') {
                    $row = substr($row, 0, 5);
                }

                if ($this->page == 'viewBiospecimen') {
                    if ($k == 'status_id') {
                        $row = $rows['status'];
                    } else if ($k == 'collection_ra_id') {
                        $row = $rows['name'];
                    } else if ($k == 'freezer_id') {
                        $row = $rows['type'];
                    }
                }
                $defaults[$k] = htmlspecialchars($row);
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
        /*Create Db Object*/
        $db      =& Database::singleton();
        $factory = NDB_Factory::singleton();
        $baseURL = $factory->settings()->getBaseURL();
        $colInfo = $this->getDataTypes();
        $bid     = $this->biospecimenID;

        /*Change Collection Date Form*/
        foreach ($values as $k => $value) {
            if (strpos($k, 'collection_date') !== false) {
                // @todo Refactor this so there's no empty if block
                if ($values[$k].trim() == '') {
                    // Empty date: valid
                } else {
                    $value      = date("Y-m-d", strtotime($value));
                    $values[$k] = $value;
                }
            }
        }

        /*Process Function for add Biospecimen*/
        if ($this->page === 'addBiospecimen') {
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
            unset($values['bidInfo']);
            unset($values['data3']);
            unset($values['dob']);

            $zid      = $values['zepsom_id'];
            $candInfo = $db->pselectRow(
                "SELECT ExternalID, PSCID, CandID 
                       FROM candidate 
                       WHERE ExternalID=:eid",
                array('eid' => $zid)
            );
            if (empty($candInfo)) {
                throw new LorisException(
                    "The chosen candidate does not exist,".
                    "please create candidate first."
                );
            }

            unset($values['zepsom_id']);

            /*Change Consent Date Format*/
            if ($values['consent_date'] !== '') {
                $values['consent_date'] = date("Y-m-d", strtotime($values['consent_date']));
            }

            /*MetaInfo Processing*/

            /*Saving Participant Consent*/
            $pStatus     = $db->pselectRow(
                "SELECT * 
                       FROM participant_status
                       WHERE CandID=:cid",
                array('cid' => $candInfo['CandID'])
            );
            $consent     = 'study_consent_biosamples';
            $consentDate = $values['consent_date'];

            if (empty($pStatus)) {

                //If there is a consent submission, set consent_submission to true
                $this->tpl_data['consent_submission'] = true;

                // Insert into SQL table
                if ($values['participant_consent'] == 'yes_project_biobank') {

                    $db->insert(
                        'participant_status',
                        array(
                            'CandID'                 => $candInfo['CandID'],
                            $consent                 => 'yes',
                            $consent.'_date'         => $consentDate,
                            $consent.'_sharing'      => 'yes',
                            $consent.'_sharing_date' => $consentDate,
                        )
                    );
                    $db->insert(
                        'consent_info_history',
                        array(
                            'CandID'                 => $candInfo['CandID'],
                            $consent                 => 'yes',
                            $consent.'_date'         => $consentDate,
                            $consent.'_sharing'      => 'yes',
                            $consent.'_sharing_date' => $consentDate,
                        )
                    );
                } else if ($values['participant_consent'] == 'yes_project') {
                    $db->insert(
                        'participant_status',
                        array(
                            'CandID'         => $candInfo['CandID'],
                            $consent         => 'yes',
                            $consent.'_date' => $consentDate,
                        )
                    );
                    $db->insert(
                        'consent_info_history',
                        array(
                            'CandID'         => $candInfo['CandID'],
                            $consent         => 'yes',
                            $consent.'_date' => $consentDate,
                        )
                    );
                }
            } else {
                if ($values['participant_consent'] == 'yes_project_biobank') {

                    //if the consent status is being altered,
                    //set consent_submission to true
                    if ($pStatus[$consent.'_sharing'] !== 'yes'
                        || $pStatus[$consent.'_sharing_date'] !== $consentDate
                    ) {
                        $this->tpl_data['consent_submission'] = true;
                    };

                    // Update SQL table
                    $db->update(
                        'participant_status',
                        array(
                            $consent                 => 'yes',
                            $consent.'_date'         => $consentDate,
                            $consent.'_sharing'      => 'yes',
                            $consent.'_sharing_date' => $consentDate,
                        ),
                        array('CandID' => $candInfo['CandID'])
                    );
                    $db->insert(
                        'consent_info_history',
                        array(
                            'CandID'                 => $candInfo['CandID'],
                            $consent                 => 'yes',
                            $consent.'_date'         => $consentDate,
                            $consent.'_sharing'      => 'yes',
                            $consent.'_sharing_date' => $consentDate,
                        )
                    );
                } else if ($values['participant_consent'] == 'yes_project') {

                    //if the consent status is being altered,
                    // set consent_submission to true
                    if ($pStatus[$consent] !== 'yes'
                        || $pStatus[$consent.'_sharing'] === 'yes'
                        || $pStatus[$consent.'_date']    !== $consentDate
                    ) {
                        $this->tpl_data['consent_submission'] = true;
                    };
                    $db->update(
                        'participant_status',
                        array(
                            $consent                 => 'yes',
                            $consent.'_date'         => $consentDate,
                            $consent.'_sharing'      => null,
                            $consent.'_sharing_date' => null,
                        ),
                        array('CandID' => $candInfo['CandID'])
                    );
                    $db->insert(
                        'consent_info_history',
                        array(
                            'CandID'         => $candInfo['CandID'],
                            $consent         => 'yes',
                            $consent.'_date' => $consentDate,
                        )
                    );
                }
            }
            if ($values['participant_consent'] == '') {
                throw new LorisException("Consent must be set to proceed.");
            }

            /*Unset submitted consent values*/
            unset($values['participant_consent']);
            unset($values['participant_consent_biobank']);
            unset($values['consent_date']);

            // Biosample Processing
            $formatedData = array();
            foreach ($values as $k => $value) {
                $matches = array();
                $err     = preg_match('/[^._]+(?=[^_]*$)/', $k, $matches);
                $column  = preg_replace('/[^._]+(?=[^_]*$)/', '', $k);
                $column  = rtrim($column, "_");
                // if there is a submission set biospecimen_submission to true
                if ($column === 'nb_samples' && $value === '1') {
                    $this->tpl_data['biospecimen_submission'] = true;
                } elseif ($column === 'nb_samples' && $value === '0') {
                    continue;
                }
                //do not store empty values
                if ($value === '') {
                    continue;
                }
                $formatedData[$matches[0]][$column] = $value;
            };

            foreach ($formatedData as $type => $vals) {
                $formatedData[$type]['zepsom_id']     = $zid;
                $formatedData[$type]['specimen_type'] = $type;
                $vals['zepsom_id']     = $zid;
                $vals['specimen_type'] = $type;

                $db->insert(
                    'biospecimen',
                    $vals
                );
            }

            //displays varying success messages depending on submission
            $addURL = "Location: ".$baseURL."/biobanking/?submenu=addBiospecimen&";
            if ($this->tpl_data['biospecimen_submission'] === true
                && $this->tpl_data['consent_submission']     === true
            ) {
                header($addURL."biospecimen=true&consent=true");
                die();
            } elseif ($this->tpl_data['biospecimen_submission'] === true) {
                header($addURL."biospecimen=true");
                die();
            } elseif ($this->tpl_data['consent_submission'] === true) {
                header($addURL."consent=true");
                die();
            } else {
                header($addURL."nosubmission=true");
                die();
            };
        }

        if ($this->page == 'editBiospecimen') {
            unset($values['bidInfo']);
            $viewURL = "Location: ".$baseURL."/biobanking/viewBiospecimen/?";
            $db->update(
                'biospecimen',
                $values,
                array('biospecimen_id' => $bid)
            );
            $this->tpl_data['success'] = true;
            header($viewURL."success=true&bid=".$values['biospecimen_id']);
            die();
        }
    }

    /**
     * Populates frontend Biospecimen elements
     */
    function addBiospecimen()
    {
        $config = NDB_Config::singleton();
        $db     =& Database::singleton();
        $user   = User::singleton();

        /*Query all ExternalIDs from candidates*/
        //Todo: check if still necessary
        $query      = "SELECT ExternalID 
                       FROM candidate 
                       WHERE ExternalID IS NOT NULL 
                       ORDER By ExternalID";
        $rows       = $db->pselect($query, array());
        $externalId = array(null => '');
        foreach ($rows as $row) {
            $externalId[$row['ExternalID']] = $row['ExternalID'];
        }

        /*Query PSCIDs from candidate table*/
        $query = "SELECT id, PSCID 
                  FROM candidate 
                  WHERE PSCID IS NOT NULL";
        $rows  = $db->pselect($query, array());
        $pscid = array();
        foreach ($rows as $row) {
            $pscid[$row['id']] = $row['PSCID'];
        }

        /*Set specimen types*/
        $query         = "SELECT * 
                          FROM biospecimen_type";
        $rows          = $db->pselect($query, array());
        $specimenTypes = array();
        foreach ($rows as $k=>$row) {
            $specimenTypes[$row['specimen']] =$row['label'];
        }

        $query    = "SELECT id, status 
                     FROM biospecimen_status";
        $rows     = $db->pselect($query, array());
        $statuses = array();
        foreach ($rows as $row) {
            $statuses[$row['id']] = $row['status'];
        }

        //Get Candidate info for element autopopulation
        $candInfo = $db->pselect(
            "SELECT   c.ExternalID,
                      c.PSCID,
                      c.DoB,
                      ps.study_consent_biosamples,
                      ps.study_consent_biosamples_sharing,
                      ps.study_consent_biosamples_date 
            FROM      candidate c 
            LEFT JOIN participant_status ps 
              ON      (c.CandID=ps.CandID)",
            array()
        );

        $candInfoMap = array();
        $consent     = 'study_consent_biosamples';
        foreach ($candInfo as $row) {
            $exID = $row['ExternalID'];
            $candInfoMap[$exID]['pscid'] = $row['PSCID'];
            $candInfoMap[$exID]['dob']   = date("d-M-Y", strtotime($row['DoB']));
            $candInfoMap[$exID]['participant_consent']         = $row[$consent];
            $candInfoMap[$exID]['participant_consent_biobank'] = $row[$consent.'_sharing'];
            $candInfoMap[$exID]['consent_date'] = empty($row[$consent.'_date']) ?
                date("d-M-Y") :
                date("d-M-Y", strtotime($row[$consent.'_date']));
        }

        $this->addHidden('data', htmlspecialchars(json_encode($candInfoMap)));

        $biospecimenInfo = $db->pselect(
            "SELECT *
             FROM   biospecimen",
            array()
        );
        $biospecimenMap  = array();
        foreach ($biospecimenInfo as $key => $row) {
            $zid      = $row['zepsom_id'];
            $specType = $row['specimen_type'];
            foreach ($row as $name => $value) {
                $elName = $name.'_'.$row['specimen_type'];
                if ($name == 'collection_date') {
                    $biospecimenMap[$zid][$specType][$elName] = date("d-M-Y", strtotime($row[$name]));
                } else if ($name == 'collection_time') {
                    $biospecimenMap[$zid][$specType][$elName] = substr($row[$name], 0, 5);
                } else {
                    $biospecimenMap[$zid][$specType][$elName] = $row[$name];
                }
            }
        }

        $this->addHidden('bidInfo', htmlspecialchars(json_encode($biospecimenMap)));

        //Get Freezer Options
        $freezerQuery = "SELECT id, type FROM freezer";
        $freezerRows  = $db->pselect($freezerQuery, array());
        $freezers     = array(null => '');
        foreach ($freezerRows as $row) {
            $freezers[$row['id']] = $row['type'];
        }
        
        $query = implode(
            " UNION ",
            array(
              $this->getMaxLocationSql('iSW', 'iswab'  , $freezers),
              $this->getMaxLocationSql('ORA', 'oragene', $freezers),
              $this->getMaxLocationSql('WB' , 'wb'     , $freezers),
              $this->getMaxLocationSql('PAX', 'paxgene', $freezers)
            )
        );
        $maxLocationsRows = $db->pselect($query, array());
        
        $nextLocations = array();
        foreach($maxLocationsRows as $row) {
			$nextLocations[$row['type']] = $this->getNextLocation($freezers, $row);
		}
            
        /*Query all RA's from database*/
        $raQuery   = "SELECT id, name 
                      FROM   biobanking_ra
                      WHERE  active = 'Y'
                        AND  role ='collection'";
        $raRows    = $db->pselect($raQuery, array());
        $ras[null] ='';
        foreach ($raRows as $row) {
            $ras[$row['id']] = $row['name'];
        }

        // Check if logged-in user is a valid research assistant.
        // If so, move their ra key-value pair to the front of the
        // array so that it becomes the default name while also
        // preserving the keys (which are numerical)
        $user =& User::singleton();
        $name = $user->getFullname();
        $id   = array_search($name, $ras, true);

        $defaultEls           = array();
        $defaultEls['status'] = '1';
        // TODO write conversion function from user Full name
        // to collection RA name to collection RA ID
        $defaultEls['ra']   = $id ? $id:null;
        $defaultEls['date'] = date("d-M-Y");
        
        $defaultEls['iswab']   = $nextLocations['iswab'];
        $defaultEls['oragene'] = $nextLocations['oragene'];
        $defaultEls['wb']      = $nextLocations['wb'];
        $defaultEls['paxgene'] = $nextLocations['paxgene'];

        $this->addHidden('data3', htmlspecialchars(json_encode($defaultEls)));


        //todo: is this necessary?
        $dateOptions = array(
            'language'       => 'en',
            'format'         => 'YMd',
            'addEmptyOption' => true,
            'minYear'        => $config->getSetting('startYear'),
            'maxYear'        => $config->getSetting('endYear'),
        );


        $this->tpl_data['biospecimenId'] = '';

        /*Form Globals*/
        $this->addBasicText(
            'zepsom_id',
            'Zepsom ID',
            array(
                'required' => true,
                'onchange' => 'validateZID();'
            )
        );

        $this->addBasicText(
            'pscid',
            'PSCID',
            array(
                'contenteditable' => false,
                'disabled'        => true,
            )
        );

        $this->addBasicText(
            'dob',
            'Date of Birth',
            array(
                'required' => true,
                'oninput' => 'formatDob(this)',
                'onchange' => 'validateDob()'
            )
        );

        $this->addSelect(
            'participant_consent',
            'Consent Given?',
            array(
                null                  => '',
                'yes_project'         => 'Yes – Project',
                'yes_project_biobank' => 'Yes – Project + Biobank',
            ),
            array(
                'required' => true,
                'onchange' => 'validateDob()',

            )
        );

        $this->addBasicText(
            'consent_date',
            'Date of Consent',
            array(
                'required' => true,
            )
        );

        /*Headers*/
        unset($group);
        foreach ($specimenTypes as $k=>$type) {
            $group[] = $this->createText(
                'type_id_'.$k,
                $type,
                array(
                    'class'    => 'form-inline form-control addSpecimenHeader',
                    'disabled' => '',
                    'id'       => 'type',
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

        /*Number of samples*/
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
                    'class'      => 'form-inline form-control input-sm addSpecimen',
                    'onchange'   => "sampleRequired('".$k."');",
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

        /*Biospecimen ID*/
        unset($group);
        foreach ($specimenTypes as $k => $type) {
            $group[] = $this->createText(
                'biospecimen_id_'.$k,
                '',
                array(
                    'class'    => 'form-inline form-control input-sm addSpecimen',
                    'required' => true,
                    'disabled' => true,
                    'oninput' => 'validateBID(this)'
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

        /*Biospecimen Status*/
        unset($group);
        foreach ($specimenTypes as $k=>$type) {
            $group[] = $this->createSelect(
                'status_id_'.$k,
                '',
                $statuses,
                array(
                    'class'    => 'form-inline form-control input-sm addSpecimen',
                    'required' => true,
                    'disabled' => '',
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

        /*Research Assistant ID*/
        unset($group);
        foreach ($specimenTypes as $k=>$type) {
            $group[] = $this->createSelect(
                'collection_ra_id_'.$k,
                '',
                $ras,
                array(
                    'class'    => 'form-inline form-control input-sm addSpecimen',
                    'required' => true,
                    'disabled' => '',
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

        /*Collection Date*/
        unset($group);
        foreach ($specimenTypes as $k=>$type) {
            $group[] = $this->createText(
                'collection_date_'.$k,
                'collection_date',
                array(
                    'class'    => 'form-inline form-control input-sm addSpecimen',
                    'required' => true,
                    'disabled' => '',
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

        /*Time of Collection*/
        unset($group);
//        $onInvalidMsg = "this.setCustomValidity('The time should be in HH:MM format')";
        foreach ($specimenTypes as $k=>$type) {
            $group[] = $this->createText(
                'collection_time_'.$k,
                '',
                array(
                    'placeholder' => 'HH:MM',
                    'class'       => 'form-inline form-control input-sm addSpecimen',
                    'required'    => true,
                    'disabled'    => '',
                    'oninvalid'   => $onInvalidMsg,
                    'onchange'    => "this.setCustomValidity('')",
                    'pattern'     => "^\s*\d{2}:\d{2}\s*$",
                    'onfocus'     => "(this.type='date')",
                )
            );
        }
        $this->form->addGroup(
            $group,
            'collection_time_group',
            'Collection Time (HH:MM)',
            $this->_GUIDelimiter,
            false
        );

        /*Freezer ID*/
        unset($group);
        foreach ($specimenTypes as $k=>$type) {
            $group[] = $this->createSelect(
                'freezer_id_'.$k,
                '',
                $freezers,
                array(
                    'class'    => 'form-inline form-control input-sm addSpecimen',
                    'required' => true,
                    'disabled' => '',
                )
            );
        }
        $this->form->addGroup(
            $group,
            'freezer_id_group',
            'Freezer/Location',
            $this->_GUIDelimiter,
            false
        );

        /*Box ID*/
        unset($group);
        foreach ($specimenTypes as $k=>$type) {
            $group[] = $this->createText(
                'box_id_'.$k,
                '',
                array(
                    'class'    => 'form-inline form-control input-sm addSpecimen',
                    'disabled' => '',
                    'required' => true,
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

        /*Box Coordinates*/
        unset($group);
        foreach ($specimenTypes as $k=>$type) {
            $group[] = $this->createText(
                'box_coordinates_'.$k,
                '',
                array(
                    'class'    => 'form-inline form-control input-sm addSpecimen',
                    'disabled' => '',
                    'required' => true,
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

        /*Collection Notes*/
        unset($group);
        foreach ($specimenTypes as $k=>$type) {
            $group[] = $this->createText(
                'collection_notes_'.$k,
                '',
                array(
                    'class'    => 'form-inline form-control input-sm addSpecimen',
                    'disabled' => '',
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

        $this->form->addFormRule(array(&$this, '_validateAddBiospecimen'));
    }

    function getNextLocation($freezers, $row)
    {    
		$freezerId = $row['type'] == 'iswab' || $row['type'] == 'oragene'
		    ? array_search('door4', $freezers) : array_search('MM15', $freezers);
		    
		// No samples collected yet for that specimen type:
		// next one will go into BOX1 / A1
        if(is_null($row['box_id'])) {
		    return array(
		        'freezer_id'      => $freezerId,
		        'box_id'          => "{$row['prefix']} - BOX1",
			    'box_coordinates' => 'A1'
			);
        }
        
        // Get box number
	    if(!preg_match('/- BOX(\d+)/', $row['box_id'], $matches)) {
            throw new UnexexpectedValueEception(
                "Cannot determine box number for box ID {$row['box_id']}"
            );
        }
		$boxNumber = $matches[1] + 0;
		
		// Get box coordinates (letter and number)
        if(!preg_match('/([A-F])([1-6])/', $row['max_coordinate'], $matches)) {
            throw new UnexexpectedValueEception(
                "Cannot determine coordinate letter and number for $row[3]"
            );
		}
		$coordinatesLetter = $matches[1];
		$coordinatesNumber = $matches[2] + 0;
			   
	    // +1 to coordinate number. If too big, set to 1 and increase coordinate letter
		$coordinatesNumber++;
		if($coordinatesNumber > 6 || ($coordinatesNumber == 6 && $row['type'] == 'iswab')) {
			$coordinatesNumber = 1;
		    $coordinatesLetter = chr(ord($coordinatesLetter) + 1);
		}
				
	    // If coordinate letter is too big, set to 1 and increase box number
		if($coordinatesLetter > 'F' || ($coordinatesLetter == 'F' && $row['type'] == 'iswab')) {
			$coordinatesLetter = 'A';
		    $boxNumber++;
		}
		
		return array(
		    'freezer_id'      => $freezerId,
		    'box_id'          => "{$row['prefix']} - BOX$boxNumber",
		    'box_coordinates' => "$coordinatesLetter$coordinatesNumber"
		);
    }
    
    function getMaxLocationSql($boxIdPrefix, $specimenType, $freezers)
    {
		$freezerId = $specimenType == 'iswab' || $specimenType == 'oragene'
		    ? array_search('door4', $freezers) : array_search('MM15', $freezers);

		$maxBoxIdSql = "SELECT 
		                   CONCAT('$boxIdPrefix - BOX', 
		                          MAX(SUBSTR(box_id, (LENGTH('$boxIdPrefix - BOX')+1))+0)
		                   )
		                FROM biospecimen
		                WHERE box_id LIKE '$boxIdPrefix - BOX%'
		                AND specimen_type = '$specimenType'
		                AND freezer_id = $freezerId";
		                
		return "SELECT 
		           '$specimenType' AS type,
		           '$boxIdPrefix'  AS prefix,
		           box_id, 
		           MAX(box_coordinates) AS max_coordinate 
                FROM biospecimen 
                WHERE box_id = ($maxBoxIdSql)
                AND freezer_id = $freezerId";
	}
	
    function viewBiospecimen()
    {
        /*Get Biospecimen Identifier*/
        if (!empty($_REQUEST['bid'])) {
            $this->biospecimenID = $_REQUEST['bid'];
        } else {
            throw new LorisException("Biospecimen ID is not set");
        }

        /*Zepsom Id*/
        $this->addScoreColumn(
            'zepsom_id',
            'Zepsom ID'
        );

        /*PSCID*/
        $this->addScoreColumn(
            'pscid',
            'PSCID'
        );

        /*Date of Birth*/
        $this->addScoreColumn(
            'dob',
            'Date of Birth'
        );

        /*Biospecimen Type*/
        $this->addScoreColumn(
            'specimen_label',
            'Biospecimen Type'
        );

        /*Biospecimen ID*/
        $this->addScoreColumn(
            'biospecimen_id',
            'Biospecimen ID'
        );

        /*Biospecimen Status*/
        $this->addScoreColumn(
            'status_id',
            'Sample Status'
        );

        /*Research Assistant ID*/
        $this->addScoreColumn(
            'collection_ra_id',
            'Collection RA'
        );

        /*Collection Date*/
        $this->addScoreColumn(
            'collection_date',
            'Collection Date'
        );

        /*Time of Collection*/
        $this->addScoreColumn(
            'collection_time',
            'Collection Time (HH:MM)'
        );

        /*Freezer ID*/
        $this->addScoreColumn(
            'freezer_id',
            'Freezer/Location'
        );

        /*Box ID*/
        $this->addScoreColumn(
            'box_id',
            'Box ID'
        );

        /*Box Coordinates*/
        $this->addScoreColumn(
            'box_coordinates',
            'Box Coordinates'
        );

        /*Collection Notes*/
        $this->addScoreColumn(
            'collection_notes',
            'Collection Notes'
        );
    }

    /**
     * Edits and updates existing biospecimen
     *
     * @return void
     */
    function editBiospecimen()
    {
        $db  =& Database::singleton();

        /*Get Biospecimen Identifier*/
        if (!empty($_REQUEST['bid'])) {
            $this->biospecimenID = $_REQUEST['bid'];
        } else {
            throw new LorisException("Biospecimen ID is not set");
        }
        $bid = $this->biospecimenID;

        /*Get Biospecimen Status Options*/
        $query    = "SELECT id, status 
                     FROM biospecimen_status";
        $rows     = $db->pselect($query, array());
        $statuses = array();
        foreach ($rows as $row) {
            $statuses[$row['id']] = $row['status'];
        }

        /*Get RA Options*/
        $raQuery   = "SELECT id, name 
                      FROM biobanking_ra
                      WHERE active = 'Y' AND role ='collection'";
        $raRows    = $db->pselect($raQuery, array());
        $ras[null] ='';
        foreach ($raRows as $row) {
            $ras[$row['id']] = $row['name'];
        }

        /*Get Freezer Options*/
        $freezerQuery = "SELECT id, type 
                         FROM freezer";
        $freezerRows  = $db->pselect($freezerQuery, array());
        $freezers     = array(null => '');
        foreach ($freezerRows as $row) {
            $freezers[$row['id']] = $row['type'];
        }

        $query = "SELECT zepsom_id, biospecimen_id, specimen_type 
                  FROM   biospecimen";
        $rows  = $db->pselect($query, array());
        $bidInfo   = array();
        foreach ($rows as $row) {
            $zid = $row['zepsom_id'];
            $specType = $row['specimen_type'];
            foreach ($row as $name => $value) {
                $elName = $name."_".$row['specimen_type'];
                $bidInfo[$zid][$specType][$elName] = $row[$name];
            }
        }
        $this->addHidden('bidInfo', htmlspecialchars(json_encode($bidInfo)));

        $query = "SELECT b.zepsom_id
                  FROM   biospecimen b
                  WHERE  b.biospecimen_id=:bid";
        $zid = $db->pselectRow($query, array('bid' => $bid));

        /*Zepsom Id*/
        $this->addScoreColumn(
            'zepsom_id',
            'Zepsom ID'
        );

        /*PSCID*/
        $this->addScoreColumn(
            'pscid',
            'PSCID'
        );

        /*Date of Birth*/
        $this->addScoreColumn(
            'dob',
            'Date of Birth'
        );

        /*Biospecimen Type*/
        $this->addScoreColumn(
            'specimen_label',
            'Biospecimen Type'
        );

        /*Biospecimen ID*/
        $this->addBasicText(
            'biospecimen_id',
            'Biospecimen ID',
            array(
                'class' => 'form-inline form-control input-sm editSpecimen',
                'required' => true,
                'oninput' => "validateBID(this, '".$zid['zepsom_id']."')"
            )
        );

        /*Biospecimen Status*/
        $this->addSelect(
            'status_id',
            'Sample Status',
            $statuses,
            array(
                'class' => 'form-inline form-control input-sm editSpecimen',
                'required' => true,
            )
        );

        /*Research Assistant ID*/
        $this->addSelect(
            'collection_ra_id',
            'Collection RA',
            $ras,
            array(
                'class' => 'form-inline form-control input-sm editSpecimen',
                'required' => true,
            )
        );

        /*Collection Date*/
        $this->addBasicText(
            'collection_date',
            'Collection Date',
            array(
                'class' => 'form-inline form-control input-sm editSpecimen',
                'required' => true,
            )
        );

        /*Time of Collection*/
        $this->addBasicText(
            'collection_time',
            'Collection Time (HH:MM)',
            array(
                'class' => 'form-inline form-control input-sm editSpecimen',
                'required' => true,
            )
        );

        /*Freezer ID*/
        $this->addSelect(
            'freezer_id',
            'Freezer/Location',
            $freezers,
            array(
                'class' => 'form-inline form-control input-sm editSpecimen',
                'required' => true,
            )
        );

        /*Box ID*/
        $this->addBasicText(
            'box_id',
            'Box ID',
            array(
                'class' => 'form-inline form-control input-sm editSpecimen',
                'required' => true,
            )
        );

        /*Box Coordinates*/
        $this->addBasicText(
            'box_coordinates',
            'Box Coordinates',
            array(
                'class' => 'form-inline form-control input-sm editSpecimen',
                'required' => true,
            )
        );

        /*Collection Notes*/
        $this->addBasicText(
            'collection_notes',
            'Collection Notes',
            array('class' => 'form-inline form-control input-sm editSpecimen',
            )
        );

        $this->form->addFormRule(array(&$this, '_validateEditBiospecimen'));
    }

    /**
     * Validates the data entered in the Add Biospecimen form.
     *
     * @param array $values what the user entered on the form.
     *
     * @return array $errors all the errors found.
     */
    function _validateAddBiospecimen($values)
    {
        $db      =& Database::singleton();
        $errors  = array();
        $success = array();


        //
        $query      = "SELECT   ExternalID 
                       FROM     candidate 
                       WHERE    ExternalID IS NOT NULL 
                       ORDER By ExternalID";
        $rows       = $db->pselect($query, array());
        $externalId = array();
        foreach ($rows as $row) {
            $externalId[$row['ExternalID']] = $row['ExternalID'];
        }

        $query         = "SELECT zepsom_id, 
                                 specimen_type, 
                                 biospecimen_id, 
                                 freezer_id, 
                                 box_id, 
                                 box_coordinates 
                          FROM   biospecimen";
        $rows          = $db->pselect($query, array());
        $biospecimenId = array();
        foreach ($rows as $row) {
            $biospecimenId[$row['biospecimen_id']] = $row;
            unset($biospecimenId[$row['biospecimen_id']]['biospecimen_id']);
        }

        $query = "SELECT * 
                  FROM biospecimen_type";
        $specimenTypesUnformatted = $db->pselect($query, array());
        $specimenTypes            = array();
        foreach ($specimenTypesUnformatted as $k=>$row) {
            $specimenTypes[$row['specimen']] =$row['label'];
        }

        $query = "SELECT * 
                  FROM freezer";
        $rows = $db->pselect($query, array());
        $freezerNames = array();
        foreach ($rows as $row) {
            $freezerNames[$row['id']] = $row['type'];
        }

        $query         = "SELECT ExternalID, DoB 
                          FROM   candidate";
        $rows          = $db->pselect($query, array());
        $candidateInfo = array();
        foreach ($rows as $row) {
            $candidateInfo[$row['ExternalID']] = $row['DoB'];
        }

        /*Zepsom ID Validation*/
        if (empty($values['zepsom_id'])) {
            $errors['zepsom_id'] = "Zepsom ID is required.";
        } else {
            if (!in_array($values['zepsom_id'], $externalId)) {
                $errors['zepsom_id'] = "Not a valid Zepsom Id";
            }
        }

        /*Zepsom Id - DoB Match Validation*/
        if (date("d-M-Y", strtotime($candidateInfo[$values['zepsom_id']]))
            !== $values['dob']) {
            $errors['dob'] = "Date of Birth and Zepsom ID do not match.";
        }

        /*Consent Validation*/
        if ($values['participant_consent'] == '') {
            $errors['participant_consent'] = "You must enter a consent ".
                "value to proceed.\n";
        }

        /*Consent Date Validation*/
        $consent_date = strtotime($values['consent_date']);
        foreach ($candidateInfo as $k => $value) {
            if ($values['zepsom_id'] == $k) {
                $DoB = strtotime($value);
            }
        }
        $current_date = time();

        if (DateTime::createFromFormat('d-M-Y', $values['consent_date']) == false) {
            $errors['consent_date'] = "Consent date is invalid. ".
                "You must enter a date of the form 01-Jan-2001\n";
        }
        if ($consent_date > $current_date) {
            $errors['consent_date'] = "Consent Date cannot be in the future.\n";
        }
        if ($consent_date < $DoB) {
            $errors['consent_date'] = "Consent Date cannot be before Date of Birth.\n";
        }

        /*Form Validation*/
        $bidSuffix = '';
        foreach ($values as $k => $value) {

            /*Biospecimen ID Validation*/
            if (strpos($k, 'biospecimen_id') !== false) {
                if ($value == '') {
                    $errors[$k] = "Biospecimen ID is empty\n";
                } else if (strpos($k, 'iswab')) {
                    if (!preg_match("/^iSW\d{6}$/", $value)) {
                        $errors[$k] = "Biospecimen ID is invalid. Must be in format ".
                            "iSW######\n";
                    }
                } else if (strpos($k, 'oragene')) {
                    if (!preg_match("/^ORA\d{6}$/", $value)) {
                        $errors[$k] = "Biospecimen ID is invalid. Must be in format ".
                            "ORA######\n";
                    }
                } else if (strpos($k, 'wb')) {
                    if (!preg_match("/^WB\d{6}$/", $value)) {
                        $errors[$k] = "Biospecimen ID is invalid\n. Must be in format ".
                            "WB######";
                    }
                } else if (strpos($k, 'paxgene')) {
                    if (!preg_match("/^PAX\d{6}$/", $value)) {
                        $errors[$k] = "Biospecimen ID is invalid. Must be in format ".
                            "PAX######\n";
                    }
                }

                if (empty($bidSuffix)) {
                    $bidSuffix = substr($value, -4);
                } else {
                    if ($bidSuffix !== substr($value, -4)) {
                        $errors[$k] = 'The last four digits of the submitted Biospecimen IDs do not match';
                    }
                }

                foreach ($biospecimenId as $id => $info) {
                    $matches = array();
                    preg_match('/[^._]+(?=[^_]*$)/', $k, $matches);
                    if (($values['zepsom_id'] === $info['zepsom_id'])
                        && ($matches[0] === $info['specimen_type'])
                    ) {
                        $errors[$k] = "You can only submit 1 sample per ".
                            "specimen type for each Zepsom ID\n";
                    }
                    //NOTE: Not checking for uniqueness across submitted samples because of validations above
                    if ($id === $value) {
                        $errors[$k] = "Biospecimen ID is not unique.\n";
                    }
                    //This is temporarily disabled due to front-end JS validation that alerts user
//                    if ($info['zepsom_id'] === $values['zepsom_id']) {
//                        if (substr($value, -4) !== substr($id, -4)) {
//                            $errors[$k] = "Last four digits of Biospecimen ID do not match previous records for this candidate";
//                        }
//                    }
                }
            }

            /*Biospecimen Status Validation*/
            if (strpos($k, 'status_id') !== false && $value === '') {
                $errors[$k] = "A Biospecimen Status must be selected\n";
            }

            /*Collection RA Validation*/
            if (strpos($k, 'collection_ra') !== false && $value === '') {
                $errors[$k] = "A Collection RA must be selected\n";
            }

            if (strpos($k, 'collection_date') !== false) {
                // @todo Refactor this so there's no empty if block
                if (DateTime::createFromFormat('d-M-Y', $values[$k]) == false) {
                    $errors[$k] = "Collection date is invalid. ".
                        "You must enter a date of the form 01-Jan-2001\n";
                }
                if (strtotime($value) > $current_date) {
                    $errors[$k] = "Collection date cannot be in the future.\n";
                }
                if (strtotime($value) < $DoB) {
                    $errors[$k] = "Collection date cannot be before ".
                        "Date of Birth.\n";
                }
            }

            if ((strpos($k, 'collection_time') !== false)) {
                if ($value == '') {
                    $errors[$k] = "Collection time entry is empty.\n";
                }
                if (!preg_match("/(2[0-3]|[01][0-9]):([0-5][0-9])/", $value)) {
                    $errors[$k] = "Collection time is invalid. ".
                        "You must enter a time in the form HH:MM.\n";
                }
            }

            if ((strpos($k, 'freezer_id') !== false) && ($value == '')) {
                $errors[$k] = "Freezer ID must be selected\n";
            }

            if (strpos($k, 'box_id') !== false) {
                if ($value == '') {
                    $errors[$k] = "Box ID must be entered\n";
                } else if (strpos($k, 'iswab')) {
                    if (!preg_match("/^iSW - BOX([1-9]|[1-9][0-9]|100)$/", $value)) {
                        $errors[$k] = "Box ID must be in format iSW - BOX#\n";
                    }
                } else if (strpos($k, 'oragene')) {
                    if (!preg_match("/^ORA - BOX([1-9]|[1-9][0-9]|100)$/", $value)) {
                        $errors[$k] = "Box ID must be in format ORA - BOX#\n";
                    }
                }
                else if (strpos($k, 'wb')) {
                    if (!preg_match("/^WB - BOX([1-9]|[1-9][0-9]|100)$/", $value)) {
                        $errors[$k] = "Box ID must be in format WB - BOX#\n";
                    }
                } else if (strpos($k, 'paxgene')) {
                    if (!preg_match("/^PAX - BOX([1-9]|[1-9][0-9]|100)$/", $value)) {
                        $errors[$k] = "Box ID must be in format PAX - BOX#\n";
                    }
                }
            }

            if (strpos($k, 'box_coordinates') !== false) {
                if ($value == '') {
                    $errors[$k] = "Box coordinates must be entered\n";
                } else if (strpos($k, 'iswab') !== false) {
                    if (!preg_match("/^[A-E][1-5]$/", $value)) {
                        $errors[$k] = "Box Coordinate must be in the format ".
                            "(A-E)(1-5)\n";
                    }
                } else {
                    if (!preg_match("/^[A-F][1-6]$/", $value)) {
                        $errors[$k] = "Box Coordinate must be in the format ".
                            "(A-F)(1-6)\n";
                    }
                }
            }
        }

        /* Validation for Freezer, Box Id, Box Coordinates combination*/
        $coordinateData = array();
        foreach ($specimenTypes as $type=>$label) {
            if (array_key_exists('nb_samples_'.$type, $values)
                && $values['nb_samples_'.$type] !== '0'
            ) {
                $coordinateData[$type]['freezer_id']      = $values['freezer_id_'.$type];
                $coordinateData[$type]['box_id']          = $values['box_id_'.$type];
                $coordinateData[$type]['box_coordinates'] = $values['box_coordinates_'.$type];
            }
        }
        foreach ($coordinateData as $type0 => $data0) {
            foreach ($biospecimenId as $id=>$location) {
                unset($location['zepsom_id']);
                unset($location['specimen_type']);
                if ($data0===$location) {
                    $errors[$type0] = "Location '".$freezerNames[$values['freezer_id_'.$type0]]." / ".
                        $values['box_id_'.$type0]." / ".$values['box_coordinates_'.$type0].
                        "' is already occupied by another specimen.";
                }
            }
            unset($coordinateData[$type0]);
        }
        return $errors;
    }

    /**
     * Validates the data entered in the Edit Biospecimen form.
     *
     * @param array $values what the user entered on the form.
     *
     * @return array $errors all the errors found.
     */
    function _validateEditBiospecimen($values)
    {
        $db     =& Database::singleton();
        $errors = array();
        $bid    = $this->biospecimenID;

        /*Query relevant data from biospecimen table*/
        $query         = "SELECT zepsom_id, 
                                 specimen_type, 
                                 biospecimen_id, 
                                 freezer_id, 
                                 box_id, 
                                 box_coordinates 
                          FROM   biospecimen";
        $rows          = $db->pselect($query, array());
        $biospecimenId = array();
        foreach ($rows as $row) {
            $biospecimenId[$row['biospecimen_id']] = $row;
            unset($biospecimenId[$row['biospecimen_id']]['biospecimen_id']);
        }

        /*Query Candidate Date of Birth and Current Date*/
        $query = "SELECT     c.DoB 
                  FROM       candidate c 
                  INNER JOIN biospecimen b ON c.ExternalID=b.zepsom_id 
                  WHERE      b.biospecimen_id='".$bid."'";
        $rows  = $db->pselect($query, array());
        $DoB   = '';
        foreach ($rows as $row) {
            $DoB = $row['DoB'];
        }
        $DoB          = strtotime($DoB);
        $current_date = time();

        $query = "SELECT * 
                  FROM freezer";
        $rows = $db->pselect($query, array());
        $freezerNames = array();
        foreach ($rows as $row) {
            $freezerNames[$row['id']] = $row['type'];
        }

        /*Form Validation*/
        foreach ($values as $k => $value) {

            /*Biospecimen ID Validation*/
            if (strpos($k, 'biospecimen_id') !== false) {
                if ($value == '') {
                    $errors[$k] = "Biospecimen ID must be entered\n";
                } else {
                    if (substr($bid, 0, 3) === 'iSW'
                        && !preg_match("/^iSW\d{6}$/", $value)
                    ) {
                        $errors[$k] = "Biospecimen ID is invalid.\n";
                    } elseif (substr($bid, 0, 3) === 'ORA'
                        && !preg_match("/^ORA\d{6}$/", $value)
                    ) {
                        $errors[$k] = "Biospecimen ID is invalid.\n";
                    } elseif (substr($bid, 0, 2) === 'WB'
                        && !preg_match("/^WB\d{6}$/", $value)
                    ) {
                        $errors[$k] = "Biospecimen ID is invalid.\n";
                    } elseif (substr($bid, 0, 3) === 'PAX'
                        && !preg_match("/^PAX\d{6}$/", $value)
                    ) {
                        $errors[$k] = "Biospecimen ID is invalid.\n";
                    }
                }
                foreach ($biospecimenId as $id => $info) {
                    if ($id === $value && $value !== $bid ) {
                        $errors[$k] = "Biospecimen ID is not unique.\n";
                    }
//              Todo: determine if this is necessary for editBiospecimen
//                    if ($info['zepsom_id'] === $values['zepsom_id']) {
//                        if (substr($value, -4) !== substr($id, -4)) {
//                            $errors[$k] = "Last four digits of Biospecimen ID do not match previous records for this candidate";
//                        }
//                    }
                }
            }

            /*Biospecimen Status Validation*/
            if (strpos($k, 'status_id') !== false && $value === '') {
                $errors[$k] = "A Biospecimen Status must be selected\n";
            }

            /*Collection RA Validation*/
            if (strpos($k, 'collection_ra') !== false && $value === '') {
                $errors[$k] = "A Collection RA must be selected\n";
            }

            /*Collection Date Validation*/
            if (strpos($k, 'collection_date') !== false) {
                if ($values === '') {
                    $errors[$k] = "Collection Date is empty\n";
                }
                if (DateTime::createFromFormat('d-M-Y', $values[$k]) == false) {
                    $errors[$k] = "Collection Date is invalid. ".
                        "You must enter a date of the form 01-Jan-2001\n";
                }
                if (strtotime($value) > $current_date) {
                    $errors[$k] = "Collection Date cannot be in the future.\n";
                }
                if (strtotime($value) < $DoB) {
                    $errors[$k] = "Collection Date cannot be before ".
                        "Date of Birth.\n";
                }
            }

            /*Collection Time Validation*/
            if ((strpos($k, 'collection_time') !== false)) {
                if ($value == '') {
                    $errors[$k] = "Collection Time entry is empty.\n";
                }
                if (!preg_match("/^(2[0-3]|[01][0-9]):([0-5][0-9])$/", $value)) {
                    $errors[$k] = "Collection Time is invalid. ".
                        "You must enter a time in the form HH:MM.\n";
                }
            }

            /*Freezer ID Validation*/
            if ((strpos($k, 'freezer_id') !== false) && ($value == '')) {
                $errors[$k] = "Freezer ID must be selected\n";
            }

            /*Box ID Validation*/
            if (strpos($k, 'box_id') !== false) {
                if ($value == '') {
                    $errors[$k] = "Box ID must be entered\n";
                } else {
                    if (substr($bid, 0, 3) === 'iSW'
                        && !preg_match("/^iSW - BOX([1-9]|[1-9][0-9]|100)$/", $value)
                    ) {
                        $errors[$k] = "Box ID format is invalid (should be something like iSW - BOX4).\n";
                    }
                    if (substr($bid, 0, 3) === 'ORA'
                        && !preg_match("/^ORA - BOX([1-9]|[1-9][0-9]|100)$/", $value)
                    ) {
                        $errors[$k] = "Box ID format is invalid (should be something like ORA - BOX2).\n";
                    }
                    if (substr($bid, 0, 2) === 'WB'
                        && !preg_match("/^WB - BOX([1-9]|[1-9][0-9]|100)$/", $value)
                    ) {
                        $errors[$k] = "Box ID format is invalid (should be something like WB - BOX1).\n";
                    }
                    if (substr($bid, 0, 3) === 'PAX'
                        && !preg_match("/^PAX - BOX([1-9]|[1-9][0-9]|100)$/", $value)
                    ) {
                        $errors[$k] = "Box ID format is invalid (should be something like PAX - BOX5).\n";
                    }
                }
            }

            if (strpos($k, 'box_coordinates') !== false) {
                if ($value == '') {
                    $errors[$k] = "Box coordinates must be entered\n";
                } else if (strpos($bid, 'iSW') !== false) {
                    if (!preg_match("/^[A-E][1-5]$/", $value)) {
                        $errors[$k] = "Box Coordinate must be in the format ".
                            "(A-E)(1-5)\n";
                    }
                } else {
                    if (!preg_match("/^[A-F][1-6]$/", $value)) {
                        $errors[$k] = "Box Coordinate must be in the format ".
                            "(A-F)(1-6)\n";
                    }
                }
            }
        }

        /*Validation for unique freezer/box/coordinates combination*/
        $comboData = array();
        $comboData['freezer_id']      = $values['freezer_id'];
        $comboData['box_id']          = $values['box_id'];
        $comboData['box_coordinates'] = $values['box_coordinates'];

        foreach ($biospecimenId as $id=>$location) {
            unset($location['zepsom_id']);
            unset($location['specimen_type']);
            if ($comboData===$location && $id!==$bid) {
                $errors['box_coordinates'] = "Location '".$freezerNames[$location['freezer_id']].
                " / ".$location['box_id']. " / ".$location['box_coordinates'].
                    "' is already occupied by another specimen.";
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
                $baseURL."/biobanking/js/addBiospecimen.js",
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
            array($baseURL."/biobanking/css/biobanking.css")
        );
    }

    /**@todo What is this? Is it necessary?
     * Create a LorisForm label element but does not add it to the form
     *
     * @param  string $labelString The label to attach to the element
     * @param  string $attr
     * @return LorisForm Label element
     */
//    function createLabel(
//        $labelString,
//        $attr=null
//    ) {
//        return $this->form->createElement(
//            "static",
//            null,
//            null,
//            $labelString,
//            $attr
//        );
//    }
}
?>
