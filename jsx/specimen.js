/* exported RBiobankSpecimen */

import SpecimenCollectionForm from './collectionForm';
import SpecimenPreparationForm from './preparationForm';
import ContainerParentForm from './containerParentForm';
import FormModal from 'FormModal';
import Panel from '../../../jsx/Panel';
import Loader from 'Loader';
import BiobankSpecimenForm from './specimenForm.js';
import LifeCycle from './lifeCycle.js';
import ContainerCheckout from './containerCheckout.js';
import TemperatureField from './temperatureField.js';
import QuantityField from './quantityField.js';

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
      data: {},
      isLoaded: false,
      loadedData: 0,
      editTemperature: false,
      editQuantity: false,
      editCollection: false,
      editPreparation: false
    };

    this.fetchSpecimenData = this.fetchSpecimenData.bind(this);
    this.fetchOptions = this.fetchOptions.bind(this);
    this.toggleEditTemperature = this.toggleEditTemperature.bind(this);
    this.toggleEditQuantity = this.toggleEditQuantity.bind(this);
    this.toggleEditCollection = this.toggleEditCollection.bind(this);
    this.toggleEditPreparation = this.toggleEditPreparation.bind(this);
    this.toggle = this.toggle.bind(this);
    this.mapFormOptions = this.mapFormOptions.bind(this);
    this.setContainerData = this.setContainerData.bind(this);
    this.updateCollection = this.updateCollection.bind(this);
    this.updatePreparation = this.updatePreparation.bind(this);
    this.saveContainer = this.saveContainer.bind(this);
  }

  componentDidMount() {
    this.fetchSpecimenData();
    this.fetchOptions();

    $('[data-toggle="tooltip"]').tooltip();
  }

  fetchSpecimenData() {
    var self = this;
    $.ajax(this.props.specimenPageDataURL, {
      dataType: 'json',
      success: function(data) {
        let container = JSON.parse(JSON.stringify(data.container));
        self.setState({
          data: data,
          container: container,
          specimen: data.specimen,
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

  fetchOptions() {
    var self = this;
    $.ajax(this.props.optionsURL, {
      dataType: 'json',
      success: function(data) {
        self.setState({
          options: data,
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

  //TODO: saveContainer() and saveSpecimen() can be merged into 1 function FOR SURE
  saveContainer() {
    let container = this.state.container;
    let containerObj = new FormData();
    for (let key in container) {
      if(container[key] !== "") {
        containerObj.append(key, container[key]);
      }   
    }   
   
    $.ajax({
      type: 'POST',
      url: this.props.saveContainer,
      data: containerObj,
      cache: false,
      contentType: false,
      processData: false,
      xhr: function() {
        let xhr = new window.XMLHttpRequest();
        return xhr;
      }.bind(this),
      success: function() {
        let data = this.state.data;
        data.container = JSON.parse(JSON.stringify(this.state.container));
        this.setState({data: data, editTemperature: false})
        swal("Save Successful!", "", "success");
      }.bind(this),
      error: function(err) {
        console.error(err);
        let msg = err.responseJSON ? err.responseJSON.message : "Specimen error!";
        this.setState({
          errorMessage: msg,
        }); 
        swal(msg, '', "error");
      }.bind(this)
    }); 
  }

  saveSpecimen() {
    let specimen = this.state.specimen;
    let specimenObj = new FormData();
    for (let key in specimen) {
      if(specimen[key] !== "") {
        specimenObj.append(key, specimen[key]);
      }   
    }   
   
    $.ajax({
      type: 'POST',
      url: this.props.saveSpecimen,
      data: specimenObj,
      cache: false,
      contentType: false,
      processData: false,
      xhr: function() {
        let xhr = new window.XMLHttpRequest();
        return xhr;
      }.bind(this),
      success: function() {
        let data = this.state.data;
        data.specimen = JSON.parse(JSON.stringify(this.state.specimen));
        this.setState({data: data, editQuantity: false})
        swal("Save Successful!", "", "success");
      }.bind(this),
      error: function(err) {
        console.error(err);
        let msg = err.responseJSON ? err.responseJSON.message : "Specimen error!";
        this.setState({
          errorMessage: msg,
        }); 
        swal(msg, '', "error");
      }.bind(this)
    }); 
  }


  //TODO: all these toggle can likely be merged into 1!
  toggle(stateToToggle) {
    let currentState = this.state[stateToToggle];
    let toggleObject = {}
    toggleObject[stateToToggle] = !currentState;
    this.setState({toggleObject})
  }

  toggleEditTemperature() {
    let editTemperature = this.state.editTemperature;
    this.setState({
      editTemperature: !editTemperature
    });
  }

  toggleEditQuantity() {
    let editQuantity = this.state.editQuantity;
    this.setState({
      editQuantity: !editQuantity
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

  //TODO: map options for forms - this is used frequently and may need to be moved to a more global place
  mapFormOptions(rawObject, targetAttribute) {
    var data = {};
    for (var id in rawObject) {
      data[id] = rawObject[id][targetAttribute];
    }

    return data;
  }

  setContainerData(name, value) {
  
    let container = this.state.container;
    container[name] = value;

    this.setState({container});
  }

  setSpecimenData(name, value) {
  
    let specimen = this.state.specimen;
    specimen[name] = value;

    this.setState({specimen});
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
	if (this.state.data.parentSpecimenBarcode) {
	  var specimenURL = loris.BaseURL+"/biobank/specimen/?barcode=";
	  parentSpecimenBarcodeValue = (
        <a href={specimenURL+this.state.data.parentSpecimenBarcode}>
          {this.state.data.parentSpecimenBarcode}
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
    if (this.state.data.parentContainer) {
      var containerURL = loris.BaseURL+"/biobank/container/?barcode=";
      parentContainerBarcodeValue = ( 
          <a href={containerURL+this.state.data.parentContainer.barcode}>   
            {this.state.data.parentContainer.barcode}
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
          {(parentContainerBarcodeValue && this.state.data.container.coordinate) ? 'Coordinate '+this.state.data.container.coordinate : null}
        </div>
        <div
          className='action'
          data-toggle='tooltip'
          title='Move Specimen'
          data-placement='right'
         >
          <FormModal
            title='Update Parent Container'
            buttonClass='action-button update'
            buttonContent={
              <span
                className='glyphicon glyphicon-chevron-right'
              />  
            }   
          >   
            <ContainerParentForm
              containersNonPrimary={this.state.options.containersNonPrimary}
              containerDimensions={this.state.options.containerDimensions}
              containerCoordinates={this.state.options.containerCoordinates}
              container={this.state.data.container}
              containerTypes={this.state.options.containerTypes}
              containerStati={this.state.options.containerStati}
              action={`${loris.BaseURL}/biobank/ajax/submitData.php?action=updateContainerParent`}
              refreshParent={this.fetchSpecimenData}
            />
          </FormModal>
        </div>
      </div>
    );

    /**
     * Specimen Form
     */
    let addAliquotForm;

    if (loris.userHasPermission('biobank_write')) {
      /**
       * Map Options for Form Select Elements
       */      
      let specimenTypes = {};
      //produces options conditionally based on the parentId of the specimen
      for (let id in this.state.options.specimenTypes) {
        // if parentTypeId is equal to typeId
        if ((this.state.options.specimenTypes[id].parentTypeId == this.state.data.specimen.typeId) || 
                                                    (id == this.state.data.specimen.typeId)) {
          specimenTypes[id] = this.state.options.specimenTypes[id]['type'];
        }
      }

      let specimenUnits = this.mapFormOptions(this.state.options.specimenUnits, 'unit');
      let containerTypesPrimary = this.mapFormOptions(this.state.options.containerTypesPrimary, 'label');

      let addAliquotButtonContent = (
        <span>+</span>  
      );

      addAliquotForm = (
        <div data-toggle='tooltip' title='Make Aliquots' data-placement='right'>
          <FormModal
            title="Add Aliquots"
            buttonClass='action-button add'
            buttonContent={addAliquotButtonContent}
          >
            <BiobankSpecimenForm
              action={`${loris.BaseURL}/biobank/ajax/submitData.php?action=submitSpecimen`}
              parentSpecimenIds={this.state.data.specimen.id}
              parentSpecimenBarcodes={this.state.data.container.barcode}
              candidateId={this.state.data.specimen.candidateId}
              sessionId={this.state.data.specimen.sessionId} 
              pscid={this.state.data.candidate.PSCID}
              visit={this.state.data.session.Visit_label}
              unitId={this.state.data.specimen.unitId}
              specimenTypes={specimenTypes}
              specimenTypeUnits={this.state.options.specimenTypeUnits}
              specimenUnits = {specimenUnits}
              containerTypesPrimary={containerTypesPrimary}
              containersNonPrimary={this.state.options.containersNonPrimary}
              containerDimensions={this.state.options.containerDimensions}
              containerCoordinates={this.state.options.containerCoordinates}
              specimenTypeAttributes={this.state.options.specimenTypeAttributes}
              attributeDatatypes={this.state.options.attributeDatatypes}
              attributeOptions={this.state.options.attributeOptions}
              refreshParent={this.fetchSpecimenData}
            />
          </FormModal>
        </div>
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
      for (var id in this.state.options.specimenTypes) {
        // if specimen type has a parent type
        if (this.state.options.specimenTypes[this.state.data.specimen.typeId].parentTypeId) {
          if (this.state.options.specimenTypes[id].parentTypeId == this.state.options.specimenTypes[this.state.data.specimen.typeId].parentTypeId
             || id == this.state.data.specimen.typeId) {
            specimenTypes[id] = this.state.options.specimenTypes[id]['type'];
          }
        // else if specimen type has no parent type
        } else {
          if (!this.state.options.specimenTypes[id].parentTypeId) {
            specimenTypes[id] = this.state.options.specimenTypes[id]['type'];
          }
        }
      }

      let containerTypesPrimary = this.mapFormOptions(this.state.options.containerTypesPrimary, 'label');

      collectionPanelForm = (
        <SpecimenCollectionForm
          specimenId={this.state.data.specimen.id}
          specimenType={this.state.data.specimen.typeId}
          containerId={this.state.data.container.id}
          containerType={this.state.data.container.typeId}
          collection={this.state.data.specimen.collection}
          specimenTypes={specimenTypes}
          specimenTypeAttributes={this.state.options.specimenTypeAttributes}
          attributeDatatypes={this.state.options.attributeDatatypes}
          attributeOptions={this.state.options.attributeOptions}
          containerTypesPrimary={containerTypesPrimary}
          specimenTypeUnits={this.state.options.specimenTypeUnits}
          edit={true}
          action={`${loris.BaseURL}/biobank/ajax/submitData.php?action=updateSpecimenCollection`}
          toggleEdit={this.toggleEditCollection}
          refreshParent={this.updateCollection}
        />
      );

      cancelEditCollectionButton = (
        <a className="pull-right" style={{cursor:'pointer'}} onClick={this.toggleEditCollection}>Cancel</a>
      );

    } else {

      //loops through data object to produce static elements
      if (this.state.data.specimen.collection.data) {
        var dataObject = this.state.data.specimen.collection.data;
        var specimenTypeAttributes = Object.keys(dataObject).map((key) => {
          return (
            <StaticElement
              label={this.state.options.specimenTypeAttributes[this.state.data.specimen.typeId][key].name}
              text={dataObject[key]}
            />
          );
        })
      }

      collectionPanelForm = (
        <FormElement>
          <StaticElement
            label='Quantity'
            text={this.state.data.specimen.collection.quantity+' '+this.state.options.specimenUnits[this.state.data.specimen.collection.unitId].unit}
          />
          <StaticElement
            label='Location'
            text={this.state.options.sites[this.state.data.specimen.collection.locationId]}
          />
	      {specimenTypeAttributes}
          <StaticElement
            label='Date'
            text={this.state.data.specimen.collection.date}
          />
          <StaticElement
            label='Time'
            text={this.state.data.specimen.collection.time}
          />
          <StaticElement
            label='Comments'
            text={this.state.data.specimen.collection.comments}
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
      specimenProtocolAttributes = this.state.options.specimenProtocolAttributes[this.state.data.specimen.typeId];

      //This remaps specimen Protocols based on the specimen Type
      //this may need to be refactored or put into a function later
      let specimenProtocols = {};
      for (let id in specimenProtocolAttributes) {
        specimenProtocols[id] = this.state.options.specimenProtocols[id];
      }

      specimenProtocols = this.mapFormOptions(specimenProtocols, 'protocol');
 
      preparationForm = (
        <SpecimenPreparationForm
          specimenId={this.state.data.specimen.id}
          preparation={this.state.data.specimen.preparation ? this.state.data.specimen.preparation : null}
          specimenProtocols={specimenProtocols}
          specimenProtocolAttributes={specimenProtocolAttributes}
          attributeDatatypes={this.state.options.attributeDatatypes}
          attributeOptions={this.state.options.attributeOptions}
          sites={this.state.options.sites}
          insertAction={`${loris.BaseURL}/biobank/ajax/submitData.php?action=insertSpecimenPreparation`}
          updateAction={`${loris.BaseURL}/biobank/ajax/submitData.php?action=updateSpecimenPreparation`}
          refreshParent={this.updatePreparation}
        />
      );

      cancelEditPreparationButton = (
        <a className="pull-right" style={{cursor:'pointer'}} onClick={this.toggleEditPreparation}>Cancel</a>
      );
    }

    // If Preparation Does Exist and the form is not in an edit state
    if (this.state.data.specimen.preparation && !this.state.editPreparation) {
      var dataObject = this.state.data.specimen.preparation.data;
      
      if (dataObject) {
        specimenProtocolAttributes = Object.keys(dataObject).map((key) => {
          return (
            <StaticElement
              label={this.state.options.specimenProtocolAttributes[this.state.data.specimen.typeId][this.state.data.specimen.preparation.protocolId][key].name}
              text={dataObject[key]}
            />
          );
        })
      }

      preparationForm = (
        <FormElement>
          <StaticElement
            label='Protocol'
            text={this.state.options.specimenProtocols[this.state.data.specimen.preparation.protocolId].protocol}
          />
          <StaticElement
            label='Location'
            text={this.state.options.sites[this.state.data.specimen.preparation.locationId]}
          />
          {specimenProtocolAttributes}
          <StaticElement
            label='Date'
            text={this.state.data.specimen.preparation.date}
          />
          <StaticElement
            label='Time'
            text={this.state.data.specimen.preparation.time}
          />
          <StaticElement
            label='Comments'
            text={this.state.data.specimen.preparation.comments}
          />
        </FormElement>
      );
    }

    // If preparation does not exist and if the form is not in an edit state
    // and a preparation protocol exists for this specimen type
    if (this.state.options.specimenProtocolAttributes[this.state.data.specimen.typeId] && 
        !this.state.data.specimen.preparation && !this.state.editPreparation) {
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

    } else if (this.state.data.specimen.preparation || this.state.editPreparation) {
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

    let temperatureField;
    if (!this.state.editTemperature) {
      temperatureField = (
        <div className="item">
          <div className='field'>
            Temperature
            <div className='value'>
              {this.state.data.container.temperature + '°C'}
            </div>
          </div>
          <div 
            className='action'
            data-toggle='tooltip'
            title='Update Temperature'
            data-placement='right'
          >
            <span
              className='action-button update'
              onClick={this.toggleEditTemperature}
            >
              <span className='glyphicon glyphicon-chevron-right'/>
            </span>
          </div>
        </div>
      )
    } else {
      temperatureField = (
        <div className="item">
          <div className='field'>
            Temperature
            <TemperatureField
              className='centered-horizontal'
              container={this.state.container}
              toggleEditTemperature={this.toggleEditTemperature}
              setContainerData={this.setContainerData}
              saveContainer={this.saveContainer}
            />
          </div>
        </div>
      )
    }

    let quantityField;
    if (!this.state.editQuantity) {
      quantityField = (
        <div className="item">
          <div className='field'>
            Quantity
            <div className='value'>
              {this.state.data.specimen.quantity}
              {' '+this.state.options.specimenUnits[this.state.data.specimen.unitId].unit}
            </div>
          </div>
          <div
            className='action'
            data-toggle='tooltip'
            title='Update Quantity'
            data-placement='right'
          >
            <div
              className='action-button update'
              onClick={this.toggleEditQuantity}
            >
              <span className='glyphicon glyphicon-chevron-right'/>  
            </div>
          </div>
        </div>
      );
    } else {
      quantityField = (
        <div className="item">
          <div className='field'>
            Quantity
            <QuantityField
              className='centered-horizontal'
              specimen={this.state.specimen}
              toggleEditQuantity={this.toggleEditQuantity}
              setSpecimenData={this.setSpecimenData}
              saveSpecimen={this.saveSpecimen}
            />
          </div>
        </div>
      )
    }

    //TODO: This should eventually go into its own component 
    let globals = (
      <div className='globals'>
        <div className='list'>
          <div className='item'>
            <div className='field'>
              Specimen Type
              <div className='value'>
                {this.state.options.specimenTypes[this.state.data.specimen.typeId].type}
              </div>
            </div>
          </div>
          <div className='item'>
            <div className='field'>
              Container Type
              <div className='value'>
                {this.state.options.containerTypes[this.state.data.container.typeId].label}
              </div>
            </div>
          </div>
          {quantityField}
          {temperatureField}
          <div className="item">
            <div className='field'>
              Status
              <div className='value'>
                {this.state.options.containerStati[this.state.data.container.statusId].status}
              </div>
            </div>
            <div
              className='action'
              data-toggle='tooltip'
              title='Update Status'
              data-placement='right'
            >
              <FormModal
                title='Update'
                buttonClass='action-button update'
                buttonContent={<span className='glyphicon glyphicon-chevron-right'/>}
              />
            </div>
          </div>
          <div className="item">
            <div className='field'>
              Location
              <div className='value'>
                {this.state.options.sites[this.state.data.container.locationId]}
              </div>
            </div>
            <div
              className='action'
              data-toggle='tooltip'
              title='Ship Specimen'
              data-placement='right'
            >
              <FormModal
                title='Ship'
                buttonClass='action-button update'
                buttonContent={<span className='glyphicon glyphicon-chevron-right'/>}
              />
            </div>
          </div>
          {parentSpecimenBarcode}
          {parentContainerBarcode}
          <div className="item">
            <div className='field'>
              PSCID
              <div className='value'>
                <a href={loris.BaseURL+'/'+this.state.data.specimen.candidateId}>
                  {this.state.data.candidate.PSCID}
                </a>
              </div>
            </div>
            <div className='field'>
              Visit Label
              <div className='value'>
                <a href={loris.BaseURL+'/instrument_list/?candID='+this.state.data.specimen.candidateId+'&sessionID='+this.state.data.specimen.sessionId}>
                  {this.state.data.session.Visit_label}
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
                <strong>{this.state.data.container.barcode}</strong>
              </div>
            </div>
            {addAliquotForm}
            <ContainerCheckout
              containerId={this.state.data.container.id}
              parentContainerId={this.state.data.container.parentContainerId}
              refreshParent={this.fetchSpecimenData}
            />
          </div>
          <LifeCycle
            collection={this.state.data.specimen.collection}
            preparation={this.state.data.specimen.preparation}
            analysis={this.state.data.specimen.analysis}
            sites={this.state.options.sites}
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
