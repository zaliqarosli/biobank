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
        const onUpdate = () => this.props.updateContainer(current.container);
        const containerTypes = mapFormOptions(
          options.container.typesPrimary,
          'label'
        );
        return (
          <div className="item">
            <div className='field'>
              Container Type
              <div className='inline-field'>
                <div style={{flex: '1 0 25%', minWidth: '90px'}}>
                  <SelectElement
                    name='typeId'
                    inputClass='col-lg-11'
                    onUserInput={this.props.setContainer}
                    options={containerTypes}
                    value={current.container.typeId}
                    errorMessage={this.props.errors.containerType}
                  />
                </div>
                <div style={{flex: '0 1 15%', margin: '0 1%'}}>
                  <ButtonElement
                    label="Update"
                    onUserInput={onUpdate}
                    columnSize= 'col-lg-11'
                  />
                </div>
                <div style={{flex: '0 1 15%', margin: '0 1%'}}>
                  <a onClick={this.props.clearAll} style={{cursor: 'pointer'}}>
                    Cancel
                  </a>
                </div>
              </div>
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

    const updateQuantity = () => {
      if (loris.userHasPermission('biobank_specimen_update')) {
        return (
          <div className='action' title='Update Quantity'>
            <div
              className='action-button update'
              onClick={() => {
                this.props.edit('quantity');
                this.props.editSpecimen(specimen);
              }}
            >
              <span className='glyphicon glyphicon-chevron-right'/>
            </div>
          </div>
        );
      }
    };

    const quantityField = () => {
      if (specimen) {
        if (!editable.quantity) {
          return (
            <div className="item">
              <div className='field'>
                Quantity
                <div className='value'>
                  {Math.round(specimen.quantity * 100) / 100}
                  {' '+options.specimen.units[specimen.unitId].label}
                </div>
              </div>
              {updateQuantity()}
            </div>
          );
        } else {
          const units = mapFormOptions(
            options.specimen.typeUnits[specimen.typeId], 'label'
          );

          return (
            <div className="item">
              <div className='field'>
                Quantity
                <QuantityField
                  specimen={current.specimen}
                  errors={this.props.errors.specimen}
                  units={units}
                  clearAll={this.props.clearAll}
                  setSpecimen={this.props.setSpecimen}
                  updateSpecimen={()=>this.props.updateSpecimen(current.specimen)}
                />
              </div>
            </div>
          );
        }
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

    const updateTemperature = () => {
      if (loris.userHasPermission('biobank_container_update')) {
        return (
          <div className='action' title='Update Temperature'>
            <span
              className='action-button update'
              onClick={() => {
                this.props.edit('temperature')
                .then(() => this.props.editContainer(container));
             }}
            >
             <span className='glyphicon glyphicon-chevron-right'/>
            </span>
          </div>
        );
      }
    };

    const temperatureField = () => {
      if (!editable.temperature) {
        return (
          <div className="item">
            <div className='field'>
              Temperature
              <div className='value'>
              {container.temperature + '°C'}
              </div>
            </div>
            {updateTemperature()}
          </div>
        );
      } else {
        return (
          <div className="item">
            <div className='field'>
              Temperature
              <TemperatureField
                container={current.container}
                errors={this.props.errors.container}
                clearAll={this.props.clearAll}
                setContainer={this.props.setContainer}
                updateContainer={this.props.updateContainer}
              />
            </div>
          </div>
        );
      }
    };

    const updateStatus = () => {
      if (loris.userHasPermission('biobank_container_update')) {
        return (
          <div className='action' title='Update Status'>
            <span
              className='action-button update'
              onClick={() => {
                this.props.edit('status');
                this.props.editContainer(container);
              }}
            >
              <span className='glyphicon glyphicon-chevron-right'/>
            </span>
          </div>
        );
      }
    };

    const statusField = () => {
      if (!editable.status) {
        return (
          <div className="item">
            <div className='field'>
              Status
              <div className='value'>
                {options.container.stati[container.statusId].label}
              </div>
              {container.comments}
            </div>
            {updateStatus()}
          </div>
        );
      } else {
        const stati = mapFormOptions(options.container.stati, 'label');
        return (
          <div className="item">
            <div className='field'>
              Status
              <StatusField
                container={current.container}
                errors={this.props.errors.container}
                stati={stati}
                clearAll={this.props.clearAll}
                setContainer={this.props.setContainer}
                updateContainer={this.props.updateContainer}
              />
            </div>
          </div>
        );
      }
    };

    const updateProject = () => {
      if (loris.userHasPermission('biobank_container_update')) {
        return (
          <div className='action' title='Update Project'>
            <span
              className='action-button update'
              onClick={() => {
                this.props.edit('project');
                this.props.editContainer(container);
              }}
            >
              <span className='glyphicon glyphicon-chevron-right'/>
            </span>
          </div>
        );
      }
    };

    const projectField = () => {
      if (!editable.project) {
        return (
          <div className="item">
            <div className='field'>
              Projects
              <div className='value'>
                {container.projectIds.length !== 0 ?
                 container.projectIds
                   .map((id) => options.projects[id])
                   .join(', ') : 'None'}
              </div>
            </div>
            {updateProject()}
          </div>
        );
      } else {
        return (
          <div className="item">
            <div className='field'>
              Projects
              <ProjectField
                container={current.container}
                errors={this.props.errors.container}
                projects={this.props.options.projects}
                clearAll={this.props.clearAll}
                multiple={true}
                emptyOption={false}
                setContainer={this.props.setContainer}
                updateContainer={this.props.updateContainer}
              />
            </div>
          </div>
        );
      }
    };

    const updateCenter = () => {
      if (loris.userHasPermission('biobank_container_update')) {
        return (
          <div className='action' title='Update Status'>
            <span
              className='action-button update'
              onClick={() => {
                this.props.edit('center');
                this.props.editContainer(container);
              }}
            >
              <span className='glyphicon glyphicon-chevron-right'/>
            </span>
          </div>
        );
      }
    };

    const centerField = () => {
      if (!editable.center) {
        return (
          <div className="item">
            <div className='field'>
              Current Site
              <div className='value'>
                {options.centers[container.centerId]}
              </div>
            </div>
            {updateCenter()}
          </div>
        );
      } else {
        return (
          <div className="item">
            <div className='field'>
              Current Site
              <CenterField
                container={current.container}
                errors={this.props.errors.container}
                centers={options.centers}
                clearAll={this.props.clearAll}
                setContainer={this.props.setContainer}
                updateContainer={this.props.updateContainer}
              />
            </div>
          </div>
        );
      }
    };

    const originField = () => {
      return (
        <div className="item">
          <div className='field'>
            Origin Site
            <div className='value'>
              {options.centers[container.originId]}
            </div>
          </div>
        </div>
      );
    };

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
                      target={target}
                      container={current.container}
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
        {temperatureField()}
        {statusField()}
        {projectField()}
        {centerField()}
        {originField()}
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

// TODO: The following fields should be condensed into a single component.

/**
 * Biobank Container Status Field
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 * */

class StatusField extends Component {
  render() {
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

    const onUpdate = () => this.props.updateContainer(this.props.container);
    return (
      <div className='inline-field'>
        <div style={{flex: '1 0 25%', minWidth: '90px'}}>
            <SelectElement
              name='statusId'
              options={this.props.stati}
              inputClass='col-lg-11'
              onUserInput={this.props.setContainer}
              value={this.props.container.statusId}
              errorMessage={this.props.errors.statusId}
            />
            {renderCommentsField()}
        </div>
        <div style={{flex: '0 1 15%', margin: '0 1%'}}>
          <ButtonElement
            label='Update'
            onUserInput={onUpdate}
            columnSize= 'col-lg-11'
          />
        </div>
        <div style={{flex: '0 1 15%', margin: '0 1%'}}>
          <a onClick={this.props.clearAll} style={{cursor: 'pointer'}}>
            Cancel
          </a>
        </div>
      </div>
    );
  }
}

StatusField.propTypes = {
  setContainer: PropTypes.func.isRequired,
  clearAll: PropTypes.func,
  stati: PropTypes.object.isRequired,
  container: PropTypes.object.isRequired,
  updateContainer: PropTypes.func.isRequired,
  className: PropTypes.string,
};

class ProjectField extends Component {
  render() {
    const onUpdate = () => this.props.updateContainer(this.props.container);
    return (
      <div className='inline-field'>
        <div style={{flex: '1 0 25%', minWidth: '90px'}}>
            <SelectElement
              name='projectIds'
              options={this.props.projects}
              inputClass='col-lg-11'
              onUserInput={this.props.setContainer}
              multiple={this.props.multiple}
              emptyOption={this.props.emptyOption}
              value={this.props.container.projectIds}
              errorMessage={this.props.errors.projectIds}
            />
        </div>
        <div style={{flex: '0 1 15%', margin: '0 1%'}}>
          <ButtonElement
            label='Update'
            onUserInput={onUpdate}
            columnSize= 'col-lg-11'
          />
        </div>
        <div style={{flex: '0 1 15%', margin: '0 1%'}}>
          <a onClick={this.props.clearAll} style={{cursor: 'pointer'}}>
            Cancel
          </a>
        </div>
      </div>
    );
  }
}

ProjectField.propTypes = {
  setContainer: PropTypes.func.isRequired,
  clearAll: PropTypes.func,
  projects: PropTypes.object.isRequired,
  container: PropTypes.object.isRequired,
  updateContainer: PropTypes.func.isRequired,
  className: PropTypes.string,
};

/**
 * Biobank Container Temperature Form
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 * */

class TemperatureField extends Component {
  render() {
    const onUpdate = () => this.props.updateContainer(this.props.container);
    return (
      <div className='inline-field'>
        <div style={{flex: '1 0 25%', minWidth: '90px'}}>
            <TextboxElement
              name='temperature'
              inputClass='col-lg-11'
              onUserInput={this.props.setContainer}
              value={this.props.container.temperature}
              errorMessage={this.props.errors.temperature}
            />
        </div>
        <div style={{flex: '0 1 15%', margin: '0 1%'}}>
          <ButtonElement
            label="Update"
            onUserInput={onUpdate}
            columnSize= 'col-lg-11'
          />
        </div>
        <div style={{flex: '0 1 15%', margin: '0 1%'}}>
          <a onClick={this.props.clearAll} style={{cursor: 'pointer'}}>
            Cancel
          </a>
        </div>
      </div>
    );
  }
}

TemperatureField.propTypes = {
  setContainer: PropTypes.func.isRequired,
  clearAll: PropTypes.func,
  container: PropTypes.object.isRequired,
  updateContainer: PropTypes.func.isRequired,
  className: PropTypes.string,
};

/**
 * Biobank Container Center Field
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 * */

class CenterField extends Component {
  render() {
    const onUpdate = () => this.props.updateContainer(this.props.container);
    return (
      <div className='inline-field'>
        <div style={{flex: '1 0 25%', minWidth: '90px'}}>
            <SelectElement
              name='centerId'
              options={this.props.centers}
              inputClass='col-lg-11'
              onUserInput={this.props.setContainer}
              value={this.props.container.centerId}
              errorMessage={this.props.errors.centerId}
            />
        </div>
        <div style={{flex: '0 1 15%', margin: '0 1%'}}>
          <ButtonElement
            label="Update"
            onUserInput={onUpdate}
            columnSize= 'col-lg-11'
          />
        </div>
        <div style={{flex: '0 1 15%', margin: '0 1%'}}>
          <a onClick={this.props.clearAll} style={{cursor: 'pointer'}}>
            Cancel
          </a>
        </div>
      </div>
    );
  }
}

CenterField.propTypes = {
  setContainer: PropTypes.func.isRequired,
  clearAll: PropTypes.func.isRequired,
  centerIds: PropTypes.object.isRequired,
  container: PropTypes.object.isRequired,
  updateContainer: PropTypes.func.isRequired,
  className: PropTypes.string,
};

/**
 * Biobank Specimen Quantity Field
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 * */
class QuantityField extends Component {
  render() {
    return (
      <div className='inline-field'>
        <div style={{flex: '1 0 25%', minWidth: '90px'}}>
          <TextboxElement
            name='quantity'
            inputClass='col-xs-11'
            onUserInput={this.props.setSpecimen}
            value={this.props.specimen.quantity}
            errorMessage={this.props.errors.quantity}
          />
        </div>
        <div style={{flex: '1 0 25%', minWidth: '90px'}}>
          <SelectElement
            name='unitId'
            inputClass='col-xs-11'
            options={this.props.units}
            onUserInput={this.props.setSpecimen}
            value={this.props.specimen.unitId}
            errorMessage={this.props.errors.unitId}
          />
        </div>
        <div style={{flex: '0 1 15%', margin: '0 1%'}}>
          <ButtonElement
            label="Update"
            onUserInput={this.props.updateSpecimen}
            columnSize= 'col-xs-11'
          />
        </div>
        <div style={{flex: '0 1 15%', margin: '0 1%'}}>
          <a onClick={this.props.clearAll} style={{cursor: 'pointer'}}>
            Cancel
          </a>
        </div>
      </div>
    );
  }
}

QuantityField.propTypes = {
  setSpecimen: PropTypes.func,
  clearAll: PropTypes.func,
  specimen: PropTypes.object,
  updateSpecimen: PropTypes.func,
  className: PropTypes.string,
};

export default Globals;
