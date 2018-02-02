/* exported RBiobankSpecimen */

import BiobankCollectionForm from './collectionForm';
import SpecimenPreparationForm from './preparationForm';
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
    this.updatePage = this.updatePage.bind(this);
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

	//loops through data object to produce static elements
    if (this.state.Data.specimen.data) {
      var dataObject = this.state.Data.specimen.data;
      var specimenTypeAttributes = Object.keys(dataObject).map((key) => {
        return (
          <StaticElement
            label = {this.state.Data.specimenTypeAttributes[this.state.Data.specimen.typeId][key].name}
            text = {dataObject[key]}
          />
        );
      })
    }

    /**
     * Specimen Form
     */
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

      //Map Options for Form Select Elements
      let specimenTypes = this.mapFormOptions(this.state.Data.specimenTypes, 'type');
      let specimenUnits = this.mapFormOptions(this.state.Data.specimenUnits, 'unit');
      let containerTypesPrimary = this.mapFormOptions(this.state.Data.containerTypesPrimary, 'label');
      let containerBarcodesNonPrimary = this.mapFormOptions(this.state.Data.containersNonPrimary, 'barcode');
      
      collectionForm = (
        <Modal show={this.state.isOpen} onClose={this.toggleModal}>
          <BiobankCollectionForm
            DataURL={`${loris.BaseURL}/biobank/ajax/SpecimenInfo.php?action=getFormData`}
            action={`${loris.BaseURL}/biobank/ajax/SpecimenInfo.php?action=submitSpecimen`}
            child='true'
            specimenId={this.state.Data.specimen.id}
            barcode={this.state.Data.container.barcode}
            candidateId={this.state.Data.specimen.candidateId}
            sessionId={this.state.Data.specimen.sessionId} 
            pscid={this.state.Data.candidateInfo[this.state.Data.specimen.candidateId].PSCID}
            visit={this.state.Data.sessionInfo[this.state.Data.specimen.sessionId].Visit_label}
            specimenTypes={specimenTypes}
            units={specimenUnits}
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
      let specimenTypes = this.mapFormOptions(this.state.Data.specimenTypes, 'type');
      let specimenUnits = this.mapFormOptions(this.state.Data.specimenUnits, 'unit');
      let containerTypesPrimary = this.mapFormOptions(this.state.Data.containerTypesPrimary, 'label');

      collectionPanelForm = (
        <BiobankSpecimenForm
          specimenId={this.state.Data.specimen.id}
          specimenType={this.state.Data.specimen.typeId}
          containerType={this.state.Data.container.typeId}
          quantity={this.state.Data.specimen.quantity}
          unit={this.state.Data.specimen.unitId}
          data={this.state.Data.specimen.data}
          collectDate={this.state.Data.specimen.collectDate}
          collectTime={this.state.Data.specimen.collectTime}
          notes={this.state.Data.specimen.notes}
          specimenTypes={specimenTypes}
          specimenTypeAttributes={this.state.Data.specimenTypeAttributes}
          attributeDatatypes={this.state.Data.attributeDatatypes}
          containerTypesPrimary={containerTypesPrimary}
          units={specimenUnits}
          edit={true}
          action={`${loris.BaseURL}/biobank/ajax/SpecimenInfo.php?action=updateSpecimen`}
          updatePage={this.updatePage}
        />
      );

      cancelEditCollectionButton = (
        <a className="pull-right" style={{cursor:'pointer'}} onClick={this.toggleEditCollection}>Cancel</a>
      );
    } else {
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
            text={this.state.Data.specimen.quantity+' '+this.state.Data.specimenUnits[this.state.Data.specimen.unitId].unit}
          />
	      {specimenTypeAttributes}
          <StaticElement
            label="Collection Date"
            text={this.state.Data.specimen.collectDate}
          />
          <StaticElement
            label="Collection Time"
            text={this.state.Data.specimen.collectTime}
          />
          <StaticElement
            label="Notes"
            text={this.state.Data.specimen.notes}
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
          specimenProtocols={specimenProtocols}
          specimenProtocolAttributes={specimenProtocolAttributes}
          attributeDatatypes={this.state.Data.attributeDatatypes}
          add={this.state.addPreparation}
        />
      );

      if (this.state.addPreparation) {
        cancelAddPreparationButton = (
          <a className="pull-right" style={{cursor:'pointer'}} onClick={this.toggleAddPreparation}>Cancel</a>
        );
      }

      if (this.state.editPreparation) {
        cancelEditPreparationButton = (
          <a className="pull-right" style={{cursor:'pointer'}} onClick={this.toggleEditPreparation}>Cancel</a>
        );
      }
    } else if (this.state.Data.specimen.data.protocol) {
      preparationPanelForm = (
        <FormElement
          name="specimenPreparationFormStatic"
          ref="formStatic"
        >
          <StaticElement
            label="Protocol"
            text=""
          />
        </FormElement>
      );
    }
    
    return (
      <div>
        <h3 style={{display:'inline-block'}}>Specimen <strong>{this.state.Data.container.barcode}</strong></h3>
        {addSpecimenButton}
        <br/>
        <br/>
        <FormElement
          columns={4}
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
            label="Status"
            text={this.state.Data.containerStati[this.state.Data.container.statusId].status}
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
              initCollapsed={this.state.addPreparation ? false : true}
              add={this.state.addPreparation ? null : this.toggleAddPreparation}
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
        {collectionForm}
      </div>
    ); 
  }


  updatePage(specimenType, quantity, unit, data, collectDate, collectTime, notes) {
    this.toggleEditCollection();
 
    let Data = this.state.Data;

    Data.specimen.typeId = specimenType;
    Data.specimen.quantity = quantity;
    Data.specimen.unitId = unit;
    Data.specimen.data = data;
    Data.specimen.collectDate = collectDate;
    Data.specimen.collectTime = collectTime;
    Data.specimen.notes = notes;

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
