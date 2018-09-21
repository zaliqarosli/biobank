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
    let preparation = this.props.preparation;
    preparation[name] = value;
    this.props.target 
      ? this.props.setSpecimen('preparation', preparation)
      : this.props.setCurrent('preparation', preparation)
  }

  addData() {
    let preparation = this.props.preparation;
    preparation.data = {};
    this.props.target
      ? this.props.setSpecimen('preparation', preparation)
      : this.props.setCurrent('preparation', preparation)
  }

  setData(name, value) {
    let data = this.props.preparation.data;
    data[name] = value;
    this.setPreparation('data', data);
  }

  render() {

    let submitButton;
    if (((this.props.target||{}).specimen||{}).preparation) {
      submitButton = (
        <ButtonElement label="Update"/>
      );
    } else if ((this.props.target||{}).specimen) {
      submitButton = (
        <ButtonElement label="Submit"/>
      );
    }

    let specimenProtocols = {};
    let specimenProtocolAttributes = {};
    Object.entries(this.props.options.specimenProtocols).forEach(([id, protocol]) => {
      if (protocol.typeId == this.props.typeId) {
        specimenProtocols[id] = protocol.protocol;
        specimenProtocolAttributes[id] = this.props.options.specimenProtocolAttributes[id];
      }
    });

    let specimenProtocolFields;
    if (this.props.preparation.protocolId) {
      let specimenProtocolFieldsObject = specimenProtocolAttributes[this.props.preparation.protocolId];

      if (specimenProtocolFieldsObject) {
        if (this.props.preparation.data) {
          specimenProtocolFields = (
            <CustomFields
              fields={specimenProtocolFieldsObject}
              attributeDatatypes={this.props.options.attributeDatatypes}
              attributeOptions={this.props.options.attributeOptions}
              errors={this.props.errors.data}
              object={this.props.preparation.data}
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
        onSubmit={()=>{this.props.saveSpecimen(this.props.specimen)}}
        ref="form"
      >
        <SelectElement
          name="protocolId"
          label="Protocol"
          options={specimenProtocols}
          onUserInput={this.setPreparation}
          required={true}
          value={this.props.preparation.protocolId}
          errorMessage={this.props.errors.protocolId}
        />
        {specimenProtocolFields}
        <DateElement
          name="date"
          label="Date"
          onUserInput={this.setPreparation}
          required={true}
          value={this.props.preparation.date}
          errorMessage={this.props.errors.date}
        />
        <TimeElement
          name="time"
          label="Time"
          onUserInput={this.setPreparation}
          required={true}
          value={this.props.preparation.time}
          errorMessage={this.props.errors.time}
        />
        <TextareaElement
          name="comments"
          label="Comments"
          onUserInput={this.setPreparation}
          value={this.props.preparation.comments}
        />
        {submitButton} 
      </FormElement>
    );
  }

}

SpecimenPreparationForm.propTypes = {
}

SpecimenPreparationForm.defaultProps = {
  errors: {}
}

export default SpecimenPreparationForm;

