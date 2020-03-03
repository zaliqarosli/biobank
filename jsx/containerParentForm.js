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
    this.setInheritedProperties = this.setInheritedProperties.bind(this);
  }

  // TODO: there might be a better way to do this.
  setInheritedProperties(name, containerId) {
    const {data, setContainer} = this.props;
    const container = data.containers[containerId];

    setContainer('parentContainerId', containerId)
    .then(() => setContainer('coordinate', null))
    .then(() => setContainer('temperature', container.temperature))
    .then(() => setContainer('centerId', container.centerId))
    .then(() => setContainer('statusId', container.statusId));
  }

  removeChildContainers(object, id) {
    const {data} = this.props;
    delete object[id];
    for (let key in data.containers) {
      if (id == data.containers[key].parentContainerId) {
        object = this.removeChildContainers(object, key);
      }
    }
    return object;
  }

  render() {
    const {container, data, target, options, display} = this.props;
    const {setContainer} = this.props;
    let containerBarcodesNonPrimary = Object.values(data.containers)
      .reduce((result, container) => {
        if (options.container.types[container.typeId].primary == 0) {
          const dimensions = options.container.dimensions[data.containers[
            container.id
          ].dimensionId];
          const capacity = dimensions.x * dimensions.y * dimensions.z;
          const available = capacity - container.childContainerIds.length;
          result[container.id] = container.barcode + ' ('+available+ ' Available Spots)';
        }
        return result;
      }, {});

    // Delete child containers from options
    if (target) {
      containerBarcodesNonPrimary = this.removeChildContainers(containerBarcodesNonPrimary, target.container.id);
    }

    const renderContainerDisplay = () => {
      if (!(container.parentContainerId && display)) {
        return;
      }

      const coordinates = data.containers[container.parentContainerId].childContainerIds
        .reduce((result, id) => {
          const container = data.containers[id];
          if (container.coordinate) {
            result[container.coordinate] = id;
          }
          return result;
        }, {});

      return (
        <ContainerDisplay
          target={target}
          data={data}
          dimensions={options.container.dimensions[data.containers[
            container.parentContainerId
          ].dimensionId]}
          coordinates={coordinates}
          parentContainerId={container.parentContainerId}
          options={options}
          select={true}
          selectedCoordinate={container.coordinate}
          setContainer={setContainer}
        />
      );
    };

    return (
      <div className='row'>
        <div className="col-lg-11">
          <SearchableDropdown
            name="parentContainerId"
            label="Parent Container Barcode"
            options={containerBarcodesNonPrimary}
            onUserInput={this.setInheritedProperties}
            value={container.parentContainerId}
          />
        </div>
        {renderContainerDisplay()}
      </div>
    );
  }
}

ContainerParentForm.propTypes = {
  setContainer: PropTypes.func.isRequired,
  data: PropTypes.object,
  target: PropTypes.object,
  container: PropTypes.object.isRequired,
  options: PropTypes.object.isRequired,
};

export default ContainerParentForm;
