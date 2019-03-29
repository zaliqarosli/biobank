import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Modal from 'Modal';
import Globals from './globals.js';
import SpecimenProcessForm from './processForm';
import BiobankSpecimenForm from './specimenForm.js';
import LifeCycle from './lifeCycle.js';
import ContainerCheckout from './containerCheckout.js';

/**
 * Biobank Specimen
 *
 * TODO: DESCRIPTION
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 */
class BiobankSpecimen extends Component {
  constructor() {
    super();
    this.openAliquotForm = this.openAliquotForm.bind(this);
  }

  addPreparation() {
    let specimen = this.props.current.specimen;
    specimen.preparation = {centerId: this.props.target.container.centerId};
    console.warn(specimen);
    this.props.setCurrent('specimen', specimen);
  }

  addAnalysis() {
    let specimen = this.props.current.specimen;
    specimen.analysis = {centerId: this.props.target.container.centerId};
    this.props.setCurrent('specimen', specimen);
  }

  openAliquotForm() {
    this.props.edit('aliquotForm')
    .then(() => this.props.editSpecimen(this.props.target.specimen))
    .then(() => this.props.addListItem('specimen'));
  }

  render() {
    console.warn(this.props.target);
    const status = this.props.options.container.stati[this.props.target.container.statusId].label;
    const addAliquotForm = () => {
      if (loris.userHasPermission('biobank_specimen_create')
          && status == 'Available'
          && this.props.target.specimen.quantity > 0) {
        return (
          <div>
            <div className='action' title='Make Aliquots'>
              <div className='action-button add' onClick={this.openAliquotForm}>+</div>
            </div>
            <div>
              <Modal
                title="Add Aliquots"
                onClose={this.props.clearAll}
                show={this.props.editable.aliquotForm}
                onSubmit={() => {
                  this.props.createSpecimens()
                  .then(() => this.props.updateSpecimen(this.props.current.specimen))
                  .then(() => this.props.clearAll());
                }}
              >
                <FormElement>
                  <BiobankSpecimenForm
                    parent={[this.props.target]}
                    options={this.props.options}
                    data={this.props.data}
                    current={this.props.current}
                    errors={this.props.errors}
                    mapFormOptions={this.props.mapFormOptions}
                    toggleCollapse={this.props.toggleCollapse}
                    setCurrent={this.props.setCurrent}
                    setSpecimen={this.props.setSpecimen}
                    setListItem={this.props.setListItem}
                    addListItem={this.props.addListItem}
                    copyListItem={this.props.copyListItem}
                    removeListItem={this.props.removeListItem}
                  />
                </FormElement>
              </Modal>
            </div>
          </div>
        );
      }
    };

    /**
     * Collection Form
     */
    // Declare Variables
    let collectionPanel;
    let collectionPanelForm;
    let cancelEditCollectionButton;

    if (this.props.editable.collection) {
      collectionPanelForm = (
        <FormElement>
          <SpecimenProcessForm
            current={this.props.current}
            errors={this.props.errors.specimen.process}
            specimen={this.props.current.specimen}
            options={this.props.options}
            process={this.props.current.specimen.collection}
            processStage={'collection'}
            setCurrent={this.props.setCurrent}
            setParent={this.props.setSpecimen}
            typeId={this.props.current.specimen.typeId}
            updateSpecimen={this.props.updateSpecimen}
          />
        </FormElement>
      );

      cancelEditCollectionButton = (
        <a
          className="pull-right"
          style={{cursor: 'pointer'}}
          onClick={this.props.clearAll}
        >
          Cancel
        </a>
      );
    } else {
      let specimenTypeAttributes;
      // loops through data object to produce static elements
      if (this.props.target.specimen.collection.data) {
        let collectionData = this.props.target.specimen.collection.data;
        specimenTypeAttributes = Object.keys(collectionData).map((key) => {
          return (
            <StaticElement
              label={this.props.options.specimen.protocolAttributes[this.props.target.specimen.typeId][key].label}
              text={collectionData[key]}
            />
          );
        });
      }

      collectionPanelForm = (
        <FormElement>
          <StaticElement
            label='Protocol'
            text={this.props.options.specimen.protocols[this.props.target.specimen.collection.protocolId].label}
          />
          <StaticElement
            label='Quantity'
            text={
              this.props.target.specimen.collection.quantity+' '+
              this.props.options.specimen.units[
                this.props.target.specimen.collection.unitId
              ].label
            }
          />
          <StaticElement
            label='Site'
            text={this.props.options.centers[this.props.target.specimen.collection.centerId]}
          />
            {specimenTypeAttributes}
          <StaticElement
            label='Date'
            text={this.props.target.specimen.collection.date}
          />
          <StaticElement
            label='Time'
            text={this.props.target.specimen.collection.time}
          />
          <StaticElement
            label='Comments'
            text={this.props.target.specimen.collection.comments}
          />
        </FormElement>
      );
    }

    const alterCollection = () => {
      if (loris.userHasPermission('biobank_specimen_alter')) {
        return (
          <span
            className={this.props.editable.collection ? null : 'glyphicon glyphicon-pencil'}
            onClick={this.props.editable.collection ? null :
              () => {
                this.props.editSpecimen(this.props.target.specimen)
                .then(() => this.props.edit('collection'));
              }
            }
          />
        );
      }
    };

    collectionPanel = (
      <div className='panel specimen-panel panel-default'>
          <div className='panel-heading'>
            <div className='lifecycle-node collection'>
              <div className='letter'>C</div>
            </div>
            <div className='title'>
              Collection
            </div>
            {alterCollection()}
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
    if (this.props.editable.preparation) {
      preparationForm = (
        <SpecimenProcessForm
          current={this.props.current}
          errors={this.props.errors.specimen.process}
          options={this.props.options}
          process={this.props.current.specimen.preparation}
          processStage={'preparation'}
          setParent={this.props.setSpecimen}
          setCurrent={this.props.setSpecimen}
          specimen={this.props.current.specimen}
          typeId={this.props.current.specimen.typeId}
          updateSpecimen={this.props.updateSpecimen}
        />
      );

      cancelEditPreparationButton = (
        <a className="pull-right" style={{cursor: 'pointer'}} onClick={this.props.clearAll}>
          Cancel
        </a>
      );
    }

    // If Preparation does Exist and the form is not in an edit state
    let specimenProtocolAttributes;
    if (this.props.target.specimen.preparation && !this.props.editable.preparation) {
      if (this.props.target.specimen.preparation.data) {
        let preparationData = this.props.target.specimen.preparation.data;
        specimenProtocolAttributes = Object.keys(preparationData).map((key) => {
          return (
            <StaticElement
              label={this.props.options.specimen.protocolAttributes[this.props.target.specimen.preparation.protocolId][key].label}
              text={preparationData[key]}
            />
          );
        });
      }

      preparationForm = (
        <FormElement>
          <StaticElement
            label='Protocol'
            text={this.props.options.specimen.protocols[this.props.target.specimen.preparation.protocolId].label}
          />
          <StaticElement
            label='Site'
            text={this.props.options.centers[this.props.target.specimen.preparation.centerId]}
          />
          {specimenProtocolAttributes}
          <StaticElement
            label='Date'
            text={this.props.target.specimen.preparation.date}
          />
          <StaticElement
            label='Time'
            text={this.props.target.specimen.preparation.time}
          />
          <StaticElement
            label='Comments'
            text={this.props.target.specimen.preparation.comments}
          />
        </FormElement>
      );
    }

    // If preparation does not exist and if the form is not in an edit state
    // and a preparation protocol exists for this specimen type
    const protocolExists = Object.values(this.props.options.specimen.protocols).find(
      (protocol) => protocol.typeId == this.props.target.specimen.typeId
    );
    if (protocolExists &&
        !this.props.target.specimen.preparation &&
        !this.props.editable.preparation &&
        loris.userHasPermission('biobank_specimen_update')) {
      preparationPanel = (
        <div
          className='panel specimen-panel inactive'
        >
          <div
            className='add-process'
            onClick={
              () => {
                this.props.editSpecimen(this.props.target.specimen)
                .then(() => this.addPreparation())
                .then(() => this.props.edit('preparation'));
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
    } else if (this.props.target.specimen.preparation || this.props.editable.preparation) {
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
                  this.props.editSpecimen(this.props.target.specimen);
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

    for (let id in this.props.options.specimen.methods) {
      if (this.props.options.specimen.methods[id].typeId == this.props.target.specimen.typeId) {
        specimenMethods[id] = this.props.options.specimen.methods[id].method;
        specimenMethodAttributes[id] = this.props.options.specimen.methodAttributes[id];
      }
    }

    if (this.props.editable.analysis) {
      analysisForm = (
        <FormElement>
          <SpecimenProcessForm
            current={this.props.current}
            errors={this.props.errors.specimen.process}
            options={this.props.options}
            process={this.props.current.specimen.analysis}
            processStage={'analysis'}
            setParent={this.props.setSpecimen}
            setCurrent={this.props.setSpecimen}
            specimen={this.props.current.specimen}
            typeId={this.props.current.specimen.typeId}
            updateSpecimen={this.props.updateSpecimen}
          />
        </FormElement>
      );

      cancelEditAnalysisButton = (
        <a
          className='pull-right'
          style={{cursor: 'pointer'}}
          onClick={this.props.clearAll}
        >
          Cancel
        </a>
      );
    }

    if (this.props.target.specimen.analysis && !this.props.editable.analysis) {
      // TODO: Make the below a separate component
      if (this.props.target.specimen.analysis.data) {
      let analysisData = this.props.target.specimen.analysis.data;

        specimenMethodAttributeFields = Object.keys(analysisData).map((key) => {
          if (this.props.options.specimen.attributeDatatypes[
            this.props.options.specimen.methodAttributes[this.props.target.specimen.analysis.methodId][key].datatypeId
          ].datatype === 'file') {
            return (
              <LinkElement
               label={this.props.options.specimen.methodAttributes[this.props.target.specimen.analysis.methodId][key].label}
               text={analysisData[key]}
               href={loris.BaseURL+'/biobank/?action=downloadFile&file='+analysisData[key]}
               target={'_blank'}
               download={analysisData[key]}
              />
            );
          } else {
            return (
              <StaticElement
                label={this.props.options.specimen.methodAttributes[this.props.target.specimen.analysis.methodId][key].label}
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
            text={this.props.options.specimen.protocols[this.props.target.specimen.analysis.protocolId].label}
          />
          <StaticElement
            label='Site'
            text={this.props.options.centers[this.props.target.specimen.analysis.centerId]}
          />
          {specimenMethodAttributeFields}
          <StaticElement
            label='Date'
            text={this.props.target.specimen.analysis.date}
          />
          <StaticElement
            label='Time'
            text={this.props.target.specimen.analysis.time}
          />
          <StaticElement
            label='Comments'
            text={this.props.target.specimen.analysis.comments}
          />
        </FormElement>
      );
    }

    if (!(Object.keys(specimenMethods).length === 0) &&
        !this.props.target.specimen.analysis &&
        !this.props.editable.analysis &&
        loris.userHasPermission('biobank_specimen_update')) {
      analysisPanel = (
        <div
          className='panel specimen-panel inactive'
        >
          <div
            className='add-process'
            onClick={
              () => {
                this.props.edit('analysis');
                this.props.editSpecimen(this.props.target.specimen)
                .then(() => this.addAnalysis());
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
    } else if (this.props.target.specimen.analysis || this.props.editable.analysis) {
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
                  this.props.editSpecimen(this.props.target.specimen);
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
        target={this.props.target}
        options={this.props.options}
        errors={this.props.errors}
        editable={this.props.editable}
        edit={this.props.edit}
        clearAll={this.props.clearAll}
        mapFormOptions={this.props.mapFormOptions}
        setSpecimen={this.props.setSpecimen}
        editSpecimen={this.props.editSpecimen}
        updateSpecimen={this.props.updateSpecimen}
        setContainer={this.props.setContainer}
        editContainer={this.props.editContainer}
        updateContainer={this.props.updateContainer}
      />
    );

    return (
      <div id='specimen-page'>
        <div className="specimen-header">
          <div className='specimen-title'>
            <div className='barcode'>
              Barcode
              <div className='value'>
                <strong>{this.props.target.container.barcode}</strong>
              </div>
            </div>
            {addAliquotForm()}
            <ContainerCheckout
              container={this.props.target.container}
              current={this.props.current}
              editContainer={this.props.editContainer}
              setContainer={this.props.setContainer}
              updateContainer={this.props.updateContainer}
            />
          </div>
          <LifeCycle
            specimen={this.props.target.specimen}
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
  specimenPageDataURL: PropTypes.string.isRequired,
};

export default BiobankSpecimen;
