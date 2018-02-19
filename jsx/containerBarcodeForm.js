/**
 * Container Barcode Form
 *
 * Acts a subform for ContainerForm
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 **/

class ContainerBarcodeForm extends React.Component {
  constructor(props) {
    super(props);
 
    this.state = {
      formData: {},
      formErrors: {},
    };
   
    this.setFormData = this.setFormData.bind(this);
    this.setSpecimenFormData = this.setSpecimenFormData.bind(this);
    this.setParentFormData = this.setParentFormData.bind(this);
  }

  render() {

    return (
      <FormElement
        name="biobankBarcode"
      >
        <div className="row">
          <div className="col-xs-11">
            <div 
              data-toggle="collapse" 
              data-target={"#" + this.props.id}
            >   
              <TextboxElement
                name={"barcode"}
                label={"Barcode " + this.props.id}
                onUserInput={this.setFormData}
                ref={"barcode"}
                required={true}
                value={this.state.formData["barcode"]}
                hasError={this.state.formErrors["barcode"]}
                errorMessage="Incorrect Barcode format for this Specimen and Container Type"
              />
            </div>
          </div>
          <div className="col-xs-1">
            {this.props.button}
          </div>
        </div>
        <div className="row">
          <div className="col-xs-2"/>
          <div className="col-xs-9">
            <div id={this.props.id} className="collapse">
              <SelectElement
                name="containerType"
                label="Container Type"
                options={this.props.containerTypesNonPrimary}
                onUserInput={this.setFormData}
                required={true}
                value={this.state.formData.containerType}
              />
            </div>
          </div>
        </div>
      </FormElement>
    );
  }

  /**
   * Set the form data based on state values of child elements/componenets
   *
   * @param {string} formElement - name of the selected element
   * @param {string} value - selected value for corresponding form element
   */
  setFormData(formElement, value) {
    var formData = this.state.formData;
    formData[formElement] = value;

    this.setState(
      {
      formData: formData
      },
      this.setParentFormData
    );
  }

  setSpecimenFormData(specimenFormData) {
    var formData = this.state.formData;
    
    for (var attribute in specimenFormData) {
      formData[attribute] = specimenFormData[attribute]
    }
 
    this.setState(
      {
      formData: formData
      },
      this.setParentFormData
    );
  }

  setParentFormData() {
    this.props.setParentFormData(this.state.formData, this.props.id);
  }
}

ContainerBarcodeForm.propTypes = {
  id: React.PropTypes.string,
  specimenTypes: React.PropTypes.object.isRequired,
  containerTypesPrimary: React.PropTypes.object.isRequired,
  specimenTypeAttributes: React.PropTypes.object.isRequired,
  attributeDatatypes: React.PropTypes.object.isRequired,
  capacities: React.PropTypes.object.isRequired,
}

export default ContainerBarcodeForm;
