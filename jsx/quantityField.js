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
          labelClass='col-xl-0'
          inputClass='col-lg-12'
          onUserInput={this.props.setSpecimenData}
          value={this.props.specimen.quantity}
        />
        <SelectElement
          name='unit'
          labelClass='col-xl-0'
          inputClass='col-lg-12'
          options={this.props.units}
          onUserInput={this.props.setSpecimenData}
          value={this.props.specimen.unitId}
        />
        <ButtonElement
          label="Update"
          onUserInput={this.props.saveSpecimen}
          columnSize= 'col-lg-12'
        />
        <a onClick={this.props.toggle}
        >
          Cancel
        </a>
      </div>
    );
  }
}

QuantityField.propTypes = {
  setSpecimenData: React.PropTypes.func,
  revertSpecimenData: React.PropTypes.func,
  specimen: React.PropTypes.object,
  saveSpecimen: React.PropTypes.func,
  className: React.PropTypes.string
};

export default QuantityField;
