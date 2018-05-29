
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
    this.addData = this.addData.bind(this);
    this.setData = this.setData.bind(this);
  }

  setPreparation(name, value) {
    let preparation = this.props.specimen.preparation;
    preparation[name] = value;
    this.props.setSpecimenData('preparation', preparation);
  }

  addData() {
    let preparation = this.props.specimen.preparation;
    preparation.data = {};
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
    let specimenProtocolFields = Object.keys(fieldsObject).map((attribute) => {
      let datatype = this.props.attributeDatatypes[fieldsObject[attribute]['datatypeId']].datatype;

      if (datatype === "text" || datatype === "number") {
        if (fieldsObject[attribute]['refTableId'] == null) {
          return (
            <TextboxElement
              name={attribute}
              label={fieldsObject[attribute]['name']}
              onUserInput={this.setData}
              required={fieldsObject[attribute]['required']}
              value={this.props.specimen.preparation.data[attribute]}
            />
          );
        }

        if (fieldsObject[attribute]['refTableId'] !== null) {
          return (
            <SelectElement
              name={attribute}
              label={fieldsObject[attribute]['name']}
              options={this.props.attributeOptions[fieldsObject[attribute]['refTableId']]}
              onUserInput={this.setData}
              required={fieldsObject[attribute]['required']}
              value={this.props.specimen.preparation.data[attribute]}
            />
          );
        }
      }

      if (datatype === "datetime") {
        return (
          <DateElement
            name={attribute}
            label={fieldsObject[attribute]['name']}
            onUserInput={this.setData}
            ref={attribute}
            required={fieldsObject[attribute]['required']}
            value={this.props.specimen.preparation.data[attribute]}
          />
        );
      }

      if (datatype === "boolean") {
      }
    });

    return specimenProtocolFields;
  }

  render() {

    let submitButton;
    if (this.props.data.specimen.preparation) {
      submitButton = (
        <ButtonElement label="Update"/>
      );
    } else {
      submitButton = (
        <ButtonElement label="Submit"/>
      );
    }

    let specimenProtocolFields;
    if (this.props.specimen.preparation.protocolId) {
      let specimenProtocolFieldsObject = this.props.specimenProtocolAttributes[this.props.specimen.preparation.protocolId];

      if (specimenProtocolFieldsObject) {
        if (this.props.specimen.preparation.data) {
          specimenProtocolFields = this.getSpecimenProtocolFields(specimenProtocolFieldsObject);
        } else {
          this.addData();
        }
      }
    }

    return (
      <FormElement
        name="specimenPreparation"
        onSubmit={this.props.saveSpecimen}
        ref="form"
      >
        <SelectElement
          name="protocolId"
          label="Protocol"
          options={this.props.specimenProtocols}
          onUserInput={this.setPreparation}
          required={true}
          value={this.props.specimen.preparation.protocolId}
        />
        {specimenProtocolFields}
        <DateElement
          name="date"
          label="Date"
          onUserInput={this.setPreparation}
          required={true}
          value={this.props.specimen.preparation.date}
        />
        <TimeElement
          name="time"
          label="Time"
          onUserInput={this.setPreparation}
          required={true}
          value={this.props.specimen.preparation.time}
        />
        <TextareaElement
          name="comments"
          label="Comments"
          onUserInput={this.setPreparation}
          value={this.props.specimen.preparation.comments}
        />
        {submitButton} 
      </FormElement>
    );
  }

}

SpecimenPreparationForm.propTypes = {
}

export default SpecimenPreparationForm;

