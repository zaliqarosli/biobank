/* exported RBiobankSpecimen */

import SpecimenCollectionForm from './collectionForm';
import SpecimenPreparationForm from './preparationForm';
import ContainerParentForm from './containerParentForm';
import FormModal from 'FormModal';
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
 */
class BiobankSpecimen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      Data: {},
      isLoaded: false,
      loadedData: 0,
      editCollection: false,
      editPreparation: false
    };

    this.fetchSpecimenData = this.fetchSpecimenData.bind(this);
    this.toggleEditCollection = this.toggleEditCollection.bind(this);
    this.toggleEditPreparation = this.toggleEditPreparation.bind(this);
    this.mapFormOptions = this.mapFormOptions.bind(this);
    this.updateCollection = this.updateCollection.bind(this);
    this.updatePreparation = this.updatePreparation.bind(this);
    //this.redirectURL = this.redirectURL.bind(this);
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

  toggleEditPreparation() {
    let editPreparation = this.state.editPreparation;
    this.setState({
     editPreparation: !editPreparation
    });
  }

  updateCollection() {
    this.fetchSpecimenData();
    this.toggleEditCollection();
  } 

  updatePreparation() {
    this.fetchSpecimenData();
    this.toggleEditPreparation();
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

	// Checks if parent specimen exists 
    // If exist: returns Barcode value with href
    // If !exist: returns value 'None'
    let parentSpecimenBarcodeValue
    let parentSpecimenBarcode;
	if (this.state.Data.parentSpecimenBarcode) {
	  var specimenURL = loris.BaseURL+"/biobank/specimen/?barcode=";
	  parentSpecimenBarcodeValue = (
        <a href={specimenURL+this.state.Data.parentSpecimenBarcode}>
          {this.state.Data.parentSpecimenBarcode}
        </a>
	  );

      parentSpecimenBarcode = (
       <div className='item'>
         <div className='field'>
         Parent Specimen
           <div className='value'>
             {parentSpecimenBarcodeValue ? parentSpecimenBarcodeValue : 'None'}
           </div>
         </div>
       </div>
      );
    }

    // Checks if parent container exists and returns static element with href
    let parentContainerBarcodeValue
    if (this.state.Data.parentContainerBarcode) {
      var containerURL = loris.BaseURL+"/biobank/container/?barcode=";
      parentContainerBarcodeValue = ( 
          <a href={containerURL+this.state.Data.parentContainerBarcode}>   
            {this.state.Data.parentContainerBarcode}
          </a> 
      );  
    }

    var parentContainerBarcode = ( 
      <div className="item">
        <div className='field'>
          Parent Container
          <div className='value'>
            {parentContainerBarcodeValue ? parentContainerBarcodeValue : 'None'}
          </div>
          {(parentContainerBarcodeValue && this.state.Data.container.coordinate) ? 'Coordinate '+this.state.Data.container.coordinate : null}
        </div>
        <div className='action'>
          <FormModal
            title='Update Parent Container'
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
            <ContainerParentForm
              containersNonPrimary={this.state.Data.containersNonPrimary}
              containerDimensions={this.state.Data.containerDimensions}
              containerCoordinates={this.state.Data.containerCoordinates}
              container={this.state.Data.container}
              containerTypes={this.state.Data.containerTypes}
              containerStati={this.state.Data.containerStati}
              action={`${loris.BaseURL}/biobank/ajax/ContainerInfo.php?action=updateContainerParent`}
              refreshParent={this.fetchSpecimenData}
            />
          </FormModal>
        </div>
      </div>
    );

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

      let addAliquotButtonContent = (
        <div className='specimen-button'>
          <span
            className='glyphicon glyphicon-plus'
            style={{marginRight: '5px'}}
          />  
          Aliquots
        </div>
      );

      addAliquotButton = (
        <FormModal
          title='Create Specimen Aliquots'
          buttonClass='btn btn-success'
          buttonStyle={{display:'flex', alignItems:'center'}}
          buttonContent={addAliquotButtonContent}
        >
          <BiobankSpecimenForm
            action={`${loris.BaseURL}/biobank/ajax/SpecimenInfo.php?action=submitSpecimen`}
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
            containersNonPrimary={this.state.Data.containersNonPrimary}
            containerDimensions={this.state.Data.containerDimensions}
            containerCoordinates={this.state.Data.containerCoordinates}
            specimenTypeAttributes={this.state.Data.specimenTypeAttributes}
            attributeDatatypes={this.state.Data.attributeDatatypes}
            attributeOptions={this.state.Data.attritbueOptions}
            refreshParent={this.fetchSpecimenData}
          />
        </FormModal>
      );
    }
   

    /** 
     * Collection Form
     */

    // Declare Variables
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
          attributeOptions={this.state.Data.attributeOptions}
          containerTypesPrimary={containerTypesPrimary}
          specimenTypeUnits={this.state.Data.specimenTypeUnits}
          edit={true}
          action={`${loris.BaseURL}/biobank/ajax/SpecimenInfo.php?action=updateSpecimenCollection`}
          toggleEdit={this.toggleEditCollection}
          refreshParent={this.updateCollection}
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
              label={this.state.Data.specimenTypeAttributes[this.state.Data.specimen.typeId][key].name}
              text={dataObject[key]}
            />
          );
        })
      }

      collectionPanelForm = (
        <FormElement>
          <StaticElement
            label='Quantity'
            text={this.state.Data.specimen.collection.quantity+' '+this.state.Data.specimenUnits[this.state.Data.specimen.collection.unitId].unit}
          />
          <StaticElement
            label='Location'
            text={this.state.Data.sites[this.state.Data.specimen.collection.locationId]}
          />
	      {specimenTypeAttributes}
          <StaticElement
            label='Date'
            text={this.state.Data.specimen.collection.date}
          />
          <StaticElement
            label='Time'
            text={this.state.Data.specimen.collection.time}
          />
          <StaticElement
            label='Comments'
            text={this.state.Data.specimen.collection.comments}
          />
        </FormElement>
      );
    }

    collectionPanel = (
	  <div className='panel panel-default'>
        <div className='panel-heading'>
          <div className='lifecycle-node collection'>
            <div className='letter'>C</div>
          </div>
          <div className='title'>
            Collection
          </div>
          <span 
            className={this.state.editCollection ? null : 'glyphicon glyphicon-pencil'}
            onClick={this.state.editCollection ? null : this.toggleEditCollection}
          />
        </div>
        <div className='panel-body'>
          {collectionPanelForm}
          {cancelEditCollectionButton}
        </div>
	  </div>
    );

    /*
     * Preparation Form
     */
    
    // Preparation Panel variable declaration
    let preparationPanel;
    let preparationForm;
    let specimenProtocolAttributes;
    let cancelEditPreparationButton;

    // If the form is an edit state
    if (this.state.editPreparation) {
      //Map Options for Form Select Elements Here
      specimenProtocolAttributes = this.state.Data.specimenProtocolAttributes[this.state.Data.specimen.typeId];

      //This remaps specimen Protocols based on the specimen Type
      //this may need to be refactored or put into a function later
      let specimenProtocols = {};
      for (var id in specimenProtocolAttributes) {
        specimenProtocols[id] = this.state.Data.specimenProtocols[id];
      }

      specimenProtocols = this.mapFormOptions(specimenProtocols, 'protocol');
 
      preparationForm = (
        <SpecimenPreparationForm
          specimenId={this.state.Data.specimen.id}
          preparation={this.state.Data.specimen.preparation ? this.state.Data.specimen.preparation : null}
          specimenProtocols={specimenProtocols}
          sites={this.state.Data.sites}
          specimenProtocolAttributes={specimenProtocolAttributes}
          attributeDatatypes={this.state.Data.attributeDatatypes}
          attributeOptions={this.state.Data.attributeOptions}
          insertAction={`${loris.BaseURL}/biobank/ajax/SpecimenInfo.php?action=insertSpecimenPreparation`}
          updateAction={`${loris.BaseURL}/biobank/ajax/SpecimenInfo.php?action=updateSpecimenPreparation`}
          refreshParent={this.updatePreparation}
        />
      );

      cancelEditPreparationButton = (
        <a className="pull-right" style={{cursor:'pointer'}} onClick={this.toggleEditPreparation}>Cancel</a>
      );
    }

    // If Preparation Does Exist and the form is not in an edit state
    if (this.state.Data.specimen.preparation && !this.state.editPreparation) {
      var dataObject = this.state.Data.specimen.preparation.data;
      
      if (dataObject) {
        specimenProtocolAttributes = Object.keys(dataObject).map((key) => {
          return (
            <StaticElement
              label={this.state.Data.specimenProtocolAttributes[this.state.Data.specimen.typeId][this.state.Data.specimen.preparation.protocolId][key].name}
              text={dataObject[key]}
            />
          );
        })
      }

      preparationForm = (
        <FormElement>
          <StaticElement
            label='Protocol'
            text={this.state.Data.specimenProtocols[this.state.Data.specimen.preparation.protocolId].protocol}
          />
          <StaticElement
            label='Location'
            text={this.state.Data.sites[this.state.Data.specimen.preparation.locationId]}
          />
          {specimenProtocolAttributes}
          <StaticElement
            label='Date'
            text={this.state.Data.specimen.preparation.date}
          />
          <StaticElement
            label='Time'
            text={this.state.Data.specimen.preparation.time}
          />
          <StaticElement
            label='Comments'
            text={this.state.Data.specimen.preparation.comments}
          />
        </FormElement>
      );
    }

    // If preparation does not exist and if the form is not in an edit state
    // and a preparation protocol exists for this specimen type
    if (this.state.Data.specimenProtocolAttributes[this.state.Data.specimen.typeId] && 
        !this.state.Data.specimen.preparation && !this.state.editPreparation) {
      preparationPanel = (
        <div
          className='panel inactive'
        >
          <div
            className='add-process'
            onClick={this.toggleEditPreparation}
          >
            <span className='glyphicon glyphicon-plus'/>
          </div>
          <div>
          ADD PREPARATION
          </div>
        </div>
      );

    } else if (this.state.Data.specimen.preparation || this.state.editPreparation) {
      preparationPanel = (
        <div className='panel panel-default'>
          <div className='panel-heading'>
            <div className='lifecycle-node preparation'>
              <div className='letter'>P</div>
            </div>
            <div className='title'>
              Preparation
            </div>
            <span 
              className={this.state.editPreparation ? null : 'glyphicon glyphicon-pencil'}
              onClick={this.state.editPreparation ? null : this.toggleEditPreparation}
            />
          </div>
          <div className='panel-body'>
            {preparationForm}
            {cancelEditPreparationButton}
          </div>
        </div>
      );
    }


    /**
     * Analysis Form
     */
    let analysisPanel;
    analysisPanel = (
	  <div
        className='panel inactive'
	  >
        <div
          className='add-process'
        >
          <span className='glyphicon glyphicon-plus'/>
        </div>
        <div>
        ADD ANALYSIS
        </div>
      </div>
    );

    // This should eventually go into its own component 
    let globals = (
      <div className='globals'>
        <div className='list'>
          <div className='item'>
            <div className='field'>
              Specimen Type
              <div className='value'>
                {this.state.Data.specimenTypes[this.state.Data.specimen.typeId].type}
              </div>
            </div>
          </div>
          <div className='item'>
            <div className='field'>
              Container Type
              <div className='value'>
                {this.state.Data.containerTypes[this.state.Data.container.typeId].label}
              </div>
            </div>
          </div>
          <div className="item">
            <div className='field'>
              Quantity
              <div className='value'>
                {this.state.Data.specimen.quantity}
                {' '+this.state.Data.specimenUnits[this.state.Data.specimen.unitId].unit}
              </div>
            </div>
            <div className='action'>
              <FormModal
                title='Update'
                buttonContent={
                  <div>
                    Update
                    <span
                      className='glyphicon glyphicon-chevron-right'
                      style={{marginLeft: '5px'}}
                    />  
                  </div>
                }
              />
            </div>
          </div>
          <div className="item">
            <div className='field'>
              Temperature
              <div className='value'>
                {this.state.Data.container.temperature + '°C'}
              </div>
            </div>
            <div className='action'>
              <FormModal
                title='Update'
                buttonContent={
                  <div>
                    Update
                    <span
                      className='glyphicon glyphicon-chevron-right'
                      style={{marginLeft: '5px'}}
                    />  
                  </div>
                }
              />
            </div>
          </div>
          <div className="item">
            <div className='field'>
              Status
              <div className='value'>
                {this.state.Data.containerStati[this.state.Data.container.statusId].status}
              </div>
            </div>
            <div className='action'>
              <FormModal
                title='Update'
                buttonContent={
                  <div>
                    Update
                    <span
                      className='glyphicon glyphicon-chevron-right'
                      style={{marginLeft: '5px'}}
                    />  
                  </div>
                }
              />
            </div>
          </div>
          <div className="item">
            <div className='field'>
              Location
              <div className='value'>
                {this.state.Data.sites[this.state.Data.container.locationId]}
              </div>
            </div>
            <div className='action'>
              <FormModal
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
          <div className="item">
            <div className='field'>
              PSCID
              <div className='value'>
                <a href={loris.BaseURL+'/'+this.state.Data.specimen.candidateId}>
                  {this.state.Data.candidateInfo[this.state.Data.specimen.candidateId].PSCID}
                </a>
              </div>
            </div>
            <div className='field'>
              Visit Label
              <div className='value'>
                <a href={loris.BaseURL+'/instrument_list/?candID='+this.state.Data.specimen.candidateId+'&sessionID='+this.state.Data.specimen.sessionId}>
                  {this.state.Data.sessionInfo[this.state.Data.specimen.sessionId].Visit_label}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <div id='specimen-page'>
        <div className="specimen-header">
          <div className='specimen-title'>
            <div className='barcode'>
              Barcode
              <div className='value'>
                <strong>{this.state.Data.container.barcode}</strong>
              </div>
            </div>
            {addAliquotButton}
          </div>
          <LifeCycle
            collection={this.state.Data.specimen.collection}
            preparation={this.state.Data.specimen.preparation}
            analysis={this.state.Data.specimen.analysis}
            sites={this.state.Data.sites}
          />
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
}

BiobankSpecimen.propTypes = {
  specimenPageDataURL: React.PropTypes.string.isRequired,
};

var RBiobankSpecimen = React.createFactory(BiobankSpecimen);

window.BiobankSpecimen = BiobankSpecimen;
window.RBiobankSpecimen = RBiobankSpecimen;

export default BiobankSpecimen;
