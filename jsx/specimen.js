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
    this.alterProcess = this.alterProcess.bind(this);
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
              <Process
                process='collection'
                target={this.props.target}
                editable={editable.collection}
                alterProcess={this.alterProcess}
                clearAll={this.props.clearAll}
                current={current}
                errors={errors}
                options={options}
                setCurrent={this.props.setCurrent}
                setParent={this.props.setSpecimen}
                updateSpecimen={this.props.updateSpecimen}
              />
              <Process
                process='preparation'
                target={this.props.target}
                editable={editable.preparation}
                alterProcess={this.alterProcess}
                clearAll={this.props.clearAll}
                current={current}
                errors={errors}
                options={options}
                setCurrent={this.props.setCurrent}
                setParent={this.props.setSpecimen}
                updateSpecimen={this.props.updateSpecimen}
              />
              <Process
                process='analysis'
                target={this.props.target}
                editable={editable.analysis}
                alterProcess={this.alterProcess}
                clearAll={this.props.clearAll}
                current={current}
                errors={errors}
                options={options}
                setCurrent={this.props.setCurrent}
                setParent={this.props.setSpecimen}
                updateSpecimen={this.props.updateSpecimen}
              />
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

class Process extends Component {
  render() {
    const {editable, process, current, target, options} = this.props;

    const alterProcess = () => {
      if (loris.userHasPermission('biobank_specimen_alter')) {
        return (
          <span
            className={editable ? null : 'glyphicon glyphicon-pencil'}
            onClick={editable ? null : () => this.props.alterProcess(process)}
          />
        );
      }
    };

    const cancelAlterProcess = () => {
      if (editable) {
        return (
          <a className="pull-right" style={{cursor: 'pointer'}} onClick={this.props.clearAll}>
            Cancel
          </a>
        );
      }
    };

    const protocolExists = Object.values(options.specimen.protocols).find(
      (protocol) => {
        return protocol.typeId == target.specimen.typeId &&
        options.specimen.processes[protocol.processId].label ==
        process.replace(/^\w/, (c) => c.toUpperCase());
      }
    );
    if (protocolExists &&
        !target.specimen[process] &&
        !editable &&
        loris.userHasPermission('biobank_specimen_update')) {
      const addProcess = () => this.addProcess(process);
      return (
        <div className='panel specimen-panel inactive'>
          <div className='add-process' onClick={addProcess}>
            <span className='glyphicon glyphicon-plus'/>
          </div>
          <div>ADD {process.toUpperCase()}</div>
        </div>
      );
    } else if (target.specimen[process] || editable) {
      return (
        <div className='panel specimen-panel panel-default'>
          <div className='panel-heading'>
            <div className={'lifecycle-node '+process}>
              <div className='letter'>
                {process.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className='title'>
              {process.replace(/^\w/, (c) => c.toUpperCase())}
            </div>
            {alterProcess()}
          </div>
          <div className='panel-body'>
            <FormElement>
              <SpecimenProcessForm
                current={this.props.current}
                errors={this.props.errors.specimen.collection}
                edit={editable}
                specimen={current.specimen}
                options={this.props.options}
                process={editable ? current.specimen[process] : target.specimen[process]}
                processStage={process}
                setCurrent={this.props.setCurrent}
                setParent={this.props.setSpecimen}
                typeId={editable ? current.specimen.typeId : target.specimen.typeId}
                updateSpecimen={this.props.updateSpecimen}
              />
            </FormElement>
            {cancelAlterProcess()}
          </div>
        </div>
      );
    }

    return null;
  }
}

export default BiobankSpecimen;
