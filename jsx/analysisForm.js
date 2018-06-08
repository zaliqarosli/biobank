import CustomFields from './customFields';

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
          specimenMethodFields = (
            <CustomFields
              fields = {specimenMethodsFieldsObject}
              attributeDatatype={this.props.attributeDatatype}
              attributeOptions={this.props.attributeOptions}
              setData={this.setData}
              object={this.props.specimen.analysis.data}
            />
          );  
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

