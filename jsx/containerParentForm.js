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
  constructor(props) {
    super(props);

    this.state = {
      formData: {},
      formErrors: {},
      errorMessage: null
    };

    this.mapFormOptions = this.mapFormOptions.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.setFormData = this.setFormData.bind(this);
  }

  componentDidMount() {
    // This is where we will pass a parentContainerId if it already exists
    // These are simply to provide 'Defaults' to the page. I am not sure that in
    // if they are entirely necessary.
    if (this.props.container) {
    let formData = this.state.formData;
    formData['container'] = JSON.stringify(this.props.container);
    formData['parentContainerId'] = this.props.container.parentContainerId;

    this.setState({
      formData: formData
    });
    }
  }

  //map options for forms
  mapFormOptions(rawObject, targetAttribute) {
    var data = {}; 
    for (var id in rawObject) {
      data[id] = rawObject[id][targetAttribute];
    }   

    return data;
  }

  render() {

    var parentContainerField;
    var coordinateField;
    var containerDisplay;
    let containerBarcodesNonPrimary = this.mapFormOptions(this.props.containersNonPrimary, 'barcode');

    parentContainerField = ( 
      <SelectElement
        name="parentContainerId"
        label="Parent Container Barcode"
        options={containerBarcodesNonPrimary}
        onUserInput={this.setFormData}
        ref="parentContainerId"
        required={false}
        value={this.state.formData.parentContainerId}
      />  
    );  

    // THIS IS VERY POORLY DONE AND NEEDS REFACTORING
    // this should be a 'currentParentContainerId' state
    if (this.state.formData.parentContainerId) {

      let dimensionId = this.props.containersNonPrimary[this.state.formData.parentContainerId].dimensionId;
      

      if (dimensionId) {
        //This will eventually become unecessary
        ///////////////////////////////////////////////////
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
          if (this.props.containerCoordinates[this.state.formData.parentContainerId]) {
            if (this.props.containerCoordinates[this.state.formData.parentContainerId][i]) {
              continue; 
            }
          }

          coordinates[i] = i;
        }   

       // coordinateField = ( 
       //   <SelectElement
       //     name="coordinate"
       //     label="Coordinate"
       //     options={coordinates}
       //     onUserInput={this.setFormData}
       //     ref="coordinate"
       //     required={false}
       //     value={this.state.formData.coordinate}
       //   />  
       // );  
       ///////////////////////////////////////////////////

        containerDisplay = (
          <ContainerDisplay
            dimensions = {this.props.containerDimensions[this.props.containersNonPrimary[this.state.formData.parentContainerId].dimensionId]}
            coordinates = {this.props.containerCoordinates[this.state.formData.parentContainerId]}
            containerTypes = {this.props.containerTypes}
            containerStati = {this.props.containerStati} 
            select = {true}
            selectedCoordinate = {this.state.formData.coordinate}
            updateParent = {this.setFormData}
          />
        );
      }
    }   

    var updateButton;
    if (this.props.container) {
      updateButton = (
        <ButtonElement label="Update"/>
      );
    }

    return (
      <FormElement
        onSubmit={this.handleSubmit}
      >
        {parentContainerField}
        {coordinateField}
        {containerDisplay}
        <br/>
        {updateButton}
      </FormElement>
    );
  }

/** *******************************************************************************
 *                      ******     Helper methods     *******
 *********************************************************************************/

  // Validation functions will go here later...

  /*
   * Uploads the file to the server
   */
  handleSubmit() {
    // Set form data and specimen the biobank file
    let formData = this.state.formData;
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
      xhr: function() {
        let xhr = new window.XMLHttpRequest();
        return xhr;
      }.bind(this),
      success: function() {
      
        this.props.refreshParent();
        swal("Parent Container Update Successful!", "", "success");
        this.props.onSuccess();
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

  /**
   * Set the form data based on state values of child elements/componenets
   *
   * @param {string} formElement - name of the selected element
   * @param {string} value - selected value for corresponding form element
   */
  setFormData(formElement, value) {

    var formData = this.state.formData;
    formData[formElement] = value;

    if (formElement === 'parentContainerId') {
      formData['coordinate'] = "";
    }

    this.setState(
      {
        formData: formData
      },
      this.setParentFormData
    );
  }

  setParentFormData() {
    if (!this.props.container) {
      var formData = this.state.formData;
      this.props.setParentFormData(formData);
    }
  } 
}

ContainerParentForm.propTypes = {
  DataURL: React.PropTypes.string,
  action: React.PropTypes.string,
  barcode: React.PropTypes.string,
  refreshTable: React.PropTypes.func,
  onSuccess: React.PropTypes.func
};

export default ContainerParentForm;
