/* exported RBiobankSpecimen */

import Modal from 'Modal';
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

  render() {

    //Map Options for Form Select Elements
    let specimenUnits = this.props.mapFormOptions(this.props.options.specimenUnits, 'unit');
    let containerTypesPrimary = this.props.mapFormOptions(this.props.options.containerTypesPrimary, 'label');
    let containerStati = this.props.mapFormOptions(this.props.options.containerStati, 'status');
    let candidates = this.props.mapFormOptions(this.props.options.candidates, 'pscid');
    let sessions = this.props.mapFormOptions(this.props.options.sessions, 'label');

    let addAliquotForm = (
      <div
        className='action'
        title='Make Aliquots'
      >
        <div
          className='action-button add'
          onClick={()=>{this.props.edit('aliquotForm')}}
        >
          <span>+</span>  
        </div>
        <Modal
          title="Add Aliquots"
          closeModal={this.props.close}
          show={this.props.editable.aliquotForm}
        >
          <BiobankSpecimenForm
            data={this.props.data}
            specimen={this.props.specimen}
            setSpecimen={this.props.setSpecimen}
            saveSpecimen={this.props.saveSpecimen}
            candidates={candidates}
            sessions={sessions}
            specimenTypes={this.props.options.specimenTypes}
            specimenUnits={specimenUnits}
            specimenTypeUnits={this.props.options.specimenTypeUnits}
            specimenTypeAttributes={this.props.options.specimenTypeAttributes}
            attributeOptions={this.props.options.attributeOptions}
            attributeDatatypes={this.props.options.attributeDatatypes}
            containerTypesPrimary={containerTypesPrimary}
            containersNonPrimary={this.props.options.containersNonPrimary}
            containerDimensions={this.props.options.containerDimensions}
            containerCoordinates={this.props.options.containerCoordinates}
            containerStati={containerStati}
            mapFormOptions={this.props.mapFormOptions}
            saveBarcodeListURL={this.props.saveBarcodeListURL}
            loadFilters={this.props.loadFilters}
            loadOptions={this.props.loadOptions}
            close={this.props.close}
            save={this.props.save}
          />
        </Modal>
      </div>
    );
   
    /** 
     * Collection Form
     */

    // Declare Variables
    let collectionPanel;
    let collectionPanelForm;
    let cancelEditCollectionButton;

    if (this.props.editable.collection) {
      let containerTypesPrimary = this.props.mapFormOptions(this.props.options.containerTypesPrimary, 'label');

      collectionPanelForm = (
        <SpecimenCollectionForm
          specimen={this.props.specimen}
          data={this.props.data}
          specimenTypeAttributes={this.props.options.specimenTypeAttributes}
          attributeDatatypes={this.props.options.attributeDatatypes}
          attributeOptions={this.props.options.attributeOptions}
          containerTypesPrimary={containerTypesPrimary}
          specimenTypeUnits={this.props.options.specimenTypeUnits}
          setSpecimen={this.props.setSpecimen}
          saveSpecimen={this.props.saveSpecimen}
        />
      );

      cancelEditCollectionButton = (
        <a
          className="pull-right"
          style={{cursor:'pointer'}}
          onClick={this.props.close}
        >
          Cancel
        </a>
      );
    } else {
      let specimenTypeAttributes;
      //loops through data object to produce static elements
      if (this.props.data.specimen.collection.data) {
        let collectionData = this.props.data.specimen.collection.data;
        specimenTypeAttributes = Object.keys(collectionData).map((key) => {
          return (
            <StaticElement
              label={this.props.options.specimenTypeAttributes[this.props.data.specimen.typeId][key].name}
              text={collectionData[key]}
            />
          );
        })
      }

      collectionPanelForm = (
        <FormElement>
          <StaticElement
            label='Quantity'
            text={
              this.props.data.specimen.collection.quantity+' '+
              this.props.options.specimenUnits[
                this.props.data.specimen.collection.unitId
              ].unit
            }
          />
          <StaticElement
            label='Location'
            text={this.props.options.centers[this.props.data.specimen.collection.locationId]}
          />
	        {specimenTypeAttributes}
          <StaticElement
            label='Date'
            text={this.props.data.specimen.collection.date}
          />
          <StaticElement
            label='Time'
            text={this.props.data.specimen.collection.time}
          />
          <StaticElement
            label='Comments'
            text={this.props.data.specimen.collection.comments}
          />
        </FormElement>
      );
    }

    collectionPanel = (
	  <div className='panel specimen-panel panel-default'>
        <div className='panel-heading'>
          <div className='lifecycle-node collection'>
            <div className='letter'>C</div>
          </div>
          <div className='title'>
            Collection
          </div>
          <span 
            className={this.props.editable.collection ? null : 'glyphicon glyphicon-pencil'}
            onClick={this.props.editable.collection ? null : () => {this.props.edit('collection')}}
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
    for (let id in this.props.options.specimenProtocols) {
      if (this.props.options.specimenProtocols[id].typeId === this.props.data.specimen.typeId) {
        specimenProtocols[id] = this.props.options.specimenProtocols[id].protocol;
        specimenProtocolAttributes[id] = this.props.options.specimenProtocolAttributes[id];
      }
    }

    if (this.props.editable.preparation) {
      preparationForm = (
        <SpecimenPreparationForm
          specimen={this.props.specimen}
          data={this.props.data}
          specimenProtocols={specimenProtocols}
          specimenProtocolAttributes={specimenProtocolAttributes}
          attributeDatatypes={this.props.options.attributeDatatypes}
          attributeOptions={this.props.options.attributeOptions}
          setSpecimen={this.props.setSpecimen}
          saveSpecimen={this.props.saveSpecimen}
        />
      );

      cancelEditPreparationButton = (
        <a
          className="pull-right"
          style={{cursor:'pointer'}}
          onClick={this.props.close}
        >
          Cancel
        </a>
      );
    }

    // If Preparation Does Exist and the form is not in an edit state
    if (this.props.data.specimen.preparation && !this.props.editable.preparation) {
      if (this.props.data.specimen.preparation.data) {
        let preparationData = this.props.data.specimen.preparation.data;
        specimenProtocolAttributes = Object.keys(preparationData).map((key) => {
          return (
            <StaticElement
              label={this.props.options.specimenProtocolAttributes[this.props.data.specimen.preparation.protocolId][key].name}
              text={preparationData[key]}
            />
          );
        })
      }

      preparationForm = (
        <FormElement>
          <StaticElement
            label='Protocol'
            text={this.props.options.specimenProtocols[this.props.data.specimen.preparation.protocolId].protocol}
          />
          <StaticElement
            label='Location'
            text={this.props.options.centers[this.props.data.specimen.preparation.locationId]}
          />
          {specimenProtocolAttributes}
          <StaticElement
            label='Date'
            text={this.props.data.specimen.preparation.date}
          />
          <StaticElement
            label='Time'
            text={this.props.data.specimen.preparation.time}
          />
          <StaticElement
            label='Comments'
            text={this.props.data.specimen.preparation.comments}
          />
        </FormElement>
      );
    }

    // If preparation does not exist and if the form is not in an edit state
    // and a preparation protocol exists for this specimen type
    if (!(Object.keys(specimenProtocols).length === 0) && !this.props.data.specimen.preparation && !this.props.editable.preparation) {
      preparationPanel = (
        <div
          className='panel specimen-panel inactive'
        >
          <div
            className='add-process'
            onClick={() => {this.props.edit('preparation'); this.props.addPreparation()}}
          >
            <span className='glyphicon glyphicon-plus'/>
          </div>
          <div>
          ADD PREPARATION
          </div>
        </div>
      );
    } else if (this.props.data.specimen.preparation || this.props.editable.preparation) {
      preparationPanel = (
        <div className='panel specimen-panel panel-default'>
          <div className='panel-heading'>
            <div className='lifecycle-node preparation'>
              <div className='letter'>P</div>
            </div>
            <div className='title'>
              Preparation
            </div>
            <span 
              className={this.props.editable.preparation ? null : 'glyphicon glyphicon-pencil'}
              onClick={this.props.editable.preparation ? null : () => {this.props.edit('preparation')}}
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

    for (let id in this.props.options.specimenMethods) {
      if (this.props.options.specimenMethods[id].typeId === this.props.data.specimen.typeId) {
        specimenMethods[id] = this.props.options.specimenMethods[id].method;
        specimenMethodAttributes[id] = this.props.options.specimenMethodAttributes[id];
      }
    }

    if (this.props.editable.analysis) {
      analysisForm = (
        <SpecimenAnalysisForm
          specimen={this.props.specimen}
          data={this.props.data}
          files={this.props.files}
          specimenMethods={specimenMethods}
          specimenMethodAttributes={specimenMethodAttributes}
          attributeDatatypes={this.props.options.attributeDatatypes}
          attributeOptions={this.props.options.attributeOptions}
          setSpecimen={this.props.setSpecimen}
          setFiles={this.props.setFiles}
          saveSpecimen={this.props.saveSpecimen}
        />
      );

      cancelEditAnalysisButton = (
        <a
          className='pull-right'
          style={{cursor:'pointer'}}
          onClick={this.props.close}
        >
          Cancel
        </a>
      );
    }

    if (this.props.data.specimen.analysis && !this.props.editable.analysis) {
      //TODO: Make the below a separate component
      if (this.props.data.specimen.analysis.data) {
      let analysisData = this.props.data.specimen.analysis.data;

        specimenMethodAttributeFields = Object.keys(analysisData).map((key) => {
          if (this.props.options.attributeDatatypes[
            this.props.options.specimenMethodAttributes[this.props.data.specimen.analysis.methodId][key].datatypeId
          ].datatype === 'file') {
            return (
              <LinkElement
               label={this.props.options.specimenMethodAttributes[this.props.data.specimen.analysis.methodId][key].name}
               text={analysisData[key]}
               href={loris.BaseURL+'/biobank/ajax/requestData.php?action=downloadFile&file='+analysisData[key]}
               target={'_blank'}
               download={analysisData[key]}
              />
            );
          } else {
            return ( 
              <StaticElement
                label={this.props.options.specimenMethodAttributes[this.props.data.specimen.analysis.methodId][key].name}
                text={analysisData[key]}
              />
            );
          }
        });
      }

      analysisForm = (
        <FormElement>
          <StaticElement
            label='Method'
            text={this.props.options.specimenMethods[this.props.data.specimen.analysis.methodId].method}
          />
          <StaticElement
            label='Location'
            text={this.props.options.centers[this.props.data.specimen.analysis.locationId]}
          />
          {specimenMethodAttributeFields}
          <StaticElement
            label='Date'
            text={this.props.data.specimen.analysis.date}
          />
          <StaticElement
            label='Time'
            text={this.props.data.specimen.analysis.time}
          />
          <StaticElement
            label='Comments'
            text={this.props.data.specimen.analysis.comments}
          />
        </FormElement>
      );
    }

    if (!(Object.keys(specimenMethods).length === 0) && !this.props.data.specimen.analysis && !this.props.editable.analysis) {
      analysisPanel = (
	      <div
          className='panel specimen-panel inactive'
	      >
          <div
            className='add-process'
            onClick={() => {this.props.edit('analysis'); this.props.addAnalysis()}}
          >
            <span className='glyphicon glyphicon-plus'/>
          </div>
          <div>
          ADD ANALYSIS
          </div>
        </div>
      );
    } else if (this.props.data.specimen.analysis || this.props.editable.analysis) {
      analysisPanel = (
        <div className='panel specimen-panel panel-default'>
          <div className='panel-heading'>
            <div className='lifecycle-node preparation'>
              <div className='letter'>A</div>
            </div>
            <div className='title'>
              Analysis
            </div>
            <span
              className={this.props.editable.analysis ? null : 'glyphicon glyphicon-pencil'}
              onClick={this.props.editable.analysis ? null : () => {this.props.edit('analysis')}}
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
        specimen={this.props.specimen}
        container={this.props.container}
        data={this.props.data}
        options={this.props.options}
        editable={this.props.editable}
        edit={this.props.edit}
        close={this.props.close}
        mapFormOptions={this.props.mapFormOptions}
        loadSpecimen={this.props.loadSpecimen}
        setSpecimen={this.props.setSpecimen}
        saveSpecimen={this.props.saveSpecimen}
        loadContainer={this.props.loadContainer}
        setContainer={this.props.setContainer}
        saveContainer={this.props.saveContainer}
      />
    );

    //TODO: this can maybe become its own component...?
    let returnToFilter = (
      <div>
        <br/>
        <span className='action'>
          <div
            className='action-button update'
            onClick={this.props.loadFilters}
          >
            <span className='glyphicon glyphicon-chevron-left'/>
          </div>
        </span>
        <div className='action-title'>
          Return to Filter
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
                <strong>{this.props.data.container.barcode}</strong>
              </div>
            </div>
            {addAliquotForm}
            <ContainerCheckout
              container={this.props.data.container}
              setContainer={this.props.setContainer}
              saveContainer={this.props.saveContainer}
            />
          </div>
          <LifeCycle
            specimen={this.props.data.specimen}
            centers={this.props.options.centers}
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
        {returnToFilter}
      </div>
    ); 
  }
}

BiobankSpecimen.propTypes = {
  specimenPageDataURL: React.PropTypes.string.isRequired,
};

export default BiobankSpecimen;
