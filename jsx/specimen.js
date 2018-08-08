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
  constructor() {
    super();
    this.openAliquotForm = this.openAliquotForm.bind(this);
  }
  
  addPreparation() {
    let specimen = this.props.current.specimen;
    specimen.preparation = {centerId: this.props.data.container.centerId};
    this.props.setCurrent('specimen', specimen);
  }

  addAnalysis() {
    let specimen = this.props.current.specimen;
    specimen.analysis = {centerId: this.props.data.container.centerId};
    this.props.setCurrent('specimen', specimen);
  }

  openAliquotForm() {
    this.props.edit('aliquotForm').then(() => {
      this.props.editSpecimen(this.props.data.specimen).then(() => {
        this.props.addListItem('specimen')
      });
    });
  }

  render() {
    let addAliquotForm = (
      <div className='action' title='Make Aliquots'>
        <div className='action-button add' onClick={this.openAliquotForm}>+</div>
        <Modal
          title="Add Aliquots"
          closeModal={this.props.close}
          show={this.props.editable.aliquotForm}
        >
          <BiobankSpecimenForm
            data={this.props.data}
            options={this.props.options}
            current={this.props.current}
            errors={this.props.errors}
            mapFormOptions={this.props.mapFormOptions}
            toggleCollapse={this.props.toggleCollapse}
            setCurrent={this.props.setCurrent}
            setSpecimenList={this.props.setSpecimenList}
            setContainerList={this.props.setContainerList}
            addListItem={this.props.addListItem}
            copyListItem={this.props.copyListItem}
            removeListItem={this.props.removeListItem}
            saveSpecimenList={this.props.saveSpecimenList}
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
      let containerTypesPrimary = this.props.mapFormOptions(
        this.props.options.containerTypesPrimary, 'label'
      );

      collectionPanelForm = (
        <SpecimenCollectionForm
          specimen={this.props.current.specimen}
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
            text={this.props.options.centers[this.props.data.specimen.collection.centerId]}
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
              onClick={this.props.editable.collection ? null : 
                () => {
                  this.props.edit('collection');
                  this.props.editSpecimen(this.props.data.specimen)
                }
              }
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
      if (this.props.options.specimenProtocols[id].typeId == this.props.data.specimen.typeId) {
        specimenProtocols[id] = this.props.options.specimenProtocols[id].protocol;
        specimenProtocolAttributes[id] = this.props.options.specimenProtocolAttributes[id];
      }
    }

    if (this.props.editable.preparation) {
      preparationForm = (
        <SpecimenPreparationForm
          specimen={this.props.current.specimen}
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

    // If Preparation does Exist and the form is not in an edit state
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
            text={this.props.options.centers[this.props.data.specimen.preparation.centerId]}
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
            onClick={
              () => {
                this.props.edit('preparation');
                this.props.editSpecimen(this.props.data.specimen).then(
                  () => this.addPreparation()
                )
              }
            }
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
              onClick={this.props.editable.preparation ? null :
                () => {
                  this.props.edit('preparation');
                  this.props.editSpecimen(this.props.data.specimen);
                }
              }
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
      if (this.props.options.specimenMethods[id].typeId == this.props.data.specimen.typeId) {
        specimenMethods[id] = this.props.options.specimenMethods[id].method;
        specimenMethodAttributes[id] = this.props.options.specimenMethodAttributes[id];
      }
    }

    if (this.props.editable.analysis) {
      analysisForm = (
        <SpecimenAnalysisForm
          specimen={this.props.current.specimen}
          data={this.props.data}
          current={this.props.current}
          specimenMethods={specimenMethods}
          specimenMethodAttributes={specimenMethodAttributes}
          attributeDatatypes={this.props.options.attributeDatatypes}
          attributeOptions={this.props.options.attributeOptions}
          setSpecimen={this.props.setSpecimen}
          setCurrent={this.props.setCurrent}
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
            text={this.props.options.centers[this.props.data.specimen.analysis.centerId]}
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
            onClick={
              () => {
                this.props.edit('analysis');
                this.props.editSpecimen(this.props.data.specimen).then(
                  () => this.addAnalysis()
                )
              }
            }
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
              onClick={this.props.editable.analysis ? null :
                () => {
                  this.props.edit('analysis');
                  this.props.editSpecimen(this.props.data.specimen);
                }
              }
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
        specimen={this.props.current.specimen}
        container={this.props.current.container}
        data={this.props.data}
        options={this.props.options}
        errors={this.props.errors}
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
        editSpecimen={this.props.editSpecimen}
        editContainer={this.props.editContainer}
      />
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
              editContainer={this.props.editContainer}
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
      </div>
    ); 
  }
}

BiobankSpecimen.propTypes = {
  specimenPageDataURL: React.PropTypes.string.isRequired,
};

export default BiobankSpecimen;
