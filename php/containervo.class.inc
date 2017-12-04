<?php

	/* Container Value Object (VO) Class
 	 * This class contains an instance of a database handling that is needed to
 	 * permanently store and retrieve Container Value Object instances
 	 */ 
/**
  *
  * PHP Version 5
  *
  * @category Loris
  * @package  Biobank
  * @author   Henri Rabalais <hrabalais.mcin@gmail.com>
  * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
  * @link     https://www.github.com/aces/CCNA/
  */
 
 namespace LORIS\biobank;
 
 /**
  * Creates the form for NDB_Form_biobank
  *
  * @category Loris
  * @package  Biobank
  * @author   Henri Rabalais <hrabalais.mcin@gmail.com>
  * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
  * @link     https://www.github.com/aces/CCNA/
  */
 
	class ContainerVO {
		
		// Persistent Instance variables. This data is directly mapped to the 
		// columns of the database table.
		protected $id;
		protected $barcode;
		protected $typeId;
		protected $statusId;
		protected $locusId;
		protected $parentContainerId;

		protected $parentContainerVO;

		protected $timeUpdate;
		protected $timeCollect;
		protected $notes;

		//Constructor.
		function __construct() {
		}
		
		//setAll allows to set all persistent variables in one method call.
		function setAll($id, $barcode, $typeId, $statusId, $locusId, $parentContainerId, $timeUpdate, $timeCollect, $notes) {
			$this->id = $id;
			$this->barcode = $barcode;
			$this->typeId = $typeId;
			$this->statusId = $statusId;
			$this->locusId = $locusId;
			$this->parentContainerId = $parentContainerId;
			$this->timeUpdate = $timeUpdate;
			$this->timeCollect = $timeCollect;
			$this->notes = $notes;
		}

		//getAll allows to get all persistent variables in one method call. 
		//function getAll() {
		//	return $this->id;
		//	return $this->barcode;
		//}
		
		// Get- and Set-methods for persistent variables. The default behaviour 
		// does not make any checks against malformed data, so these might required 
		// some manual additions.


		public function setId($id) {
			$this->id = $id;
		}

		public function getId() {
			return $this->id;
		}

		public function setBarcode($barcode) {
			$this->container = $barcode;
		}

		public function getBarcode() {
			return $this->barcode;
		}

		public function setTypeId($typeId) {
			$this->typeId = $typeId;
		}

		public function getTypeId() {
			return $this->typeId;
		}

		public function setStatusId($statusId) {
			$this->statusId = $statusId;
		}

		public function getStatusId() {
			return $this->statusId;
		}

		public function setLocusId($locusId) {
			$this->locusId = $locusId;
		}

		public function getLocusId() {
			return $this->locusId;
		}

		public function setParentContainerId($parentContainerId) {
			$this->parentContainerId = $parentContainerId;
		}

		public function getParentContainerId() {
			return $this->parentContainerId;
		}

		public function setParentContainerVO($parentContainerVO) {
			$this->parentContainerVO = $parentContainerVO;
		}

		public function getParentContainerVO() {
			return $this->parentContainerVO;
		}

		public function setTimeUpdate($timeUpdate) {
			$this->timeUpdate = $timeUpdate;
		}

		public function getTimeUpdate() {
			return $this->timeUpdate;
		}

		public function setTimeCollect($timeCollect) {
			$this->timeCollect = $timeCollect;
		}

		public function getTimeCollect() {
			return $this->timeCollect;
		}

		public function setNotes($notes) {
			$this->notes = $notes;
		}
		
		public function getNotes() {
			return $this->notes;
		}

		/**
		 * hasEqualMapping-method will compare two Container instances and return true
		 * if they contain same values in all persistent instance variables.
		 */
		function hasEqualMapping($containerVO) {
			if ($containerVO->getId() 		!= $this->id) {
				return(false);
			}
			if ($containerVO->getBarcode() 		!= $this->barcode) {
				return(false);
			}
			if ($containerVO->getTypeId() 		!= $this->typeId) {
				return(false);
			}
			if ($containerVO->getStatusId() 	!= $this->statusId) {
				return(false);
			}
			if ($containerVO->getLocusId()		!= $this->locusId) {
				return(false);
			}
			if ($containerVO->getParentContainerId()!= $this->parentContainerId) {
				return(false);
			}
			if ($containerVO->getTimeUpdate() 	!= $this->timeUpdate) {
				return(false);
			}
			if ($containerVO->getTimeCollect() 	!= $this->timeCollect) {
				return(false);
			}
			if ($containerVO->getNotes() 		!= $this->notes) {
				return(false);
			}
		
			return true;
		}		

		// toString will return String object representing the state of this containerVO.
		// This is useful during application development, and possibly when application
		// is writing object states in textlog.
		function toString() {
			$out  = "";
			$out .= "\nclass Container, mapping to table biobank_container\n";
			$out .= "Persistent attributes: \n"; 
			$out .= "id = ".$this->id."\n"; 
			$out .= "barcode = ".$this->barcode."\n"; 
			$out .= "typeId = ".$this->typeId."\n"; 
			$out .= "statusId = ".$this->statusId."\n"; 
			$out .= "locusId = ".$this->locusId."\n"; 
			$out .= "parentContainerId = ".$this->parentContainerId."\n";
			$out .= "parentContainerVO = {".$parentContainerVO."}\n"; 
			$out .= "timeUpdate = ".$this->timeUpdate."\n"; 
			$out .= "timeCollect = ".$this->timeCollect."\n"; 
			$out .= "notes = ".$this->notes."\n"; 
			
			return $out;
		}

		// toArray will return an Array representing the statof the Container VO.
		// This is usefule
		function toArray() {
			$containerData = array();
			if (isset($this->id)) 
				{$containerData['id'] 			= $this->id;}
			if (isset($this->barcode)) 
				{$containerData['barcode'] 		= $this->barcode;}
			if (isset($this->typeId)) 
				{$containerData['type_id'] 		= $this->typeId;}
			if (isset($this->statusId)) 
				{$containerData['status_id'] 		= $this->statusId;}
			if (isset($this->locusId)) 
				{$containerData['locus__id'] 		= $this->locusId;}
			if (isset($this->parentContainerId)) 
				{$containerData['parent_container_id'] 	= $this->parentContainerId;}
			if (isset($this->timeUpdate)) 
				{$containerData['time_update'] 		= $this->timeUpdate;}
			if (isset($this->timeCollect)) 
				{$containerData['time_collect'] 	= $this->timeCollect;}
			if (isset($this->notes)) 
				{$containerData['notes'] 		= $this->notes;}
			
			return $containerData;
		}

		//DECIDE HOW 
		function fromArray($containerData) {
			$this->id 		= $containerData['id']; 
			$this->barcode 		= $containerData['barcode']; 
			$this->typeId 		= $containerData['type_id']; 
			$this->statusId 	= $containerData['status_id']; 
			$this->locusId 		= $containerData['locus_id']; 
			$this->parentContainerId= $containerData['parent_container_id']; 
			$this->timeUpdate 	= $containerData['time_update']; 
			$this->timeCollect 	= $containerData['time_collect']; 
			$this->notes 		= $containerData['notes']; 
		}

		// Clone will return an identical deep copy of this valueObject
		function cloneContainerVO() {
			$clone = new ContainerVO();
			$clone->setId($this->id); 
			$clone->setBarcode($this->barcode); 
			$clone->setTypeId($this->typeId); 
			$clone->setStatusId($this->statusId); 
			$clone->setLocusId($this->locusId); 
			$clone->setParentContainerId($this->parentContainerId); 
			$clone->setTimeUpdate($this->timeUpdate); 
			$clone->setTimeUpdate($this->timeUpdate); 
			$clone->setNotes($this->notes); 

			return $clone;
		 }
	}
?>
