import BiobankSpecimenForm from './specimenForm';
import SpecimenPreparationForm from './preparationForm';

/**
 * Biobank Pool Specimen Form
 *
 * Fetches data from Loris backend and displays a form allowing
 * to specimen a biobank file attached to a specific instrument
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 **/
class PoolSpecimenForm extends React.Component {
  constructor() {
    super();

    this.setPool = this.setPool.bind(this);
  };

  setPool(key, containerId) {
    let list        = this.props.current.list;
    const container = this.props.options.containers[containerId];
    const specimen  = Object.values(this.props.options.specimens).find(
      specimen => {return specimen.containerId == containerId}
    );

    list[key].container = container;
    list[key].specimen  = specimen;

    this.props.setCurrent('list', list);
    this.props.setCurrent('candidateId', specimen.candidateId);
    this.props.setCurrent('sessionId', specimen.sessionId);
    this.props.setCurrent('typeId', specimen.typeId);
  }

  render() {
    let list = this.props.current.list;
    let barcodes = [];
    let containersPrimary = {};

    //Create options for barcodes based on match candidateId, sessionId and typeId
    if (this.props.current.candidateId) {
      Object.values(this.props.options.containersPrimary).map(container => {
        const specimen = Object.values(this.props.options.specimens).find(
          specimen => {return specimen.containerId == container.id}
        );
        if (
          specimen.candidateId == this.props.current.candidateId &&
          specimen.sessionId   == this.props.current.sessionId   &&
          specimen.typeId      == this.props.current.typeId
        ) {
          containersPrimary[container.id] = container;
        };
      });
    } else {
      containersPrimary = this.props.options.containersPrimary;
    }

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
          label={'Barcode ' + key}
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
    
    let preparationButton = ( 
      <div className='row'>
        <div className='col-xs-4'/>
        <div className='col-xs 4 action'>
          <span className='action'>
            <div className='action-button add'>+</div>
          </span>
          <div className='action-title'>
            Add Preparation
          </div>
        </div>
      </div>
    );

    let inputForm = (
      <div>
        <div className='row'>
          <div className='col-sm-9 col-sm-offset-1'>
            <StaticElement
              label='Pooling Note'
              text='Select or Scan the specimens to be pooled. Specimens must
                    be of the same type, and share the same PSCID and Visit Label'
            />
            <StaticElement
              label='Specimen Type'
              text={
                (this.props.options.specimenTypes[this.props.current.typeId]||{}).type}
            />
            <StaticElement
              label='PSCID'
              text={(this.props.options.candidates[this.props.current.candidateId]||{}).pscid}
            />
            <StaticElement
              label='Visit Label'
              text={(this.props.options.sessions[this.props.current.sessionId]||{}).label}
            />
            <NumericElement
              name='total'
              label='№ of Specimens'
              min='2'
              max='100'
              value={Object.keys(list).length}
              onUserInput={
                (name, value) => value < 100 && this.props.setBarcodeList(name, value)
              }
            />
            {barcodes}
          </div>
        </div>
        <div className='col-sm-3 col-xs-offset-9 action'>
          <div className='action-title'>
            Next
          </div>
          <span className='action'>
            <div className='action-button update'>
              <span className='glyphicon glyphicon-chevron-right'/>
            </div>
          </span>
        </div>
      </div>
    );

    return (
      <FormElement
        name="poolSpecimenForm"
        id='poolSpecimenForm'
        ref="form"
      >
        {inputForm}
      </FormElement>
    );
  }
}

PoolSpecimenForm.propTypes = {
  DataURL: React.PropTypes.string.isRequired,
  action: React.PropTypes.string.isRequired,
  refreshTable: React.PropTypes.func
};

export default PoolSpecimenForm;
