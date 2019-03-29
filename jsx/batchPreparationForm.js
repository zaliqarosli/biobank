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

    this.setPreparationGlobals = this.setPreparationGlobals.bind(this);
    this.setPool = this.setPool.bind(this);
  };

  setPreparationGlobals(key, containerId) {
    let list = this.props.current.list;
    const container = this.props.data.containers.primary[containerId];
    const specimen = Object.values(this.props.data.specimens).find(
      (specimen) => specimen.containerId == containerId
    );

    list[key].container = container;
    list[key].specimen = specimen;

    this.props.setCurrent('list', list);
    this.props.setCurrent('typeId', specimen.typeId);
    this.props.setCurrent('centerId', container.centerId);
  }

  setPool(name, poolId) {
    const specimens = Object.values(this.props.data.specimens).filter(
      (specimen) => specimen.poolId == poolId
    );

    this.props.setListLength('total', specimens.length)
    .then(() => this.props.setCurrent(name, poolId))
    .then(() => {
      specimens.forEach((specimen, key) => {
        this.setPreparationGlobals(key, specimen.containerId);
      });
     });
  }

  render() {
    let list = this.props.current.list;
    let containersPrimary = {};

    // Create options for barcodes based on match typeId
    Object.values(this.props.data.containers.primary).forEach((container) => {
      const specimen = Object.values(this.props.data.specimens).find(
        (specimen) => specimen.containerId == container.id
      );
      const availableId = Object.keys(this.props.options.container.stati).find(
        (key) => this.props.options.container.stati[key].label == 'Available'
      );
      const protocolExists = Object.values(this.props.options.specimen.protocols).find(
        (protocol) => protocol.typeId == specimen.typeId
      );

      if (specimen.quantity != 0 && container.statusId == availableId && protocolExists) {
        if (this.props.current.typeId) {
          if (
             specimen.typeId == this.props.current.typeId
             && container.centerId == this.props.current.centerId
           ) {
          containersPrimary[container.id] = container;
          }
        } else {
          containersPrimary[container.id] = container;
        }
      }
    });

    // Only allow containers that are not already in the list
    const barcodes = Object.keys(list).map((key) => {
      const validContainers = Object.keys(containersPrimary).reduce((result, id) => {
        const f = Object.values(list).find((i) => i.container.id == id);
        if (!f || list[key].container.id == id) {
          result[id] = containersPrimary[id];
        }
        return result;
      }, {});

      let barcodesPrimary = this.props.mapFormOptions(validContainers, 'barcode');

      return (
        <SearchableDropdown
          name={key}
          key={key}
          label={'Barcode ' + (parseInt(key)+1)}
          onUserInput={(key, containerId) => {
            containerId && this.setPreparationGlobals(key, containerId);
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
          errors={this.props.errors.preparation}
          options={this.props.options}
          process={this.props.current.preparation}
          processStage='preparation'
          setParent={this.props.setCurrent}
          setCurrent={this.props.setCurrent}
          typeId={this.props.current.typeId}
        />
      </div>
    );

    const pools = this.props.mapFormOptions(this.props.data.pools, 'label');
    const batchPreparationForm = (
      <div>
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
              text={
                (this.props.options.specimen.types[this.props.current.typeId]||{}).label || '—'
              }
            />
            <StaticElement
              label='Site'
              text={
                this.props.options.centers[this.props.current.centerId] || '—'
             }
            />
            <div className='form-top'>
              <SearchableDropdown
                name={'pool'}
                label={'Pool'}
                onUserInput={this.setPool}
                options={pools}
                value={this.props.current.pool}
              />
            </div>
            {/* TODO: find a better way to place this 'form-top' line here*/}
            <div className='form-top'>
              <NumericElement
                name='total'
                label='№ of Specimens'
                min='1'
                max='100'
                value={Object.keys(this.props.current.list).length}
                onUserInput={
                  (name, value) => 1 < value < 100 && this.props.setListLength(name, value)
                }
              />
            </div>
            {barcodes}
            {preparationForm}
          </div>
        </div>
      </div>
    );

    return (
      <FormElement>
        {batchPreparationForm}
      </FormElement>
    );
  }
}

BatchPreparationForm.propTypes = {
};

export default BatchPreparationForm;
