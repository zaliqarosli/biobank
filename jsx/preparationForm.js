
/**
 * Biobank Specimen Form
 *
 * Acts a subform for BiobankCollectionForm
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 **/

class SpecimenPreparationForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      formData: {data:{}},
      currentProtocol: null,
      formErrors: {},
    };

    this.setFormData = this.setFormData.bind(this);
    this.setSpecimenProtocolFieldFormData = this.setSpecimenProtocolFieldFormData.bind(this);
    this.getSpecimenProtocolFields = this.getSpecimenProtocolFields.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.updateSpecimen = this.updateSpecimen.bind(this);
  }

  componentDidMount() {
    let formData = this.state.formData;
    // This for autoloading data and will be used later
    if (this.props.edit) {
      formData['protocol'] = this.props.protocol;

      var specimenProtocolFieldsObject = this.props.specimenProtocolAttributes[this.state.currentProtocol];
      if (specimenProtocolFieldsObject) {
        var specimenProtocolFields = Object.keys(specimenProtocolFieldsObject).map((attribute) => {
          formData.data[attribute] = this.props.data[attribute];
        });
      }
    }
    this.setState({
      formData: formData
    });
  }

  render() {

    var submitButton;
    if (this.props.add) {
      submitButton = (
        <ButtonElement label="Submit"/>
      );
    }

    var updateButton;
    if (this.props.edit) {
      updateButton = (
        <ButtonElement label="Update"/>
      );
    }

  let specimenProtocolFields;
  if (this.state.currentProtocol) {
    var specimenProtocolFieldsObject = this.props.specimenProtocolAttributes[this.state.currentProtocol];

    if (specimenProtocolFieldsObject) {
      specimenProtocolFields = this.getSpecimenProtocolFields(specimenProtocolFieldsObject);
    }
  }

    //This will be for default fields, if there are any eventually
    if (this.state.currentSpecimenProtocol) {
      preparationFields = (
        <div>
        </div>
      );
    }

    return (
      <FormElement
        name="specimenPreparation"
        onSubmit={this.handleSubmit}
        ref="form"
      >
        <div>
          <SelectElement
            name="protocol"
            label="Protocol"
            options={this.props.specimenProtocols}
            onUserInput={this.setFormData}
            ref="protocol"
            required={true}
            value={this.state.formData.protocol}
          />
        {specimenProtocolFields}
        {submitButton} 
        {updateButton}
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

    if (formElement === "protocol" && value !== "") {
      this.setState({
        currentProtocol: value
      });
    }

    let formData = this.state.formData;
    formData[formElement] = value;

    this.setState({
      formData: formData
    });
  }

  setSpecimenProtocolFieldFormData(formElement, value) {
    let formData = this.state.formData;
    formData.data[formElement] = value;
  
    this.setState({
      formData: formData
    });
  }

  // This generates all the form fields for a given specimen protocol
  getSpecimenProtocolFields(fieldsObject) {
    var specimenProtocolFields = Object.keys(fieldsObject).map((attribute) => {
      let datatype = this.props.attributeDatatypes[fieldsObject[attribute]['datatypeId']].datatype;

      if (datatype === "text" || datatype === "number") {
        if (fieldsObject[attribute]['refTableId'] == null) {
          return (
            <TextboxElement
              name={attribute}
              label={fieldsObject[attribute]['name']}
              onUserInput={this.setSpecimenProtocolFieldFormData}
              ref={attribute}
              required={fieldsObject[attribute]['required']}
              value={this.state.formData.data[attribute]}
              hasError={this.state.formErrors[attribute]}
              errorMessage={"This is a " + datatype + " field."}
            />
          );
        }

        if (fieldsObject[attribute]['refTableId'] !== null) {
          return (
            <SelectElement
              name={attribute}
              label={fieldsObject[attribute]['name']}
              options=""
              onUserInput={this.setSpecimenProtocolFieldFormData}
              ref={attribute}
              required={fieldsObject[attribute]['required']}
              value={this.state.formData.data[attribute]}
            />
          );
        }
      }

      if (datatype === "datetime") {
        return (
          <DateElement
            name={attribute}
            label={fieldsObject[attribute]['name']}
            onUserInput={this.setSpecimenProtocolFieldFormData}
            ref={attribute}
            required={fieldsObject[attribute]['required']}
            value={this.state.formData.data[attribute]}
          />
        );
      }

      if (datatype === "boolean") {
      
      }
    })

    return specimenProtocolFields;
  }

  handleUpdate(e) {
    //more things will go here later
    this.updateSpecimen();
  }

  updateSpecimen() {
    let formData = this.state.formData;
    formData['data'] = JSON.stringify(formData['data']);

    let formObj = new FormData();
    for (let key in formData) {
      if (formData[key] !== "") {
        formObj.append(key, formData[key]);
      }
    }

    $.ajax({
      type: 'POST',
      url: this.props.action,
      data: formObj,
      cache: false,
      contentType: false,
      processData: false,
      processData: false,
      xhr: function() {
        let xhr = new window.XMLHttpRequest();
        return xhr;
      }.bind(this),
      success: function() {
        //Update Parent Specimen Page Here
        this.props.updatePage(
          formData.quantity, 
          formData.unit, 
          JSON.parse(formData.data), 
          formData.collectDate, 
          formData.collectTime, 
          formData.notes
          );
        //swal("Specimen Update Successful!", "", "success");
      }.bind(this),
      error: function(err) {
        console.error(err);
        let msg = err.responseJSON ? err.responseJSON.message : "Specimen error!";

        this.setState({
          errorMessage: msg,
        });
        swal(msg, "", "error");
      }.bind(this)
    });
  }
}

SpecimenPreparationForm.propTypes = {
  containerTypesPrimary: React.PropTypes.object.isRequired,
  specimenTypeAttributes: React.PropTypes.object.isRequired,
  attributeDatatypes: React.PropTypes.object.isRequired,
  capacities: React.PropTypes.object.isRequired,
  units: React.PropTypes.object.isRequired,
}

export default SpecimenPreparationForm;

