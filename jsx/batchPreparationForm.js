import SpecimenProcessForm from './processForm';

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

    this.setPreparation = this.setPreparation.bind(this);
    this.setPool = this.setPool.bind(this);
  };

  setPreparation(key, containerId) {
    const list = this.props.current.list;
    const container = this.props.data.containers.primary[containerId];
    const specimen = Object.values(this.props.data.specimens).find(
      (specimen) => specimen.containerId == containerId
    );

    list[key].specimen = specimen;
    list[key].container = container;

    this.props.setCurrent('list', list);
    this.props.setCurrent('typeId', specimen.typeId);
    this.props.setCurrent('centerId', container.centerId);
  }

  setPool(name, poolId) {
    const specimens = Object.values(this.props.data.specimens).filter(
      (specimen) => specimen.poolId == poolId
    );
    // TODO: Currently, if a pool that contains unavailable, 0 quantity or
    // specimens with no protocol it will still try to be rendered.

    this.props.setListLength('total', specimens.length)
    .then(() => this.props.setCurrent(name, poolId))
    .then(() => {
      specimens.forEach((specimen, key) => {
        this.setPreparation(key, specimen.containerId);
      });
    });
  }

  render() {
    const {current, data, errors, options, setCurrent} = this.props;
    const list = current.list;

    // Create options for barcodes based on match typeId
    const containersPrimary = Object.values(data.containers.primary).reduce(
      (result, container) => {
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
        return result;
      }, {}
    );

    // Only allow containers that are not already in the list
    const barcodes = Object.keys(list).map((key) => {
      const validContainers = Object.keys(containersPrimary).reduce((result, id) => {
        const f = Object.values(list).find((i) => i.container.id == id);
        if (!f || list[key].container.id == id) {
          result[id] = containersPrimary[id];
        }
        return result;
      }, {});

      const barcodesPrimary = this.props.mapFormOptions(validContainers, 'barcode');

      return (
        <SearchableDropdown
          name={key}
          key={key}
          label={'Barcode ' + (parseInt(key)+1)}
          onUserInput={(key, containerId) => {
            containerId && this.setPreparation(key, containerId);
          }}
          options={barcodesPrimary}
          value={list[key].container.id}
          required={true}
          disabled={list[key].container.id ? true : false}
        />
      );
    });

    const preparationForm = (
      <div className='form-top'>
        <SpecimenProcessForm
          edit={true}
          errors={errors.preparation}
          mapFormOptions={this.props.mapFormOptions}
          options={options}
          process={current.preparation}
          processStage='preparation'
          setParent={setCurrent}
          setCurrent={setCurrent}
          typeId={current.typeId}
        />
      </div>
    );

    const pools = this.props.mapFormOptions(data.pools, 'label');
    return (
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
            <div className='form-top'>
              <SearchableDropdown
                name={'poolId'}
                label={'Pool'}
                onUserInput={this.setPool}
                options={pools}
                value={current.poolId}
              />
            </div>
            <div className='form-top'>
              <NumericElement
                name='total'
                label='№ of Specimens'
                min='1'
                max='100'
                value={Object.keys(current.list).length}
                onUserInput={
                  (name, value) => 1 < value < 100 && this.props.setListLength(name, value)
                }
              />
            </div>
            {barcodes}
            {preparationForm}
          </div>
        </div>
      </FormElement>
    );
  }
}

BatchPreparationForm.propTypes = {
};

export default BatchPreparationForm;
