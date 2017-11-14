<?php
	class Datasource {

 		var $dbLink;

        // Constructor. Call this once when initializing system core. Then save the instance of this class in $connection variable and pass it as an argument when using services from core.
       		function Datasource($dbHost, $dbName, $dbuser, $dbpasswd) {
                	$this->dbLink = mysql_connect($dbHost, $dbuser, $dbpasswd);
                	mysql_select_db($dbName, $this->dbLink);
		}

	}



	class specimenDAO {
	
		protected var $connect;
		protected var $db;
		
		// Attempts to initialize the database connection using the supplied info.
		public function specimenDAO($host, $username, $password, $database) {
			$this->connect = mysql_connect($host, $username, $password);
			$this->db = mysql_select_db($database);
		}

		// Executes the specified query and returns an associative array of results.
		protected function execute($sql) {
			$res = mysql_query($sql, $this->connect) or die(mysql_error());
		
			if(mysql_num_rows($res) > 0) {
     			       for($i = 0; $i < mysql_num_rows($res); $i++) {
                			$row = mysql_fetch_assoc($res);
                			$specimenVO[$i] = new UserVO();
                
                			$specimenVO[$i]->setId($row[id]);
                			$specimenVO[$i]->setContainer($row[container]);
                			$specimenVO[$i]->setType($row[type]);
                			$specimenVO[$i]->setQuantity($row[quantity]);
                			$specimenVO[$i]->setParent($row[parent]);
                			$specimenVO[$i]->setCandidate($row[candidate]);
                			$specimenVO[$i]->setSession($row[session]);
                			$specimenVO[$i]->setUpdateTime($row[updatetime]);
                			$specimenVO[$i]->setCreationTime($row[creationtime]);
                			$specimenVO[$i]->setNotes($row[notes]);
            			}
        		}
        		return $specimenVO;
    		}
		
		// Retrieves the corresponding row for the specified specimen ID.
		public function getBySpecimenId($specimenId) {
			$sql = "SELECT * FROM biobank_specimen_entity WHERE id=".$specimenId;
			return $this->execute($sql);
		}
		
		// Retrieves all specimen currently in the database.
		public function getAllSpecimens() {
			$sql = "SELECT * FROM biobank_specimen_entity";
			return $this->execute($sql);		
		}

		// Retrieves single column value for the specified specimen ID.
		public function getAttributeBySpecimenId($column, $specimenId) {
			$sql = "SELECT ".$column." FROM biobank_specimen_entity WHERE id=".$specimenId;
			return $this->execute($sql); 
		}

		//Saves the supplied specimen to the database.
		public function save($specimenVO) {
			$affectedRows = 0;
			
			if($specimenVO->getId() != "") {
				$currSpecimenVO = $this->getBySpecimenId($specimenVO->getId());
			}
			
			// If the query returned a row then update, otherwise insert a new specimen
			if(sizeof($currSpecimenVO) > 0) {
				$sql = "UPDATE biobank_specimen_entity SET ".
					"container_id='".$specimenVO->getContainer()."',".
					"type_id='".$specimenVO->getType()."',".
					"quantity='".$specimenVO->getQuantity()."',".
					"specimen_parent_id='".$specimenVO->getParent()."',".
					"candidate_id='".$specimenVO->getCandidate()."',".
					"session_id='".$specimenVO->getSession()."',".
					"update_time='".$specimenVO->getUpdateTime()."',".
					"creation_time='".$specimenVO->getCreationTime()."',".
					"notes='".$specimenVO->getNotes()."',".
					"WHERE id=".$specimenVO->getId();
				mysql_query($sql, $this->connect) or die(mysql_error());
				$affectedRows = mysql_affected_rows();
			}
			else {
				$sql = "INSERT INTO specimen (container, type, quantity, parent, candidate, session, updatetime, creationtime, notes)".
					"VALUES('".
					$specimenVO->getContainer()."', ". 
					$specimenVO->getType()."', ". 
					$specimenVO->getQuantity()."', ". 
					$specimenVO->getParent()."', ". 
					$specimenVO->getCandidate()."', ". 
					$specimenVO->getSession()."', ". 
					$specimenVO->getUpdateTime()."', ". 
					$specimenVO->getCreationTime()."', ". 
					$specimenVO->getNotes()."')";

				mysql_query($sql, $this->connect) or die(mysql_error());
				$affectedRows = mysql_affected_rows(): 
			}
			return $affectedRows;
		}
		
		// Deletes the supplied specimen from the database
		public function delete($specimenVO) {
			$affectedRows = 0;

			// Check for a specimen ID.
			if($specimenVO->getId() != "") {
				$currSpecimenVO = $this->getBySpecimenId($specimenVO->getId());
			}
			
			// Otherwise delete a specimen.
			if(sizeof($currUserVO) > 0) {
				$sql = "DELETE FROM biobank_specimen_entity WHERE id=".$specimenVO->getId();

				mysql_query($sql, $this->connect) or die(mysql_error());
				$affectedRows = mysql_affected_rows();
			}
			
			return $affectedRows;
		}
	}

>
