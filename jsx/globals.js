import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {mapFormOptions} from './helpers.js';

import Modal from 'Modal';
import ContainerParentForm from './containerParentForm';

/**
 * Biobank Globals Component
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 **/

class Globals extends Component {
  constructor() {
    super();
    this.increaseCycle = this.increaseCycle.bind(this);
    this.decreaseCycle = this.decreaseCycle.bind(this);
  }

  increaseCycle() {
    this.props.editSpecimen(this.props.specimen)
    .then(() => {
      let cycle = this.props.specimen.fTCycle;
      cycle++;
      this.props.setSpecimen('fTCycle', cycle);
    })
    .then(()=>this.props.updateSpecimen(this.props.current.specimen));
  }

  decreaseCycle() {
    this.props.editSpecimen(this.props.specimen)
    .then(() => {
      let cycle = this.props.specimen.fTCycle;
      cycle--;
      this.props.setSpecimen('fTCycle', cycle);
    })
    .then(()=>this.props.updateSpecimen(this.props.current.specimen));
  }

  render() {
    const {current, data, editable, options, specimen, container} = this.props;

    const specimenTypeField = () => {
      if (specimen) {
        return (
          <div className="item">
            <div className='field'>
              Specimen Type
              <div className='value'>
                {options.specimen.types[specimen.typeId].label}
              </div>
            </div>
          </div>
        );
      }
    };

    const updateContainerType = () => {
      if (loris.userHasPermission('biobank_specimen_alter') && specimen) {
        return (
          <div className='action' title='Alter Container Type'>
            <span
              style={{color: 'grey'}}
              className='glyphicon glyphicon-pencil'
              onClick={() => {
                this.props.edit('containerType');
                this.props.editContainer(container);
              }}
            />
          </div>
        );
      }
    };

    const containerTypeField = () => {
      if (!editable.containerType) {
        return (
          <div className="item">
            <div className='field'>
              Container Type
              {updateContainerType()}
              <div className='value'>
                {options.container.types[container.typeId].label}
              </div>
            </div>
          </div>
        );
      } else {
        const containerTypes = mapFormOptions(
          options.container.typesPrimary,
          'label'
        );
        return (
          <div className="item">
            <div className='field'>
              Container Type
              <InlineField
                updateValue={this.props.updateContainer}
                clearAll={this.props.clearAll}
              >
                <SelectElement
                  name='typeId'
                  onUserInput={this.props.setContainer}
                  options={containerTypes}
                  value={current.container.typeId}
                  errorMessage={this.props.errors.containerType}
                />
              </InlineField>
            </div>
          </div>
        );
      }
    };

    const poolField = () => {
      if ((specimen||{}).poolId) {
        return (
          <div className="item">
            <div className='field'>
              Pool
              <div className='value'>
                {data.pools[specimen.poolId].label}
              </div>
            </div>
          </div>
        );
      }
    };

    const quantityField = () => {
      if (specimen) {
        return (
          <InlineField
            label='Quantity'
            clearAll={this.props.clearAll}
            updateValue={()=>this.props.updateSpecimen(current.specimen)}
            edit={() => this.props.edit('quantity')}
            editValue={() => this.props.editSpecimen(specimen)}
            value={Math.round(specimen.quantity * 100) / 100+
            ' '+options.specimen.units[specimen.unitId].label}
            editable={editable.quantity}
          >
            <TextboxElement
              name='quantity'
              onUserInput={this.props.setSpecimen}
              value={this.props.current.specimen.quantity}
              errorMessage={this.props.errors.specimen.quantity}
            />
            <SelectElement
              name='unitId'
              options={units}
              onUserInput={this.props.setSpecimen}
              value={this.props.current.specimen.unitId}
              errorMessage={this.props.errors.specimen.unitId}
            />
          </InlineField>
        );
      }
    };

    const fTCycleField = () => {
      if (specimen
          && options.specimen.types[specimen.typeId].freezeThaw == 1) {
        const decreaseCycle = () => {
          if (specimen.fTCycle > 0) {
            return (
              <div className='action' title='Remove Cycle'>
                <span
                  className='action-button update'
                  onClick={this.decreaseCycle}
                >
                  <span className='glyphicon glyphicon-minus'/>
                </span>
              </div>
            );
          }
        };

        const increaseCycle = () => {
          return (
            <div className='action' title='Add Cycle'>
              <span className='action-button update' onClick={this.increaseCycle}>
                <span className='glyphicon glyphicon-plus'/>
              </span>
            </div>
          );
        };

        const updateFTCycle = () => {
          if (loris.userHasPermission('biobank_specimen_update')) {
            return <div>{decreaseCycle()} {increaseCycle()}</div>;
          }
        };

        return (
          <div className='item'>
            <div className='field'>
            Freeze-Thaw Cycle
              <div className='value'>
                {specimen.fTCycle || 0}
              </div>
            </div>
            {updateFTCycle()}
          </div>
        );
      }
    };

    const temperatureField = (
      <InlineField
        label={'Temperature'}
        clearAll={this.props.clearAll}
        updateValue={this.props.updateContainer}
        edit={() => this.props.edit('temperature')}
        editValue={() => this.props.editContainer(container)}
        value={container.temperature + '°'}
        editable={editable.temperature}
      >
        <TextboxElement
          name='temperature'
          onUserInput={this.props.setContainer}
          value={this.props.container.temperature}
          errorMessage={this.props.errors.container.temperature}
        />
      </InlineField>
    );

    const renderCommentsField = () => {
      if (this.props.stati[this.props.container.statusId] !== 'Discarded' &&
          this.props.stati[this.props.container.statusId] !== 'Dispensed' &&
          this.props.stati[this.props.container.statusId] !== 'Shipped') {
        return null;
      }
      return (
        <TextareaElement
          name='comments'
          onUserInput={this.props.setContainer}
          value={this.props.container.comments}
          required={true}
        />
      );
    };
    const stati = mapFormOptions(options.container.stati, 'label');
    const statusField = (
      <InlineField
        label={'Status'}
        clearAll={this.props.clearAll}
        updateValue={this.props.updateContainer}
        edit={() => this.props.edit('status')}
        editValue={() => this.props.editContainer(container)}
        value={options.container.stati[container.statusId].label}
        subValue={container.comments}
        editable={editable.status}
      >
        <SelectElement
          name='statusId'
          options={stati}
          onUserInput={this.props.setContainer}
          value={this.props.current.container.statusId}
          errorMessage={this.props.errors.container.statusId}
        />
        {renderCommentsField}
      </InlineField>
    );

    const projectField = (
      <InlineField
        label='Projects'
        clearAll={this.props.clearAll}
        updateValue={this.props.updateContainer}
        edit={() => this.props.edit('project')}
        editValue={() => this.props.editContainer(container)}
        value={container.projectIds.length !== 0 ?
         container.projectIds
           .map((id) => options.projects[id])
           .join(', ') : 'None'}
        editable={editable.project}
      >
        <SelectElement
          name='projectIds'
          options={this.props.options.projects}
          onUserInput={this.props.setContainer}
          multiple={true}
          emptyOption={false}
          value={this.props.current.container.projectIds}
          errorMessage={this.props.errors.container.projectIds}
        />
      </InlineField>
    );

    const centerField = (
      <InlineField
        label='Current Site'
        clearAll={this.props.clearAll}
        updateValue={this.props.updateContainer}
        edit={() => this.props.edit('center')}
        editValue={() => this.editContainer(container)}
        value={options.center[container.centerId]}
        editable={editable.center}
      >
        <SelectElement
          name='centerId'
          options={this.props.options.centers}
          onUserInput={this.props.setContainer}
          value={this.props.current.container.centerId}
          errorMessage={this.props.errors.container.centerId}
        />
      </InlineField>
    );

    const originField = (
      <div className="item">
        <div className='field'>
          Origin Site
          <div className='value'>
            {options.centers[container.originId]}
          </div>
        </div>
      </div>
    );

    const parentSpecimenField = () => {
      if ((specimen||{}).parentSpecimenIds) {
        const parentSpecimenBarcodes = Object.values(specimen.parentSpecimenIds)
          .map((id) => {
            const barcode = data.containers[
                              data.specimens[id].containerId
                            ].barcode;
            return <Link to={`/barcode=${barcode}`}>{barcode}</Link>;
          })
          .reduce((prev, curr) => [prev, ', ', curr]);

        return (
          <div className='item'>
            <div className='field'>
            Parent Specimen
              <div className='value'>
                {parentSpecimenBarcodes || 'None'}
              </div>
            </div>
          </div>
        );
      }
    };

    const parentContainerField = () => {
      if (loris.userHasPermission('biobank_container_view')) {
        // Set Parent Container Barcode Value if it exists
        const parentContainerBarcodeValue = () => {
          if (container.parentContainerId) {
            const barcode = data.containers[
                            container.parentContainerId
                          ].barcode;
            return <Link to={`/barcode=${barcode}`}>{barcode}</Link>;
          }
        };

        const updateParentContainer = () => {
          if (loris.userHasPermission('biobank_container_update')) {
            return (
              <div>
                <div className='action' title='Move Container'>
                  <span
                    className='action-button update'
                    onClick={() => {
                      this.props.edit('containerParentForm');
                      this.props.editContainer(container);
                    }}
                  >
                    <span className='glyphicon glyphicon-chevron-right'/>
                  </span>
                </div>
                <div>
                  <Modal
                    title='Update Parent Container'
                    onClose={this.props.clearAll}
                    show={editable.containerParentForm}
                    onSubmit={() => this.props.updateContainer(current.container)}
                  >
                    <ContainerParentForm
                      display={true}
                      current={current}
                      container={container}
                      options={options}
                      data={data}
                      setContainer={this.props.setContainer}
                      updateContainer={this.props.updateContainer}
                    />
                  </Modal>
                </div>
              </div>
            );
          }
        };

        let coordinate;
        if (container.coordinate) {
          coordinate = this.props.getCoordinateLabel(container);
        }

        return (
          <div className="item">
            <div className='field'>
              Parent Container
              <div className='value'>
                {parentContainerBarcodeValue() || 'None'}
              </div>
              {(parentContainerBarcodeValue && container.coordinate) ?
              'Coordinate '+ coordinate : null}
            </div>
            {updateParentContainer()}
          </div>
        );
      }
    };

    const candidateSessionField = () => {
      if (specimen) {
        return (
          <div className="item">
            <div className='field'>
              PSCID
              <div className='value'>
                <a href={loris.BaseURL+'/'+specimen.candidateId}>
                  {options.candidates[specimen.candidateId].pscid}
                </a>
              </div>
            </div>
            <div className='field'>
              Visit Label
              <div className='value'>
                <a href={
                  loris.BaseURL+'/instrument_list/?candID='+
                  specimen.candidateId+'&sessionID='+
                  specimen.sessionId
                }>
                  {options.sessions[specimen.sessionId].label}
                </a>
              </div>
            </div>
          </div>
        );
      }
    };

    const fieldList = (
      <div className='list'>
        {specimenTypeField()}
        {containerTypeField()}
        {poolField()}
        {quantityField()}
        {fTCycleField()}
        {temperatureField}
        {statusField}
        {projectField}
        {centerField}
        {originField}
        {parentSpecimenField()}
        {parentContainerField()}
        {candidateSessionField()}
      </div>
    );

    return (
      <div className="globals">
        {fieldList}
      </div>
    );
  }
}

Globals.propTypes = {
};

/**
 * Inline Field
 *
 * @param {object} props
 * @return {*}
 * */
function InlineField(props) {
  const fields = React.Children.map((child) => (
      <div style={{flex: '1 0 25%', minWidth: '90px'}}>
        {child}
      </div>
    )
  ); 
  // inputClass='col-lg-11'

  const updateButton = () => {
    if (loris.userHasPermission('biobank_container_update')) {
      return (
        <div className='action' title={'Update '+this.props.label}>
          <span
            className='action-button update'
            onClick={() => {
              this.props.edit();
              this.props.editValue();
            }}
          >
            <span className='glyphicon glyphicon-chevron-right'/>
          </span>
        </div>
      );
    }
  };

  renderField = () => {
    return this.props.editable ? (
      <div className='inline-field'>
        {fields}
        <div style={{flex: '0 1 15%', margin: '0 1%'}}>
          <ButtonElement
            label="Update"
            onUserInput={props.updateValue}
            columnSize= 'col-xs-11'
          />
        </div>
        <div style={{flex: '0 1 15%', margin: '0 1%'}}>
          <a onClick={props.clearAll} style={{cursor: 'pointer'}}>
            Cancel
          </a>
        </div>
      </div>
    ) : (
      <div className='value'>
        {this.props.value}
      </div>
    );
  }

  return (
    <div className="item">
      <div className='field'>
        {this.props.label}
        {renderField()}
      </div>
      {this.props.editable ? null : updateButton()}
    </div>
  );
}

InlineField.propTypes = {
  clearAll: PropTypes.func,
  specimen: PropTypes.object,
  updateValue: PropTypes.func,
  className: PropTypes.string,
};

export default Globals;
