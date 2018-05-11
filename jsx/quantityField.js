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
      <div className={this.props.className}>
        <TextboxElement
          name='quantity'
          labelClass='col-sm-0'
          onUserInput={this.props.setSpecimenData}
          value={this.props.specimen.quantity}
        />  
        <ButtonElement
          label="Update"
          onUserInput={this.props.saveSpecimen}
        />
        <a onClick={this.props.toggleEditQuantity}>
          Cancel
        </a>
      </div>
    );
  }
}

QuantityField.propTypes = {
  setSpecimenData: React.PropTypes.func,
  specimen: React.PropTypes.object,
  saveSpecimen: React.PropTypes.func,
  className: React.PropTypes.string
};

export default QuantityField;
