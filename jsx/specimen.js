/* exported RBiobankSpecimen */

import SpecimenCollectionForm from './collectionForm';
import SpecimenPreparationForm from './preparationForm';
import {Modal} from 'Tabs';
import Panel from '../../../jsx/Panel';
import BiobankSpecimenForm from './specimenForm.js';
import LifeCycle from './lifeCycle.js';

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
      isLoaded: false,
      loadedData: 0,
      editCollection: false,
      addPreparation: false,
      editPreparation: false
    };

    this.fetchSpecimenData = this.fetchSpecimenData.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.toggleEditCollection = this.toggleEditCollection.bind(this);
    this.toggleAddPreparation = this.toggleAddPreparation.bind(this);
    this.toggleEditPreparation = this.toggleEditPreparation.bind(this);
    this.mapFormOptions = this.mapFormOptions.bind(this);
    this.updateCollection = this.updateCollection.bind(this);
    this.updatePreparation = this.updatePreparation.bind(this);
  }

  componentDidMount() {
    this.fetchSpecimenData();
  }

  fetchSpecimenData() {
    var self = this;
    $.ajax(this.props.specimenPageDataURL, {
      dataType: 'json',
      success: function(data) {
        self.setState({
          Data: data,
          isLoaded: true,
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

  toggleModal() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
 
  toggleEditCollection() {
    let editCollection = this.state.editCollection;
    this.setState({
      editCollection: !editCollection
    });
  }

  toggleAddPreparation() {
    let addPreparation = this.state.addPreparation;
    this.setState({
      addPreparation: !addPreparation
    });
  }

  toggleEditPreparation() {
    let editPreparation = this.state.editPreparation;
    this.setState({
     editPreparation: !editPreparation
    });
  }

  //map options for forms
  mapFormOptions(rawObject, targetAttribute) {
    var data = {};
    for (var id in rawObject) {
      data[id] = rawObject[id][targetAttribute];
    }

    return data;
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

	//checks if parent specimen exists and returns static element with href
	if (this.state.Data.parentSpecimenBarcode) {
	  var specimenURL = loris.BaseURL+"/biobank/specimen/?barcode=";
	  var parentSpecimenBarcode = (
          <LinkElement
            label="Parent Specimen"
            text={this.state.Data.parentSpecimenBarcode}
	        href={specimenURL+this.state.Data.parentSpecimenBarcode}
          />
	  );
	}	

	//checks if parent container exists and returns static element with href
	if (this.state.Data.parentContainerBarcode) {
	  var containerURL = loris.BaseURL+"/biobank/container/?barcode=";
	  var parentContainerBarcode = (
          <LinkElement
            label="Parent Container"
            text={this.state.Data.parentContainerBarcode}
	        href={containerURL+this.state.Data.parentContainerBarcode}
          />
	  );
	}	

    /**
     * Specimen Form
     */
    let addSpecimenButton;
    let specimenForm;
    if (loris.userHasPermission('biobank_write')) {
      addSpecimenButton = (
        <button 
          type="button" 
          className="btn-sm btn-success"
          onClick={this.toggleModal} 
          style={{marginLeft: '20px', border: 'none'}}
        >
          <span 
            className="glyphicon glyphicon-plus"
            style={{marginRight: '5px'}}
          />
          Aliquot
        </button>
      );

      /**
       * Map Options for Form Select Elements
       */      
      let specimenTypes = {};
      //produces options conditionally based on the parentId of the specimen
      for (let id in this.state.Data.specimenTypes) {
        // if parentTypeId is equal to typeId
        if ((this.state.Data.specimenTypes[id].parentTypeId == this.state.Data.specimen.typeId) || 
                                                    (id == this.state.Data.specimen.typeId)) {
          specimenTypes[id] = this.state.Data.specimenTypes[id]['type'];
        }
      }

      let specimenUnits = this.mapFormOptions(this.state.Data.specimenUnits, 'unit');
      let containerTypesPrimary = this.mapFormOptions(this.state.Data.containerTypesPrimary, 'label');
      let containerBarcodesNonPrimary = this.mapFormOptions(this.state.Data.containersNonPrimary, 'barcode');
      
      specimenForm = (
        <Modal show={this.state.isOpen} onClose={this.toggleModal}>
          <BiobankSpecimenForm
            action={`${loris.BaseURL}/biobank/ajax/SpecimenInfo.php?action=submitSpecimen`}
            child='true'
            specimenId={this.state.Data.specimen.id}
            barcode={this.state.Data.container.barcode}
            candidateId={this.state.Data.specimen.candidateId}
            sessionId={this.state.Data.specimen.sessionId} 
            pscid={this.state.Data.candidateInfo[this.state.Data.specimen.candidateId].PSCID}
            visit={this.state.Data.sessionInfo[this.state.Data.specimen.sessionId].Visit_label}
            unitId={this.state.Data.specimen.unitId}
            specimenTypes={specimenTypes}
            specimenTypeUnits={this.state.Data.specimenTypeUnits}
            specimenUnits = {specimenUnits}
            containerTypesPrimary={containerTypesPrimary}
            containerBarcodesNonPrimary={containerBarcodesNonPrimary}
            specimenTypeAttributes={this.state.Data.specimenTypeAttributes}
            attributeDatatypes={this.state.Data.attributeDatatypes}
            closeModal={this.toggleModal}
          />
        </Modal>
      );
    }
   
    /** 
     * Collection Form
     */
    let collectionPanelForm;
    let cancelEditCollectionButton;
    if (this.state.editCollection) {

      //Map Options for Form Select Elements
      let specimenTypes = {};
      //produces options conditionally based on the parentId of the specimen
      for (var id in this.state.Data.specimenTypes) {
        // if specimen type has a parent type
        if (this.state.Data.specimenTypes[this.state.Data.specimen.typeId].parentTypeId) {
          if (this.state.Data.specimenTypes[id].parentTypeId == this.state.Data.specimenTypes[this.state.Data.specimen.typeId].parentTypeId
             || id == this.state.Data.specimen.typeId) {
            specimenTypes[id] = this.state.Data.specimenTypes[id]['type'];
          }
        // else if specimen type has no parent type
        } else {
          if (!this.state.Data.specimenTypes[id].parentTypeId) {
            specimenTypes[id] = this.state.Data.specimenTypes[id]['type'];
          }
        }
      }

      let containerTypesPrimary = this.mapFormOptions(this.state.Data.containerTypesPrimary, 'label');

      collectionPanelForm = (
        <SpecimenCollectionForm
          specimenId={this.state.Data.specimen.id}
          specimenType={this.state.Data.specimen.typeId}
          containerId={this.state.Data.container.id}
          containerType={this.state.Data.container.typeId}
          collection={this.state.Data.specimen.collection}
          specimenTypes={specimenTypes}
          specimenTypeAttributes={this.state.Data.specimenTypeAttributes}
          attributeDatatypes={this.state.Data.attributeDatatypes}
          containerTypesPrimary={containerTypesPrimary}
          specimenTypeUnits={this.state.Data.specimenTypeUnits}
          edit={true}
          action={`${loris.BaseURL}/biobank/ajax/SpecimenInfo.php?action=updateSpecimenCollection`}
          toggleEdit={this.toggleEditCollection}
          updateCollection={this.updateCollection}
        />
      );

      cancelEditCollectionButton = (
        <a className="pull-right" style={{cursor:'pointer'}} onClick={this.toggleEditCollection}>Cancel</a>
      );
    } else {

      //loops through data object to produce static elements
      if (this.state.Data.specimen.collection.data) {
        var dataObject = this.state.Data.specimen.collection.data;
        var specimenTypeAttributes = Object.keys(dataObject).map((key) => {
          return (
            <StaticElement
              label = {this.state.Data.specimenTypeAttributes[this.state.Data.specimen.typeId][key].name}
              text = {dataObject[key]}
            />
          );
        })
      }

      collectionPanelForm = (
        <FormElement
          name="specimenPreparationFormStatic"
          ref="formStatic"
        >
          <StaticElement
            label="Specimen Type"
            text={this.state.Data.specimenTypes[this.state.Data.specimen.typeId].type}
          />
          <StaticElement
            label="Container Type"
            text={this.state.Data.containerTypesPrimary[this.state.Data.container.typeId].label}
          />
          <StaticElement
            label="Quantity"
            text={this.state.Data.specimen.collection.quantity+' '+this.state.Data.specimenUnits[this.state.Data.specimen.collection.unitId].unit}
          />
	      {specimenTypeAttributes}
          <StaticElement
            label="Date"
            text={this.state.Data.specimen.collection.date}
          />
          <StaticElement
            label="Time"
            text={this.state.Data.specimen.collection.time}
          />
          <StaticElement
            label="Comments"
            text={this.state.Data.specimen.collection.comments}
          />
        </FormElement>
      );
    }

    /*
     * Preparation Form
     */
    let preparationPanelForm;
    let cancelAddPreparationButton;
    let cancelEditPreparationButton;
    if (this.state.addPreparation || this.state.editPreparation) {

      //Map Options for Form Select Elements Here
      let specimenProtocolAttributes = this.state.Data.specimenProtocolAttributes[this.state.Data.specimen.typeId];

      //This remaps specimen Protocols based on the specimen Type
      //this may need to be refactored or put into a function later
      let specimenProtocols = {};
      for (var id in specimenProtocolAttributes) {
        specimenProtocols[id] = this.state.Data.specimenProtocols[id];
      }

      specimenProtocols = this.mapFormOptions(specimenProtocols, 'protocol');
 
      preparationPanelForm = (
        <SpecimenPreparationForm
          specimenId={this.state.Data.specimen.id}
          preparation={this.state.Data.specimen.preparation ? this.state.Data.specimen.preparation : null}
          specimenProtocols={specimenProtocols}
          specimenProtocolAttributes={specimenProtocolAttributes}
          attributeDatatypes={this.state.Data.attributeDatatypes}
          add={this.state.addPreparation}
          edit={this.state.editPreparation}
          insertAction={`${loris.BaseURL}/biobank/ajax/SpecimenInfo.php?action=insertSpecimenPreparation`}
          updateAction={`${loris.BaseURL}/biobank/ajax/SpecimenInfo.php?action=updateSpecimenPreparation`}
          updatePreparation={this.updatePreparation}
        />
      );

      //Cancel Add Button
      if (this.state.addPreparation) {
        cancelAddPreparationButton = (
          <a className="pull-right" style={{cursor:'pointer'}} onClick={this.toggleAddPreparation}>Cancel</a>
        );
      }

      //Cancel Edit Button
      if (this.state.editPreparation) {
        cancelEditPreparationButton = (
          <a className="pull-right" style={{cursor:'pointer'}} onClick={this.toggleEditPreparation}>Cancel</a>
        );
      }

    } else if (this.state.Data.specimen.preparation) {
      var dataObject = this.state.Data.specimen.preparation.data;
      
      if (dataObject) {
        var specimenProtocolAttributes = Object.keys(dataObject).map((key) => {
          return (
            <StaticElement
              label = {this.state.Data.specimenProtocolAttributes[this.state.Data.specimen.typeId][this.state.Data.specimen.preparation.protocolId][key].name}
              text = {dataObject[key]}
            />
          );
        })
      }

      preparationPanelForm = (
        <FormElement
          name="specimenPreparationFormStatic"
          ref="formStatic"
        >
          <StaticElement
            label="Protocol"
            text={this.state.Data.specimenProtocols[this.state.Data.specimen.preparation.protocolId].protocol}
          />
          {specimenProtocolAttributes}
          <StaticElement
            label="Date"
            text={this.state.Data.specimen.preparation.date}
          />
          <StaticElement
            label="Time"
            text={this.state.Data.specimen.preparation.time}
          />
          <StaticElement
            label="Comments"
            text={this.state.Data.specimen.preparation.comments}
          />
        </FormElement>
      );
    }

    return (
      <div>
        <h3 style={{display:'inline-block'}}>Specimen <strong>{this.state.Data.container.barcode}</strong></h3>
        {addSpecimenButton}
        <LifeCycle/>
        <FormElement
          columns={5}
        >
          <LinkElement
            label="PSCID"
            text={this.state.Data.candidateInfo[this.state.Data.specimen.candidateId].PSCID}
            href={loris.BaseURL+'/'+this.state.Data.specimen.candidateId}
          />
          <LinkElement
            label="Visit Label"
            text={this.state.Data.sessionInfo[this.state.Data.specimen.sessionId].Visit_label}
            href={loris.BaseURL+'/instrument_list/?candID='+this.state.Data.specimen.candidateId+
                    '&sessionID='+this.state.Data.specimen.sessionId}
          />
          <StaticElement
            label="Quantity"
            text={this.state.Data.specimen.quantity+' '+this.state.Data.specimenUnits[this.state.Data.specimen.unitId].unit}
          />
          <StaticElement
            label="Status"
            text={this.state.Data.containerStati[this.state.Data.container.statusId].status}
          />
          <StaticElement
            label="Location"
            text={this.state.Data.sites[this.state.Data.container.locationId]}
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
	    	>
              {collectionPanelForm}
              {cancelEditCollectionButton}
	    	</Panel>
	    	<Panel
	    	  id="preparation-panel"
	    	  title="Preparation"
              initCollapsed={this.state.Data.specimen.preparation ? false : true}
              add={this.state.Data.specimen.preparation ? 
                    null : (this.state.addPreparation ? null : this.toggleAddPreparation)}
              edit={this.state.Data.specimen.preparation ? 
                    (this.state.editPreparation ? null : this.toggleEditPreparation) : null}
	    	>
              {preparationPanelForm}
              {cancelAddPreparationButton}
              {cancelEditPreparationButton}
	    	</Panel>
	    	<Panel
	    	  id="analysis-panel"
	    	  title="Analysis"
              initCollapsed={true}
              add={this.toggleEditCollection}
	    	>
	    	</Panel>
        </FormElement>
        {specimenForm}
      </div>
    ); 
  }


  updateCollection(collection) {
    this.toggleEditCollection();
 
    let Data = this.state.Data;

    Data.specimen.typeId = collection.specimenType;
    Data.specimen.collection.quantity = collection.quantity;
    Data.specimen.collection.unitId = collection.unitId;
    Data.specimen.collection.date = collection.date;
    Data.specimen.collection.time = collection.time;
    Data.specimen.collection.data = collection.data;
    Data.specimen.collection.comments = collection.comments;

    this.setState({
      Data: Data
    });
  } 

  updatePreparation(preparation) {
    if (this.state.editPreparation) {
      this.toggleEditPreparation();
    } 

    if (this.state.addPreparation) {
      this.toggleAddPreparation();
    }

    let Data = this.state.Data;
    Data.specimen.preparation = preparation;

    this.setState({
      Data: Data
    });
  } 

}

BiobankSpecimen.propTypes = {
  specimenPageDataURL: React.PropTypes.string.isRequired,
};

var RBiobankSpecimen = React.createFactory(BiobankSpecimen);

window.BiobankSpecimen = BiobankSpecimen;
window.RBiobankSpecimen = RBiobankSpecimen;

export default BiobankSpecimen;
