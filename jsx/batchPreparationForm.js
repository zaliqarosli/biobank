import {PureComponent} from 'react';
import SpecimenProcessForm from './processForm';
import Modal from 'Modal';

/**
 * Biobank BatchPreparation Specimen Form
 *
 * TODO: DESCRIPTION
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 **/
class BatchPreparationForm extends React.Component {
  constructor() {
    super();

    this.state = {
      preparation: {},
      list: {},
      count: 0,
      current: {},
    };

    this.setCurrent = this.setCurrent.bind(this);
    this.setPreparationList = this.setPreparationList.bind(this);
    this.setPool = this.setPool.bind(this);
  };

  clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  setCurrent(name, value) {
    return new Promise((resolve) => {
      const current = this.state.current;
      current[name] = value;
      this.setState({current}, resolve());
    });
  }

  setPreparationList(containerId) {
    this.setCurrent('containerId', 1).then(() => this.setCurrent('containerId', null));
    const list = this.clone(this.state.list);
    const current = this.clone(this.state.current);
    const preparation = this.clone(this.state.preparation);
    const container = this.props.data.containers[containerId];
    const specimen = Object.values(this.props.data.specimens).find(
      (specimen) => specimen.containerId == containerId
    );

    const count = this.state.count+1;

    // Use setListItem here instead.
    list[count] = {specimen, container};

    current.typeId = specimen.typeId;
    current.centerId = container.centerId;

    preparation.centerId = container.centerId;

    this.setState({preparation, list, current, count});
  }

  setPool(name, poolId) {
    const specimens = Object.values(this.props.data.specimens)
      .filter((specimen) => specimen.poolId == poolId);

    this.setCurrent(name, poolId)
      .then(() => Promise.all(specimens
        .map((specimen) => Object.values(this.state.list)
          .find((item) => item.specimen.id === specimen.id)
          || this.setPreparationList(specimen.containerId))
        .map((p) => p instanceof Promise ? p : Promise.resolve(p))))
      .then(() => this.setCurrent(name, null));
  }

  removeListItem(key) {
    const list = this.clone(this.state.list);
    delete list[key];
    if (Object.keys(list).length === 0) {
      this.setState({current: {}});
    }
    this.setState({list});
  }

  render() {
    console.log('render batch preparation form');
    const {data, errors, options} = this.props;
    const {preparation, list, current} = this.state;

    const preparationForm = (
      <SpecimenProcessForm
        edit={true}
        errors={errors.preparation}
        mapFormOptions={this.props.mapFormOptions}
        options={options}
        process={this.state.preparation}
        processStage='preparation'
        setParent={this.setCurrent}
        setCurrent={this.setCurrent}
        typeId={current.typeId}
      />
    );

    const pools = this.props.mapFormOptions(data.pools, 'label');
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
                  data={this.props.data}
                  options={this.props.options}
                  current={this.state.current}
                  list={this.state.list}
                  setPreparationList={this.setPreparationList}
                />
                <SearchableDropdown
                  name={'poolId'}
                  label={'Pool'}
                  onUserInput={this.setPool}
                  options={pools}
                  value={current.poolId}
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

    const handleSubmit = () => this.props.onSubmit(preparation, list);
    return (
      <Modal
        title='Prepare Specimens'
        show={this.props.show}
        onClose={this.props.onClose}
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
  componentDidUpdate(prevProps, prevState) {
    Object.entries(this.props).forEach(([key, val]) =>
      prevProps[key] !== val && console.log(`Prop '${key}' changed`)
    );
  }

  render() {
    console.log('render batch preparation barcode input');
    const {data, options, current, list, setPreparationList} = this.props;
    // Create options for barcodes based on match typeId
    const containersPrimary = Object.values(data.containers)
      .reduce((result, container) => {
        if (options.container.types[container.typeId].primary == 1) {
          const specimen = Object.values(data.specimens).find(
            (specimen) => specimen.containerId == container.id
          );
          const availableId = Object.keys(options.container.stati).find(
            (key) => options.container.stati[key].label == 'Available'
          );
          const protocolExists = Object.values(options.specimen.protocols).find(
            (protocol) => protocol.typeId == specimen.typeId
          );

          if (specimen.quantity != 0 && container.statusId == availableId
              && protocolExists) {
            if (current.typeId) {
              if (
                 specimen.typeId == current.typeId
                 && container.centerId == current.centerId
               ) {
                result[container.id] = container;
              }
            } else {
              result[container.id] = container;
            }
          }
        }
        return result;
      }, {}
    );

    const barcodesPrimary = Object.keys(containersPrimary).reduce((result, id) => {
      const inList = Object.values(list).find((i) => i.container.id == id);
      if (!inList) {
        result[id] = containersPrimary[id].barcode;
      }
      return result;
    }, {});

    const handleSpecimenInput = (name, containerId) => containerId && setPreparationList(containerId);
    return (
      <SearchableDropdown
        name={'containerId'}
        label={'Specimen'}
        onUserInput={handleSpecimenInput}
        options={barcodesPrimary}
      />
    );
  }
}

export default BatchPreparationForm;
