/* exported RBiobankSpecimen */

import SpecimenCollectionForm from './collectionForm';
import SpecimenPreparationForm from './preparationForm';
import ContainerMoveForm from './containerMoveForm';
import Modal from 'Modal';
import Panel from '../../../jsx/Panel';
import Loader from 'Loader';
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
        <Loader/>
      );
    }

	//checks if parent specimen exists and returns static element with href
	if (this.state.Data.parentSpecimenBarcode) {
	  var specimenURL = loris.BaseURL+"/biobank/specimen/?barcode=";
	  var parentSpecimenBarcode = (
        <div className='item'>
          <a href={specimenURL+this.state.Data.parentSpecimenBarcode} className='field'>
            <div className='value'>
              {this.state.Data.parentSpecimenBarcode}
            </div>
            Parent Specimen
          </a>
        </div>
	  );
	} else {
      var parentSpecimenBarcode = (
        <div className='item'>
          <div className='field'>
            <div className='value'>
              None
            </div>
            Parent Specimen
          </div>
        </div>
      );
    }	

	//checks if parent container exists and returns static element with href
	if (this.state.Data.parentContainerBarcode) {
	  var containerURL = loris.BaseURL+"/biobank/container/?barcode=";
      let containerBarcodesNonPrimary = this.mapFormOptions(this.state.Data.containersNonPrimary, 'barcode');
	  var parentContainerBarcode = (
        <div className='item'>
          <a href={containerURL+this.state.Data.parentContainerBarcode} className='field'>
            <div className='value'>
              {this.state.Data.parentContainerBarcode}
            </div>
            Parent Container
          </a>
          <div className='action'>
            <Modal
              title='Assign Location'
              buttonContent={
                <div>
                  Move
                  <span
                    className='glyphicon glyphicon-chevron-right'
                    style={{marginLeft: '5px'}}
                  />  
                </div>
              }
            >
              <ContainerMoveForm
                containerBarcodesNonPrimary={containerBarcodesNonPrimary}
              />
            </Modal>
          </div>
        </div>
	  );
	} else {
      var parentContainerBarcode = (
        <div className='item'>
          <div className='field'>
            <div className='value'>
              None
            </div>
            Parent Container
          </div>
          <div className='action'>
            <Modal
              title='Assign Location'
              buttonContent={
                <div>
                  Move
                  <span
                    className='glyphicon glyphicon-chevron-right'
                    style={{marginLeft: '5px'}}
                  />  
                </div>
              }
            />
          </div>
        </div>
      );
    }	

    /**
     * Specimen Form
     */
    let addAliquotButton;

    if (loris.userHasPermission('biobank_write')) {
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

      let addAliquotButtonContent = (
        <div className='specimen-button'>
          <span
            className='glyphicon glyphicon-plus'
            style={{marginRight: '5px'}}
          />  
          Aliquot
        </div>
      );

      addAliquotButton = (
        <Modal
          title='Create Specimen Aliquots'
          buttonClass='btn btn-success'
          buttonStyle={{display:'flex', alignItems:'center'}}
          buttonContent={addAliquotButtonContent}
        >
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
          />
        </Modal>
      );

    }
   
    /** 
     * Collection Form
     */
    let addPreparationButton;
    if (!this.state.Data.specimen.preparation) {
      addPreparationButton = (
        <Modal
          title='Assign Location'
          buttonClass='btn btn-success'
          buttonStyle={{display:'flex', alignItems:'center'}}
          buttonContent={
            <div>
              <span
                className='glyphicon glyphicon-plus'
                style={{marginLeft: '5px'}}
              />  
              Add Preparation
            </div>
          }
        />
      );
    }

    let collectionPanel;
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
            <div>
              {this.state.Data.specimenTypeAttributes[this.state.Data.specimen.typeId][key].name}
              <div className='value'>
                {dataObject[key]}
              </div>
            </div>
          );
        })
      }

      collectionPanelForm = (
        <div
          className='panel'
        >
          <div className='item'>
            Container Type
            <div className='value'>
              {this.state.Data.containerTypesPrimary[this.state.Data.container.typeId].label}
            </div>
          </div>
          <div className='item'>
            Quantity
            <div className='value'>
              {this.state.Data.specimen.collection.quantity+' '+this.state.Data.specimenUnits[this.state.Data.specimen.collection.unitId].unit}
            </div>
          </div>
          <div className='item'>
            Location
            <div className='value'>
              {this.state.Data.sites[this.state.Data.specimen.collection.locationId]}
            </div>
	      {specimenTypeAttributes}
          </div>
          <div className='item'>
            Date
            <div className='value'>
              {this.state.Data.specimen.collection.date}
            </div>
          </div>
          <div className='item'>
            Time
            <div className='value'>
              {this.state.Data.specimen.collection.time}
            </div>
          </div>
          <div className='item'>
            Comments
            <div className='value'>
              {this.state.Data.specimen.collection.comments}
            </div>
          </div>
        </div>
      );

      collectionPanel = (
	    <Panel
	      id="collection-panel"
	      title="Collection"
          edit={this.state.editCollection ? null : this.toggleEditCollection}
	    >
          {collectionPanelForm}
          {cancelEditCollectionButton}
	    </Panel>
      );
    }

    /*
     * Preparation Form
     */
    let preparationPanel;
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
            <div className='item'>
              {this.state.Data.specimenProtocolAttributes[this.state.Data.specimen.typeId][this.state.Data.specimen.preparation.protocolId][key].name}
              <div className='value'>
                {dataObject[key]}
              </div>
            </div>
          );
        })
      }

      preparationPanelForm = (
        <div className='panel'>
          <div className='item'>
            Protocol
            <div className='value'>
              {this.state.Data.specimenProtocols[this.state.Data.specimen.preparation.protocolId].protocol}
            </div>
          </div>
          <div className='item'>
            Location
            <div className='value'>
              {this.state.Data.sites[this.state.Data.specimen.preparation.locationId]}
            </div>
          </div>
          {specimenProtocolAttributes}
          <div className='item'>
            Date
            <div className='value'>
              {this.state.Data.specimen.preparation.date}
            </div>
          </div>
          <div className='item'>
            Time
            <div className='value'>
              {this.state.Data.specimen.preparation.time}
            </div>
          </div>
          <div className='item'>
            Comments
            <div className='value'>
              {this.state.Data.specimen.preparation.comments}
            </div>
          </div>
        </div>
      );

      preparationPanel = (
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
      );
    }

    let analysisPanel;
    if (this.state.Data.specimen.analysis) {
      analysisPanel = (
	    <Panel
	      id="analysis-panel"
	      title="Analysis"
          initCollapsed={true}
	    >
	    </Panel>
      );
    }

    let globals = (
      <div className='globals'>
        <div className='list'>
          <div className='item'>
            <div className='field'>
              <div className='value'>
                {this.state.Data.specimenTypes[this.state.Data.specimen.typeId].type}
              </div>
              Type
            </div>
          </div>
          <div className="item">
            <div className='field'>
              <div className='value'>
                {this.state.Data.specimen.quantity}
                {' '+this.state.Data.specimenUnits[this.state.Data.specimen.unitId].unit}
              </div>
              Quantity
            </div>
          </div>
          <div className="item">
            <div className='field'>
              <div className='value'>
                {this.state.Data.containerStati[this.state.Data.container.statusId].status}
              </div>
              Status
            </div>
          </div>
          <div className="item">
            <div className='field'>
              <div className='value'>
                {this.state.Data.sites[this.state.Data.container.locationId]}
              </div>
              Location
            </div>
            <div className='action'>
              <Modal
                title='Ship'
                buttonContent={
                  <div>
                    Ship
                    <span
                      className='glyphicon glyphicon-chevron-right'
                      style={{marginLeft: '5px'}}
                    />  
                  </div>
                }
              />
            </div>
          </div>
          {parentSpecimenBarcode}
          {parentContainerBarcode}
          <a href={loris.BaseURL+'/'+this.state.Data.specimen.candidateId} className="item">
            <div className='field'>
              <div className='value'>
                {this.state.Data.candidateInfo[this.state.Data.specimen.candidateId].PSCID}
              </div>
              PSCID
            </div>
          </a>
          <a href={loris.BaseURL+'/instrument_list/?candID='+this.state.Data.specimen.candidateId+'&sessionID='+this.state.Data.specimen.sessionId} className="item">
            <div className='field'>
              <div className='value'>
                {this.state.Data.sessionInfo[this.state.Data.specimen.sessionId].Visit_label}
              </div>
              Visit Label
            </div>
          </a>
        </div>
      </div>
    );

    return (
      <div id='specimen-page'>
        <div className="specimen-header">
          <div className='specimen-title'>
            <div className='barcode'>
              <div className='value'>
                <strong>{this.state.Data.container.barcode}</strong>
              </div>
              Barcode
            </div>
            {addAliquotButton}
          </div>
          <LifeCycle
            collection={this.state.Data.specimen.collection}
            preparation={this.state.Data.specimen.preparation}
            analysis={this.state.Data.specimen.analysis}
            sites={this.state.Data.sites}
          />
          {addPreparationButton}
        </div>
        <div className='summary'>
          {globals}
          <div className="processing">
            {collectionPanel}
            {preparationPanel}
            {analysisPanel}
          </div>
        </div>
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
