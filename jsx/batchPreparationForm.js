import SpecimenPreparationForm from './preparationForm';

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
  };

  setPreparationGlobals(key, containerId) {
    let list        = this.props.current.list;
    const container = this.props.options.containers[containerId];
    const specimen  = Object.values(this.props.options.specimens).find(
      specimen => {return specimen.containerId == containerId}
    );

    list[key].container = container;
    list[key].specimen  = specimen;

    this.props.setCurrent('list', list);
    this.props.setCurrent('typeId', specimen.typeId);
    this.props.setCurrent('centerId', container.centerId);
  }

  render() {
    let list = this.props.current.list;
    let barcodes = [];
    let containersPrimary = {};

    //Create options for barcodes based on match typeId
    Object.values(this.props.options.containersPrimary).map(container => {
      const specimen = Object.values(this.props.options.specimens).find(
        specimen => specimen.containerId == container.id
      );
      const availableId = Object.keys(this.props.options.containerStati).find(
        key => this.props.options.containerStati[key].status == 'Available'
      );
      const protocolExists = Object.values(this.props.options.specimenProtocols).find(
        protocol => protocol.typeId == specimen.typeId
      )

      if (specimen.quantity != 0 && container.statusId == availableId && protocolExists) {
        if (this.props.current.typeId 
             && specimen.typeId == this.props.current.typeId 
             && container.centerId == this.props.current.centerId
           ) {
          containersPrimary[container.id] = container;
        } else {
          containersPrimary[container.id] = container;
        }
      }
    });

    //Only allow containers that are not already in the list
    Object.keys(list).map(key => {
      let validContainers = {};
      for (let id in containersPrimary) {
        let f = Object.values(list).find(i => i.container.id == id);
        if (!f || list[key].container.id == id) {
          validContainers[id] = containersPrimary[id];
        }
      }

      let barcodesPrimary = this.props.mapFormOptions(validContainers, 'barcode');
      barcodes.push(
        <SearchableDropdown
          name={key}
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
        <SpecimenPreparationForm
          typeId={this.props.current.typeId}
          preparation={this.props.current.preparation}
          options={this.props.options}
          errors={this.props.errors.preparation}
          setCurrent={this.props.setCurrent}
        />
      </div>
    );
    
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
                (this.props.options.specimenTypes[this.props.current.typeId]||{}).type || '—'
              }
            />
            <StaticElement
              label='Site'
              text={
                this.props.options.centers[this.props.current.centerId] || '—'
             }
            />
            {/*TODO: find a better way to place this 'form-top' line here*/}
            <div className='form-top'>
              <NumericElement
                name='total'
                label='№ of Specimens'
                min='2'
                max='100'
                value={Object.keys(list).length}
                onUserInput={
                  (name, value) => 1 < value < 100 && this.props.setListLength(name, value)
                }
              />
            </div>
            {barcodes}
            {preparationForm}
            <div className='form-top'>
              <ButtonElement
                label='Submit'
                onUserInput={this.props.saveBatchPreparation}
              />
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <FormElement
        name="batchPreparationForm"
        id='batchPreparationForm'
        ref="form"
      >
        {batchPreparationForm}
      </FormElement>
    );
  }
}

BatchPreparationForm.propTypes = {
};

export default BatchPreparationForm;
