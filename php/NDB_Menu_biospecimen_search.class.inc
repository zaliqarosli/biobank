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
                          'b.biospecimen_id',
                          'b.zepsom_id',
                          "DATE_FORMAT(c.dob, '%d-%b-%Y') as DoB",
                          'bt.label',
                          'b.nb_samples',
                          "DATE_FORMAT(b.collection_date, '%d-%b-%Y')",
                          'bs.status as status',
                          "CONCAT(f.type,"
                        . "       ' / Box ',"     
                        . "       b.box_id,"
                        . "       ' / ',"
                        . "       b.box_coordinates"
                        . ") AS Location"
                      );
       if ($useProjects) {
            array_splice($this->columns, 4, 0, "p.Name");
        }

       $this->headers = array(
           'Biospecimen ID',
           'Zepsom ID',
           'DoB',
           'Type',
           'Qty.',
           'Collected On',
           'Status',
           'Location',
       );
       if ($useProjects) {
            array_splice($this->headers, 4, 0, "Project");
        }


       # $this->columns =array_merge(
       #     $this->columns,
       #     array(
       #      'DATE_FORMAT(c.DoB,\'%Y-%m-%d\') AS DoB',
       #     )
       # );
       $this->formToFilter = array(
	           'biospecimenId'   => 'b.biospecimen_id',
               'zepsomId'        => 'b.zepsom_id',
               'dob'             => 'DoB',
	           'sampleType'      => 'b.specimen_type',
               'collectionDate'  => 'b.collection_date',
               'sampleStatus'    => 'b.status_id',
       );

       $this->validFilters = array(
	           'b.biospecimen_id',
	           'b.zepsom_id',
               'DoB',
	           'b.specimen_type',
               'b.collection_date',
               'b.status_id',
        );

        $this->query = " FROM biospecimen b"
                       . " JOIN biospecimen_type bt ON (bt.specimen=b.specimen_type)"
                       . " JOIN biospecimen_status bs ON (bs.id=b.status_id)"
                       . " JOIN candidate c ON (c.externalId=b.zepsom_id)"
                       . " JOIN freezer f ON (f.id=b.freezer_id)";
        if ($useProjects) {
            $this->query .= " JOIN Project p ON (p.ProjectID=b.project_id)";
        }
 
        $this->order_by = 'b.zepsom_id, b.biospecimen_id, b.specimen_type';

        # Define filters to be used. May need to add more later.
        # TODO: Look up filters for numerical ranges, e.g. the `quantity_on_hand` field.
        $this->EqualityFilters    = array(
                                     'b.biospecimen_id',
                                     'b.zepsom_id',
                                     'b.specimen_type',
                                     'DoB',
                                     'b.collection_date',
                                     'b.status_id'
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

        //=========================
        // Get sample types in DB
        //=========================
        $db =& Database::singleton();
        $rows = $db->pselect(
            "SELECT specimen, label FROM biospecimen_type",
            array()
        );
        
        $types = array();
        foreach($rows as $r) {
            $types[$r['specimen']] = $r['label'];
        }

        $sample_type_options = array(
            null => ''
        );
        foreach($types as $id => $label) {
            $sample_type_options[$id] = $label;
        }

        //============================
        // Get sample statuses in DB
        //============================
        $rows = $db->pselect(
            "SELECT id, status FROM biospecimen_status",
            array()
        );
        
        $statuses = array();
        foreach($rows as $r) {
            $statuses[$r['id']] = $r['status'];
        }

        $sample_status_options = array(
            null => ''
        );
        foreach($statuses as $id => $status) {
            $sample_status_options[$id] = $status;
        }

        /* Add form elements to object */
        $this->addBasicText('biospecimenId', 'Biospecimen ID', array('maxlength' => 10));
        
        /* Note the hack: resize option is embedded in row specification */
        /*     since LorisForm does not support resize option            */
        $this->addBasicTextArea(
            'zepsomId', 
            'Zepsom Id',
            array(
              'rows'  => '1" style="resize:vertical',
            )
        );

        $this->addBasicText('dob', 'DoB');
        $this->addSelect('sampleType', 'Sample Type', $sample_type_options);
        $this->addBasicText('nbSamples', 'Nb Samples');
        $this->addBasicText('collectionDate', 'Collection Date', array('maxlength' => 10));
        $this->addSelect('sampleStatus', 'Sample Status', $sample_status_options);

        return true;
    }

    function _addValidFilters($prepared_key, $field, $val)
    {
        if($field == 'DoB') {
		    return " AND DoB IS NOT NULL AND DoB = STR_TO_DATE(:v_$prepared_key, '%d-%M-%Y')";	
		}
		
        if($field == 'b.collection_date') {
		    return " AND b.collection_date IS NOT NULL AND b.collection_date = STR_TO_DATE(:v_$prepared_key, '%d-%M-%Y')";	
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
             $baseURL . "/biobanking/js/biospecimenSearchColumnFormatter.js",
            )
        );
    }
}
?>
