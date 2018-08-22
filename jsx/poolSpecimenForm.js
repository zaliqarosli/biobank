import BiobankSpecimenForm from './specimenForm';
import SpecimenPreparationForm from './preparationForm';

/**
 * Biobank Pool Specimen Form
 *
 * TODO: DESCRIPTION
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 **/
class PoolSpecimenForm extends React.Component {
  constructor() {
    super();

    this.setPool  = this.setPool.bind(this);
  };

  setPool(key, containerId) {
    let list        = this.props.current.poolList;
    const container = this.props.options.containers[containerId];
    const specimen  = Object.values(this.props.options.specimens).find(
      specimen => {return specimen.containerId == containerId}
    );

    list[key].container = container;
    list[key].specimen  = specimen;

    this.props.setCurrent('poolList', list);
    this.props.setCurrent('candidateId', specimen.candidateId);
    this.props.setCurrent('sessionId', specimen.sessionId);
    this.props.setCurrent('typeId', specimen.typeId);
    this.props.setCurrent('centerId', container.centerId);
  }

  render() {
    let list = this.props.current.poolList;
    let barcodes = [];
    let containersPrimary = {};

    //Create options for barcodes based on match candidateId, sessionId and typeId
    Object.values(this.props.options.containersPrimary).map(container => {
      const specimen = Object.values(this.props.options.specimens).find(
        specimen => {return specimen.containerId == container.id}
      );
      const availableId = Object.keys(this.props.options.containerStati).find(
        key => this.props.options.containerStati[key].status === 'Available'
      );

      if (specimen.quantity != 0 && container.statusId == availableId) {
        if (this.props.current.candidateId) {
          if (
            specimen.candidateId == this.props.current.candidateId &&
            specimen.sessionId   == this.props.current.sessionId   &&
            specimen.typeId      == this.props.current.typeId      &&
            container.centerId   == this.props.current.centerId 
          ) {
            containersPrimary[container.id] = container;
          }
        } else {
          containersPrimary[container.id] = container;
          //TODO: potentially make a check to ensure atleast two specimens meet
          //the previous conditions
        }
      }
    });

    Object.keys(list).map(key => {
      //Only allow containers that are not already in the list
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
            containerId && this.setPool(key, containerId);
          }}
          options={barcodesPrimary}
          value={list[key].container.id}
          required={true}
          disabled={list[key].container.id ? true : false}
        />
      );
    });
    
    const poolForm = (
      <div>
        <div className='row'>
          <div className='col-sm-10 col-sm-offset-1'>
            <StaticElement
              label='Pooling Note'
              text="Select or Scan the specimens to be pooled. Specimens must
                    be have a Status of 'Available', have a Quantity of greater
                    than 0, and share the same Type, PSCID, Visit Label
                    and Current Site."
            />
            <StaticElement
              label='Specimen Type'
              text={
                (this.props.options.specimenTypes[this.props.current.typeId]||{}).type || '—'}
            />
            <StaticElement
              label='PSCID'
              text={(this.props.options.candidates[this.props.current.candidateId]||{}).pscid || '—'}
            />
            <StaticElement
              label='Visit Label'
              text={(this.props.options.sessions[this.props.current.sessionId]||{}).label || '—'}
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
                  (name, value) => 1 < value < 100 && this.props.setPoolList(name, value)
                }
              />
            </div>
            {barcodes}
            <ButtonElement
              label='Submit'
              onUserInput={() => this.props.savePool(list)}
            />
          </div>
        </div>
      </div>
    );

    return (
      <FormElement
        name="poolSpecimenForm"
        id='poolSpecimenForm'
        ref="form"
      >
        {poolForm}
      </FormElement>
    );
  }
}

PoolSpecimenForm.propTypes = {
};

export default PoolSpecimenForm;
