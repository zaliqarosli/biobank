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

    function getSumNbSamplesSQL($type, $status, $varName, $equals=true) 
    {
        if(is_null($status)) {
            return "SUM(IF(bt.type='$type', nb_samples, 0)) as $varName";
        }

        return $equals 
            ? "SUM(IF(bt.type ='$type' AND bs.status = '$status', nb_samples,0)) AS $varName"
            : "SUM(IF(bt.type ='$type' AND bs.status LIKE '$status%', nb_samples,0)) AS $varName";
    }

    function getQuotedString($s) {
        return "'$s'";
    }

    function getExistsSQL($type, $status=null, $varName=null)
    {
        $sql  = "(EXISTS(SELECT 1 FROM biospecimen b2";

        if(!is_null($type) && !is_null($status)) {
            $quotedStatus = array_map(array($this, 'getQuotedString'), $status);
            $sql .= " JOIN biospecimen_type bt2 ON (bt2.id=b2.type_id)" 
              .     " JOIN biospecimen_status bs2 ON (bs2.id=b2.status_id)"
              .     " WHERE bt2.type='$type' AND bs2.status IN (" . implode(',', $quotedStatus) . ')';
        } elseif(!is_null($type)) {
            $sql .= " JOIN biospecimen_type bt2 ON (bt2.id=b2.type_id)" 
              .     " WHERE bt2.type='$type'";
        } elseif(!is_null($status)) {
            $quotedStatus = array_map(array($this, 'getQuotedString'), $status);
            $sql .= " JOIN biospecimen_status bs2 ON (bs2.id=b2.status_id)"
              .     " WHERE bs2.status IN (" . implode(',', $quotedStatus) . ')';
        } else {
            throw new LorisException("Parameters status and type for method getExistsSql cannot both be null");
        }

        $sql .= " AND b2.subject_id=b.subject_id))";

        if(!is_null($varName)) {
            $sql .= " AS $varName";
        }

        return $sql;
    }

    function getExistsWithStatusSql($type, $status, $varName=null) {
        return is_null($status)
             ? $this->getExistsSQL($type, $status, $varName)
             : $this->getExistsSQL($type, array($status), $varName);
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
                          'DISTINCT b.subject_id',
                          'if(b.subject_id LIKE "%M", "Mother", "Child") as participant_type',
                          "DATE_FORMAT(b.subject_dob, '%d-%b-%Y')"
                      );
       if ($useProjects) {
            $this->columns[] = 'p.Name as project';
       }

       //==============================================//
       // Buccal samples related queries (col. 4-13)   //
       //==============================================//
       $this->columns[]  = $this->getSumNbSamplesSQL('Buccal Swabs', 'Available', 'buccal_swabs_available');            
       $this->columns[]  = $this->getSumNbSamplesSQL('Buccal Swabs', 'Extracted', 'buccal_swabs_extracted');


       $this->columns[]  = $this->getSumNbSamplesSQL('Buccal DNA Stock', 'Available', 'buccal_dna_available');
       $this->columns[]  = $this->getSumNbSamplesSQL('Buccal DNA Stock', 'Sent'     , 'buccal_dna_sent', false);
       $this->columns[]  = $this->getSumNbSamplesSQL('Buccal DNA Stock', 'Data'     , 'buccal_dna_data', false);
       $this->columns[]  = $this->getSumNbSamplesSQL('Buccal DNA Stock', 'Depleted' , 'buccal_dna_depleted');

       $this->columns[]  = $this->getSumNbSamplesSQL('Buccal DNA Dilution', 'Available', 'buccal_dil_available');
       $this->columns[]  = $this->getSumNbSamplesSQL('Buccal DNA Dilution', 'Sent'     , 'buccal_dil_sent', false);
       $this->columns[]  = $this->getSumNbSamplesSQL('Buccal DNA Dilution', 'Data'     , 'buccal_dil_data', false);
       $this->columns[]  = $this->getSumNbSamplesSQL('Buccal DNA Dilution', 'Depleted' , 'buccal_dil_depleted');


       //===============================================//
       // Oragene samples related queries  (col. 14-23) //
       //===============================================//
       $this->columns[]  = $this->getSumNbSamplesSQL('Oragene Tube', 'Available', 'oragene_tube_available');
       $this->columns[]  = $this->getSumNbSamplesSQL('Oragene Tube', 'Extracted', 'oragene_tube_extracted');

       $this->columns[]  = $this->getSumNbSamplesSQL('Oragene DNA Stock', 'Available', 'oragene_dna_available');
       $this->columns[]  = $this->getSumNbSamplesSQL('Oragene DNA Stock', 'Sent'     , 'oragene_dna_sent', false);
       $this->columns[]  = $this->getSumNbSamplesSQL('Oragene DNA Stock', 'Data'     , 'oragene_dna_data', false);
       $this->columns[]  = $this->getSumNbSamplesSQL('Oragene DNA Stock', 'Depleted' , 'oragene_dna_depleted');

       $this->columns[]  = $this->getSumNbSamplesSQL('Oragene DNA Dilution', 'Available', 'oragene_dil_available');
       $this->columns[]  = $this->getSumNbSamplesSQL('Oragene DNA Dilution', 'Sent'     , 'oragene_dil_sent', false);
       $this->columns[]  = $this->getSumNbSamplesSQL('Oragene DNA Dilution', 'Data'     , 'oragene_dil_data', false);
       $this->columns[]  = $this->getSumNbSamplesSQL('Oragene DNA Dilution', 'Depleted' , 'oragene_dil_depleted');

       //==================================================//
       // Blood DNA samples related queries  (col. 24-33)  //
       //==================================================//
       $this->columns[]  = $this->getSumNbSamplesSQL('EDTA Tube', 'Available', 'blood_dna_tube_available');
       $this->columns[]  = $this->getSumNbSamplesSQL('EDTA Tube', 'Extracted', 'blood_dna_tube_extracted');

       $this->columns[]  = $this->getSumNbSamplesSQL('gDNA (blood) Stock', 'Available', 'blood_dna_stock_available');
       $this->columns[]  = $this->getSumNbSamplesSQL('gDNA (blood) Stock', 'Sent'     , 'blood_dna_stock_sent ', false);
       $this->columns[]  = $this->getSumNbSamplesSQL('gDNA (blood) Stock', 'Data'     , 'blood_dna_stock_data', false);
       $this->columns[]  = $this->getSumNbSamplesSQL('gDNA (blood) Stock', 'Depleted' , 'blood_dna_stock_depleted');

       $this->columns[]  = $this->getSumNbSamplesSQL('gDNA (blood) Dilution', 'Available', 'blood_dna_dil_available');
       $this->columns[]  = $this->getSumNbSamplesSQL('gDNA (blood) Dilution', 'Sent'     , 'blood_dna_dil_sent');
       $this->columns[]  = $this->getSumNbSamplesSQL('gDNA (blood) Dilution', 'Data'     , 'blood_dna_dil_data');
       $this->columns[]  = $this->getSumNbSamplesSQL('gDNA (blood) Dilution', 'Depleted' , 'blood_dna_dil_depleted');

       //==================================================//
       // Blood RNA samples related queries (col. 34-43)   //
       //==================================================//
       $this->columns[]  = $this->getSumNbSamplesSQL('Paxgene Tube', 'Available', 'blood_rna_tube_available');
       $this->columns[]  = $this->getSumNbSamplesSQL('Paxgene Tube', 'Extracted', 'blood_rna_tube_extracted');

       $this->columns[]  = $this->getSumNbSamplesSQL('Paxgene RNA Stock', 'Available', 'blood_rna_stock_available');
       $this->columns[]  = $this->getSumNbSamplesSQL('Paxgene RNA Stock', 'Sent'     , 'blood_rna_stock_sent ', false);
       $this->columns[]  = $this->getSumNbSamplesSQL('Paxgene RNA Stock', 'Data'     , 'blood_rna_stock_data', false);
       $this->columns[]  = $this->getSumNbSamplesSQL('Paxgene RNA Stock', 'Depleted' , 'blood_rna_stock_depleted');

       $this->columns[]  = $this->getSumNbSamplesSQL('Paxgene RNA Aliquot', 'Available', 'blood_rna_dil_available');
       $this->columns[]  = $this->getSumNbSamplesSQL('Paxgene RNA Aliquot', 'Sent'     , 'blood_rna_dil_sent');
       $this->columns[]  = $this->getSumNbSamplesSQL('Paxgene RNA Aliquot', 'Data'     , 'blood_rna_dil_data');
       $this->columns[]  = $this->getSumNbSamplesSQL('Paxgene RNA Aliquot', 'Depleted' , 'blood_rna_dil_depleted');

       //===============================================//
       // Saliva samples related queries (col. 44-49)   //
       //===============================================//
       $this->columns[]  = $this->getSumNbSamplesSQL('Saliva Stock', 'Available', 'saliva_stock_available');
       $this->columns[]  = $this->getSumNbSamplesSQL('Saliva Stock', 'Extracted', 'saliva_stock_extracted');

       $this->columns[]  = $this->getSumNbSamplesSQL('Aliquot', 'Available', 'aliquot_available');
       $this->columns[]  = $this->getSumNbSamplesSQL('Aliquot', 'Sent'     , 'aliquot_sent ', false);
       $this->columns[]  = $this->getSumNbSamplesSQL('Aliquot', 'Data'     , 'aliquot_data', false);
       $this->columns[]  = $this->getSumNbSamplesSQL('Aliquot', 'Depleted' , 'aliquot_depleted');


       //====================================//
       // Data related queries (col. 50-51)  //
       //====================================//
       $this->columns[] = $this->getExistsSql(null, array('Data available (M)', 'Data available (G+M)'), 'meth_data');
       $this->columns[] = $this->getExistsSql(null, array('Data available (G)', 'Data available (G+M)'), 'geno_data');

       $this->headers = array(
           'Pscid',
           'M/C',
           'Dob',
           'Project',
           'Buccal',
           'Oragene',
           'Blood DNA',
           'Blood RNA',
           'Saliva',
           '5MC',
           'Genotype'
       );
       $this->formToFilter = array(
               'pscId_1'           => 'subject_id',
               'dob_1'             => 'subject_dob',
               'participantType_1' => 'participant_type',   
               'buccalSample_1'    => 'buccal',
               'orageneSample_1'   => 'oragene',
               'salivaSample_1'    => 'saliva',
               'bloodDnaSample_1'  => 'bloodDNA',
               'bloodRnaSample_1'  => 'bloodRNA',
               'data_1'            => 'data',
               'project_1'         => 'p.ProjectID'
       );

       $this->validFilters = array(
               'subject_id',
               'subject_dob',
               'participant_type',
               'buccal',
               'oragene',
               'saliva',
               'bloodDNA',
               'bloodRNA',
               'data',
               'p.ProjectID'
        );

        $this->query =   " FROM biospecimen b"
                       . " JOIN Project p             ON (p.ProjectID=b.project_id)"
                       . " JOIN biospecimen_type bt   ON (bt.id=b.type_id)"
                       . " JOIN biospecimen_status bs ON (bs.id=b.status_id)"
                       . " WHERE 1=1";

        # Define filters to be used. May need to add more later.
        # TODO: Look up filters for numerical ranges, e.g. the `quantity_on_hand` field.
        $this->EqualityFilters    = array(
                                     'p.ProjectID'
        );

        /* TODO: Not sure if any of this commented code is relevant. */
#        if ($useProjects) {
#            $this->formToFilter = array_merge(
#                $this->formToFilter,
#                array('ProjectID' => 'c.ProjectID')
#            );
#        }
#        $this->formToFilter = array_merge(
#            $this->formToFilter,
#            array(
#             'dob'                 => 'c.DoB',
#            )
#        );
        $this->group_by = "b.subject_id";
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

        $db =& Database::singleton();

        //=========================
        // Get sample types in DB
        //=========================
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
            null => 'All'
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
            null => 'All'
        );
        sort($ids);
        foreach($ids as $id) {
            $sample_status_options[$id] = $statuses[$id];
        }

        // SubprojectID
        $list_of_subprojects = Utility::getSubprojectList();
        /* List applicable menu filter options for 'select' (dropdown) form elements */

        /* Add form elements to object */
        /* Note the hack: resize option is embedded in row specification */
        /*     since LorisForm does not support resize option            */
        $this->addBasicTextArea(
            'pscId_1', 
            'PSCIDs',
            array(
              'rows'  => '1" style="resize:vertical',
            )
        );
        $this->addBasicText('dob_1', 'DoB');
        $this->addSelect('participantType_1' ,
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

        $this->addSelect(
            'buccalSample_1',
            'Buccal',
            array(
              null              => '',
              'any'             => 'With buccal sample (any)',
              'swabs'           => 'With swabs',
              'swabs_available' => 'With available swabs',
              'dna'             => 'With DNA stock',
              'dna_available'   => 'With available DNA stock',
              'dil'             => 'With DNA dilution',
              'dil_available'   => 'With available DNA dilution',
              'none'            => 'Without any buccal sample'
            )
        );
        $this->addSelect(
            'orageneSample_1',
            'Oragene',
            array(
              null              => '',
              'any'             => 'With oragene sample (any)',
              'tube'            => 'With oragene tube',
              'tube_available'  => 'With available oragene tube',
              'dna'             => 'With DNA stock',
              'dna_available'   => 'With available DNA stock',
              'dil'             => 'With DNA dilution',
              'dil_available'   => 'With available DNA dilution',
              'none'            => 'Without any oragene sample'
            )
        );
        $this->addSelect(
            'salivaSample_1',
            'Saliva',
            array(
              null                => '', 
              'any'               => 'With saliva sample (any)',
              'stock'             => 'With saliva stock',
              'stock_available'   => 'With available saliva stock',
              'aliquot'           => 'With aliquot',
              'aliquot_available' => 'With aliquot available',
              'none'              => 'Without any saliva sample'
            )
        );

        $this->addSelect(
            'bloodDnaSample_1',
            'Blood DNA', 
            array(
              null   => '',
              'any'             => 'With blood DNA sample (any)',
              'tube'            => 'With EDTA tube',
              'tube_available'  => 'With available EDTA tube',
              'dna'             => 'With gDNA stock',
              'dna_available'   => 'With available gDNA stock',
              'dil'             => 'With gDNA dilution',
              'dil_available'   => 'With available gDNA dilution',
              'none'            => 'Without any blood DNA sample'
            )
        );

        $this->addSelect(
            'bloodRnaSample_1',
            'Blood RNA', 
            array(
              null                => '',
              'any'               => 'With blood RNA sample (any)',
              'tube'              => 'With Paxgene tube',
              'tube_available'    => 'With available Paxgene tube',
              'rna'               => 'With RNA stock',
              'rna_available'     => 'With available RNA stock',
              'aliquot'           => 'With RNA Aliquot',
              'aliquot_available' => 'With available RNA Aliquot',
              'none'              => 'Without any blood RNA sample'
            )
        );

        $this->addSelect(
            'data_1',
            'Data',
            array(
                null                   => '',
                'none'                 => 'None',
                '5mc'                  => '5MC only',
                'genotype'             => 'Genotype only',
                '5mc_or_genotype'      => '5MC, genotype or both',
                '5mc_and_genotype'     => '5MC and Genotype',
                'cystokine'            => 'Cytokine only',
                'steroid'              => 'Steroid only',
                'cytokine_or_steroid'  => 'Cytokine, steroid or both',
                'cytokine_and_steroid' => 'Cytokine and steroid'
             )
        );

        $useProjects = $config->getSetting("useProjects");
        if($useProjects !== 'false') {
            $rows = $db->pselect(
                "SELECT ProjectID, Name FROM Project",
                array()
            );
            $projects = array();
            foreach($rows as $r) {
                $projects[$r['ProjectID']] = $r['Name'];
            }
            $this->addSelect('project_1', 'Project' , $projects);
        }

        return true;
    }

    function _addValidFilters($prepared_key, $field, $val)
    {
        $sql = " AND :v_$prepared_key='$val' AND ";

        if($field == 'subject_dob') {
		    return $sql . "b.subject_dob IS NOT NULL AND b.subject_dob = STR_TO_DATE(:v_$prepared_key, '%d-%M-%Y')";	
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

        if($field == 'buccal') {
            switch($val) {
                case 'swabs'          : $sql .= $this->getExistsSQL('Buccal Swabs'       ); break;
                case 'dna'            : $sql .= $this->getExistsSQL('Buccal DNA Stock'   ); break;
                case 'dil'            : $sql .= $this->getExistsSQL('Buccal DNA Dilution'); break;
                case 'swabs_available': $sql .= $this->getExistsWithStatusSQL('Buccal Swabs'       , 'Available'); break;
                case 'dna_available'  : $sql .= $this->getExistsWithStatusSQL('Buccal DNA Stock'   , 'Available'); break;
                case 'dil_available'  : $sql .= $this->getExistsWithStatusSQL('Buccal DNA Dilution', 'Available'); break;
                case 'none'           :
                case 'any'            : $swabsSql = $this->getExistsSQL('Buccal Swabs'       );
                                        $dnaSql   = $this->getExistsSQL('Buccal DNA Stock'   );
                                        $dilSql   = $this->getExistsSQL('Buccal DNA Dilution');
                                        $anySql   = "($swabsSql OR $dnaSql OR $dilSql)";
                                        $sql     .= $val == 'any' ? $anySql : "NOT $anySql"            ; break;
                default               : throw new LorisException("Unexpected buccal sample filter value $val");
            }

            return $sql;
        }

        if($field == 'oragene') {
            switch($val) {
                case 'tube'          : $sql .= $this->getExistsSQL('Oragene Tube'        ); break;
                case 'dna'           : $sql .= $this->getExistsSQL('Oragene DNA Stock'   ); break;
                case 'dil'           : $sql .= $this->getExistsSQL('Oragene DNA Dilution'); break;
                case 'tube_available': $sql .= $this->getExistsWithStatusSQL('Oragene Tube'        , 'Available'); break;
                case 'dna_available' : $sql .= $this->getExistsWithStatusSQL('Oragene DNA Stock'   , 'Available'); break;
                case 'dil_available' : $sql .= $this->getExistsWithStatusSQL('Oragene DNA Dilution', 'Available'); break;
                case 'none'          :
                case 'any'           : $tubesSql = $this->getExistsSQL('Oragene Tube'        );
                                       $dnaSql   = $this->getExistsSQL('Oragene DNA Stock'   );
                                       $dilSql   = $this->getExistsSQL('Oragene DNA Dilution');
                                       $anySql   = "($tubesSql OR $dnaSql OR $dilSql)";
                                       $sql     .= $val == 'any' ? $anySql : "NOT $anySql"             ; break;
                default              : throw new LorisException("Unexpected oragene sample filter value $val");
            }

            return $sql;
        }

        if($field == 'bloodDNA') {
            switch($val) {
                case 'tube'          : $sql .= $this->getExistsSQL('EDTA Tube'); break;
                case 'dna'           : $sql .= $this->getExistsSQL('gDNA (blood) Stock'); break;
                case 'dil'           : $sql .= $this->getExistsSQL('gDNA (blood) Dilution'); break;
                case 'tube_available': $sql .= $this->getExistsWithStatusSQL('EDTA Tube', 'Available'); break;
                case 'dna_available' : $sql .= $this->getExistsWithStatusSQL('gDNA (blood) Stock', 'Available'); break;
                case 'dil_available' : $sql .= $this->getExistsWithStatusSQL('gDNA (blood) Dilution', 'Available'); break;
                case 'none'          :
                case 'any'           : $tubesSql = $this->getExistsSQL('EDTA Tube');
                                       $dnaSql   = $this->getExistsSQL('gDNA (blood) Stock');
                                       $dilSql   = $this->getExistsSQL('gDNA (blood) Dilution');
                                       $anySql   = "($tubesSql OR $dnaSql OR $dilSql)";
                                       $sql     .= $val == 'any' ? $anySql : "NOT $anySql"              ; break;
                default              : throw new LorisException("Unexpected blood DNA sample filter value $val");
            }

            return $sql;
        }

        if($field == 'bloodRNA') {
            switch($val) {
                case 'tube'              : $sql .= $this->getExistsSQL('Paxgene Tube'); break;
                case 'rna'               : $sql .= $this->getExistsSQL('Paxgene RNA Stock'); break;
                case 'aliquot'           : $sql .= $this->getExistsSQL('RNA Aliquot'); break;
                case 'tube_available'    : $sql .= $this->getExistsWithStatusSQL('Paxgene Tube', 'Available'); break;
                case 'rna_available'     : $sql .= $this->getExistsWithStatusSQL('Paxgene RNA Stock', 'Available'); break;
                case 'aliquot_available' : $sql .= $this->getExistsWithStatusSQL('RNA Aliquot', 'Available'); break;
                case 'none'              :
                case 'any'               : $tubesSql = $this->getExistsSQL('EDTA Tube');
                                           $dnaSql   = $this->getExistsSQL('Paxgene RNA Stock');
                                           $dilSql   = $this->getExistsSQL('RNA Aliquot');
                                           $anySql   = "($tubesSql OR $dnaSql OR $dilSql)";
                                           $sql     .= $val == 'any' ? $anySql : "NOT $anySql"          ; break;
                default                  : throw new LorisException("Unexpected blood RNA sample filter value $val");
            }

            return $sql;
        }

        if($field == 'saliva') {
            switch($val) {
                case 'stock'             : $sql .= $this->getExistsSQL('Saliva Stock'); break;
                case 'aliquot'           : $sql .= $this->getExistsSQL('Aliquot'); break;
                case 'stock_available'   : $sql .= $this->getExistsWithStatusSQL('Saliva Stock', 'Available'); break;
                case 'aliquot_available' : $sql .= $this->getExistsWithStatusSQL('Aliquot', 'Available'); break;
                case 'none'              :
                case 'any'               : $stockSql   = $this->getExistsSQL('Saliva Stock');
                                           $aliquotSql = $this->getExistsSQL('Aliquot');
                                           $anySql   = "($stockSql OR $aliquotSql)";
                                           $sql     .= $val == 'any' ? $anySql : "NOT $anySql"     ; break;
                default                  : throw new LorisException("Unexpected saliva sample filter value $val");
            }

            return $sql;
        }

        if($field == 'data') {
            switch($val) {
                case '5mc'                 : $sql .= $this->getExistsSql(null, array('Data available (M)')); break;
                case 'genotype'            : $sql .= $this->getExistsSql(null, array('Data available (G)')); break;
                case '5mc_or_genotype'     : $sql .= $this->getExistsSql(null, array('Data available (G)', 'Data available (M)', 'Data available (G+M)')); break;
                case '5mc_and_genotype'    : $sql .= $this->getExistsSql(null, array('Data available (G+M)')); break;
                case 'cytokine'            : $sql .= $this->getExistsSql(null, array('Cytokine')); break;
                case 'steroid'             : $sql .= $this->getExistsSql(null, array('Steroid')); break;
                case 'cytokine_or_steroid' : $sql .= $this->getExistsSql(null, array('Cytokine', 'Steroid')); break;
                case 'cytokine_and_steroid': $sql .= $this->getExistsSql(null, array('Cytokine')) 
                                                  . ' AND ' . $this->getExistsSql(null, array('Steroid')); break;
                case 'none'                : $sql .= " NOT " 
                                                  . $this->getExistsSql(
                                                        null, 
                                                        array(
                                                          'Data available (G)',
                                                          'Data available (M)',
                                                          'Data available (G+M)',
                                                          'Cytokine',
                                                          'Steroid',
                                                          'Data available'
                                                        )
                                                    ); break;
                default                    : throw new LorisException("Unexpected data filter value $val");
            }

            return $sql;
        }

        if($field == 'subject_id') {
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
            $mother         = "b.subject_id REGEXP('M$') AND TRIM(TRAILING 'M' FROM b.subject_id) IN $indexChildPscid";
            $allChildren    = "   b.subject_id IN $indexChildPscid "
                            . "OR b.subject_id IN (SELECT pscid FROM index_child WHERE CONCAT(' ', REPLACE(:v_$prepared_key,'\r\n', ''), ' ') LIKE(CONCAT('% ', index_child_pscid, ' %')))";
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
             $baseURL . "/biobanking/js/biobanking_helper.js",
            )
        );
    }
}
?>
