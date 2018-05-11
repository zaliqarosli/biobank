
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
      currentProtocol: this.props.preparation ? this.props.preparation.protocolId : null,
      formErrors: {},
    };

    this.setFormData = this.setFormData.bind(this);
    this.setParentFormData = this.setParentFormData.bind(this);
    this.setSpecimenProtocolFieldFormData = this.setSpecimenProtocolFieldFormData.bind(this);
    this.getSpecimenProtocolFields = this.getSpecimenProtocolFields.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.savePreparation = this.savePreparation.bind(this);
  }

  componentDidMount() {
    let formData = this.state.formData;

    // if (this.props.specimenId) ??
    formData['specimenId'] = this.props.specimenId;

    //TODO: this is a shitty fix to the problem, do better.
    // Actually, this may be less shitty than I thought
    if (this.props.formData) {
      formData = this.props.formData;
  
      let currentProtocol;
      currentProtocol = this.props.formData.protocolId || null;
      this.setState({currentProtocol});
    }

    // This for autoloading data and will be used later
    if (this.props.preparation) {
      formData['protocolId'] = this.props.preparation.protocolId;
      formData['locationId'] = this.props.preparation.locationId;
      formData['date']       = this.props.preparation.date;
      formData['time']       = this.props.preparation.time;
      formData['comments']   = this.props.preparation.comments;

      var specimenProtocolFieldsObject = this.props.specimenProtocolAttributes[this.state.currentProtocol];
      if (specimenProtocolFieldsObject) {
        var specimenProtocolFields = Object.keys(specimenProtocolFieldsObject).map((attribute) => {
          formData.data[attribute] = this.props.preparation.data[attribute];
        });
      }
    }
    this.setState({
      formData: formData
    });
  }

  render() {

    var submitButton;
    //TODO: fix this second check (!this.props.specimenId) -- it's not great
    // All it does is signal that we are in the pool specimen form. There must be
    // a better way!!
    if (this.props.preparation || !this.props.specimenId) {
      submitButton = null;
    } else if (!this.props.preparation) {
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

  /**
   * Set the form data based on state values of child elements/componenets
   *
   * @param {string} formElement - name of the selected element
   * @param {string} value - selected value for corresponding form element
   */
  setFormData(formElement, value) {

    let formData = this.state.formData;

    if (formElement === "protocolId" && value !== "") {
      //This is to eliminate the values for the specimen protocol fields
      //TODO: This could potentially be improved later to retain the values
      //for the fields that are common accross protocols
      formData.data = {};
      this.setState({
        currentProtocol: value
      });
    }

    formData[formElement] = value;

    this.setState(
      {formData}, 
      this.setParentFormData
    );
  }

  setSpecimenProtocolFieldFormData(formElement, value) {
    let formData = this.state.formData;
    formData.data[formElement] = value;
  
    this.setState(
      {formData}, 
      this.setParentFormData
    );
  }

  setParentFormData() {
    if (this.props.setParentFormData) {
      let formData = this.state.formData;
      this.props.setParentFormData(formData);
    }
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
              onUserInput={this.setSpecimenProtocolFieldFormData}
              ref={attribute}
              required={fieldsObject[attribute]['required']}
              value={this.state.formData.data[attribute]}
              errorMessage={this.state.formErrors[attribute] ? 'This is a '+datatype+' field.' : null}
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

  handleSave(e) {
    //more things will go here later
    if (!this.props.preparation) {
      this.savePreparation(this.props.insertAction)
    }
    if (this.props.preparation) {
      this.savePreparation(this.props.updateAction);
    }
  }

  savePreparation(action) {
    let formData = this.state.formData;
    formData['data'] = JSON.stringify(formData['data']);

    console.log(formData);
    let formObj = new FormData();
    for (let key in formData) {
      if (formData[key] !== "") {
        formObj.append(key, formData[key]);
      }
    }

    $.ajax({
      type: 'POST',
      url: action,
      data: formObj,
      cache: false,
      contentType: false,
      processData: false,
      xhr: function() {
        let xhr = new window.XMLHttpRequest();
        return xhr;
      }.bind(this),
      success: function() {
        //Update Parent Specimen Page Here
        //formData.data = JSON.parse(formData.data);
        this.props.refreshParent();
        //swal("Specimen Preparation Update Successful!", "", "success");
        //this.props.onSuccess();
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

