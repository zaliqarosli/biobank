import React, {Component} from 'react';
import PropTypes from 'prop-types';

/**
 * Biobank Custom Attribute Fields
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 */

class CustomFields extends Component {
  render() {
    let fields = this.props.fields;
    let attributeFields = Object.keys(fields).map((attribute) => {
      let datatype = this.props.attributeDatatypes[fields[attribute]['datatypeId']].datatype;
      if (datatype === 'text' || datatype === 'number') {
        if (fields[attribute]['refTableId'] === null) {
          return (
            <TextboxElement
              name={attribute}
              label={fields[attribute]['name']}
              onUserInput={this.props.setData}
              required={fields[attribute]['required']}
              value={this.props.object[attribute]}
              errorMessage={this.props.errors[attribute]}
            />
          );
        }

        if (fields[attribute]['refTableId'] !== null) {
          return (
            <SelectElement
              name={attribute}
              label={fields[attribute]['name']}
              options={this.props.attributeOptions[fields[attribute]['refTableId']]}
              onUserInput={this.props.setData}
              required={fields[attribute]['required']}
              value={this.props.object[attribute]}
              errorMessage={this.props.errors[attribute]}
            />
          );
        }
      }

      if (datatype === 'datetime') {
        return (
          <DateElement
            name={attribute}
            label={fields[attribute]['name']}
            onUserInput={this.props.setData}
            required={fields[attribute]['required']}
            value={this.props.object[attribute]}
            errorMessage={this.props.errors[attribute]}
          />
        );
      }

      // Do not present the possibility of uploading if file is already set
      // File must instead be deleted or overwritten.
      if (datatype === 'file' && !(this.props.data||{})[attribute]) {
        return (
          <FileElement
            name={attribute}
            label={fields[attribute]['name']}
            onUserInput={this.props.setData}
            required={fields[attribute]['required']}
            value={this.props.current.files[this.props.object[attribute]]}
            errorMessage={this.props.errors[attribute]}
          />
        );
      }
    });

    return (
      <div>
        {attributeFields}
      </div>
    );
  }
}

CustomFields.propTypes = {
  fields: PropTypes.object.isRequired,
  attributeDatatypes: PropTypes.object.isRequired,
  attributeOptions: PropTypes.object.isRequired,
  object: PropTypes.object.isRequired,
  setData: PropTypes.func.isRequired,
  errors: PropTypes.object,
};

CustomFields.defaultProps = {
  errors: {},
};

export default CustomFields;
