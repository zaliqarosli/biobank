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
class Biospecimen
{
    var $biospecimen = null;

    function __construct(string $id)
    {
        $this->biospecimen =& _getBiospecimenDetails($id);

        if(is_null($this->biospecimen)) {
            throw new InvalidArgumentException("Cannot build biospecimen object with id $id");
        }
    }

    function _getBiospecimenDetails(string $id)
    {
        if(!is_null($this->biospecimen)) {
            return $this->biospecimen;
        }

        $db          =& Database::singleton();
        $biospecimen = $db->pselect(
            "SELECT 
                 b.*, 
                 c.pscid, 
                 c.dob, 
                 if(c.pscid LIKE '%-M', 'Mother', 'Child') as participant_type, 
                 p.name AS project_name, 
                 bt.description as sample_type
             FROM biospecimen b 
             JOIN candidate c ON (c.candid=b.candid)
             JOIN Project p ON (p.projectid=c.projectid)
             JOIN biospecimen_sample_type bt ON (bt.id=b.sample_type_id)
             WHERE b.id=:id",
            $params  = array('id' => $id)
        );

        return $biospecimen;
    }

    function getId()
    {
        return $this->biospecimen['id'];
    }

    function getParticipantCandid()
    {
        return $this->biospecimen['candid'];
    }

    function getParticipantPscid()
    {
        return $this->biospecimen['pscid'];
    }

    function getParticipantDob()
    {
        return $this->biospecimen['dob'];
    }

    function getParticipantType()
    {
        return $this->biospecimen['participant_type'];
    }

    function getProject()
    {
        return $this->biospecimen['project_name'];
    }

    function getSampleType()
    {
        switch($this->biospecimen['sample_type']) {
        case '1':
            return 'Buccal Swabs';
        case '2':
            return 'Buccal Stock';
        case '3':
            return 'Buccal Dilution';
        case '4':
            return 'Saliva Swabs';
        case '5':
            return 'Saliva Stock';
        case '6':
            return 'Saliva Dilution';
        case '7':
            return 'Oragene Swabs';
        case '8':
            return 'Oragene Stock';
        case '9':
            return 'Oragene Dilution';
        default throw new IllegalArgumentException("Unexpected sample type id {$this->biospecimen['sample_type']}");
        }
    }

    function getNbSamples()
    {
        return $this->biospecimen['nb_samples'];
    }

    function getCollectionDate()
    {
        return $this->biospecimen['collection_date'];
    }

    function getExtractionDate()
    {
        return $this->biospecimen['extraction_date'];
    }

    function getSampleStatus()
    {
        return $this->biospecimen['sample_status'];
    }

    function getStorageLocation()
    {
        return $this->biospecimen['storage_location'];
    }

    function getBatchName()
    {
        return $this->biospecimen['batch_name'];
    }

    function getProtocol()
    {
        return $this->biospecimen['protocol'];
    }

    function getElutionVolume()
    {
        return $this->biospecimen['elution_volume'];
    }

    function getPassFail()
    {
        return $this->biospecimen['pass_fail'];
    }

    function getDnaConcentration()
    {
        return $this->biospecimen['dna_concentration'];
    }

    function getTwoSixtyTwoEighty()
    {
        return $this->biospecimen['two_sixty_two_eighty'];
    }

    function getSampleVolume()
    {
        return $this->biospecimen['sample_volume'];
    }

    function getDnaAmount()
    {
        return $this->biospecimen['dna_amount'];
    }

    function getAnalysisType()
    {
        return $this->biospecimen['analysis_type'];
    }

    function getExperimentalName()
    {
        return $this->biospecimen['experimental_name'];
    }

    function getTechnicalBatchNum()
    {
        return $this->biospecimen['technical_batch_num'];
    }

    function getSampleName()
    {
        return $this->biospecimen['sample_name'];
    }

    function getChipPosition()
    {
        return $this->biospecimen['chip_position'];
    }

    function getSentrixId()
    {
        return $this->biospecimen['sentrix_id'];
    }

    function setParticipantPscid($pscid)
    {
        $this->biospecimen['candid'];
        $this->biospecimen['pscid'];
        $this->biospecimen['dob'];
        $this->biospecimen['participant_type'];
        $this->biospecimen['project_name'];
    }

    function setSampleTypeId($sampleTypeId)
    {
        $this->biospecimen['sample_type_id'] = $sampleTypeId;
    }

    function setNbSamples($nbSamples)
    {
        $this->biospecimen['nb_samples'] = $nbSamples;
    }

    function setCollectionDate($collectionDate)
    {
        $this->biospecimen['collection_date'] = $collectionDate;
    }

    function setExtractionDate($extractionDate)
    {
        $this->biospecimen['extraction_date'] = $extractionDate;
    }

    function setSampleStatus($sampleStatus)
    {
        $this->biospecimen['sample_status'] = $sampleStatus;
    }

    function setBatchName($batchName)
    {
        $this->biospecimen['batch_name'] = $batchName;
    }

    function setProtocol($protocol)
    {
        $this->biospecimen['protocol'] = $protocol;
    }

    function setElutionVolume($elutionVolume)
    {
        $this->biospecimen['elution_volume'] = $elutionVolume;
    }

    function setPassFail($passFail)
    {
        $this->biospecimen['pass_fail'] = $passFail;
    }

    function setDnaConcentration($dnaConcentration)
    {
        $this->biospecimen['dna_concentration'] = $dnaConcentration;
    }

    function setTwoSixtyTwoEighty($twoSixtyTwoEighty)
    {
        $this->biospecimen['two_sixty_two_eighty'] = $twoSixtyTwoEighty;
    }

    function setSampleVolume($sampleVolume)
    {
        $this->biospecimen['sample_volume'] = $sampleVolume;
    }

    function setTotalVolume($dnaAmount)
    {
        $this->biospecimen['dna_amount'] = $dnaAmount;
    }

    function setAnalysisType($analysisType)
    {
        $this->biospecimen['analysis_type'] = $analysisType;
    }

    function setExperimentalName($experimentalName)
    {
        $this->biospecimen['experimental_name'] = $experimentalName;
    }

    function setTechnicalBatchNum($technialBatchNum)
    {
        $this->biospecimen['technical_batch_num'] = $technicalBatchNum;
    }

    function setSampleName($sampleName)
    {
        $this->biospecimen['sample_name'] = $sampleName;
    }

    function setChipPosition($chipPosition)
    {
        $this->biospecimen['chip_position'] = $chipPosition;
    }

    function setSentrixId($sentrixId)
    {
        $this->biospecimen['sentrix_id'] = $sentrixId;
    }

    function update()
    {
        $db =& Database::singleton();

        $set = array(
                'candid'               => $this->biospecimen['candid'],
                'sample_type_id'       => $this->biospecimen['sample_type_id'],
                'nb_samples'           => $this->biospecimen['nb_samples'],
                'collection_date'      => $this->biospecimen['collection_date'],
                'extraction_date'      => $this->biospecimen['extraction_date'],
                'sample_status'        => $this->biospecimen['sample_status'],
                'storage_locaton'      => $this->biospecimen['storage_locaton'],
                'batch_name'           => $this->biospecimen['batch_name'],
                'protocol'             => $this->biospecimen['protocol'],
                'elution_volume'       => $this->biospecimen['elution_volume'],
                'pass_fail'            => $this->biospecimen['pass_fail'],
                'dna_concentration'    => $this->biospecimen['dna_concentration'],
                'two_sixty_two_eighty' => $this->biospecimen['two_sixty_two_eighty'],
                'sample_volume'        => $this->biospecimen['sample_volume'],
                'total_volume'         => $this->biospecimen['total_volume'],
                'analysis_type'        => $this->biospecimen['analysis_type'],
                'experimental_name'    => $this->biospecimen['experimental_name'],
                'technical_batch_num'  => $this->biospecimen['technical_batch_num'],
                'sample_name'          => $this->biospecimen['sample_name'],
                'chip_position'        => $this->biospecimen['chip_position'],
                'sentrix_id'           => $this->biospecimen['sentrix_id'],
               );

        $db->update('biospecimen', $set, $this->biospecimen['id']);
    }
}
?>
