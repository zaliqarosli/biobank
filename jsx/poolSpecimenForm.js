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

  };

  setBarcodeList(name, value) {
  }

  render() {
    //Generates barcodes
    let total = this.props.current.total;
    for (let i=1; i<=total; i++) {
      //this.props.addListItem('specimen');
    }

    let barcodeListArray = Object.keys(this.props.current.list);
    let barcodes = [];
    for (let key of barcodeListArray) {
      barcodes.push(
        <SearchableDropdown
          name={key}
          label={'Barcode ' + key}
          onUserInput={this.setBarcodeList}
          options={this.props.barcodesNonPrimary}
          value={this.props.current.list[key].container.barcode}
          required={true}
        />
      )
    }
    
    let preparationButton = ( 
      <div className='row'>
        <div className='col-xs-4'/>
        <div className='col-xs 4 action'>
            <span className='action'>
            <div 
              className='action-button add'
            >
              +
            </div>
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
              text='Select or Scan the specimens to be pooled. Please ensure that they
                    are the same type, and share the same PSCID and Visit Label'
            />
            <NumericElement
              name='total'
              label='№ of Specimens'
              min='2'
              max='100'
              value={this.props.current.total}
              onUserInput={this.props.setBarcodeList}
            />
            {barcodes}
          </div>
        </div>
        <div className='col-sm-3 col-xs-offset-9 action'>
          <div className='action-title'>
            Next
          </div>
          <span className='action'>
            <div 
              className='action-button update'
            >
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
