import React, {Component} from 'react';
import PropTypes from 'prop-types';

import CustomFields from './customFields';

/**
 * Biobank Specimen Process Form
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 **/

class SpecimenProcessForm extends Component {
  constructor() {
    super();

    this.setProcess = this.setProcess.bind(this);
    this.addData = this.addData.bind(this);
    this.setData = this.setData.bind(this);
    this.setProtocol = this.setProtocol.bind(this);
  }

  setProcess(name, value) {
    let process = this.props.process;
    process[name] = value;
    this.props.setParent(this.props.processStage, process);
  }

  // TODO: this function may not be necessary
  addData() {
    let process = this.props.process;
    process.data = {};
    this.props.setParent(this.props.processStage, process);
  }

  setData(name, value) {
    const data = this.props.process.data;
    if (value instanceof File) {
      data[name] = value.name;
      const files = this.props.current.files;
      files[value.name] = value;
      this.props.setCurrent('files', files);
    } else {
      data[name] = value;
    }
    this.setProcess('data', data);
  }

  setProtocol(name, value) {
    // Clear data first.
    this.setProcess('data', {});
    this.setProcess(name, value);
  }

  render() {
    const {specimen, process, processStage, typeId, options, errors} = this.props;

    const renderUpdateButton = () => {
      if (!this.props.specimen) {
        return;
      };
      return (
        <ButtonElement
          label="Update"
          onUserInput={() => this.props.updateSpecimen(specimen)}
        />
      );
    };

    let specimenProtocols = {};
    let specimenProtocolAttributes = {};
    Object.entries(options.specimen.protocols).forEach(([id, protocol]) => {
      // FIXME: I really don't like this 'toLowerCase()' function, but it's the
      // only way I can get it to work at the moment.
      if (typeId == protocol.typeId && options.specimen.processes[protocol.processId].label.toLowerCase() == processStage) {
        specimenProtocols[id] = protocol.label;
        specimenProtocolAttributes[id] = options.specimen.protocolAttributes[id];
      }
    });

    const renderCustomFields = () => {
      if (specimenProtocolAttributes[process.protocolId]) {
        if (process.data) {
          return (
            <CustomFields
              attributeDatatypes={options.specimen.attributeDatatypes}
              attributeOptions={options.specimen.attributeOptions}
              errors={errors.data}
              fields={specimenProtocolAttributes[process.protocolId]}
              object={process.data}
              setData={this.setData}
            />
          );
        } else {
          this.addData();
        }
      }
    };

    const renderCollectionFields = () => {
      if (processStage === 'collection') {
        const specimenTypeUnits = Object.keys(options.specimen.typeUnits[typeId]).reduce((result, id) => {
          result[id] = options.specimen.typeUnits[typeId][id].label;
          return result;
        }, {});
        return (
          <div>
            <TextboxElement
              name="quantity"
              label="Quantity"
              onUserInput={this.setProcess}
              required={true}
              value={process.quantity}
              errorMessage={errors.quantity}
            />
            <SelectElement
              name="unitId"
              label="Unit"
              options={specimenTypeUnits}
              onUserInput={this.setProcess}
              required={true}
              value={process.unitId}
              errorMessage={errors.unitId}
            />
          </div>
        );
      }
    };

    // const renderContainerFields = () => {
    //   if (process.protocolId) {
    //     if (process.data) {
    //       return options.specimen.protocolContainers[process.protocolId].map((typeId) => {
    //         return (
    //           <div>
    //           <TextboxElement
    //             name={options.container.types[typeId].label + ' Lot #'}
    //             label={options.container.types[typeId].label + ' Lot #'}
    //             onUserInput={this.setData}
    //             value={process.data[options.container.types[typeId].label + ' Lot #']}
    //           />
    //           <DateElement
    //             name={options.container.types[typeId].label + ' Expiration Date'}
    //             label={options.container.types[typeId].label + ' Expiration Date'}
    //             onUserInput={this.setData}
    //             value={process.data[options.container.types[typeId].label + ' Expiration Date']}
    //           />
    //           </div>
    //         );
    //       });
    //     }
    //   }
    // };

    const renderProtocolFields = () => {
      if (typeId) {
        return (
          <div>
            <SelectElement
              name="protocolId"
              label="Protocol"
              options={specimenProtocols}
              onUserInput={this.setProtocol}
              required={true}
              value={process.protocolId}
              errorMessage={(errors.specimen||{}).protocolId}
            />
            {renderCollectionFields()}
            {renderCustomFields()}
            <DateElement
              name="date"
              label="Date"
              minYear="2000"
              onUserInput={this.setProcess}
              required={true}
              value={process.date}
              errorMessage={errors.date}
            />
            <TimeElement
              name="time"
              label="Time"
              onUserInput={this.setProcess}
              required={true}
              value={process.time}
              errorMessage={errors.time}
            />
            <TextareaElement
              name="comments"
              label="Comments"
              onUserInput={this.setProcess}
              value={process.comments}
              errorMessage={errors.comments}
            />
          </div>
        );
      }
    };

    return (
      <div>
        {renderProtocolFields()}
        {renderUpdateButton()}
      </div>
    );
  }
}


SpecimenProcessForm.propTypes = {
  setParent: PropTypes.func.isRequired,
  updateSpecimen: PropTypes.func,
  specimen: PropTypes.object.isRequired,
  attributeDatatypes: PropTypes.object.isRequired,
  attributeOptions: PropTypes.object.isRequired,
  specimenTypeUnits: PropTypes.object.isRequired,
  specimenTypeAttributes: PropTypes.object.isRequired,
};

SpecimenProcessForm.defaultProps = {
  errors: {},
};

export default SpecimenProcessForm;
