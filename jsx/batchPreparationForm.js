import {PureComponent} from 'react';
import SpecimenProcessForm from './processForm';
import Modal from 'Modal';
import Loader from 'Loader';
import {mapFormOptions, clone, isEmpty} from './helpers.js';

import swal from 'sweetalert2';

/**
 * Biobank BatchPreparation Specimen Form
 *
 * TODO: DESCRIPTION
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 **/
const defaultState = {
  preparation: {},
  list: {},
  count: 0,
  current: {},
  loading: false,
};

class BatchPreparationForm extends React.PureComponent {
  constructor() {
    super();

    this.state = defaultState;
    this.setCurrent = this.setCurrent.bind(this);
    this.setPreparation = this.setPreparation.bind(this);
    this.validateListItem = this.validateListItem.bind(this);
    this.setPreparationList = this.setPreparationList.bind(this);
    this.setPool = this.setPool.bind(this);
  };

  setCurrent(name, value) {
    const {current} = clone(this.state);
    current[name] = value;
    return new Promise((res) => this.setState({current}, res()));
  }

  setPreparation(name, value) {
    const preparation = clone(this.state.preparation);
    preparation[name] = value;
    return new Promise((res) => this.setState({preparation}, res()));
  }

  setPreparationList(containerId) {
    let {list, current, preparation, count} = clone(this.state);

    // Increase count.
    count++;

    // Set Specimen and Container.
    const container = this.props.data.containers[containerId];
    const specimen = this.props.data.specimens[container.specimenId];

    // Set current global values.
    current.typeId = specimen.typeId;
    current.centerId = container.centerId;

    // Set list values.
    list[count] = {specimen, container};

    // Set current preparation values.
    preparation.centerId = container.centerId;

    this.setState(
      {preparation, list, current, count, containerId},
      this.setState({containerId: null})
    );
  }

  setPool(name, poolId) {
    const pool = clone(this.props.data.pools[poolId]);

    this.setState({loading: true});
    this.setCurrent('poolId', poolId)
    .then(() => Promise.all(pool.specimenIds
      .map((specimenId) => Object.values(this.state.list)
        .find((item) => item.specimen.id === specimenId)
        || this.setPreparationList(this.props.data.specimens[specimenId].containerId))
      .map((p) => p instanceof Promise ? p : Promise.resolve(p))))
    .then(() => this.setCurrent('poolId', null))
    .then(() => this.setState({loading: false}));
  }

  removeListItem(key) {
    let {list, current} = clone(this.state);
    delete list[key];
    current = isEmpty(list) ? {} : current;
    const containerId = null;
    this.setState({list, current, containerId});
  }

  validateListItem(containerId) {
    const {current, list} = clone(this.state);
    const container = this.props.data.containers[containerId];
    const specimen = this.props.data.specimens[container.specimenId];
    if (!isEmpty(list) &&
      (specimen.typeId !== current.typeId ||
      container.centerId !== current.centerId)
    ) {
      swal.fire('Oops!', 'Specimens must be of the same Type and Center', 'warning');
      return Promise.reject();
    }
    return Promise.resolve();
  }

  render() {
    if (this.state.loading) {
      return <Loader/>;
    }

    const {data, errors, options} = this.props;
    const {containerId, poolId, preparation, list, current} = this.state;

    const preparationForm = (
      <SpecimenProcessForm
        edit={true}
        errors={errors.preparation}
        options={options}
        process={preparation}
        processStage='preparation'
        setParent={this.setPreparation}
        setCurrent={this.setCurrent}
        typeId={current.typeId}
      />
    );

    // TODO: This should likely be filtered so that only pools that match the
    // proper criteria are left in the list.
    const pools = mapFormOptions(data.pools, 'label');
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

    const handlePoolInput = (name, value) => value && this.setPool(name, value);
    const form = (
      <FormElement>
        <div className='row'>
          <div className='col-sm-10 col-sm-offset-1'>
            <StaticElement
              label='Preparation Note'
              text="Select or Scan the specimens to be prepared. Specimens must
                    have a Status of 'Available', have a Quantity of greater
                    than 0, and share the same Type. Any previous Preparation
                    associated with a Pooled Specimen will be overwritten if one
                    is added on this form."
            />
            <StaticElement
              label='Specimen Type'
              text={(options.specimen.types[current.typeId]||{}).label || '—'}
            />
            <StaticElement
              label='Site'
              text={options.centers[current.centerId] || '—'}
            />
            <div className='row'>
              <div className='col-xs-6'>
                <h4>Barcode Input</h4>
                <div className='form-top'/>
                <BarcodeInput
                  data={data}
                  options={options}
                  list={list}
                  containerId={containerId}
                  validateListItem={this.validateListItem}
                  setPreparationList={this.setPreparationList}
                />
                <SearchableDropdown
                  name={'poolId'}
                  label={'Pool'}
                  onUserInput={handlePoolInput}
                  options={pools}
                  value={poolId}
                />
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
            {preparationForm}
          </div>
        </div>
      </FormElement>
    );

    const handleClose = () => {
      this.setState(defaultState);
      this.props.onClose();
    };
    const handleSubmit = () => this.props.onSubmit(preparation, list);
    return (
      <Modal
        title='Prepare Specimens'
        show={this.props.show}
        onClose={handleClose}
        onSubmit={handleSubmit}
        throwWarning={true}
      >
        {form}
      </Modal>
    );
  }
}

BatchPreparationForm.propTypes = {
};

class BarcodeInput extends PureComponent {
  render() {
    const {data, options, list, containerId, setPreparationList} = this.props;
    // Create options for barcodes based on match typeId
    const barcodesPrimary = Object.values(data.containers)
    .reduce((result, container) => {
      if (options.container.types[container.typeId].primary == 1) {
        const specimen = data.specimens[container.specimenId];
        const availableId = Object.keys(options.container.stati).find(
          (key) => options.container.stati[key].label == 'Available'
        );
        const protocolExists = Object.values(options.specimen.protocols).find(
          (protocol) => protocol.typeId == specimen.typeId
        );
        const inList = Object.values(list)
        .find((i) => i.container.id == container.id);

        if (container.statusId == availableId && protocolExists && !inList) {
          result[container.id] = container.barcode;
        }
      }
      return result;
    }, {});

    const handleInput = (name, containerId) => {
      containerId && this.props.validateListItem(containerId)
      .then(() => setPreparationList(containerId));
    };
    return (
      <SearchableDropdown
        name={'containerId'}
        label={'Specimen'}
        onUserInput={handleInput}
        options={barcodesPrimary}
        value={containerId}
      />
    );
  }
}

export default BatchPreparationForm;
