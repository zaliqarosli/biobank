import ContainerParentForm from './containerParentForm'


/**
 * Biobank Specimen Form
 *
 * Acts a subform for BiobankCollectionForm
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 **/

class SpecimenCollectionForm extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      formData: {data:{}},
      currentSpecimenType: this.props.edit ? this.props.specimenType : null,
      currentContainerType: this.props.edit ? this.props.containerType : null,
    };

    this.setFormData = this.setFormData.bind(this);
    this.setSpecimenTypeFieldFormData = this.setSpecimenTypeFieldFormData.bind(this);
    this.setParentFormData = this.setParentFormData.bind(this);
    this.setContainerParentFormData = this.setContainerParentFormData.bind(this);
    this.getSpecimenTypeFields = this.getSpecimenTypeFields.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.updateSpecimen = this.updateSpecimen.bind(this);
  }

  componentDidMount() {
    let formData = this.state.formData;

    if (this.props.formData) {
      formData = this.props.formData;
      let currentSpecimenType = this.state.currentSpecimenType;
      
      this.setState({
        currentSpecimenType: formData.specimenType
      });
    }

    if (this.props.edit) {
      formData['specimenId']    = this.props.specimenId;
      formData['containerId']   = this.props.containerId;
      formData['specimenType']  = this.props.specimenType;
      formData['containerType'] = this.props.containerType;
      formData['quantity']      = this.props.collection.quantity;
      formData['unitId']        = this.props.collection.unitId;
      formData['date']          = this.props.collection.date;
      formData['time']          = this.props.collection.time;
      formData['comments']      = this.props.collection.comments;

      var specimenTypeFieldsObject = this.props.specimenTypeAttributes[this.state.currentSpecimenType];
      if (specimenTypeFieldsObject) {
        var specimenTypeFields = Object.keys(specimenTypeFieldsObject).map((attribute) => {
          formData.data[attribute] = this.props.collection.data[attribute];
        });
      }
    }

    this.setState({
      formData: formData
    });
  }

  mapFormOptions(rawObject, targetAttribute) {
    let data = {};
    for (let id in rawObject) {
      data[id] = rawObject[id][targetAttribute];
    }

    return data;
  }

  render() {
    var containerParentForm;
    if (!this.props.edit) {
      containerParentForm = (
        <ContainerParentForm
          setParentFormData={this.setContainerParentFormData}
          containersNonPrimary={this.props.containersNonPrimary}
          containerDimensions={this.props.containerDimensions}
          containerCoordinates={this.props.containerCoordinates}
        />
      );
    }

    var updateButton;
    if (this.props.edit) {
      updateButton = (
        <ButtonElement label="Update"/>
      );
    }

    //This block of code should potentially be moved to setFormData();
    //Consider Refactoring...
    var specimenTypeUnits = {};
    if (this.state.currentSpecimenType) {
     
      //This modifies the selections for unit drop down based on the chosend specimen type 
      for (var id in this.props.specimenTypeUnits[this.state.currentSpecimenType]) {
        specimenTypeUnits[id] = this.props.specimenTypeUnits[this.state.currentSpecimenType][id].unit;
      }

      var specimenTypeFieldsObject = this.props.specimenTypeAttributes[this.state.currentSpecimenType];
      if (specimenTypeFieldsObject) {
        var specimenTypeFields = this.getSpecimenTypeFields(specimenTypeFieldsObject);
      }
    }

    var specimenFields;
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
          <TextboxElement
            name="quantity"
            label="Quantity"
            onUserInput={this.setFormData}
            ref="quantity"
            required={true}
            value={this.state.formData.quantity}
          />
          <SelectElement
            name="unitId"
            label="Unit"
            options={specimenTypeUnits}
            onUserInput={this.setFormData}
            required={true}
            value={this.state.formData.unitId}
          />
          {specimenTypeFields}
          <DateElement
            name="date"
            label="Date"
            minYear="2000"
            maxYear="2018"
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
            ref="comments"
            value={this.state.formData.comments}
          />
          {containerParentForm}
        </div>
      );
    }

    return (
      <FormElement
        name="biobankSpecimen"
        onSubmit={this.handleUpdate}
        ref="form"
      >
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

    this.props.onChange instanceof Function && this.props.onChange();

    let formData = this.state.formData;
    formData[formElement] = value;

    if (formElement === "specimenType" && value !== "") {
      //This throws a warning if the specimen type is changed because of the cascading effects this 
      //would cause.
      if (this.props.edit) {
        swal({
          title: "Warning",
          text: "Changing the specimen type will result in the loss of any preparation or anaylsis "+
            "data for this specimen. You will also need to manually change the specimen type of any "+
            "aliquots derived from this specimen. Proceed with caution.",
          type: "warning",
          showCancelButton: true,
          confirmButtonText: 'Cancel Change',
          cancelButtonText: 'Proceed',
        }, 
        function(isConfirm) {
          if (isConfirm) {
            this.props.toggleEdit();
          } else {
          }
        }.bind(this));
      }

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

  setContainerParentFormData(containerParentFormData) {
    var formData = this.state.formData;

    for (let field in containerParentFormData) {
      formData[field] = containerParentFormData[field];
    }

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

  // TODO: decouple this code from the preaprationForm by making it a React Component
  // This generates all the form fields for a given specimen type
  getSpecimenTypeFields(fieldsObject) {
    var specimenTypeFields = Object.keys(fieldsObject).map((attribute) => {
      let datatype = this.props.attributeDatatypes[fieldsObject[attribute]['datatypeId']].datatype;
      if (datatype === "text" || datatype === "number") {

        if (fieldsObject[attribute]['refTableId'] == null) {
          return (
            <TextboxElement
              name={attribute}
              label={fieldsObject[attribute]['name']}
              onUserInput={this.setSpecimenTypeFieldFormData}
              ref={attribute}
              required={fieldsObject[attribute]['required']}
              value={this.state.formData.data[attribute]}
            />
          );
        }

        if (fieldsObject[attribute]['refTableId'] !== null) {
          console.log(fieldsObject[attribute]['refTableId']);
          console.log(this.props.attributeOptions[fieldsObject[attribute]['refTableId']]);
          return (
            <SelectElement
              name={attribute}
              label={fieldsObject[attribute]['name']}
              options={this.props.attributeOptions[fieldsObject[attribute]['refTableId']]}
              onUserInput={this.setSpecimenTypeFieldFormData}
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
            onUserInput={this.setSpecimenTypeFieldFormData}
            ref={attribute}
            required={fieldsObject[attribute]['required']}
            value={this.state.formData.data[attribute]}
          />
        );
      }

      if (datatype === "boolean") {
        // There is currently no CheckboxElement or RadioElement in loris/jsx/Form.js and therefore
        // this is not possible.     
      }
    })

    return specimenTypeFields;
  }

  handleUpdate(e) {
    // TODO: Validate Form Here

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
        formData.data = JSON.parse(formData.data);
        this.props.refreshParent();
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

SpecimenCollectionForm.propTypes = {
  setParentFormData: React.PropTypes.func,
  specimenTypes: React.PropTypes.object.isRequired,
  containerTypesPrimary: React.PropTypes.object.isRequired,
  specimenTypeAttributes: React.PropTypes.object.isRequired,
  attributeDatatypes: React.PropTypes.object.isRequired,
  capacities: React.PropTypes.object.isRequired,
}

export default SpecimenCollectionForm;

