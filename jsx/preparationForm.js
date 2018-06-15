import CustomFields from './customFields';

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

    this.setPreparation = this.setPreparation.bind(this);
    this.addData = this.addData.bind(this);
    this.setData = this.setData.bind(this);
  }

  setPreparation(name, value) {
    let preparation = this.props.specimen.preparation;
    preparation[name] = value;
    this.props.setSpecimen('preparation', preparation);
  }

  addData() {
    let preparation = this.props.specimen.preparation;
    preparation.data = {};
    this.props.setSpecimen('preparation', preparation);
  }

  setData(name, value) {
    let data = this.props.specimen.preparation.data;
    data[name] = value;
    this.setPreparation('data', data);
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
          specimenProtocolFields = (
            <CustomFields
              fields={specimenProtocolFieldsObject}
              attributeDatatypes={this.props.attributeDatatypes}
              attributeOptions={this.props.attributeOptions}
              object={this.props.specimen.preparation.data}
              setData={this.setData}
            />
          );
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

