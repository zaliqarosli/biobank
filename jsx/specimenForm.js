import ProgressBar from 'ProgressBar';

/**
 * Biobank Specimen Form
 *
 * Fetches data from Loris backend and displays a form allowing
 * to specimen a biobank file attached to a specific instrument
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 * */
class BiobankSpecimenForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      Data: {},
      formData: {},
      currentSpecimenType: null,
      specimenResult: null,
      errorMessage: null,
      isLoaded: false,
      loadedData: 0,
      specimenProgress: -1
    };

    //this.getValidFileName = this.getValidFileName.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    //this.isValidFileName = this.isValidFileName.bind(this);
    this.isValidForm = this.isValidForm.bind(this);
    this.setFormData = this.setFormData.bind(this);
    this.getSpecimenTypeFields = this.getSpecimenTypeFields.bind(this);
    this.specimenSubmit = this.specimenSubmit.bind(this);
  }

  componentDidMount() {
    var self = this;
    $.ajax(this.props.DataURL, {
      dataType: 'json',
      success: function(data) {
        self.setState({
          Data: data,
          isLoaded: true
        });
      },
      error: function(data, errorCode, errorMsg) {
        console.error(data, errorCode, errorMsg);
        self.setState({
          error: 'An error occurred when loading the form!'
        });
      }
    });
  }

  render() {
    // Data loading error
    if (this.state.error !== undefined) {
      return (
        <div className="alert alert-danger text-center">
          <strong>
            {this.state.error}
          </strong>
        </div>
      );
    }

    // Waiting for data to load
    if (!this.state.isLoaded) {
      return (
        <button className="btn-info has-spinner">
          Loading
          <span
            className="glyphicon glyphicon-refresh glyphicon-refresh-animate">
          </span>
        </button>
      );
    }

    var specimenTypeFields = this.getSpecimenTypeFields();

    return (
          <FormElement
            name="biobankSpecimen"
            fileSpecimen={true}
            onSubmit={this.handleSubmit}
            ref="form"
          >
            <h3>Add New Specimen</h3>
            <br/>
            <SelectElement
              name="pscid"
              label="PSCID"
              options={this.state.Data.PSCIDs}
              onUserInput={this.setFormData}
              ref="pscid"
              hasError={false}
              required={true}
              value={this.state.formData.pscid}
            />
            <SelectElement
              name="visitLabel"
              label="Visit Label"
              options={this.state.Data.visits}
              onUserInput={this.setFormData}
              ref="visitLabel"
              required={true}
              value={this.state.formData.visitLabel}
            />
            <SelectElement
              name="forSite"
              label="Site"
              options={this.state.Data.sites}
              onUserInput={this.setFormData}
              ref="forSite"
              required={true}
              value={this.state.formData.forSite}
            />
            <SelectElement
              name="specimenType"
              label="Specimen Type"
              options={this.state.Data.specimenTypes}
              onUserInput={this.setFormData}
              ref="specimenType"
              required={true}
              value={this.state.formData.specimenType}
            />
            {specimenTypeFields}
            <SelectElement
              name="containerType"
              label="Container Type"
              options={this.state.Data.containerTypes}
              onUserInput={this.setFormData}
              ref="containerType"
              required={true}
              value={this.state.formData.containerType}
            />
            <TextboxElement
              name="barcode"
              label="Barcode"
              onUserInput={this.setFormData}
              ref="barcode"
              required={true}
              value={this.state.formData.barcode}
            />
            <TextboxElement
              name="quantity"
              label="Quantity"
              onUserInput={this.setFormData}
              ref="quantity"
              required={true}
              value={this.state.formData.quantity}
            />
            <DateElement
              name="timeCollect"
              label="Collection Time"
              minYear="2000"
              maxYear="2017"
              onUserInput={this.setFormData}
              ref="timeCollect"
              required={true}
              value={this.state.formData.timeCollect}
            />
            <TextareaElement
              name="notes"
              label="Notes"
              onUserInput={this.setFormData}
              ref="notes"
              value={this.state.formData.notes}
            />
            <ButtonElement label="Submit"/>
            {/*<ButtonElement label="Cancel" type="button" onUserInput={this.toggleModal}/>*/}
            <div className="row">
              <div className="col-sm-9 col-sm-offset-3">
                <ProgressBar value={this.state.specimenProgress}/>
              </div>
            </div>
          </FormElement>
    );
  }

/** *******************************************************************************
 *                      ******     Helper methods     *******
 *********************************************************************************/

  /**
   * Returns a valid name for the file to be specimened
   *
   * @param {string} pscid - PSCID selected from the dropdown
   * @param {string} visitLabel - Visit label selected from the dropdown
   * @param {string} instrument - Instrument selected from the dropdown
   * @return {string} - Generated valid filename for the current selection
   */
//  getValidFileName(pscid, visitLabel, instrument) {
//    var fileName = pscid + "_" + visitLabel;
//    if (instrument) fileName += "_" + instrument;
//
//    return fileName;
//  }

  /**
   * Handle form submission
   * @param {object} e - Form submission event
   */
  handleSubmit(e) {
    e.preventDefault();

    let formData = this.state.formData;
    let formRefs = this.refs;
    //let biobankFiles = this.state.Data.biobankFiles ? this.state.Data.biobankFiles : [];

    // Validate the form
    if (!this.isValidForm(formRefs, formData)) {
      return;
    }

//    // Validate specimened file name
//    let instrument = formData.instrument ? formData.instrument : null;
//    let fileName = formData.file ? formData.file.name.replace(/\s+/g, '_') : null;
//    let requiredFileName = this.getValidFileName(
//      formData.pscid, formData.visitLabel, instrument
//    );
//    if (!this.isValidFileName(requiredFileName, fileName)) {
//      swal(
//        "Invalid Specimen name!",
//        "File name should begin with: " + requiredFileName,
//        "error"
//      );
//      return;
//    }

    // Check for duplicate file names
//    let isDuplicate = biobankFiles.indexOf(fileName);
//    if (isDuplicate >= 0) {
//      swal({
//        title: "Are you sure?",
//        text: "A file with this name already exists!\n Would you like to override existing file?",
//        type: "warning",
//        showCancelButton: true,
//        confirmButtonText: 'Yes, I am sure!',
//        cancelButtonText: "No, cancel it!"
//      }, function(isConfirm) {
//        if (isConfirm) {
//          this.specimenFile();
//        } else {
//          swal("Cancelled", "Your imaginary file is safe :)", "error");
//        }
//      }.bind(this));
//    } else {
      this.specimenSubmit();
//    }
  }

  /*
   * Uploads the file to the server
   */
  specimenSubmit() {
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
        //xhr.specimen.addEventListener("progress", function(evt) {
        //  if (evt.lengthComputable) {
        //    let percentage = Math.round((evt.loaded / evt.total) * 100);
        //    this.setState({specimenProgress: percentage});
        //  }
        //}.bind(this), false);
        return xhr;
      }.bind(this),
      success: function() {
        // Add git pfile to the list of exiting files
        //let biobankFiles = JSON.parse(JSON.stringify(this.state.Data.biobankFiles));
        //biobankFiles.push(formData.file.name);

        // Trigger an update event to update all observers (i.e DataTable)
        let event = new CustomEvent('update-datatable');
        window.dispatchEvent(event);

        this.setState({
          //biobankFiles: biobankFiles,
          formData: {}, // reset form data after successful file specimen
          specimenProgress: -1
        });
        swal("Specimen Successful!", "", "success");
      }.bind(this),
      error: function(err) {
        console.error(err);
        let msg = err.responseJSON ? err.responseJSON.message : "Specimen error!";
        this.setState({
          errorMessage: msg,
          specimenProgress: -1
        });
        swal(msg, "", "error");
      }.bind(this)
    });
  }

  /**
   * Checks if the inputted file name is valid
   *
   * @param {string} requiredFileName - Required file name
   * @param {string} fileName - Provided file name
   * @return {boolean} - true if fileName starts with requiredFileName, false
   *   otherwise
   */
//  isValidFileName(requiredFileName, fileName) {
//    if (fileName === null || requiredFileName === null) {
//      return false;
//    }
//
//    return (fileName.indexOf(requiredFileName) === 0);
//  }

  /**
   * Validate the form
   *
   * @param {object} formRefs - Object containing references to React form elements
   * @param {object} formData - Object containing form data inputed by user
   * @return {boolean} - true if all required fields are filled, false otherwise
   */
  isValidForm(formRefs, formData) {
    var isValidForm = true;

    var requiredFields = {
      pscid: null,
      visitLabel: null,
    };

    Object.keys(requiredFields).map(function(field) {
      if (formData[field]) {
        requiredFields[field] = formData[field];
      } else if (formRefs[field]) {
        formRefs[field].props.hasError = true;
        isValidForm = false;
      }
    });
    this.forceUpdate();

    return isValidForm;
  }

  /**
   * Set the form data based on state values of child elements/componenets
   *
   * @param {string} formElement - name of the selected element
   * @param {string} value - selected value for corresponding form element
   */
  setFormData(formElement, value) {
    // Only display visits and sites available for the current pscid
    let visitLabel = this.state.formData.visitLabel;
    let pscid = this.state.formData.pscid;
   
    if (formElement === "pscid" && value !== "") {
      this.state.Data.visits = this.state.Data.sessionData[this.state.Data.PSCIDs[value]].visits;
      this.state.Data.sites = this.state.Data.sessionData[this.state.Data.PSCIDs[value]].sites;
    }

    if (formElement === "specimenType" && value !== "") {
      this.setState({
        currentSpecimenType: value
      });
    } 

    var formData = this.state.formData;
    formData[formElement] = value;

    this.setState({
      formData: formData
    });
  }

  // This generates all the form fields for a given specimen type
  getSpecimenTypeFields() {
    if (this.state.currentSpecimenType) {
      var specimenTypeFieldsObject = this.state.Data.specimenTypeAttributes[this.state.currentSpecimenType];
      var specimenTypeFields = Object.keys(specimenTypeFieldsObject).map((attribute) => {
        return (
          <TextboxElement
            name={attribute}
            label={attribute} 
            onUserInput={this.setFormData}
            ref={attribute}
            required={specimenTypeFieldsObject[attribute]}
            value={this.state.formData[attribute]}
          />
        );
      })
      
      return specimenTypeFields;
    }
  }
}


  

BiobankSpecimenForm.propTypes = {
  DataURL: React.PropTypes.string.isRequired,
  action: React.PropTypes.string.isRequired
};

export default BiobankSpecimenForm;
