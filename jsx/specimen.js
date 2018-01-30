/* exported RBiobankSpecimen */

import BiobankCollectionForm from './collectionForm';
import {Modal} from 'Tabs';
import Panel from '../../../jsx/Panel';
import BiobankSpecimenForm from './specimenForm.js';

/**
 * Biobank Specimen
 *
 * Fetches data corresponding to a given Specimen from Loris backend and
 * displays a page allowing viewing of meta information of the specimen
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 * */
class BiobankSpecimen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      Data: {},
      collectionData: {},
      uploadResult: null,
      isLoaded: false,
      loadedData: 0,
      editCollection: false
    };

    this.fetchSpecimenData = this.fetchSpecimenData.bind(this);
    this.fetchCollectionFormData = this.fetchCollectionFormData.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.setCollectionData = this.setCollectionData.bind(this);
    this.showAlertMessage = this.showAlertMessage.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.toggleEditCollection = this.toggleEditCollection.bind(this);
    this.updatePage = this.updatePage.bind(this);
  }

  componentDidMount() {
    this.fetchSpecimenData();
    this.fetchCollectionFormData();
  }

  fetchSpecimenData() {
    var self = this;
    $.ajax(this.props.DataURL, {
      dataType: 'json',
      success: function(data) {
        var collectionData = {
          specimen: data.specimenData,
	  	  container: data.containerData,
	      parentSpecimenBarcode: data.parentSpecimenBarcode,
	      parentContainerBarcode: data.parentContainerBarcode,
        };
		  
        self.setState({
          Data: data,
          isLoaded: true,
          collectionData: collectionData,
        });
      },
      error: function(error, errorCode, errorMsg) {
        console.error(error, errorCode, errorMsg);
        self.setState({
          error: 'An error occurred when loading the form!'
        });
      }
    });
  }

  fetchCollectionFormData() {
    $.ajax(this.props.collectionFormDataURL, {
      method: "GET",
      dataType: 'json',
      success: function(data) {
        this.setState({
          SpecimenData: data,
          isLoaded: true
        });
      }.bind(this),
      error: function(error) {
        console.error(error); 
      }
    });
  }

  toggleModal() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
 
  render() {
    // Data loading error
    if (this.state.error !== undefined) {
      return (
        <div className="alert alert-danger text-center">
          <strong>
            {this.state.error}
          </strong>
        </div>
      );
    }

    // Waiting for data to load
    if (!this.state.isLoaded) {
      return (
        <button className="btn-info has-spinner">
          Loading
          <span
            className="glyphicon glyphicon-refresh glyphicon-refresh-animate">
          </span>
        </button>
      );
    }

    var alertMessage = "";
    var alertClass = "alert text-center hide";
    var backURL = loris.BaseURL.concat('/biobank/');

    if (this.state.uploadResult) {
      if (this.state.uploadResult === "success") {
        alertClass = "alert alert-success text-center";
        alertMessage = "Update Successful!";
      } else if (this.state.uploadResult === "error") {
        alertClass = "alert alert-danger text-center";
        alertMessage = "Failed to update the file";
      }
    }

	//checks if parent specimen exists and returns static element with href
	if (this.state.collectionData.parentSpecimenBarcode) {
	  var specimenURL = loris.BaseURL+"/biobank/specimen/?barcode=";
	  var parentSpecimenBarcode = (
          <LinkElement
            label="Parent Specimen"
            text={this.state.collectionData.parentSpecimenBarcode}
	        href={specimenURL+this.state.collectionData.parentSpecimenBarcode}
          />
	  );
	}	

	//checks if parent container exists and returns static element with href
	if (this.state.collectionData.parentContainerBarcode) {
	  var containerURL = loris.BaseURL+"/biobank/container/?barcode=";
	  var parentContainerBarcode = (
          <LinkElement
            label="Parent Container"
            text={this.state.collectionData.parentContainerBarcode}
	        href={containerURL+this.state.collectionData.parentContainerBarcode}
          />
	  );
	}	

	//loops through data object to produce static elements
    if (this.state.Data.specimenData.data) {
      var dataObject = this.state.Data.specimenData.data;
      var specimenTypeAttributes = Object.keys(dataObject).map((key) => {
        return (
          <StaticElement
            label = {this.state.Data.specimenTypeAttributes[this.state.Data.specimenData.typeId][key].name}
            text = {dataObject[key]}
          />
        );
      })
    }


    let addSpecimenButton;
    let collectionForm;
    if (loris.userHasPermission('biobank_write')) {
      addSpecimenButton = (
        <button 
          type="button" 
          className="btn btn-success"
          onClick={this.toggleModal} 
          style={{marginLeft: '20px'}}
        >
          <span 
            className="glyphicon glyphicon-plus"
            style={{marginRight: '5px'}}
          />
          Child
        </button>
      );
      collectionForm = (
        <Modal show={this.state.isOpen} onClose={this.toggleModal}>
          <BiobankCollectionForm
            DataURL={`${loris.BaseURL}/biobank/ajax/SpecimenInfo.php?action=getFormData`}
            action={`${loris.BaseURL}/biobank/ajax/SpecimenInfo.php?action=submitSpecimen`}
            child='true'
            specimenId={this.state.collectionData.specimen.id}
            barcode={this.state.collectionData.container.barcode}
            candidateId={this.state.collectionData.specimen.candidateId}
            sessionId={this.state.collectionData.specimen.sessionId} 
            pscid={this.state.Data.candidateInfo[this.state.collectionData.specimen.candidateId].PSCID}
            visit={this.state.Data.sessionInfo[this.state.collectionData.specimen.sessionId].Visit_label}
            specimenTypes={this.state.SpecimenData.specimenTypes}
            containerTypesPrimary={this.state.SpecimenData.containerTypesPrimary}
            containerBarcodesNonPrimary={this.state.SpecimenData.containerBarcodesNonPrimary}
            specimenTypeAttributes={this.state.SpecimenData.specimenTypeAttributes}
            attributeDatatypes={this.state.SpecimenData.attributeDatatypes}
            capacities={this.state.SpecimenData.capacities}
            units={this.state.SpecimenData.units}
            closeModal={this.toggleModal}
          />
        </Modal>
      );
    }
   
    let disableEdit;
    let collectionPanelForm;
    if (this.state.editCollection) {
      disableEdit = (
        <a 
          onClick={this.toggleEditCollection} 
          style={{cursor: 'pointer'}}
        >
          Cancel
        </a>
      );
      collectionPanelForm = (
        <BiobankSpecimenForm
          barcode={this.state.Data.containerData.barcode}
          specimenType={this.state.Data.specimenData.typeId}
          containerType={this.state.Data.containerData.typeId}
          quantity={this.state.Data.specimenData.quantity}
          unit={this.state.Data.specimenData.unitId}
          data={this.state.Data.specimenData.data}
          collectDate={this.state.Data.specimenData.collectDate}
          notes={this.state.Data.specimenData.notes}
          specimenTypes={this.state.SpecimenData.specimenTypes}
          specimenTypeAttributes={this.state.SpecimenData.specimenTypeAttributes}
          attributeDatatypes={this.state.SpecimenData.attributeDatatypes}
          containerTypesPrimary={this.state.SpecimenData.containerTypesPrimary}
          capacities={this.state.SpecimenData.capacities}
          units={this.state.SpecimenData.units}
          edit={true}
          action={`${loris.BaseURL}/biobank/ajax/SpecimenInfo.php?action=updateSpecimen`}
          updatePage={this.updatePage}
        />
      );
    } else {
      collectionPanelForm = (
        <FormElement
          name="specimenCollectionFormStatic"
          onSubmit={this.handleSubmit}
          ref="formStatic"
        >
          <StaticElement
            label="Specimen Type"
            text={this.state.Data.specimenTypes[this.state.collectionData.specimen.typeId].type}
          />
          <StaticElement
            label="Container Type"
            text={this.state.Data.containerTypesPrimary[this.state.collectionData.container.typeId].label}
          />
          <StaticElement
            label="Quantity"
            text={this.state.collectionData.specimen.quantity+' '+
                    this.state.Data.containerUnits[this.state.Data.containerCapacities[
                    this.state.Data.containerTypesPrimary[this.state.collectionData.container.typeId].capacityId].unitId].unit}
          />
	      {specimenTypeAttributes}
          <StaticElement
            label="Collection Date"
            text={this.state.collectionData.specimen.collectDate}
          />
          <StaticElement
            label="Notes"
            text={this.state.collectionData.specimen.notes}
          />
        </FormElement>
      );
    }

    return (
      <div>
        <div className={alertClass} role="alert" ref="alert-message">
          {alertMessage}
        </div>
        {
          this.state.uploadResult === "success" ?
          <a className="btn btn-primary" href={backURL}>Back to biobank</a> :
          null
        }
        <h3 style={{display:'inline-block'}}>Specimen <strong>{this.state.collectionData.container.barcode}</strong></h3>
        {addSpecimenButton}
        <br/>
        <br/>
        <FormElement
          columns={4}
        >
          <LinkElement
            label="PSCID"
            text={this.state.Data.candidateInfo[this.state.collectionData.specimen.candidateId].PSCID}
            href={loris.BaseURL+'/'+this.state.collectionData.specimen.candidateId}
          />
          <LinkElement
            label="Visit Label"
            text={this.state.Data.sessionInfo[this.state.collectionData.specimen.sessionId].Visit_label}
            href={loris.BaseURL+'/instrument_list/?candID='+this.state.collectionData.specimen.candidateId+
                    '&sessionID='+this.state.collectionData.specimen.sessionId}
          />
          <StaticElement
            label="Status"
            text={this.state.Data.containerStati[this.state.collectionData.container.statusId].status}
          />
		  {parentSpecimenBarcode}
		  {parentContainerBarcode}
        </FormElement>
        <FormElement
          columns= {3}
        >
	    	<Panel
	    	  id="collection-panel"
	    	  title="Collection"
              edit={this.state.editCollection ? null : this.toggleEditCollection}
              cancel={this.state.editCollection ? this.toggleEditCollection : null}
	    	>
              {collectionPanelForm}
	    	</Panel>
	    	<Panel
	    	  id="preparation-panel"
	    	  title="Preparation"
              initCollapsed={true}
              add={this.toggleEditCollection}
	    	>
	    	</Panel>
	    	<Panel
	    	  id="analysis-panel"
	    	  title="Analysis"
              initCollapsed={true}
              add={this.toggleEditCollection}
	    	>
	    	</Panel>
        </FormElement>
        {collectionForm}
      </div>
    ); 
  }


  toggleEditCollection() {
    let editCollection = this.state.editCollection;
    this.setState({
      editCollection: !editCollection
    });
  }

  /**
   * Handles form submission
   * @param {event} e - Form submition event
   */
  handleSubmit(e) {
    e.preventDefault();

    var self = this;
    var myCollectionData = this.state.formData;

    $('#biobankSpecimenEl').hide();
    $("#file-progress").removeClass('hide');

    $.ajax({
      type: 'POST',
      url: self.props.action,
      data: JSON.stringify(myCollectionData),
      cache: false,
      contentType: false,
      processData: false,
      xhr: function() {
        var xhr = new window.XMLHttpRequest();
        xhr.upload.addEventListener("progress", function(evt) {
          if (evt.lengthComputable) {
            var progressbar = $("#progressbar");
            var progresslabel = $("#progresslabel");
            var percent = Math.round((evt.loaded / evt.total) * 100);
            $(progressbar).width(percent + "%");
            $(progresslabel).html(percent + "%");
            progressbar.attr('aria-valuenow', percent);
          }
        }, false);
        return xhr;
      },
      success: function(data) {
        $("#file-progress").addClass('hide');
        self.setState({
          uploadResult: "success"
        });
        self.showAlertMessage();
      },
      error: function(err) {
        console.error(err);
        self.setState({
          uploadResult: "error"
        });
        self.showAlertMessage();
      }

    });
  }

  /**
   * Set the form data based on state values of child elements/componenets
   *
   * @param {string} formElement - name of the selected element
   * @param {string} value - selected value for corresponding form element
   */
  setCollectionData(formElement, value) {
    var collectionData = this.state.collectionData;

    if (value === "") {
      collectionData[formElement] = null;
    } else {
      collectionData[formElement] = value;
    }

    this.setState({
      collectionData: collectionData
    });
  }

  updatePage(specimenType, quantity, unit, data, collectDate, notes) {
    this.toggleEditCollection();
 
    let Data = this.state.Data;

    Data.specimenData.typeId = specimenType;
    Data.specimenData.quantity = quantity;
    Data.specimenData.unitId = unit;
    Data.specimenData.data = data;
    Data.specimenData.collectDate = collectDate;
    Data.specimenData.notes = notes;

    this.setState({
      Data: Data
    });
  } 

  /**
   * Display a success/error alert message after form submission
   */
  showAlertMessage() {
    var self = this;

    if (this.refs["alert-message"] === null) {
      return;
    }

    var alertMsg = this.refs["alert-message"];
    $(alertMsg).fadeTo(2000, 500).delay(3000).slideUp(500, function() {
      self.setState({
        uploadResult: null
      });
    });
  }

}

BiobankSpecimen.propTypes = {
  DataURL: React.PropTypes.string.isRequired,
  action: React.PropTypes.string.isRequired
};

var RBiobankSpecimen = React.createFactory(BiobankSpecimen);

window.BiobankSpecimen = BiobankSpecimen;
window.RBiobankSpecimen = RBiobankSpecimen;

export default BiobankSpecimen;
