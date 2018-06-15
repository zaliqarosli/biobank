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
        <div style={{flexGrow: 2}}>
          <TextboxElement
            name='quantity'
            inputClass='col-xs-11'
            onUserInput={this.props.setSpecimen}
            value={this.props.specimen.quantity}
          />
        </div>
        <div style={{flexGrow: 2}}>
          <SelectElement
            name='unit'
            inputClass='col-xs-11'
            options={this.props.units}
            onUserInput={this.props.setSpecimen}
            value={this.props.specimen.unitId}
          />
        </div>
        <div style={{flexGrow: 1}}>
          <ButtonElement
            label="Update"
            onUserInput={this.props.saveSpecimen}
            columnSize= 'col-xs-12'
          />
        </div>
        <div style={{flexGrow: 1}}>
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
