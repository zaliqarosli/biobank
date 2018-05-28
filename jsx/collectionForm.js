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
  constructor() {
    super();
    
    this.getSpecimenTypeFields = this.getSpecimenTypeFields.bind(this);
    this.setCollectionData = this.setCollectionData.bind(this);
    this.setData = this.setData.bind(this);
  }

  setCollectionData(name, value) {
    let collection = this.props.specimen.collection;
    collection[name] = value;
    this.props.setSpecimenData('collection', collection);
  }

  setData(name, value) {
    let data = this.props.specimen.collection.data;
    data[name] = value;
    this.setCollectionData('data', data);
  }

  // This generates all the form fields for a given specimen type
  getSpecimenTypeFields(fieldsObject) {
    let specimenTypeFields = Object.keys(fieldsObject).map((attribute) => {
      let datatype = this.props.attributeDatatypes[fieldsObject[attribute]['datatypeId']].datatype;
      if (datatype === "text" || datatype === "number") {

        if (fieldsObject[attribute]['refTableId'] == null) {
          return (
            <TextboxElement
              name={attribute}
              label={fieldsObject[attribute]['name']}
              onUserInput={this.setData}
              required={fieldsObject[attribute]['required']}
              value={this.props.specimen.collection.data[attribute]}
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
              value={this.props.specimen.collection.data[attribute]}
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
            value={this.props.specimen.collection.data[attribute]}
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

  render() {

    let updateButton;
    if (this.props.specimen) {
      updateButton = (
        <ButtonElement label="Update"/>
      );
    }

    let specimenTypeUnits = {};
    let specimenTypeFields;
    if (this.props.specimen.typeId) {
     
      //This modifies the selections for unit drop down based on the chosen specimen type 
      for (let id in this.props.specimenTypeUnits[this.props.specimen.typeId]) {
        specimenTypeUnits[id] = this.props.specimenTypeUnits[this.props.specimen.typeId][id].unit;
      }

      let specimenTypeFieldsObject = this.props.specimenTypeAttributes[this.props.specimen.typeId];
      if (specimenTypeFieldsObject) {
        specimenTypeFields = this.getSpecimenTypeFields(specimenTypeFieldsObject);
      }
    }

    let specimenFields;
    if (this.props.specimen.typeId) {
      specimenFields = (
        <div>
          <TextboxElement
            name="quantity"
            label="Quantity"
            onUserInput={this.setCollectionData}
            required={true}
            value={this.props.specimen.collection.quantity}
          />
          <SelectElement
            name="unitId"
            label="Unit"
            options={specimenTypeUnits}
            onUserInput={this.setCollectionData}
            required={true}
            value={this.props.specimen.collection.unitId}
          />
          {specimenTypeFields}
          <DateElement
            name="date"
            label="Date"
            minYear="2000"
            maxYear="2018"
            onUserInput={this.setCollectionData}
            required={true}
            value={this.props.specimen.collection.date}
          />
          <TimeElement
            name="time"
            label="Time"
            onUserInput={this.setCollectionData}
            required={true}
            value={this.props.specimen.collection.time}
          />
          <TextareaElement
            name="comments"
            label="Comments"
            onUserInput={this.setCollectionData}
            ref="comments"
            value={this.props.specimen.collection.comments}
          />
        </div>
      );
    }

    return (
      <FormElement
        name="biobankSpecimen"
        onSubmit={this.props.saveSpecimen}
        ref="form"
      >
        {specimenFields}
        {updateButton}
      </FormElement>
    );
  }
}


SpecimenCollectionForm.propTypes = {
}

export default SpecimenCollectionForm;
