import React, {Component} from 'react';
import PropTypes from 'prop-types';

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

class SpecimenCollectionForm extends Component {
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

  // TODO: this function may not be necessary
  addData() {
    let collection = this.props.specimen.collection;
    collection.data = {};
    this.props.setSpecimen('collection', collection);
  }

  setData(name, value) {
    let data = this.props.specimen.collection.data;
    data[name] = value;
    this.setCollection('data', data);
  }

  render() {
    const renderUpdateButton = () => {
      if (((this.props.target||{}).specimen||{}).collection) {
        return (
          <ButtonElement
            label="Update"
            onUserInput={() => this.props.updateSpecimen(this.props.specimen)}
          />
        );
      }
    };

    let specimenTypeUnits = {};
    let specimenTypeFields;
    if (this.props.specimen.typeId) {
      // This modifies the selections for unit drop down based on the chosen
      // specimen type
      Object.keys(this.props.specimenTypeUnits[this.props.specimen.typeId]).forEach((id) => {
        specimenTypeUnits[id] = this.props.specimenTypeUnits[this.props.specimen.typeId][id].unit;
      });

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
            value={this.props.specimen.collection.comments}
            errorMessage={this.props.errors.comments}
          />
        </div>
      );
    }

    return (
      <div>
        {specimenFields}
        {renderUpdateButton()}
      </div>
    );
  }
}


SpecimenCollectionForm.propTypes = {
  setSpecimen: PropTypes.func.isRequired,
  updateSpecimen: PropTypes.func,
  specimen: PropTypes.object.isRequired,
  attributeDatatypes: PropTypes.object.isRequired,
  attributeOptions: PropTypes.object.isRequired,
  specimenTypeUnits: PropTypes.object.isRequired,
  specimenTypeAttributes: PropTypes.object.isRequired,
};

SpecimenCollectionForm.defaultProps = {
  errors: {},
};

export default SpecimenCollectionForm;
