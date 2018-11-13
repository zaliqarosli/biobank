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

class ContainerParentForm extends React.Component {
  constructor() {
    super();
    this.setContainer = this.setContainer.bind(this);
  }

  // This is to have a child adopt the properties of the parent
  // TODO: there might be a better way to do this.
  setContainer(name, value) {
    let container = this.props.data.containers.nonPrimary[value];
    this.props.setContainer(name, value);
    this.props.setContainer('coordinate', null);
    this.props.setContainer('temperature', container.temperature);
    this.props.setContainer('centerId', container.centerId);
    this.props.setContainer('statusId', container.statusId);
  }

  removeChildContainers(object, id) {
    delete object[id];
    for (let key in this.props.data.containers.nonPrimary) {
      if (id == this.props.data.containers.nonPrimary[key].parentContainerId) {
        object = this.removeChildContainers(object, key);
      }
    }
    return object;
  }

  render() {
    let containerDisplay;
    let containerBarcodesNonPrimary = this.props.mapFormOptions(
      this.props.data.containers.nonPrimary, 'barcode'
    );

    // Delete child containers from options
    if (this.props.target) {
      containerBarcodesNonPrimary = this.removeChildContainers(containerBarcodesNonPrimary, this.props.target.container.id);
    }

    let parentContainerField = (
      <SelectElement
        name="parentContainerId"
        label="Parent Container Barcode"
        options={containerBarcodesNonPrimary}
        onUserInput={this.setContainer}
        value={this.props.container.parentContainerId || undefined}
      />
    );

    if (this.props.container.parentContainerId) {
      let dimensionId = this.props.data.containers.nonPrimary[
        this.props.container.parentContainerId
      ].dimensionId;

      if (dimensionId) {
        // This will eventually become unecessary
        let dimensions = this.props.options.container.dimensions[dimensionId];

        // Total coordinates is determined by the product of the dimensions
        let coordinatesTotal = 1;
        for (let dimension in dimensions) {
          coordinatesTotal = coordinatesTotal * dimensions[dimension];
        }

        // Mapping of options for the SelectElement
        let coordinates = {};
        for (let i = 1; i <= coordinatesTotal; i++) {
          // If the coordinate is already taken, skip it.
          // this doubling of if statements seems unnecessary
          if (this.props.options.container.coordinates[this.props.container.parentContainerId]) {
            if (this.props.options.container.coordinates[this.props.container.parentContainerId][i]) {
              continue;
            }
          }

          coordinates[i] = i;
        }

        containerDisplay = (
          <ContainerDisplay
            target={this.props.target}
            data={this.props.data}
            dimensions={
              this.props.options.container.dimensions[
                this.props.data.containers.nonPrimary[
                  this.props.container.parentContainerId
                ].dimensionId
              ]
            }
            coordinates={this.props.options.container.coordinates[
              this.props.container.parentContainerId
            ]}
            options={this.props.options}
            select={true}
            selectedCoordinate={this.props.container.coordinate}
            setContainer={this.props.setContainer}
          />
        );
      }
    }

    let updateButton;
    if ((this.props.target||{}).container) {
      updateButton = (
        <div><br/><ButtonElement label='Update'/></div>
      );
    }

    return (
      <FormElement onSubmit={()=>{
this.props.saveContainer(this.props.container, true);
}}>
        {parentContainerField}
        {containerDisplay}
        {updateButton}
      </FormElement>
    );
  }
}

ContainerParentForm.propTypes = {
  mapFormOptions: React.PropTypes.func.isRequired,
  setContainer: React.PropTypes.func.isRequired,
  saveContainer: React.PropTypes.func,
  data: React.PropTypes.object,
  container: React.PropTypes.object.isRequired,
  containersNonPrimary: React.PropTypes.object.isRequired,
  containerDimensions: React.PropTypes.object.isRequired,
  containerCoordinates: React.PropTypes.object.isRequired,
  containerTypes: React.PropTypes.object,
  containerStati: React.PropTypes.object,
};

export default ContainerParentForm;
