<?php
/**
* The biobanking module
*
* PHP Version 5
*
* @category Main
* @package  Biobanking
* @author   Loris Team <loris.mni@bic.mni.mcgill.ca>
* @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
* @link     https://www.github.com/aces/Loris/
*/
class NDB_Menu_Filter_biospecimen_search extends NDB_Menu_Filter
{
    var $AjaxModule = true;

    /**
     * Overloading this method to allow access to site users (their own site only)
     * and users w/ multisite privs
     * @return true if user has access, false otherwise
     */
    function _hasAccess()
    {
        // TODO: Create biobanking-specific permissions
        $user =& User::singleton();
        $site =& Site::singleton($user->getData('CenterID'));
        $this->tpl_data['biobanking']
            = $user->hasPermission('view_biobanking') || $user->hasPermission('edit_biobanking');
        return $user->hasPermission('view_biobanking') || $user->hasPermission('edit_biobanking');
    }

    /**
     * Sets up all the class variables needed for the candidate_list menu
     * filter
     *
     * @return true on success
     */
    function _setupVariables()
    {
        $user   =& User::singleton();
        $config =& NDB_Config::singleton();
        $this->tpl_data['toggled_visible'] =false;
        // set the class variables
        $useProjects = $config->getSetting("useProjects");
        if ($useProjects === "false") {
            $useProjects = false;
        }
       // set the class variables
       // this is everything that will appear in the 'Snapshot' view
       $this->columns = array(
                          'b.id',
                          'b.subject_id as pscid',
                          'if(b.subject_id LIKE "%M", "Mother", "Child") as participant_type',
                          "DATE_FORMAT(b.subject_dob, '%d-%b-%Y') as DoB",
                          'b.timepoint',
                          'b.timepoint_pscid',
                          'bt.type',
                          'b.nb_samples',
                          "DATE_FORMAT(b.collection_date, '%d-%b-%Y')",
                          "DATE_FORMAT(b.extraction_date, '%d-%b-%Y')",
                          'bs.status as status',
//                          'b.freezer_id as freezer',
//                          'b.buccal_rack_id',
//                          'b.buccal_rack_coordinates',
//                          'b.shelf_num',
//                          'b.rack_num',
//                          'b.box_name',
//                          'b.box_coordinates',
//                          'b.bag_name',
                          "IF(b.type_id=7,"
                          . " CONCAT(COALESCE(b.freezer_id, ''),"
                          . "        IF(b.buccal_rack_id IS NOT NULL OR b.buccal_rack_coordinates IS NOT NULL, "
                          . "           CONCAT('-', COALESCE(b.buccal_rack_id, '?'), IF(b.buccal_rack_coordinates IS NOT NULL,CONCAT('-', b.buccal_rack_coordinates), '')),"
                          . "           IF(b.bag_name IS NOT NULL,CONCAT('-', b.bag_name), '')"
                          . "        )"
                          . " ), "
                          . "  IF(b.type_id IN (8,9),"
                          . "    CONCAT(COALESCE(b.freezer_id, ''),"
                          . "           IF(b.rack_num IS NOT NULL OR b.box_name IS NOT NULL OR b.box_coordinates IS NOT NULL, "
                          . "              CONCAT('-', "
                          . "                     COALESCE(b.rack_num, '?'), "
                          . "                     IF(b.box_name IS NOT NULL OR b.box_coordinates IS NOT NULL,"
                          . "                        CONCAT('-', COALESCE(b.box_name, '?'), IF(b.box_coordinates IS NOT NULL,CONCAT('-', b.box_coordinates), '')),"
                          . "                        ''"
                          . "                     )"
                          . "              ),"
                          . "              ''"
                          . "           )"
                          . "    ),"
                          . "    '')"
                          . " ) AS Location",
                          'b.special'
                      );
       if ($useProjects) {
            array_splice($this->columns, 4, 0, "p.Name");
        }

       $this->headers = array(
           'Id',
           'Pscid',
           'M/C',
           'DoB',
           'Visit',
           'VisitPscid',
           'Type',
           'Qty.',
           'Collected On',
           'Extracted On',
           'Status',
//           'Freezer',
//           'BuccalRackId',
//           'BuccalRackCoordinates',
//           'ShelfNum',
//           'RackNum',
//           'BoxName',
//           'BoxCoordinates',
//           'BagName',
           'Location',
           'Special'
       );
       if ($useProjects) {
            array_splice($this->headers, 4, 0, "Project");
        }

       // Set header as hidden from the data table
       $this->tpl_data['hiddenHeaders'] = json_encode(
         [
          'VisitPscid', 
//          'Freezer', 
//          'BuccalRackId',
//          'BuccalRackCoordinates',
//          'ShelfNum',
//          'RackNum',
//          'BoxName',
//          'BoxCoordinates',
//          'BagName',           
          'Special'
         ]
      );


       # $this->columns =array_merge(
       #     $this->columns,
       #     array(
       #      'DATE_FORMAT(c.DoB,\'%Y-%m-%d\') AS DoB',
       #     )
       # );
       $this->formToFilter = array(
               'pscId'           => 'b.subject_id',
	           'biospecimenId'   => 'b.id',
               'dob'             => 'b.subject_dob',
               'participantType' => 'participant_type',   
	           'sampleType'      => 'b.type_id',
               'nbSamples'       => 'b.nb_samples',
               'collectionDate'  => 'b.collection_date',
               'extractionDate'  => 'b.extraction_date',
               'sampleStatus'    => 'b.status_id',
       );

       $this->validFilters = array(
               'b.subject_id',
	           'b.id',
               'b.subject_dob',
               'participant_type',
	           'b.type_id',
	           'b.nb_samples',
               'b.collection_date',
               'b.extraction_date',
               'b.status_id',
        );

        $this->query = " FROM biospecimen b"
                       . " JOIN biospecimen_type bt ON (bt.id=b.type_id)"
                       . " JOIN biospecimen_status bs ON (bs.id=b.status_id)";
        if ($useProjects) {
            $this->query .= " JOIN Project p ON (p.ProjectID=b.project_id)";
        }
 
        if (!$user->hasPermission('view_biobanking')) {
            $this->query .= " AND c.CenterID=" . $user->getCenterID();
        }
        $this->group_by = '';#'c.CandID, psc.Name, c.PSCID, c.Gender';
        $this->order_by = 'b.subject_id, b.timepoint, b.id';

        # Define filters to be used. May need to add more later.
        # TODO: Look up filters for numerical ranges, e.g. the `quantity_on_hand` field.
        $this->EqualityFilters    = array(
                                     'b.type_id',
                                     'b.status_id',
                                     'b.collection_date',
                                     'b.extraction_date'
        );

        return true;
    }
    /**
     * Create the form for the biobanking menu page
     *
     * @return none
     */
    function _setFilterForm()
    {
        // create user object
        $user   =& User::singleton();
        $config =& NDB_Config::singleton();

        // PSC
        if ($user->hasPermission('view_biobanking')) {
            // get the list of study sites - to be replaced by the Site object
            $list_of_sites = Utility::getSiteList();
            if (is_array($list_of_sites)) {
                $list_of_sites = array('' => 'All') + $list_of_sites;
            }
        } else {
            // allow only to view own site data
            $site =& Site::singleton($user->getData('CenterID'));
            if ($site->isStudySite()) {
                $list_of_sites = array();
                $list_of_sites[$user->getData('CenterID')]
                    = $user->getData('Site');
            }
        }

        //=========================
        // Get sample types in DB
        //=========================
        $db =& Database::singleton();
        $rows = $db->pselect(
            "SELECT id, type FROM biospecimen_type",
            array()
        );
        
        $ids   = array();
        $types = array();
        foreach($rows as $r) {
            $ids[] = $r['id'];
            $types[$r['id']] = $r['type'];
        }

        $sample_type_options = array(
            null => ''
        );
        sort($ids);
        foreach($ids as $id) {
            $sample_type_options[$id] = $types[$id];
        }

        //============================
        // Get sample statuses in DB
        //============================
        $rows = $db->pselect(
            "SELECT id, status FROM biospecimen_status",
            array()
        );
        
        $ids      = array();
        $statuses = array();
        foreach($rows as $r) {
            $ids[]              = $r['id'];
            $statuses[$r['id']] = $r['status'];
        }

        $sample_status_options = array(
            null => ''
        );
        sort($ids);
        foreach($ids as $id) {
            $sample_status_options[$id] = $statuses[$id];
        }

        /* Add form elements to object */
        $this->addBasicText('biospecimenId', 'Biospecimen ID', array('maxlength' => 10));
        
        /* Note the hack: resize option is embedded in row specification */
        /*     since LorisForm does not support resize option            */
        $this->addBasicTextArea(
            'pscId', 
            'PSCIDs',
            array(
              'rows'  => '1" style="resize:vertical',
            )
        );
        $this->addSelect('participantType' ,
                         'Mother/Child'    ,
                         array(
                           'none_specified' => '',
                           'family'         => 'Entire family',
                           'child'          => 'Child only',
                           'all_children'   => 'Child and all siblings',
                           'mother'         => 'Mother only',
                           'mother_child'   => 'Mother and child',
                         )
        );
        $this->addBasicText('dob', 'DoB');
        $this->addSelect('sampleType', 'Sample Type', $sample_type_options);
        $this->addBasicText('nbSamples', 'Nb Samples');
        $this->addBasicText('collectionDate', 'Collection Date', array('maxlength' => 10));
        $this->addBasicText('extractionDate', 'Extraction Date', array('maxlength' => 10));
        $this->addSelect('sampleStatus', 'Sample Status', $sample_status_options);

        return true;
    }

    function _addValidFilters($prepared_key, $field, $val)
    {
        $sql = " AND :v_$prepared_key='$val' AND ";

        if($field == 'b.subject_dob') {
		    return $sql . "b.subject_dob IS NOT NULL AND b.subject_dob = STR_TO_DATE(:v_$prepared_key, '%d-%M-%Y')";	
		}
		
        if($field == 'b.collection_date') {
		    return $sql . "b.collection_date IS NOT NULL AND b.collection_date = STR_TO_DATE(:v_$prepared_key, '%d-%M-%Y')";	
		}

        if($field == 'b.extraction_date') {
		    return $sql . "b.extraction_date IS NOT NULL AND b.extraction_date = STR_TO_DATE(:v_$prepared_key, '%d-%M-%Y')";	
		}

        // This is the case where only the participant type is specified
        // Note that there is *always* a participant_type constraint specified
        // For the case where there is also a constraint on the pscid, see
        // (if $field == 'subject_id')
        if($field == 'participant_type') {
            switch($val) {
                case 'mother'        : return $sql . "b.subject_id LIKE '%M'";
                case 'child'         : return $sql . "b.subject_id NOT LIKE '%M' AND b.subject_id IN (SELECT index_child_pscid FROM index_child)";
                case 'all_children'  : return $sql . "b.subject_id NOT LIKE '%M'";
                case 'mother_child'  : 
                case 'family'        : 
                case 'none_specified': return $sql . "1=1";
            }
        }
        
        if($field == 'b.subject_id') {
            $noneSpecified   = "CONCAT(' ', REPLACE(:v_$prepared_key,'\r\n',''), ' ') REGEXP(CONCAT(' ', b.subject_id, ' '))";
            $indexChildPscid = "(SELECT index_child_pscid FROM index_child"
                             . " WHERE CONCAT(' ', REPLACE(:v_$prepared_key,'\r\n',''), ' ') REGEXP(CONCAT(' ', pscid, ' ')))";
            $child           = "b.subject_id IN $indexChildPscid";
            $mother         = "b.subject_id REGEXP('M$') AND TRIM(TRAILING 'M' FROM b.subject_id) IN $indexChildPscid";
            $allChildren    = "   b.subject_id IN $indexChildPscid "
                            . "OR b.subject_id IN (SELECT pscid FROM index_child WHERE CONCAT(' ', REPLACE(:v_$prepared_key,'\r\n',''), ' ') REGEXP(CONCAT(' ', index_child_pscid, ' ')))";
            $motherChild    = "($child OR $mother)";
            $family         = "($mother OR $allChildren)";
 
            $pkParticipantType = Utility::getCleanString('participant_type');

            $sql .= "IF(:v_$pkParticipantType='none_specified', $noneSpecified, "
                 .  "   IF(:v_$pkParticipantType='mother', $mother, "
                 .  "      IF(:v_$pkParticipantType='family', $family, "
                 .  "         IF(:v_$pkParticipantType='mother_child', $motherChild, "
                 .  "            IF(:v_$pkParticipantType='all_children', $allChildren, "
                 .  "               IF(:v_$pkParticipantType='child', $child, 0))))))";
            return $sql;
        }
        
        return parent::_addValidFilters($prepared_key, $field, $val);
    }


    function getJSDependencies()
    {
        $factory = NDB_Factory::singleton();
        $baseURL = $factory->settings()->getBaseURL();
        $deps    = parent::getJSDependencies();
        return array_merge(
            $deps,
            array(
             $baseURL . "/js/advancedMenu.js",
             $baseURL . "/biobanking/js/biobanking_helper.js",
             $baseURL . "/biobanking/js/biospecimenSearchColumnFormatter.js",
            )
        );
    }
}
?>
