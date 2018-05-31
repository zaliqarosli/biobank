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

import ContainerDisplay from './containerDisplay.js';

class ContainerParentForm extends React.Component {

  render() {
    let containerDisplay;
    let containerBarcodesNonPrimary = this.props.mapFormOptions(
      this.props.containersNonPrimary, 'barcode'
    );
    let parentContainerField = ( 
      <SelectElement
        name="parentContainerId"
        label="Parent Container Barcode"
        options={containerBarcodesNonPrimary}
        onUserInput={this.props.setContainerData}
        required={true}
        value={this.props.container.parentContainerId}
      />  
    );  

    if (this.props.container.parentContainerId) {
      let dimensionId = this.props.containersNonPrimary[
        this.props.container.parentContainerId
      ].dimensionId;

      if (dimensionId) {
        // This will eventually become unecessary
        let dimensions = this.props.containerDimensions[dimensionId];

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
          if (this.props.containerCoordinates[this.props.container.parentContainerId]) {
            if (this.props.containerCoordinates[this.props.container.parentContainerId][i]) {
              continue; 
            }
          }

          coordinates[i] = i;
        }   

        containerDisplay = (
          <ContainerDisplay
            dimensions = {
              this.props.containerDimensions[
                this.props.containersNonPrimary[
                  this.props.container.parentContainerId
                ].dimensionId
              ]
            }
            coordinates = {
              this.props.containerCoordinates[this.props.container.parentContainerId]
            }
            containerTypes = {this.props.containerTypes}
            containerStati = {this.props.containerStati} 
            select = {true}
            selectedCoordinate = {this.props.container.coordinate}
            setContainerData = {this.props.setContainerData}
          />
        );
      }
    }   

    let updateButton;
    if ((this.props.data||{}).container) {
      updateButton = (
        <div>
          <br/>
          <ButtonElement label='Update'/>
        </div>
      );
    }

    return (
      <FormElement
        onSubmit={this.props.saveContainer}
      >
        {parentContainerField}
        {containerDisplay}
        {updateButton}
      </FormElement>
    );
  }
}

ContainerParentForm.propTypes = {
  mapFormOptions: React.PropTypes.func.isRequired,
  setContainerData: React.PropTypes.func.isRequired,
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
