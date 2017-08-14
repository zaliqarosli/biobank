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
class NDB_Menu_Filter_biobanking extends NDB_Menu_Filter
{
    var $AjaxModule = true;

    /**
     * Overloading this method to allow access to site users (their own site only)
     * and users w/ multisite privs
     *
     * @return true if user has access, false otherwise
     */
    function _hasAccess()
    {
        // TODO: Create biobanking-specific permissions
        $user =& User::singleton();
        $site =& Site::singleton($user->getData('CenterID'));
        $this->tpl_data['view_biobanking']    = $user->hasPermission('view_biobanking');
        $this->tpl_data['edit_biobanking']    = $user->hasPermission('edit_biobanking');
        $this->tpl_data['upload_biobanking']  = $user->hasPermission('upload_biobanking');
        
        return $user->hasPermission('view_biobanking');
    }

    function _setFilterForm()
    {
        // create user object
        $user   =& User::singleton();
        $db     = Database::singleton();
        $config =& NDB_Config::singleton();

        $siteList  = Utility::getSiteList(false);
        $visitList = [null => 'Any'] + Utility::getVisitList();

        // allow to view all sites data through filter
        if ($user->hasPermission('access_all_profiles')) {
            // get the list of study sites - to be replaced by the Site object
            if (is_array($siteList)) {
                $siteList = [null => 'Any'] + $siteList;
            }
        } else {
            // allow only to view own site data
            $site =& Site::singleton($user->getData('CenterID'));
            if ($site->isStudySite()) {
                $siteList = [$user->getData('CenterID') => $user->getData('Site')];
            }
        }

        //Adjust to suit us
        //        $instrumentList   = [null => 'Any'];
        //        $instrumentsQuery = $db->pselect(
        //            "SELECT Test_name, Full_name FROM test_names ORDER BY Test_name",
        //            []
        //        );
        //        foreach ($instrumentsQuery as $instrument) {
        //            $instrumentList[$instrument['Test_name']] = $instrument['Full_name'];
        //        }

        //Form Elements
        $this->addBasicTextArea('pscid', 'PSCIDs', array('rows' => '1" style="resize:vertical'));
        $this->addBasicText('dob', 'DoB');

        //==================
        // Specimen Types
        //==================
        $db            =& Database::singleton();
        $query         = "SELECT specimen, label FROM biospecimen_type";
        $rows          = $db->pselect($query, array());
        $specimenTypes = array();
        foreach ($rows as $row) {
            $specimenTypes[$row['specimen']] = $row['label'];
        }

        $this->addSelect(
            'specimen_types',
            'Specimen types',
            $specimenTypes,
            array('multiple')
        );

        $this->tpl_data["hasWritePermission"] = $this->hasWritePermission;

        return true;
    }

    /**
     * Build a list of biospecimen to display in Data Table
     *
     * @return bool
     * @throws DatabaseException
     */
    function _setupVariables()
    {
        $user =& User::singleton();
        // the base query
        $query = " FROM candidate c JOIN biospecimen b ON c.ExternalID=b.zepsom_id JOIN biospecimen_type bt ON b.specimen_type=bt.specimen";
        //        $query .= " WHERE m.hide_file = FALSE";

        // set the class variables
        $this->columns
            = [
               '(SELECT PSCID FROM candidate WHERE ExternalID=b.zepsom_id) as pscid',
               'b.zepsom_id',
               'c.dob as DoB',
               'b.biospecimen_id',
               'bt.label',
               'b.collection_notes',
              ];

        $this->query = $query;

        if (!$user->hasPermission('access_all_profiles')) {
            $this->query .= " AND c.CenterID=" . $user->getCenterID();
        }

        $this->group_by = '';
        $this->order_by = 'pscid';
        $this->headers  = [
                           'PSCID',
                           'Zepsom ID',
                           'DoB',
                           'Biospecimen ID',
                           'Biospecimen Type',
                           'Collection Notes',
                          ];

        // Set header as hidden from the data table
        //        $this->tpl_data['hiddenHeaders'] = json_encode(['Cand ID', 'Session ID']);

        // Add Edit field if user has permissions
        if ($this->hasWritePermission) {
            array_push($this->headers, 'Edit Metadata');
        }

        $this->validFilters = [
                               'c.PSCID',
                               'DoB',
                               'b.specimen_type',
                              ];

        $this->formToFilter = [
                               'pscid'          => 'c.PSCID',
                               'dob'            => 'DoB',
                               'specimen_types' => 'b.specimen_type',
                              ];

        return true;
    }


    /**
     * Create the form for the biobanking menu page
     *
     * @return none
     */
    function _addValidFilters($prepared_key, $field, $val)
    {
        if($field == 'b.specimen_type') {
            $specimenTypeSql .= "";
            for($i=0; $i < count($val); $i++) {
                if($i != 0) {
                    $specimenTypeSql .= " OR ";
                }
                $specimenTypeSql .= "$field = '$val[$i]'";
            }

            return " AND ($specimenTypeSql)";
        }

        if($field == 'DoB') {
            return " AND DoB IS NOT NULL AND DoB = STR_TO_DATE(:v_$prepared_key, '%d-%M-%Y')";
        }

        if($field == 'zepsom_id') {
            //            $noneSpecified   = "b.subject_id = :v_$prepared_key";
            //            $getIndexChildForPK  = "(SELECT index_child_pscid FROM siblings WHERE pscid=:v_$prepared_key)";
            //            $indexChildPscid = "COALESCE($getIndexChildForPK, "
            //                             . "        (SELECT DISTINCT(index_child_pscid) FROM siblings WHERE index_child_pscid =:v_$prepared_key), "
            //                             . "        (SELECT pscid FROM candidate c WHERE c.pscid =:v_$prepared_key))";
            //            $child           = "b.subject_id = $indexChildPscid";
            //            $mother          = "b.subject_id = CONCAT($indexChildPscid, 'M')";
            //            $allChildren    = "   b.subject_id = $indexChildPscid "
            //                            . "OR b.subject_id IN (SELECT pscid FROM siblings WHERE index_child_pscid = $indexChildPscid)";
            //            $motherChild    = "($child OR $mother)";
            //            $family         = "($mother OR $allChildren)";

            //            $pkParticipantType = Utility::getCleanString('participant_type');

            //            $sql .= "IF(:v_$pkParticipantType='none_specified', $noneSpecified, "
            //                 .  "   IF(:v_$pkParticipantType='mother', $mother, "
            //                 .  "      IF(:v_$pkParticipantType='family', $family, "
            //                 .  "         IF(:v_$pkParticipantType='mother_child', $motherChild, "
            //                 .  "            IF(:v_$pkParticipantType='all_children', $allChildren, "
            //                 .  "               IF(:v_$pkParticipantType='child', $child, 0))))))";
            //            $pscidRegexp = "REGEXP(CONCAT('^(', REGEXP_REPLACE(:v_$prepared_key, '[[:space:]]+', '|'), ')$'))";
            //            $pscidRegexp = "CONCAT(' ', :v_$prepared_key, ' ') REGEXP(CONCAT(' ', b.subject_id, ' '))";
            $noneSpecified   = "CONCAT(' ', REPLACE(:v_$prepared_key,'\r\n', ''), ' ') LIKE(CONCAT('% ', b.subject_id, ' %'))";
            $indexChildPscid = "(SELECT index_child_pscid FROM index_child"
                . " WHERE CONCAT(' ', REPLACE(:v_$prepared_key,'\r\n',''), ' ') LIKE(CONCAT('% ', pscid, ' %')))";
            $child           = "b.subject_id IN $indexChildPscid";
            $mother          = "b.subject_id REGEXP('M$') AND TRIM(TRAILING 'M' FROM b.subject_id) IN $indexChildPscid";
            $allChildren     = "   b.subject_id IN $indexChildPscid "
                . "OR b.subject_id IN (SELECT pscid FROM index_child WHERE CONCAT(' ', REPLACE(:v_$prepared_key,'\r\n', ''), ' ') LIKE(CONCAT('% ', index_child_pscid, ' %')))";
            $motherChild     = "($child OR $mother)";
            $family          = "($mother OR $allChildren)";

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
             $baseURL . "/biobanking/js/columnFormatter.js",
            )
        );
    }

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
}
?>
