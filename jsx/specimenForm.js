import BiobankBarcodeForm from './barcodeForm.js';

/**
 * Biobank Collection Form
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
      formData: {},
      barcodeFormList: {},
      errorMessage: null,
      formErrors: {},
      countBarcodeForms: [1] 
    };

    //this.getValidFileName = this.getValidFileName.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    //this.isValidFileName = this.isValidFileName.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.setFormData = this.setFormData.bind(this);
    this.specimenSubmit = this.specimenSubmit.bind(this);
    this.addBarcodeForm = this.addBarcodeForm.bind(this);
    this.setBarcodeFormData = this.setBarcodeFormData.bind(this);
  }

  componentDidMount() {

    //if this is a child specimen form then certain formData is set when component mounts
    if (this.props.child) {
      var formData = this.state.formData;
      formData['parentSpecimen'] = this.props.specimenId;
      formData['pscid'] = this.props.candidateId;
      formData['visitLabel'] = this.props.sessionId;
      formData['unitId'] = this.props.unitId;

      this.setState({
        formData: formData
      });
    }
  }

  render() {

    //Styling for remove Barcode button
    const glyphStyle = {
     color: '#D3D3D3',
     margin: 'auto',
    }; 
    const buttonStyle = {
      appearance: 'none',
      outline: 'none',
      boxShadow: 'none',
      borderColor: 'transparent',
      backgroundColor: 'transparent',
       
    };

    //Generates new Barcode Form everytime the addBarcodeForm button is pressed
    var barcodeForms = [];
    for (let i = 0; i < this.state.countBarcodeForms.length; i++) {
      barcodeForms.push(
        <BiobankBarcodeForm
          setParentFormData={this.setBarcodeFormData}
          id={this.state.countBarcodeForms[i]}
          specimenTypes={this.props.specimenTypes}
          containerTypesPrimary={this.props.containerTypesPrimary}
          containerBarcodesNonPrimary={this.props.containerBarcodesNonPrimary}
          specimenTypeAttributes={this.props.specimenTypeAttributes}
          attributeDatatypes={this.props.attributeDatatypes}
          capacities={this.props.capacities}
          specimenTypeUnits={this.props.specimenTypeUnits}
          units={this.props.units}
          button={i+1 === this.state.countBarcodeForms.length ? (
            <button 
              type="button"
              className="btn btn-success btn-sm"
              onClick={this.addBarcodeForm}
            >   
              <span className="glyphicon glyphicon-plus"/>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary-outline btn-sm"
              style={buttonStyle}
              onClick={() => this.removeBarcodeForm(i)}
            >
            <span className="glyphicon glyphicon-remove" style={glyphStyle}/>
            </button>
          )}
        />
      );
    }


    let globalFields;
    let remainingQuantityFields;
    if (this.props.child) {
      globalFields = (   
        <div>
          <StaticElement
            label="Parent Specimen"
            text={this.props.barcode}
          />
          <StaticElement
            label="PSCID"
            text={this.props.pscid}
          />
          <StaticElement
            label="Visit Label"
            text={this.props.visit}
          />
        </div>
      );

      //It may be wise to make unit static and forced, or atleast prepopulated --
      remainingQuantityFields = (
        <div>
          <TextboxElement
            name="quantity"
            label="Remaining Quantity"
            onUserInput={this.setFormData}
            required={true}
            value={this.state.formData.quantity}
          />
          <SelectElement
            name="unitId"
            label="Unit"
            options={this.props.specimenUnits}
            onUserInput={this.setFormData}
            emptyOption={false}
            required={true}
            value={this.state.formData.unitId}
          />
        </div>
      );

    } else {
      globalFields = (
          <div>
            <SelectElement
              name="pscid"
              label="PSCID"
              options={this.props.pSCIDs}
              onUserInput={this.setFormData}
              ref="pscid"
              required={true}
              value={this.state.formData.pscid}
            />
            <SelectElement
              name="visitLabel"
              label="Visit Label"
              options={this.state.visits}
              onUserInput={this.setFormData}
              ref="visitLabel"
              required={true}
              value={this.state.formData.visitLabel}
              disabled={this.state.formData.pscid ? false : true}
            />
          </div>
      );
    }

    //ALLOW THEM TO CANCEL THE FORM AND DELETE BARCODE FORMS
    return (
      <FormElement
        name="specimenForm"
        id='specimenForm'
        onSubmit={this.handleSubmit}
        ref="form"
      >
        <br/>
        <div className='row'>
          <div className="col-xs-11">
            {globalFields}
          </div>
        </div>
        {barcodeForms}
        <div className='row'>
          <div className="col-xs-11">
            {remainingQuantityFields}
          </div>
        </div>
        <div className="col-xs-3 col-xs-offset-9">
          <ButtonElement label="Submit"/>
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


  validateForm(formElement, value) {
    let formErrors = this.state.formErrors;

    //validate barcode regex
    if (formElement === "barcode" && value !== "") {
      if (!(/^hello/.test(this.state.formData.barcode))) {
        formErrors.barcode = true;
      } else {
        formErrors.barcode = false;
      }
    }

    //validate that quantity is a number and less than capacity
    if (formElement === "quantity" && value !== "") {
      if (isNaN(value) || (value > this.props.capacities[this.state.currentContainerType])) {
        formErrors.quantity = true;
      } else {
        formErrors.quantity = false;
      }
    }

    //validate datatypes and regex of generated type attributes
    var specimenTypeFieldsObject = this.props.specimenTypeAttributes[this.state.currentSpecimenType];
    var specimenTypeFields = Object.keys(specimenTypeFieldsObject).map((attribute) => {

      let datatype = this.props.attributeDatatypes[specimenTypeFieldsObject[attribute]['datatypeId']].datatype;
      if (datatype === "number") {
        if (formElement === attribute) {
          if (isNaN(value) && value !== "") {
            formErrors[attribute] = true;
          } else {
            formErrors[attribute] = false;
          }
        }
      }
    })

    this.setState({
      formErrors: formErrors
    });

  }


  /**
   * Handle form submission
   * @param {object} e - Form submission event
   */
  handleSubmit(e) {
    e.preventDefault();

    let formData = this.state.formData;
    let barcodeFormList = this.state.barcodeFormList;
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
    let barcodeFormList = this.state.barcodeFormList;
    formData['barcodeFormList'] = JSON.stringify(barcodeFormList);
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
        // FOR SOME REASON THIS IS NO LONGER WORKING
        // Trigger an update event to update all observers (i.e DataTable)
        // THIS CURRENTLY DOES NOT WORK - LOOK INTO IT
        let event = new CustomEvent('update-datatable');
        window.dispatchEvent(event);

        //refreshes table if not a child
        if (!this.props.child) {
          this.props.refreshTable();
        }
        swal("Specimen Submission Successful!", "", "success");
        this.props.closeModal();
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
    //let visitLabel = this.state.formData.visitLabel;
    //let pscid = this.state.formData.pscid;
  
    //LOOK AT THIS LATER - THE SWITCH TO PROPS MESSED THIS ALL UP 
    if (formElement === "pscid" && value !== "") {
      this.state.visits = this.props.sessionData[this.props.pSCIDs[value]].visits;
      //this.state.Data.sites = this.state.Data.sessionData[this.state.Data.PSCIDs[value]].sites;
    }

    var formData = this.state.formData;
    formData[formElement] = value;

    this.setState({
      formData: formData
    });
  }

  setBarcodeFormData(barcodeFormData, barcodeId) {
    var formData = this.state.formData;
    var barcodeFormList = this.state.barcodeFormList;
    barcodeFormList[barcodeId] = barcodeFormData;
    formData['barcodeFormList'] = barcodeFormList;

    this.setState({
      formData: formData
    });
  }

  addBarcodeForm() {
    let countBarcodeForms = this.state.countBarcodeForms;
    countBarcodeForms.push(countBarcodeForms[countBarcodeForms.length -1] + 1); 
    this.setState({
      countBarcodeForms: countBarcodeForms
    });
  }

  removeBarcodeForm(index) {
    let countBarcodeForms = this.state.countBarcodeForms;
    countBarcodeForms.splice(index, 1);
    this.setState({
      countBarcodeForms: countBarcodeForms
    });
  }

}

BiobankSpecimenForm.propTypes = {
  DataURL: React.PropTypes.string.isRequired,
  action: React.PropTypes.string.isRequired,
  barcode: React.PropTypes.string,
  refreshTable: React.PropTypes.func
};

export default BiobankSpecimenForm;
