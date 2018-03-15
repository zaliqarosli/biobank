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
      barcodes: {1: {}},
      errorMessage: null,
      formErrors: {},
      countBarcodeForms: 1
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

    //Generates new Barcode Form everytime the addBarcodeForm button is pressed
    var barcodeForms = Object.keys(this.state.barcodes).map((key) => {
       return ( 
        <BiobankBarcodeForm
          key={key}
          id={key} 
          formData={this.state.barcodes[key] ? this.state.barcodes[key] : null}
          removeBarcodeForm={key !== 1 ? () => this.removeBarcodeForm(key) : null}
          addBarcodeForm={key == this.state.countBarcodeForms ? this.addBarcodeForm : null}
          duplicateBarcodeForm={key == this.state.countBarcodeForms  && this.state.barcodeFormList[key] ? () => this.duplicateBarcodeForm(key) : null}
          setParentFormData={this.setBarcodeFormData}
          specimenTypes={this.props.specimenTypes}
          containerTypesPrimary={this.props.containerTypesPrimary}
          containersNonPrimary={this.props.containersNonPrimary}
          specimenTypeAttributes={this.props.specimenTypeAttributes}
          attributeDatatypes={this.props.attributeDatatypes}
          capacities={this.props.capacities}
          containerDimensions={this.props.containerDimensions}
          containerCoordinates={this.props.containerCoordinates}
          specimenTypeUnits={this.props.specimenTypeUnits}
          units={this.props.units}
        />
      );
    });

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
        // Trigger an update event to update all observers (i.e DataTable)
        // THIS CURRENTLY DOES NOT WORK - LOOK INTO IT
        let event = new CustomEvent('update-datatable');
        window.dispatchEvent(event);

        this.props.refreshParent();
        swal("Specimen Submission Successful!", "", "success");
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
    // This lets the modal window know that there is formData
    // and will cause a warning to be thrown of the modal window
    // is exited/
    this.props.onChange();
  
    if (formElement === "pscid" && value !== "") {
      this.state.visits = this.props.sessionData[this.props.pSCIDs[value]].visits;
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
    let barcodes = this.state.barcodes;
    let count = this.state.countBarcodeForms;
    
    barcodes[count+1] = {}; 

    this.setState({
      barcodes: barcodes,
      countBarcodeForms: count + 1
    });
  }

  duplicateBarcodeForm(key) {
    let barcodes = this.state.barcodes;
    let count = this.state.countBarcodeForms;
    let barcodeFormList = this.state.barcodeFormList;
    
    if (barcodeFormList[key]) {
      barcodes[count+1] = JSON.parse(JSON.stringify(barcodeFormList[key])); 
      console.log(barcodes);
      delete barcodes[count+1].barcode;

      this.setState({
        barcodes: barcodes,
        countBarcodeForms: count + 1
      });
    } else {
      swal("nothing to duplicate!");
    }
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
