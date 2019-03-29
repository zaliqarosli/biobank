import React, {Component} from 'react';
import PropTypes from 'prop-types';

import ContainerDisplay from './containerDisplay.js';

/**
 * Biobank Container Parent Form
 *
 * Fetches data from Loris backend and displays a form allowing
 * to specimen a biobank file attached to a specific instrument
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 * */

class ContainerParentForm extends Component {
  constructor() {
    super();
    this.setContainer = this.setContainer.bind(this);
  }

  // This is to have a child adopt the properties of the parent
  // TODO: there might be a better way to do this.
  setContainer(name, value) {
    const {data, setContainer} = this.props;
    const container = data.containers.nonPrimary[value];

    setContainer(name, value);
    setContainer('coordinate', null);
    setContainer('temperature', container.temperature);
    setContainer('centerId', container.centerId);
    setContainer('statusId', container.statusId);
  }

  removeChildContainers(object, id) {
    const {data} = this.props;
    delete object[id];
    for (let key in data.containers.nonPrimary) {
      if (id == data.containers.nonPrimary[key].parentContainerId) {
        object = this.removeChildContainers(object, key);
      }
    }
    return object;
  }

  render() {
    const {container, data, target, options, display} = this.props;
    let containerBarcodesNonPrimary = this.props.mapFormOptions(
      data.containers.nonPrimary, 'barcode'
    );

    // Delete child containers from options
    if (target) {
      containerBarcodesNonPrimary = this.removeChildContainers(containerBarcodesNonPrimary, target.container.id);
    }

    const renderContainerDisplay = () => {
      if (!(container.parentContainerId && display)) {
        return;
      }

      return (
        <ContainerDisplay
          target={target}
          data={data}
          dimensions={
            options.container.dimensions[
              data.containers.nonPrimary[
                container.parentContainerId
              ].dimensionId
            ]
          }
          coordinates={options.container.coordinates[container.parentContainerId]}
          options={options}
          select={true}
          selectedCoordinate={container.coordinate}
          setContainer={this.props.setContainer}
        />
      );
    };

    return (
      <FormElement>
        <SelectElement
          name="parentContainerId"
          label="Parent Container Barcode"
          options={containerBarcodesNonPrimary}
          onUserInput={this.setContainer}
          value={container.parentContainerId}
        />
        {renderContainerDisplay()}
      </FormElement>
    );
  }
}

ContainerParentForm.propTypes = {
  mapFormOptions: PropTypes.func.isRequired,
  setContainer: PropTypes.func.isRequired,
  updateContainer: PropTypes.func,
  data: PropTypes.object,
  container: PropTypes.object.isRequired,
  containersNonPrimary: PropTypes.object.isRequired,
  containerDimensions: PropTypes.object.isRequired,
  containerCoordinates: PropTypes.object.isRequired,
  containerTypes: PropTypes.object,
  containerStati: PropTypes.object,
};

export default ContainerParentForm;
