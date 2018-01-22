
/**
 * Biobank Barcode Form
 *
 * Acts a subform for BiobankSpecimenForm
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 **/

class BiobankBarcodeForm extends React.Component {
  constructor(props) {
    super(props);
 
    this.state = {
      formData: {},
      currentSpecimenType: null,
      currentContainerType: null,
      formErrors: {},
    };
   
    this.setFormData = this.setFormData.bind(this);
    this.getSpecimenTypeFields = this.getSpecimenTypeFields.bind(this);
  }

  render() {

    var specimenFields;
    var specimenTypeFields = this.getSpecimenTypeFields();
    if (this.state.currentSpecimenType) {
      specimenFields = (
       <div>
         <SelectElement
           name="containerType"
           label="Container Type"
           options={this.props.containerTypesPrimary}
           onUserInput={this.setFormData}
           ref="containerType"
           required={true}
           value={this.state.formData.containerType}
         />
         <SelectElement
           name="parentContainer"
           label="Parent Container Barcode"
           options={this.props.containerBarcodesNonPrimary}
           onUserInput={this.setFormData}
           ref="parentContainer"
           required={false}
           value={this.state.formData.parentContainer}
         />
         <TextboxElement
           name="quantity"
           label={"Quantity" + (this.state.currentContainerType ?
             " (" + this.props.units[this.state.currentContainerType] + ")" : "")}
           onUserInput={this.setFormData}
           ref="quantity"
           required={true}
           value={this.state.formData.quantity}
           hasError={this.state.formErrors.quantity}
         />
         {specimenTypeFields}
         <TextareaElement
           name="notes"
           label="Notes"
           onUserInput={this.setFormData}
           ref="notes"
           value={this.state.formData.notes}
         />
       </div>
      );
    }

    return (
      <FormElement
        name="biobankBarcode"
      >
        <div className="row">
          <div className="col-xs-11">
            <div 
              data-toggle="collapse" 
              data-target={"#" + this.props.id}
              color="blue"
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
                name="specimenType"
                label="Specimen Type"
                options={this.props.specimenTypes}
                onUserInput={this.setFormData}
                ref="specimenType"
                required={true}
                value={this.state.formData.specimenType}
              />
            {specimenFields}
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

    if (formElement === "specimenType" && value !== "") {
      this.setState({
        currentSpecimenType: value
      });
    }

    if (formElement === "containerType" && value !== "") {
      this.setState({
        currentContainerType: value
      });
    }

    var formData = this.state.formData;
    formData[formElement] = value;

    this.setState({
      formData: formData
    });
 
    this.props.setSpecimenFormData(this.state.formData, this.props.id);	
  }

  // This generates all the form fields for a given specimen type
  getSpecimenTypeFields() {
    if (this.state.currentSpecimenType) {
      var specimenTypeFieldsObject = this.props.specimenTypeAttributes[this.state.currentSpecimenType];
      if (specimenTypeFieldsObject) {
        var specimenTypeFields = Object.keys(specimenTypeFieldsObject).map((attribute) => {
          let datatype = this.props.attributeDatatypes[specimenTypeFieldsObject[attribute]['datatypeId']].datatype;
          if (datatype === "text" || datatype === "number") {
            if (specimenTypeFieldsObject[attribute]['refTableId'] == null) {
              return (
                <TextboxElement
                  name={attribute}
                  label={specimenTypeFieldsObject[attribute]['name']}
                  onUserInput={this.setFormData}
                  ref={attribute}
                  required={specimenTypeFieldsObject[attribute]['required']}
                  value={this.state.formData[attribute]}
                  hasError={this.state.formErrors[attribute]}
                  errorMessage={"This is a " + datatype + " field."}
                />
              );
            }

            // OPTIONS FOR SELECT ELEMENT WILL MOST LIKELY BE PASSED VIA AJAX CALL
            // BUT IT CAN ALSO BE PRELOADED --
            // ASK RIDA HOW THIS SHOULD BE DONE
            if (specimenTypeFieldsObject[attribute]['refTableId'] !== null) {
              return (
                <SelectElement
                  name={attribute}
                  label={specimenTypeFieldsObject[attribute]['name']}
                  options=""
                  onUserInput={this.setFormData}
                  ref={attribute}
                  required={this.state.formData[attribute]}
                  value={this.state.formData[attribute]}
                />
              );
            }
          }

          if (datatype === "datetime") {
            return (
              <DateElement
                name={attribute}
                label={specimenTypeFieldsObject[attribute]['name']}
                onUserInput={this.setFormData}
                ref={attribute}
                required={specimenTypeFieldsObject[attribute]['required']}
                value={this.state.formData[attribute]}
              />
            );
          }
        })

        return specimenTypeFields;
      }
    }
  }
}

BiobankBarcodeForm.propTypes = {
  
  id: React.PropTypes.string,
  specimenTypes: React.PropTypes.object.isRequired,
  containerTypesPrimary: React.PropTypes.object.isRequired,
  specimenTypeAttributes: React.PropTypes.object.isRequired,
  attributeDatatypes: React.PropTypes.object.isRequired,
  capacities: React.PropTypes.object.isRequired,
  units: React.PropTypes.object.isRequired,
}

export default BiobankBarcodeForm;
