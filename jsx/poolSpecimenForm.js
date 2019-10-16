import Modal from 'Modal';
import React, {PureComponent} from 'react';

import swal from 'sweetalert2';
/**
 * Biobank Pool Specimen Form
 *
 * TODO: DESCRIPTION
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 **/

const defaultState = {
  pool: {},
  list: {},
  count: 0,
  current: {},
  containerId: null,
};

class PoolSpecimenForm extends React.Component {
  constructor() {
    super();

    this.state = defaultState;
    this.setPool = this.setPool.bind(this);
    this.validateListItem = this.validateListItem.bind(this);
    this.setPoolList = this.setPoolList.bind(this);
  }

  clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  setPool(name, value) {
    const pool = this.clone(this.state.pool);
    pool[name] = value;
    this.setState({pool});
  }

  setPoolList(containerId) {
    // Increase count
    const {current, list, pool} = this.state;
    let count = this.state.count+1;

    // Set specimen and container
    const container = this.props.data.containers[containerId];
    const specimen = this.props.data.specimens[container.specimenId];

    // Set current global values
    if (Object.keys(list).length == 0) {
      current.candidateId = specimen.candidateId;
      current.sessionId = specimen.sessionId;
      current.typeId = specimen.typeId;
      current.centerId = container.centerId;
    }

    // Set list values
    list[count] = {container, specimen};

    // Set current pool values
    const specimenIds = pool.specimenIds || [];
    specimenIds.push(specimen.id);
    pool.centerId = container.centerId;
    pool.specimenIds = specimenIds;

    this.setState({pool, list, count, current, containerId}, this.setState({containerId: null}));
  }

  removeListItem(key) {
    const pool = this.clone(this.state.pool);
    pool.specimenIds = pool.specimenIds.filter((id) => id != this.state.list[key].specimen.id);

    const list = this.clone(this.state.list);
    delete list[key];

    const current = Object.keys(list).length === 0 ? {} : this.clone(this.state.current);
    const containerId = null;

    this.setState({pool, list, current, containerId});
  }

  validateListItem(containerId) {
    return new Promise((resolve, reject) => {
      const current = this.state.current;
      const list = this.state.list;
      const container = this.props.data.containers[containerId];
      const specimen = this.props.data.specimens[container.specimenId];
      if ((Object.keys(list).length > 0) &&
        (specimen.candidateId !== current.candidateId ||
        specimen.sessionId !== current.sessionId ||
        specimen.typeId !== current.typeId ||
        container.centerId !== current.centerId)
      ) {
        swal.fire({
          title: 'Oops!',
          text: 'Specimens must be of the same PSCID, Visit Label, Type and Center',
          type: 'warning',
        });
        reject();
      }
      resolve();
    });
  }

  render() {
    const {data, errors, options} = this.props;
    const {current, pool, list} = this.state;

    const barcodeInput = (
      <BarcodeInput
        current={current}
        list={list}
        data={data}
        options={options}
        errors={errors}
        containerId={this.state.containerId}
        validateListItem={this.validateListItem}
        setPoolList={this.setPoolList}
      />
    );

    const specimenUnits = this.props.mapFormOptions(options.specimen.units, 'label');

    const glyphStyle = {
      color: '#DDDDDD',
      marginLeft: 10,
      cursor: 'pointer',
    };

    const barcodeList = Object.entries(list)
      .map(([key, item]) => {
        const handleRemoveItem = () => this.removeListItem(key);
        return (
          <div key={key} className='preparation-item'>
            <div>{item.container.barcode}</div>
            <div
              className='glyphicon glyphicon-remove'
              style={glyphStyle}
              onClick={handleRemoveItem}
            />
          </div>
        );
      });

    const error = this.state.error ? 'ERROR' : '';

    const form = (
      <FormElement name="poolSpecimenForm">
        <div className='row'>
          <div className='col-sm-10 col-sm-offset-1'>
            <StaticElement
              label='Pooling Note'
              text="Select or Scan the specimens to be pooled. Specimens must
                    be have a Status of 'Available', have a Quantity of greater
                    than 0, and share the same Type, PSCID, Visit Label
                    and Current Site. Pooled specimens cannot already belong to
                    a pool. Once pooled, the Status of specimen will be changed
                    to 'Dispensed' and there Quantity set to '0'"
            />
            <StaticElement
              label='Specimen Type'
              text={
                (options.specimen.types[current.typeId]||{}).label || '—'}
            />
            <StaticElement
              label='PSCID'
              text={(options.candidates[current.candidateId]||{}).pscid || '—'}
            />
            <StaticElement
              label='Visit Label'
              text={(options.sessions[current.sessionId]||{}).label || '—'}
            />
            <div className='row'>
              <div className='col-xs-6'>
                <h4>Barcode Input</h4>
                <div className='form-top'/>
                {barcodeInput}
              </div>
              <div className='col-xs-6'>
                <h4>Barcode List</h4>
                <div className='form-top'/>
                <div className='preparation-list'>
                  {barcodeList}
                </div>
                {error}
              </div>
            </div>
            <div className='form-top'/>
            <TextboxElement
              name='label'
              label='Label'
              onUserInput={this.setPool}
              required={true}
              value={pool.label}
              errorMessage={errors.pool.label}
            />
            <TextboxElement
              name='quantity'
              label='Quantity'
              onUserInput={this.setPool}
              required={true}
              value={pool.quantity}
              errorMessage={errors.pool.quantity}
            />
            <SelectElement
              name='unitId'
              label='Unit'
              options={specimenUnits}
              onUserInput={this.setPool}
              required={true}
              value={pool.unitId}
              errorMessage={errors.pool.unitId}
            />
            <DateElement
              name='date'
              label='Date'
              onUserInput={this.setPool}
              required={true}
              value={pool.date}
              errorMessage={errors.pool.date}
            />
            <TimeElement
              name='time'
              label='Time'
              onUserInput={this.setPool}
              required={true}
              value={pool.time}
              errorMessage={errors.pool.time}
            />
          </div>
        </div>
      </FormElement>
    );

    const handleClose = () => {
      this.setState(defaultState);
      this.props.onClose();
    };
    const onSubmit = () => this.props.onSubmit(pool, list);
    return (
      <Modal
        title='Pool Specimens'
        show={this.props.show}
        onClose={handleClose}
        onSubmit={onSubmit}
        throwWarning={true}
      >
        {form}
      </Modal>
    );
  }
}

PoolSpecimenForm.propTypes = {
};

class BarcodeInput extends PureComponent {
  render() {
    const {list, data, options, errors, containerId} = this.props;

    // Create options for barcodes based on match candidateId, sessionId and
    // typeId and don't already belong to a pool.
    // TODO: barcodesPrimary should maybe be held in a state.
    const barcodesPrimary = Object.values(data.containers)
    .filter((container) => {
      if (options.container.types[container.typeId].primary == 1) {
        const specimen = data.specimens[container.specimenId];
        const availableId = Object.keys(options.container.stati).find(
          (key) => options.container.stati[key].label === 'Available'
        );

        if (specimen.quantity > 0 &&
            container.statusId == availableId &&
            specimen.poolId == null) {
          return true;
        }
        return false;
      }
    })
    .filter((container) => !Object.values(list).find((i) => i.container.id == container.id))
    .reduce((result, container) => {
      result[container.id] = container.barcode;
      return result;
    }, {});

    const handleInput = (name, containerId) => containerId && this.props.validateListItem(containerId)
      .then(() => this.props.setPoolList(containerId));
    return (
      <SearchableDropdown
        name={'containerId'}
        label={'Specimen'}
        onUserInput={handleInput}
        options={barcodesPrimary}
        value={containerId}
        errorMessage={errors.pool.total}
      />
    );
  }
}

export default PoolSpecimenForm;
