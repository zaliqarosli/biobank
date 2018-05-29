/* exported RBiobankSpecimen */

import FormModal from 'FormModal';
import Loader from 'Loader';
import Globals from './globals.js';
import SpecimenCollectionForm from './collectionForm';
import SpecimenPreparationForm from './preparationForm';
import BiobankSpecimenForm from './specimenForm.js';
import LifeCycle from './lifeCycle.js';
import ContainerCheckout from './containerCheckout.js';

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
  constructor() {
    super();

    this.state = {
      data: {},
      isLoaded: false,
      loadedData: 0,
      edit: {
        temperature: false,
        quantity: false,
        collection: false,
        preparation: false
      }
    };

    this.fetchSpecimenData = this.fetchSpecimenData.bind(this);
    this.fetchOptions = this.fetchOptions.bind(this);
    this.toggle = this.toggle.bind(this);
    this.toggleAll = this.toggleAll.bind(this);
    this.mapFormOptions = this.mapFormOptions.bind(this);
    this.setContainerData = this.setContainerData.bind(this);
    this.revertContainerData = this.revertContainerData.bind(this);
    this.setSpecimenData = this.setSpecimenData.bind(this);
    this.addPreparation = this.addPreparation.bind(this);
    this.revertSpecimenData = this.revertSpecimenData.bind(this);
    this.saveContainer = this.saveContainer.bind(this);
    this.saveSpecimen = this.saveSpecimen.bind(this);
    this.submit = this.submit.bind(this);
  }

  componentDidMount() {
    this.fetchSpecimenData();
    this.fetchOptions();
  }

  fetchSpecimenData() {
    var self = this;
    $.ajax(this.props.specimenPageDataURL, {
      dataType: 'json',
      success: function(data) {
        let specimen = JSON.parse(JSON.stringify(data.specimen));
        let container = JSON.parse(JSON.stringify(data.container));
        self.setState({
          data: data,
          container: container,
          specimen: specimen,
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

  saveContainer() {
    let container = JSON.parse(JSON.stringify(this.state.container));
    let containerObj = new FormData();
    for (let key in container) {
      containerObj.append(key, container[key]);
    }   
  
    this.submit(containerObj, this.props.saveContainer, 'Container Save Successful!').then(
      () => {
        //this.fetchSpecimenData();
        //this.fetchOptions();
        let data = this.state.data;
        data.container = JSON.parse(JSON.stringify(this.state.container));
        this.setState({data});
      }
    );
  }

  saveSpecimen() {
    let specimen = JSON.parse(JSON.stringify(this.state.specimen));;
    let specimenObj = new FormData();
    for (let key in specimen) {
      if ((key === 'collection') || (key === 'preparation') || (key === 'analysis')) {
          specimen[key] = JSON.stringify(specimen[key]);
      }
      specimenObj.append(key, specimen[key]);
    }   

    this.submit(specimenObj, this.props.saveSpecimen, 'Specimen Save Successful!').then(
      () => {
        let data = this.state.data;
        data.specimen = JSON.parse(JSON.stringify(this.state.specimen));
        this.setState({data})
      }
    );
  }

  //TODO: this should likely be placed in its own component.
  //TODO: should the success messages be coming from the back end?
  submit(data, url, message) {
    return new Promise(resolve => {
      $.ajax({
        type: 'POST',
        url: url,
        data: data,
        cache: false,
        contentType: false,
        processData: false,
        xhr: function() {
          let xhr = new window.XMLHttpRequest();
          return xhr;
        }.bind(this),
        success: () => {
          resolve();
          this.toggleAll();
          swal(message, '', 'success');
        },
        error: error => {
          let message = error.responseJSON ? error.responseJSON.message : "Submission error!";
          this.setState({
            errorMessage: message
          });
          swal(message, '', 'error');
          console.error(error);
        }
      });
    })
  }

  toggle(stateKey) {
    let edit = this.state.edit;
    let stateValue = edit[stateKey];
    edit[stateKey] = !stateValue;
    this.setState({edit});
  }

  toggleAll() {
    let edit = this.state.edit;
    for (let key in edit) {
      edit[key] = false;
    }
    this.setState({edit});
  }

  // TODO: map options for forms - this is used frequently and may need
  // to be moved to a more global place
  mapFormOptions(rawObject, targetAttribute) {
    var data = {};
    for (var id in rawObject) {
      data[id] = rawObject[id][targetAttribute];
    }

    return data;
  }

  setContainerData(name, value) {
    let container = this.state.container;

    if (value !== null) {
      container[name] = value;
    } else {
      delete container[name];
    }

    this.setState({container});
  }

  revertContainerData() {
    let container = this.state.container;
    container = JSON.parse(JSON.stringify(this.state.data.container));
    this.setState({container});
  }

  setSpecimenData(name, value) {
    let specimen = this.state.specimen;
    specimen[name] = value;
    this.setState({specimen});
  }

  addPreparation() {
    let specimen = this.state.specimen;
    specimen.preparation = {locationId: this.state.data.container.locationId};
    this.setState({specimen});
  }

  revertSpecimenData() {
    let specimen = this.state.specimen;
    specimen = JSON.parse(JSON.stringify(this.state.data.specimen));
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
        if (
             (this.state.options.specimenTypes[id].parentTypeId == 
             this.state.data.specimen.typeId) || 
             (id == this.state.data.specimen.typeId)
           ) {
          specimenTypes[id] = this.state.options.specimenTypes[id]['type'];
        }
      }

      let specimenUnits = this.mapFormOptions(this.state.options.specimenUnits, 'unit');
      let containerTypesPrimary = this.mapFormOptions(this.state.options.containerTypesPrimary, 'label');

      let addAliquotButtonContent = (
        <span>+</span>  
      );

      addAliquotForm = (
        <div title='Make Aliquots'>
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

    if (this.state.edit.collection) {

      //Map Options for Form Select Elements
      let specimenTypes = {};
      //produces options conditionally based on the parentId of the specimen
      for (var id in this.state.options.specimenTypes) {
        // if specimen type has a parent type
        if (this.state.options.specimenTypes[this.state.data.specimen.typeId].parentTypeId) {
          if (this.state.options.specimenTypes[id].parentTypeId == 
             this.state.options.specimenTypes[this.state.data.specimen.typeId].parentTypeId
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
          specimen={this.state.specimen}
          specimenTypes={specimenTypes}
          specimenTypeAttributes={this.state.options.specimenTypeAttributes}
          attributeDatatypes={this.state.options.attributeDatatypes}
          attributeOptions={this.state.options.attributeOptions}
          containerTypesPrimary={containerTypesPrimary}
          specimenTypeUnits={this.state.options.specimenTypeUnits}
          toggle={() => this.toggle('collection')}
          setSpecimenData={this.setSpecimenData}
          revertSpecimenData={this.revertSpecimenData}
          saveSpecimen={this.saveSpecimen}
        />
      );

      cancelEditCollectionButton = (
        <a
          className="pull-right"
          style={{cursor:'pointer'}}
          onClick={() => this.toggle('collection')}
        >
          Cancel
        </a>
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
            text={
              this.state.data.specimen.collection.quantity+' '+
              this.state.options.specimenUnits[
                this.state.data.specimen.collection.unitId
              ].unit
            }
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
            className={this.state.edit.collection ? null : 'glyphicon glyphicon-pencil'}
            onClick={this.state.edit.collection ? null : () => this.toggle('collection')}
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
    if (this.state.edit.preparation) {
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
          specimen={this.state.specimen}
          data={this.state.data}
          specimenProtocols={specimenProtocols}
          specimenProtocolAttributes={specimenProtocolAttributes}
          attributeDatatypes={this.state.options.attributeDatatypes}
          attributeOptions={this.state.options.attributeOptions}
          sites={this.state.options.sites}
          setSpecimenData={this.setSpecimenData}
          revertSpecimenData={this.revertSpecimenData}
          saveSpecimen={this.saveSpecimen}
        />
      );

      cancelEditPreparationButton = (
        <a
          className="pull-right"
          style={{cursor:'pointer'}}
          onClick={() => {this.toggle('preparation'); this.revertSpecimenData()}}
        >
          Cancel
        </a>
      );
    }

    // If Preparation Does Exist and the form is not in an edit state
    if (this.state.data.specimen.preparation && !this.state.edit.preparation) {
      var dataObject = this.state.data.specimen.preparation.data;
      
      if (dataObject) {
        specimenProtocolAttributes = Object.keys(dataObject).map((key) => {
          return (
            <StaticElement
              label={this.state.options.specimenProtocolAttributes[
                this.state.data.specimen.typeId
              ][this.state.data.specimen.preparation.protocolId][key].name}
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
        !this.state.data.specimen.preparation && !this.state.edit.preparation) {
      preparationPanel = (
        <div
          className='panel inactive'
        >
          <div
            className='add-process'
            onClick={() => {this.toggle('preparation'); this.addPreparation()}}
          >
            <span className='glyphicon glyphicon-plus'/>
          </div>
          <div>
          ADD PREPARATION
          </div>
        </div>
      );

    } else if (this.state.data.specimen.preparation || this.state.edit.preparation) {
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
              className={this.state.edit.preparation ? null : 'glyphicon glyphicon-pencil'}
              onClick={this.state.edit.preparation ? null : () => this.toggle('preparation')}
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

    let globals = (
      <Globals
        specimen={this.state.specimen}
        container={this.state.container}
        data={this.state.data}
        options={this.state.options}
        edit={this.state.edit}
        toggle={this.toggle}
        mapFormOptions={this.mapFormOptions}
        setSpecimenData={this.setSpecimenData}
        revertSpecimenData={this.revertSpecimenData}
        saveSpecimen={this.saveSpecimen}
        setContainerData={this.setContainerData}
        revertContainerData={this.revertContainerData}
        saveContainer={this.saveContainer}
      />
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
              container={this.state.container}
              setContainerData={this.setContainerData}
              saveContainer={this.saveContainer}
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
