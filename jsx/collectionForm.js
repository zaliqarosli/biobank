import CustomFields from './customFields'

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
    
    this.setCollection = this.setCollection.bind(this);
    this.addData = this.addData.bind(this);
    this.setData = this.setData.bind(this);
  }

  setCollection(name, value) {
    let collection = this.props.specimen.collection;
    collection[name] = value;
    this.props.setSpecimen('collection', collection);
  }

  //TODO: this function may not be necessary
  addData() {
    let collection = this.props.specimen.collection;
    collection.data = {};
    this.props.setSpecimen('collection', collection)
  }

  setData(name, value) {
    let data = this.props.specimen.collection.data;
    data[name] = value;
    this.setCollection('data', data);
  }

  render() {
    let updateButton;
    if (((this.props.data||{}).specimen||{}).collection) {
      updateButton = (
        <ButtonElement label="Update"/>
      );
    }

    let specimenTypeUnits = {};
    let specimenTypeFields;
    if (this.props.specimen.typeId) {
      
      //This modifies the selections for unit drop down based on the chosen
      //specimen type 
      for (let id in this.props.specimenTypeUnits[this.props.specimen.typeId]) {
        specimenTypeUnits[id] = this.props.specimenTypeUnits[this.props.specimen.typeId][id].unit;
      }

      let specimenTypeFieldsObject = this.props.specimenTypeAttributes[this.props.specimen.typeId];
      if (specimenTypeFieldsObject) {
        if (((this.props.specimen||{}).collection||{}).data) {
          specimenTypeFields = (
            <CustomFields
              object={this.props.specimen.collection.data}
              fields={specimenTypeFieldsObject}
              errors={this.props.errors.data}
              attributeDatatypes={this.props.attributeDatatypes}
              attributeOptions={this.props.attributeOptions}
              setData={this.setData}
            />
          );
        } else {
          this.addData();
        }
      }
    }

    let specimenFields;
    if (this.props.specimen.typeId) {
      specimenFields = (
        <div>
          <TextboxElement
            name="quantity"
            label="Quantity"
            onUserInput={this.setCollection}
            required={true}
            value={this.props.specimen.collection.quantity}
            errorMessage={this.props.errors.quantity}
          />
          <SelectElement
            name="unitId"
            label="Unit"
            options={specimenTypeUnits}
            onUserInput={this.setCollection}
            required={true}
            value={this.props.specimen.collection.unitId}
            errorMessage={this.props.errors.unitId}
          />
          {specimenTypeFields}
          <DateElement
            name="date"
            label="Date"
            minYear="2000"
            maxYear="2018"
            onUserInput={this.setCollection}
            required={true}
            value={this.props.specimen.collection.date}
            errorMessage={this.props.errors.date}
          />
          <TimeElement
            name="time"
            label="Time"
            onUserInput={this.setCollection}
            required={true}
            value={this.props.specimen.collection.time}
            errorMessage={this.props.errors.time}
          />
          <TextareaElement
            name="comments"
            label="Comments"
            onUserInput={this.setCollection}
            ref="comments"
            value={this.props.specimen.collection.comments}
            errorMessage={this.props.errors.comments}
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
  setSpecimen: React.PropTypes.func.isRequired,
  saveSpecimen: React.PropTypes.func,
  specimen: React.PropTypes.object.isRequired,
  attributeDatatypes: React.PropTypes.object.isRequired,
  attributeOptions: React.PropTypes.object.isRequired,
  specimenTypeUnits: React.PropTypes.object.isRequired,
  specimenTypeAttributes: React.PropTypes.object.isRequired,
}

SpecimenCollectionForm.defaultProps = {
  errors: {}
}

export default SpecimenCollectionForm;
