/**
 * Biobank Specimen Quantity Field
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 * */

class QuantityField extends React.Component {
  render() {
    return (
      <div className='inline-field'>
        <div style={{flex: '1 0 25%', minWidth: '90px'}}>
          <TextboxElement
            name='quantity'
            inputClass='col-xs-11'
            onUserInput={this.props.setSpecimen}
            value={this.props.specimen.quantity}
            errorMessage={this.props.errors.quantity}
          />
        </div>
        <div style={{flex: '1 0 25%', minWidth: '90px'}}>
          <SelectElement
            name='unitId'
            inputClass='col-xs-11'
            options={this.props.units}
            onUserInput={this.props.setSpecimen}
            value={this.props.specimen.unitId}
            errorMessage={this.props.errors.unitId}
          />
        </div>
        <div style={{flex: '0 1 15%', margin: '0 1%'}}>
          <ButtonElement
            label="Update"
            onUserInput={this.props.saveSpecimen}
            columnSize= 'col-xs-11'
          />
        </div>
        <div style={{flex: '0 1 15%', margin: '0 1%'}}>
          <a onClick={this.props.close} style={{cursor: 'pointer'}}>
            Cancel
          </a>
        </div>
      </div>
    );
  }
}

QuantityField.propTypes = {
  setSpecimen: React.PropTypes.func,
  close: React.PropTypes.func,
  specimen: React.PropTypes.object,
  saveSpecimen: React.PropTypes.func,
  className: React.PropTypes.string
};

export default QuantityField;
