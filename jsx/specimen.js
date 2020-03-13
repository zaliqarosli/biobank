import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import Globals from './globals.js';
import SpecimenProcessForm from './processForm';
import Header from './header.js';

/**
 * Biobank Specimen
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

  addProcess(process) {
    this.props.editSpecimen(this.props.target.specimen)
    .then(() => {
      const specimen = this.props.current.specimen;
      specimen[process] = {centerId: this.props.target.container.centerId};
      this.props.setCurrent('specimen', specimen);
    })
    .then(() => this.props.edit(process));
  }

  alterProcess(process) {
    this.props.editSpecimen(this.props.target.specimen)
    .then(() => this.props.edit(process));
  }

  openAliquotForm() {
    this.props.edit('aliquotForm')
    .then(() => this.props.editSpecimen(this.props.target.specimen));
  }

  render() {
    const {current, data, editable, errors, options, target} = this.props;
    /**
     * Collection Form
     */

    const alterCollection = () => {
      if (loris.userHasPermission('biobank_specimen_alter')) {
        return (
          <span
            className={editable.collection ? null : 'glyphicon glyphicon-pencil'}
            onClick={editable.collection ? null : () => this.alterProcess('collection')}
          />
        );
      }
    };

    const cancelAlterCollection = () => {
      if (editable.collection) {
        return (
          <a className="pull-right" style={{cursor: 'pointer'}} onClick={this.props.clearAll}>
            Cancel
          </a>
        );
      }
    };

    const collectionPanel = (
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
            <FormElement>
              <SpecimenProcessForm
                current={current}
                errors={errors.specimen.collection}
                edit={editable.collection}
                specimen={current.specimen}
                options={options}
                process={editable.collection ? current.specimen.collection : target.specimen.collection}
                processStage={'collection'}
                setCurrent={this.props.setCurrent}
                setParent={this.props.setSpecimen}
                typeId={editable.collection ? current.specimen.typeId : target.specimen.typeId}
                updateSpecimen={this.props.updateSpecimen}
              />
            </FormElement>
            {cancelAlterCollection()}
          </div>
      </div>
    );

    /**
     * Preparation Form
     */

    const alterPreparation = () => {
      if (loris.userHasPermission('biobank_specimen_alter')) {
        return (
          <span
            className={editable.preparation ? null : 'glyphicon glyphicon-pencil'}
            onClick={editable.preparation ? null : () => this.alterProcess('preparation')}
          />
        );
      }
    };

    const cancelAlterPreparation = () => {
      if (editable.preparation) {
        return (
          <a className="pull-right" style={{cursor: 'pointer'}} onClick={this.props.clearAll}>
            Cancel
          </a>
        );
      }
    };

    const preparationPanel = () => {
      const protocolExists = Object.values(options.specimen.protocols).find(
        (protocol) => {
          return protocol.typeId == target.specimen.typeId &&
          options.specimen.processes[protocol.processId].label == 'Preparation';
        }
      );
      if (protocolExists &&
          !target.specimen.preparation &&
          !editable.preparation &&
          loris.userHasPermission('biobank_specimen_update')) {
        const addPreparation = () => this.addProcess('preparation');
        return (
          <div className='panel specimen-panel inactive'>
            <div className='add-process' onClick={addPreparation}>
              <span className='glyphicon glyphicon-plus'/>
            </div>
            <div>ADD PREPARATION</div>
          </div>
        );
      } else if (target.specimen.preparation || editable.preparation) {
        return (
          <div className='panel specimen-panel panel-default'>
              <div className='panel-heading'>
                <div className='lifecycle-node collection'>
                  <div className='letter'>P</div>
                </div>
                <div className='title'>
                  Preparation
                </div>
                {alterPreparation()}
              </div>
              <div className='panel-body'>
                <FormElement>
                  <SpecimenProcessForm
                    current={current}
                    errors={errors.specimen.preparation}
                    edit={editable.preparation}
                    specimen={current.specimen}
                    options={options}
                    process={editable.preparation ? current.specimen.preparation : target.specimen.preparation}
                    processStage={'preparation'}
                    setCurrent={this.props.setCurrent}
                    setParent={this.props.setSpecimen}
                    typeId={editable.preparation ? current.specimen.typeId : target.specimen.typeId}
                    updateSpecimen={this.props.updateSpecimen}
                  />
                </FormElement>
                {cancelAlterPreparation()}
              </div>
          </div>
        );
      }
    };

    /**
     * Analysis Form
     */

    const alterAnalysis = () => {
      if (loris.userHasPermission('biobank_specimen_alter')) {
        return (
          <span
            className={editable.analysis ? null : 'glyphicon glyphicon-pencil'}
            onClick={editable.analysis ? null : () => this.alterProcess('analysis')}
          />
        );
      }
    };

    const cancelAlterAnalysis = () => {
      if (editable.analysis) {
        return (
          <a className="pull-right" style={{cursor: 'pointer'}} onClick={this.props.clearAll}>
            Cancel
          </a>
        );
      }
    };

    const analysisPanel = () => {
      const protocolExists = Object.values(options.specimen.protocols).find(
        (protocol) => {
          return protocol.typeId == target.specimen.typeId &&
          options.specimen.processes[protocol.processId].label == 'Analysis';
        }
      );
      if (protocolExists &&
          !target.specimen.analysis &&
          !editable.analysis &&
          loris.userHasPermission('biobank_specimen_update')) {
        const addAnalysis = () => this.addProcess('analysis');
        return (
          <div className='panel specimen-panel inactive'>
            <div className='add-process' onClick={addAnalysis}>
              <span className='glyphicon glyphicon-plus'/>
            </div>
            <div>ADD ANALYSIS</div>
          </div>
        );
      } else if (target.specimen.analysis || editable.analysis) {
        return (
          <div className='panel specimen-panel panel-default'>
              <div className='panel-heading'>
                <div className='lifecycle-node collection'>
                  <div className='letter'>A</div>
                </div>
                <div className='title'>
                  Analysis
                </div>
                {alterAnalysis()}
              </div>
              <div className='panel-body'>
                <FormElement>
                  <SpecimenProcessForm
                    current={current}
                    errors={errors.specimen.analysis}
                    edit={editable.analysis}
                    specimen={current.specimen}
                    options={options}
                    process={editable.analysis ? current.specimen.analysis : target.specimen.analysis}
                    processStage={'analysis'}
                    setCurrent={this.props.setCurrent}
                    setParent={this.props.setSpecimen}
                    typeId={editable.analysis ? current.specimen.typeId : target.specimen.typeId}
                    updateSpecimen={this.props.updateSpecimen}
                  />
                </FormElement>
                {cancelAlterAnalysis()}
              </div>
          </div>
        );
      }
    };

    let globals = (
      <Globals
        specimen={current.specimen}
        container={current.container}
        data={data}
        target={target}
        options={options}
        errors={errors}
        editable={editable}
        edit={this.props.edit}
        clearAll={this.props.clearAll}
        setSpecimen={this.props.setSpecimen}
        editSpecimen={this.props.editSpecimen}
        updateSpecimen={this.props.updateSpecimen}
        setContainer={this.props.setContainer}
        editContainer={this.props.editContainer}
        updateContainer={this.props.updateContainer}
        getCoordinateLabel={this.props.getCoordinateLabel}
      />
    );

    return (
      <div>
        <Link to={`/`}><span className='glyphicon glyphicon-chevron-left'/> Return to Filter</Link>
        <div id='specimen-page'>
          <Header
            current={current}
            editable={editable}
            options={options}
            editContainer={this.props.editContainer}
            edit={this.props.edit}
            target={this.props.target}
            clearAll={this.props.clearAll}
            openAliquotForm={this.openAliquotForm}
            setContainer={this.props.setContainer}
            updateContainer={this.props.updateContainer}
            editContainer={this.props.editContainer}
            getParentContainerBarcodes={this.props.getParentContainerBarcodes}
            getBarcodePathDisplay={this.props.getBarcodePathDisplay}
          />
          <div className='summary'>
            {globals}
            <div className="processing">
              {collectionPanel}
              {preparationPanel()}
              {analysisPanel()}
            </div>
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
