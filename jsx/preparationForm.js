
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
  constructor() {
    super();

    this.getSpecimenProtocolFields = this.getSpecimenProtocolFields.bind(this);
    this.setPreparation = this.setPreparation.bind(this);
    this.setData = this.setData.bind(this);
  }

  setPreparation(name, value) {
    let preparation = this.props.specimen.preparation;
    preparation[name] = value;
    this.props.setSpecimenData('preparation', preparation);
  }

  setData(name, value) {
    let data = this.props.specimen.preparation.data;
    data[name] = value;
    this.setPreparation('data', data);
  }

  // TODO: decouple this code from the collectionForm by make it a React Component
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
              onUserInput={this.setData}
              required={fieldsObject[attribute]['required']}
              value={this.state.formData.data[attribute]}
              errorMessage={this.props.formErrors[attribute] ? 'This is a '+datatype+' field.' : null}
            />
          );
        }

        if (fieldsObject[attribute]['refTableId'] !== null) {
          return (
            <SelectElement
              name={attribute}
              label={fieldsObject[attribute]['name']}
              options={this.props.attributeOptions[fieldsObject[attribute]['refTableId']]}
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

  render() {

    let submitButton;
    if (this.props.preparation) {
      submitButton = null;
    } else {
      submitButton = (
        <ButtonElement label="Submit"/>
      );
    }

    var updateButton;
    var locationField;
    if (this.props.preparation) {
      updateButton = (
        <ButtonElement label="Update"/>
      );

      locationField = (
        <SelectElement
          name="locationId"
          label="Location"
          options={this.props.sites}
          onUserInput={this.setFormData}
          required={true}
          value={this.state.formData.locationId}
        />
      );
    }

    let specimenProtocolFields;
    if (this.state.currentProtocol) {
      var specimenProtocolFieldsObject = this.props.specimenProtocolAttributes[this.state.currentProtocol];

      if (specimenProtocolFieldsObject) {
        specimenProtocolFields = this.getSpecimenProtocolFields(specimenProtocolFieldsObject);
      }
    }

    return (
      <FormElement
        name="specimenPreparation"
        onSubmit={this.handleSave}
        ref="form"
      >
        <SelectElement
          name="protocolId"
          label="Protocol"
          options={this.props.specimenProtocols}
          onUserInput={this.setFormData}
          required={true}
          value={this.state.formData.protocolId}
        />
        {locationField}
        {specimenProtocolFields}
        <DateElement
          name="date"
          label="Date"
          onUserInput={this.setFormData}
          required={true}
          value={this.state.formData.date}
        />
        <TimeElement
          name="time"
          label="Time"
          onUserInput={this.setFormData}
          required={true}
          value={this.state.formData.time}
        />
        <TextareaElement
          name="comments"
          label="Comments"
          onUserInput={this.setFormData}
          value={this.state.formData.comments}
        />
        {submitButton} 
        {updateButton}
      </FormElement>
    );
  }

}

SpecimenPreparationForm.propTypes = {
}

export default SpecimenPreparationForm;

