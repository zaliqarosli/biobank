/* exported RBiobankSpecimen */

import FormModal from 'FormModal';
import Loader from 'Loader';
import Globals from './globals.js';
import SpecimenCollectionForm from './collectionForm';
import SpecimenPreparationForm from './preparationForm';
import SpecimenAnalysisForm from './analysisForm';
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
        preparation: false,
        analysis: false,
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
    let self = this;
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
    let self = this;
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
    this.submit(container, this.props.saveContainer, 'Container Save Successful!').then(
      () => {
        let data = this.state.data;
        data.container = JSON.parse(JSON.stringify(this.state.container));
        this.setState({data});
      }
    );
  }

  saveSpecimen() {
    let specimen = JSON.parse(JSON.stringify(this.state.specimen));;
    this.submit(specimen, this.props.saveSpecimen, 'Specimen Save Successful!').then(
      () => {
        let data = this.state.data;
        data.specimen = JSON.parse(JSON.stringify(this.state.specimen));
        this.setState({data});
      }
    );
  }

  //TODO: this should likely be placed in its own component.
  //TODO: should the success messages be coming from the back end?
  submit(data, url, message) {
    console.log(data);
    return new Promise(resolve => {
      $.ajax({
        type: 'POST',
        url: url,
        data: {data: JSON.stringify(data)},
        cache: false,
        success: () => {
          resolve();
          this.toggleAll();
          this.props.onSuccess instanceof Function && this.props.onSuccess();
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
    let data = {};
    for (let id in rawObject) {
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

  addAnalysis() {
    let specimen = this.state.specimen;
    specimen.analysis = {locationId: this.state.data.container.locationId};
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

    /**
     * Map Options for Form Select Elements
     */      
    let addAliquotButtonContent = (
      <span>+</span>  
    );

    let specimenUnits = this.mapFormOptions(this.state.options.specimenUnits, 'unit');
    let containerTypesPrimary = this.mapFormOptions(this.state.options.containerTypesPrimary, 'label');
    let containerStati = this.mapFormOptions(this.state.options.containerStati, 'status');
    let candidates = this.mapFormOptions(this.state.options.candidates, 'pscid');
    let sessions = this.mapFormOptions(this.state.options.sessions, 'label');

    addAliquotForm = (
      <div title='Make Aliquots'>
        <FormModal
          title="Add Aliquots"
          buttonClass='action-button add'
          buttonContent={addAliquotButtonContent}
        >
          <BiobankSpecimenForm
            data={this.state.data}
            specimen={this.state.specimen}
            setSpecimenData={this.setSpecimenData}
            saveSpecimen={this.saveSpecimen}
            candidates={candidates}
            sessions={sessions}
            specimenTypes={this.state.options.specimenTypes}
            specimenUnits={specimenUnits}
            specimenTypeUnits={this.state.options.specimenTypeUnits}
            specimenTypeAttributes={this.state.options.specimenTypeAttributes}
            attributeOptions={this.state.options.attributeOptions}
            attributeDatatypes={this.state.options.attributeDatatypes}
            containerTypesPrimary={containerTypesPrimary}
            containersNonPrimary={this.state.options.containersNonPrimary}
            containerDimensions={this.state.options.containerDimensions}
            containerCoordinates={this.state.options.containerCoordinates}
            containerStati={containerStati}
            refreshParent={this.fetchSpecimenData}
            mapFormOptions={this.mapFormOptions}
            saveBarcodeList={`${loris.BaseURL}/biobank/ajax/submitData.php?action=saveBarcodeList`}
          />
        </FormModal>
      </div>
    );
    
   
    /** 
     * Collection Form
     */

    // Declare Variables
    let collectionPanel;
    let collectionPanelForm;
    let cancelEditCollectionButton;

    if (this.state.edit.collection) {
      let containerTypesPrimary = this.mapFormOptions(this.state.options.containerTypesPrimary, 'label');

      collectionPanelForm = (
        <SpecimenCollectionForm
          specimen={this.state.specimen}
          data={this.state.data}
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

      let dataObject;
      let specimenTypeAttributes;
      //loops through data object to produce static elements
      if (this.state.data.specimen.collection.data) {
        dataObject = this.state.data.specimen.collection.data;
        specimenTypeAttributes = Object.keys(dataObject).map((key) => {
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
            text={this.state.options.centers[this.state.data.specimen.collection.locationId]}
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
    let cancelEditPreparationButton;
    let specimenProtocols = {};
    let specimenProtocolAttributes = {};

    //Remap specimen Protocols based on the specimen Type
    for (let id in this.state.options.specimenProtocols) {
      if (this.state.options.specimenProtocols[id].typeId === this.state.data.specimen.typeId) {
        specimenProtocols[id] = this.state.options.specimenProtocols[id].protocol;
        specimenProtocolAttributes[id] = this.state.options.specimenProtocolAttributes[id];
      }
    }

    if (this.state.edit.preparation) {
      preparationForm = (
        <SpecimenPreparationForm
          specimen={this.state.specimen}
          data={this.state.data}
          specimenProtocols={specimenProtocols}
          specimenProtocolAttributes={specimenProtocolAttributes}
          attributeDatatypes={this.state.options.attributeDatatypes}
          attributeOptions={this.state.options.attributeOptions}
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
      let dataObject = this.state.data.specimen.preparation.data;
      
      if (dataObject) {
        specimenProtocolAttributes = Object.keys(dataObject).map((key) => {
          return (
            <StaticElement
              label={this.state.options.specimenProtocolAttributes[this.state.data.specimen.preparation.protocolId][key].name}
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
            text={this.state.options.centers[this.state.data.specimen.preparation.locationId]}
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
    if (!(Object.keys(specimenProtocols).length === 0) && !this.state.data.specimen.preparation && !this.state.edit.preparation) {
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
    let analysisForm;
    let cancelEditAnalysisButton;
    let specimenMethods = {};
    let specimenMethodAttributes = {};
    let specimenMethodAttributeFields;

    for (let id in this.state.options.specimenMethods) {
      if (this.state.options.specimenMethods[id].typeId === this.state.data.specimen.typeId) {
        specimenMethods[id] = this.state.options.specimenMethods[id].method;
        specimenMethodAttributes[id] = this.state.options.specimenMethodAttributes[id];
      }
    }

    if (this.state.edit.analysis) {
      analysisForm = (
        <SpecimenAnalysisForm
          specimen={this.state.specimen}
          data={this.state.data}
          specimenMethods={specimenMethods}
          specimenMethodAttributes={specimenMethodAttributes}
          attributeDatatypes={this.state.options.attributeDatatypes}
          attributeOptions={this.state.options.attributeOptions}
          setSpecimenData={this.setSpecimenData}
          revertSpecimenData={this.revertSpecimenData}
          saveSpecimen={this.saveSpecimen}
        />
      );

      cancelEditAnalysisButton = (
        <a
          className='pull-right'
          style={{cursor:'pointer'}}
          onClick={()=>{this.toggle('analysis'); this.revertSpecimenData()}}
        >
          Cancel
        </a>
      );
    }

    if (this.state.data.specimen.analysis && !this.state.edit.analysis) {
      //TODO: This can likely go into a function since it is used elsewhere
      if (this.state.data.specimen.analysis.data) {
      let analysisData = this.state.data.specimen.analysis.data;

        specimenMethodAttributeFields = Object.key(analysisData).map((key) => {
          return ( 
            <StaticElement
              label={this.state.options.specimenMethodAttributes[this.state.data.specimen.analysis.methodId][key].name}
              text={analysisData[key]}
            />
          );
        });
      }

      analysisForm = (
        <FormElement>
          <StaticElement
            label='Method'
            text={this.state.options.specimenMethods[this.state.data.specimen.analysis.methodId].method}
          />
          <StaticElement
            label='Location'
            text={this.state.options.centers[this.state.data.specimen.analysis.locationId]}
          />
          {specimenMethodAttributeFields}
          <StaticElement
            label='Date'
            text={this.state.data.specimen.analysis.date}
          />
          <StaticElement
            label='Time'
            text={this.state.data.specimen.analysis.time}
          />
          <StaticElement
            label='Comments'
            text={this.state.data.specimen.analysis.comments}
          />
        </FormElement>
      );
    }

    if (!(Object.keys(specimenMethods).length === 0) && !this.state.data.specimen.analysis && !this.state.edit.analysis) {
      analysisPanel = (
	      <div
          className='panel inactive'
	      >
          <div
            className='add-process'
            onClick={() => {this.toggle('analysis'); this.addAnalysis()}}
          >
            <span className='glyphicon glyphicon-plus'/>
          </div>
          <div>
          ADD ANALYSIS
          </div>
        </div>
      );
    } else if (this.state.data.specimen.analysis || this.state.edit.analysis) {
      analysisPanel = (
        <div className='panel panel-default'>
          <div className='panel-heading'>
            <div className='lifecycle-node preparation'>
              <div className='letter'>A</div>
            </div>
            <div className='title'>
              Analysis
            </div>
            <span
              className={this.state.edit.analysis ? null : 'glyphicon glyphicon-pencil'}
              onClick={this.state.edit.analysis ? null : () => this.toggle('analysis')}
            />
          </div>
          <div className='panel-body'>
            {analysisForm}
            {cancelEditAnalysisButton}
          </div>
        </div>
      );
    }

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
            centers={this.state.options.centers}
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

let RBiobankSpecimen = React.createFactory(BiobankSpecimen);

window.BiobankSpecimen = BiobankSpecimen;
window.RBiobankSpecimen = RBiobankSpecimen;

export default BiobankSpecimen;
