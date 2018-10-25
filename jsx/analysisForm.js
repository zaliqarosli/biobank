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
    const analysis = this.props.specimen.analysis;
    analysis[name] = value;
    this.props.setSpecimen('analysis', analysis);
  }

  addData() {
    const analysis = this.props.specimen.analysis;
    analysis.data = {};
    this.props.setSpecimen('analysis', analysis);
  }

  setData(name, value) {
    const data = this.props.specimen.analysis.data;
    if (value instanceof File) {
      data[name] = value.name;
      this.props.setCurrent(name, value);
    } else {
      data[name] = value;
      this.setAnalysis('data', data);
    }
  }

  render() {
    let submitButton;
    const analysis = this.props.specimen.analysis || {};
    submitButton = this.props.target.specimen.analysis ? <ButtonElement label="Update"/>
      : <ButtonElement label="Submit"/>;

    let specimenMethodFields;
    if (analysis.methodId) {
      let specimenMethodFieldsObject = this.props.specimenMethodAttributes[analysis.methodId];
      if (specimenMethodFieldsObject) {
        if (analysis.data) {
          specimenMethodFields = (
            <CustomFields
              fields={specimenMethodFieldsObject}
              current={this.props.current}
              attributeDatatypes={this.props.attributeDatatypes}
              attributeOptions={this.props.attributeOptions}
              object={analysis.data}
              data={(((this.props.target||{}).specimen||{}).analysis||{}).data}
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
        name="specimenAnalysis"
        onSubmit={()=>{this.props.saveSpecimen(this.props.specimen)}}
        fileUpload={true}
        ref="form"
      >
        <SelectElement
          name="methodId"
          label="Method"
          options={this.props.specimenMethods}
          onUserInput={this.setAnalysis}
          required={true}
          value={analysis.methodId}
        />
        {specimenMethodFields}
        <DateElement
          name="date"
          label="Date"
          onUserInput={this.setAnalysis}
          required={true}
          value={analysis.date}
        />
        <TimeElement
          name="time"
          label="Time"
          onUserInput={this.setAnalysis}
          required={true}
          value={analysis.time}
        />
        <TextareaElement
          name="comments"
          label="Comments"
          onUserInput={this.setAnalysis}
          value={analysis.comments}
        />
        {submitButton} 
      </FormElement>
    );
  }

}

SpecimenAnalysisForm.propTypes = {
}

export default SpecimenAnalysisForm;
