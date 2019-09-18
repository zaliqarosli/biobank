import Modal from 'Modal';
import React, {PureComponent} from 'react';
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
};

class PoolSpecimenForm extends React.Component {
  constructor() {
    super();

    this.state = defaultState;
    this.setPool = this.setPool.bind(this);
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
    let count = this.state.count+1;

    // Set specimen and container
    const container = this.clone(this.props.data.containers[containerId]);
    const specimen = Object.values(this.props.data.specimens)
      .find((specimen) => specimen.containerId == containerId);

    // Set current global values
    const current = this.clone(this.state.current);
    current.candidateId = specimen.candidateId;
    current.sessionId = specimen.sessionId;
    current.typeId = specimen.typeId;
    current.centerId = container.centerId;

    // Set list values
    const list = this.clone(this.state.list);
    list[count] = {container, specimen};

    // Set current pool values
    const pool = this.clone(this.state.pool);
    const specimenIds = pool.specimenIds || [];
    specimenIds.push(specimen.id);
    pool.centerId = container.centerId;
    pool.specimenIds = specimenIds;

    this.setState({pool, list, count, current});
  }

  removeListItem(key) {
    const pool = this.clone(this.state.pool);
    pool.specimenIds = pool.specimenIds.filter((id) => id != this.state.list[key].specimen.id);

    const list = this.clone(this.state.list);
    delete list[key];

    const current = Object.keys(list).length === 0 ? {} : this.clone(this.state.current);

    this.setState({pool, list, current});
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
    console.log('render barcode input');
    const {current, list, data, options, errors, containerId} = this.props;

    // Create options for barcodes based on match candidateId, sessionId and
    // typeId and don't already belong to a pool.
    const barcodesPrimary = Object.values(data.containers)
    .filter((container) => {
      if (options.container.types[container.typeId].primary == 1) {
        const specimen = data.specimens[container.specimenId];
        const availableId = Object.keys(options.container.stati).find(
          (key) => options.container.stati[key].label === 'Available'
        );

        if (specimen.quantity != 0 &&
            container.statusId == availableId &&
            specimen.poolId == null) {
          if (current.candidateId) {
            if (
              specimen.candidateId == current.candidateId &&
              specimen.sessionId == current.sessionId &&
              specimen.typeId == current.typeId &&
              container.centerId == current.centerId
            ) {
              return true;
            }
          } else {
            return true;
          }
        }
        return false;
      }
    })
    .filter((container) => !Object.values(list).find((i) => i.container.id == container.id))
    .reduce((result, container) => {
      result[container.id] = container.barcode;
      return result;
    }, {});

    const handleInput = (name, containerId) => containerId && this.props.setPoolList(containerId);
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
