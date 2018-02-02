
/**
 * Biobank Specimen Form
 *
 * Acts a subform for BiobankCollectionForm
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 **/

class BiobankSpecimenForm extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      formData: {data:{}},
      currentSpecimenType: this.props.edit ? this.props.specimenType : null,
      currentContainerType: this.props.edit ? this.props.containerType : null,
      formErrors: {},
    };

    this.setFormData = this.setFormData.bind(this);
    this.setSpecimenTypeFieldFormData = this.setSpecimenTypeFieldFormData.bind(this);
    this.setParentFormData = this.setParentFormData.bind(this);
    this.getSpecimenTypeFields = this.getSpecimenTypeFields.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.updateSpecimen = this.updateSpecimen.bind(this);
  }

  componentDidMount() {
    let formData = this.state.formData;
    if (this.props.edit) {
      formData['specimenId'] = this.props.specimenId;
      formData['specimenType'] = this.props.specimenType;
      formData['containerType'] = this.props.containerType;
      formData['quantity'] = this.props.quantity;
      formData['unit'] = this.props.unit;
      formData['collectDate'] = this.props.collectDate;
      formData['collectTime'] = this.props.collectTime;
      formData['notes'] = this.props.notes;

      var specimenTypeFieldsObject = this.props.specimenTypeAttributes[this.state.currentSpecimenType];
      if (specimenTypeFieldsObject) {
        var specimenTypeFields = Object.keys(specimenTypeFieldsObject).map((attribute) => {
          formData.data[attribute] = this.props.data[attribute];
        });
      }
    }
    this.setState({
      formData: formData
    });
  }

  render() {

    var parentContainerField;
    if (!this.props.edit) {
      parentContainerField = (
        <SelectElement
          name="parentContainer"
          label="Parent Container Barcode"
          options={this.props.containerBarcodesNonPrimary}
          onUserInput={this.setFormData}
          ref="parentContainer"
          required={false}
          value={this.state.formData.parentContainer}
        />
      );
    }

    var updateButton;
    if (this.props.edit) {
      updateButton = (
        <ButtonElement label="Update"/>
      );
    }

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
          {parentContainerField}
          <TextboxElement
            name="quantity"
            label="Quantity"
            onUserInput={this.setFormData}
            ref="quantity"
            required={true}
            value={this.state.formData.quantity}
            hasError={this.state.formErrors.quantity}
          />
          <SelectElement
            name="unit"
            label="Unit"
            options={this.props.units}
            onUserInput={this.setFormData}
            ref="unit"
            required={true}
            value={this.state.formData.unit}
          />
          {specimenTypeFields}
          <DateElement
            name="collectDate"
            label="Collection Date"
            minYear="2000"
            maxYear="2018"
            onUserInput={this.setFormData}
            ref="collectDate"
            required={true}
            value={this.state.formData.collectDate}
          />
          <TimeElement
            name="collectTime"
            label="Collection Time"
            onUserInput={this.setFormData}
            ref="collectTime"
            required={true}
            value={this.state.formData.collectTime}
          />
          <TextareaElement
            name="notes"
            label="Notes"
            onUserInput={this.setFormData}
            ref="notes"
            value={this.state.formData.notes}
          />
          {updateButton}
        </div>
      );
    }

    return (
      <FormElement
        name="biobankSpecimen"
        onSubmit={this.handleUpdate}
        ref="form"
      >
        <div>
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

    if (formElement === "specimenType" && value !== "") {
      //This is to eliminate the values for the specimen type fields
      //This could potentially be improved later to retain the values
      //for the fields that are common across specimen types
      formData.data = {}; 
      this.setState({
        currentSpecimenType: value
      });
    }

    if (formElement === "containerType" && value !== "") {
      this.setState({
        currentContainerType: value
      });
    }

    formData[formElement] = value;

    this.setState(
      {
        formData: formData
      },
      this.setParentFormData
    );
  }

  setSpecimenTypeFieldFormData(formElement, value) {
    let formData = this.state.formData;
    formData.data[formElement] = value;

    this.setState(
      {
        formData: formData
      },
      this.setParentFormData
    );
  
  }

  setParentFormData() {
    if (!this.props.edit) {
      var formData = this.state.formData;
      this.props.setParentFormData(formData);
    }
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
                  onUserInput={this.setSpecimenTypeFieldFormData}
                  ref={attribute}
                  required={specimenTypeFieldsObject[attribute]['required']}
                  value={this.state.formData.data[attribute]}
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
                  onUserInput={this.setSpecimenTypeFieldFormData}
                  ref={attribute}
                  required={specimenTypeFieldsObject[attribte]['required']}
                  value={this.state.formData.data[attribute]}
                />
              );
            }
          }

          if (datatype === "datetime") {
            return (
              <DateElement
                name={attribute}
                label={specimenTypeFieldsObject[attribute]['name']}
                onUserInput={this.setSpecimenTypeFieldFormData}
                ref={attribute}
                required={specimenTypeFieldsObject[attribute]['required']}
                value={this.state.formData.data[attribute]}
              />
            );
          }

          if (datatype === "boolean") {
          
          }
        })

        return specimenTypeFields;
      }
    }
  }

  handleUpdate(e) {
    //more things will go here later
    this.updateSpecimen();
  }

  updateSpecimen() {
    //it seems as though this updates the state even though there's no set state
    //ask David why this is happening
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
          formData.specimenType, 
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
        //this is necessary because of the automatic state update above ^
        //let formData = this.state.formData;
        //formData['data'] = JSON.parse(formData['data']);
        this.setState({
        //  formData: formData,
          errorMessage: msg,
        });
        swal(msg, "", "error");
      }.bind(this)
    });
  }
}

BiobankSpecimenForm.propTypes = {
  setParentFormData: React.PropTypes.func,
  specimenTypes: React.PropTypes.object.isRequired,
  containerTypesPrimary: React.PropTypes.object.isRequired,
  specimenTypeAttributes: React.PropTypes.object.isRequired,
  attributeDatatypes: React.PropTypes.object.isRequired,
  capacities: React.PropTypes.object.isRequired,
  units: React.PropTypes.object.isRequired,
}

export default BiobankSpecimenForm;

