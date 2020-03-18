import React, {Component} from 'react';
import PropTypes from 'prop-types';

import SpecimenProcessForm from './processForm';

/**
 * Biobank Specimen
 */
class BiobankSpecimen extends Component {
  constructor() {
    super();
    this.openAliquotForm = this.openAliquotForm.bind(this);
    this.addProcess = this.addProcess.bind(this);
    this.alterProcess = this.alterProcess.bind(this);
  }

  addProcess(process) {
    this.props.editSpecimen(this.props.specimen)
    .then(() => {
      const specimen = this.props.current.specimen;
      specimen[process] = {centerId: this.props.container.centerId};
      this.props.setCurrent('specimen', specimen);
    })
    .then(() => this.props.edit(process));
  }

  alterProcess(process) {
    this.props.editSpecimen(this.props.specimen)
    .then(() => this.props.edit(process));
  }

  openAliquotForm() {
    this.props.edit('aliquotForm')
    .then(() => this.props.editSpecimen(this.props.specimen));
  }

  render() {
    const {current, editable, errors, options, specimen} = this.props;

    return (
      <div className="processing">
        <Process
          process='collection'
          specimen={specimen}
          editable={editable.collection}
          alterProcess={this.alterProcess}
          clearAll={this.props.clearAll}
          current={current}
          errors={errors}
          options={options}
          setCurrent={this.props.setCurrent}
          setSpecimen={this.props.setSpecimen}
          updateSpecimen={this.props.updateSpecimen}
        />
        <Process
          process='preparation'
          addProcess={this.addProcess}
          specimen={specimen}
          editable={editable.preparation}
          alterProcess={this.alterProcess}
          clearAll={this.props.clearAll}
          current={current}
          errors={errors}
          options={options}
          setCurrent={this.props.setCurrent}
          setSpecimen={this.props.setSpecimen}
          updateSpecimen={this.props.updateSpecimen}
        />
        <Process
          process='analysis'
          addProcess={this.addProcess}
          specimen={specimen}
          editable={editable.analysis}
          alterProcess={this.alterProcess}
          clearAll={this.props.clearAll}
          current={current}
          errors={errors}
          options={options}
          setCurrent={this.props.setCurrent}
          setSpecimen={this.props.setSpecimen}
          updateSpecimen={this.props.updateSpecimen}
        />
      </div>
    );
  }
}

BiobankSpecimen.propTypes = {
  specimenPageDataURL: PropTypes.string.isRequired,
};

class Process extends Component {
  render() {
    const {editable, process, current, specimen, options} = this.props;

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
        return protocol.typeId == specimen.typeId &&
        options.specimen.processes[protocol.processId].label ==
        process.replace(/^\w/, (c) => c.toUpperCase());
      }
    );

    let panel = null;
    if (protocolExists &&
        !specimen[process] &&
        !editable &&
        loris.userHasPermission('biobank_specimen_update')) {
      const addProcess = () => this.props.addProcess(process);
      panel = (
        <div className='panel specimen-panel inactive'>
          <div className='add-process' onClick={addProcess}>
            <span className='glyphicon glyphicon-plus'/>
          </div>
          <div>ADD {process.toUpperCase()}</div>
        </div>
      );
    }

    if (specimen[process] || editable) {
      panel = (
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
                process={editable ? current.specimen[process] : specimen[process]}
                processStage={process}
                setCurrent={this.props.setCurrent}
                setParent={this.props.setSpecimen}
                typeId={editable ? current.specimen.typeId : specimen.typeId}
                updateSpecimen={this.props.updateSpecimen}
              />
            </FormElement>
            {cancelAlterProcess()}
          </div>
        </div>
      );
    }

    return panel;
  }
}

export default BiobankSpecimen;
