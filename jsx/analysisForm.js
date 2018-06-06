
/**
 * Biobank Analysis Form
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 **/

class SpecimenAnalysisForm extends React.Component {
  constructor() {
    super();

    this.getSpecimenMethodFields = this.getSpecimenMethodFields.bind(this);
    this.setAnalysis = this.setAnalysis.bind(this);
    this.addData = this.addData.bind(this);
    this.setData = this.setData.bind(this);
  }

  setAnalysis(name, value) {
    let analysis = this.props.specimen.analysis;
    analysis[name] = value;
    this.props.setSpecimenData('analysis', analysis);
  }

  addData() {
    let analysis = this.props.specimen.analysis;
    analysis.data = {};
    this.props.setSpecimenData('analysis', analysis);
  }

  setData(name, value) {
    let data = this.props.specimen.analysis.data;
    data[name] = value;
    this.setAnalysis('data', data);
  }

  // TODO: decouple this code from the collectionForm by make it a React Component
  // This generates all the form fields for a given specimen method
  getSpecimenMethodFields(fieldsObject) {
    let specimenMethodFields = Object.keys(fieldsObject).map((attribute) => {
      let datatype = this.props.attributeDatatypes[fieldsObject[attribute]['datatypeId']].datatype;

      if (datatype === "text" || datatype === "number") {
        if (fieldsObject[attribute]['refTableId'] == null) {
          return (
            <TextboxElement
              name={attribute}
              label={fieldsObject[attribute]['name']}
              onUserInput={this.setData}
              required={fieldsObject[attribute]['required']}
              value={this.props.specimen.analysis.data[attribute]}
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
              value={this.props.specimen.analysis.data[attribute]}
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
            value={this.props.specimen.analysis.data[attribute]}
          />
        );
      }

      if (datatype === "boolean") {
      }
    });

    return specimenMethodFields;
  }

  render() {

    let submitButton;
    if (this.props.data.specimen.analysis) {
      submitButton = (
        <ButtonElement label="Update"/>
      );
    } else {
      submitButton = (
        <ButtonElement label="Submit"/>
      );
    }

    let specimenMethodFields;
    if (this.props.specimen.analysis.methodId) {
      let specimenMethodFieldsObject = this.props.specimenMethodAttributes[this.props.specimen.analysis.methodId];

      if (specimenMethodFieldsObject) {
        if (this.props.specimen.analysis.data) {
          specimenMethodFields = this.getSpecimenMethodFields(specimenMethodFieldsObject);
        } else {
          this.addData();
        }
      }
    }

    return (
      <FormElement
        name="specimenAnalysis"
        onSubmit={this.props.saveSpecimen}
        ref="form"
      >
        <SelectElement
          name="methodId"
          label="Method"
          options={this.props.specimenMethods}
          onUserInput={this.setAnalysis}
          required={true}
          value={this.props.specimen.analysis.methodId}
        />
        {specimenMethodFields}
        <DateElement
          name="date"
          label="Date"
          onUserInput={this.setAnalysis}
          required={true}
          value={this.props.specimen.analysis.date}
        />
        <TimeElement
          name="time"
          label="Time"
          onUserInput={this.setAnalysis}
          required={true}
          value={this.props.specimen.analysis.time}
        />
        <TextareaElement
          name="comments"
          label="Comments"
          onUserInput={this.setAnalysis}
          value={this.props.specimen.analysis.comments}
        />
        {submitButton} 
      </FormElement>
    );
  }

}

SpecimenAnalysisForm.propTypes = {
}

export default SpecimenAnalysisForm;

