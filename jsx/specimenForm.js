import SpecimenBarcodeForm from './barcodeForm.js';

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
      errorMessage: null,
      formErrors: {},
      barcodeFormList: {1: {}},
      countBarcodeForms: 1
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.setFormData = this.setFormData.bind(this);
    this.setParentFormData = this.setParentFormData.bind(this);
    this.specimenSubmit = this.specimenSubmit.bind(this);
    this.addBarcodeForm = this.addBarcodeForm.bind(this);
    this.setBarcodeFormData = this.setBarcodeFormData.bind(this);
  }

  componentDidMount() {

    // Sets formData to formData passed from parent component
    // or else it is set to an empty object
    // TODO: this should be moved to the constructor.
    let formData = this.props.formData || this.state.formData;

    //if this is a child specimen form then certain formData is set when component mount
    //TODO: there is a better way of doing this.
    //This solution assumes too much about the props being passed
    if (this.props.parentSpecimenIds) {
      formData['parentSpecimenIds'] = this.props.parentSpecimenIds;
      formData['pscid'] = this.props.candidateId;
      formData['visitLabel'] = this.props.sessionId;
      formData['unitId'] = this.props.unitId;
    }

    this.setState({formData});
  }

  render() {

    //Generates new Barcode Form everytime the addBarcodeForm button is pressed
    var barcodeListArray = Object.keys(this.state.barcodeFormList);
    var barcodeForms = [];
    let i = 1;
    for (let key of barcodeListArray) {
      barcodeForms.push(
        <SpecimenBarcodeForm
          key={key}
          barcodeKey={key}
          id={i} 
          formData={this.state.barcodeFormList[key] ? 
            this.state.barcodeFormList[key] : null}
          removeBarcodeForm={barcodeListArray.length !== 1 ?
            () => this.removeBarcodeForm(key) : null}
          addBarcodeForm={i == barcodeListArray.length ? this.addBarcodeForm : null}
          copyBarcodeForm={i == barcodeListArray.length && this.state.barcodeFormList[key] ? 
            this.copyBarcodeForm.bind(this, key) : null}
          setParentFormData={this.setBarcodeFormData}
          onChange={this.props.onChange}
          specimenTypes={this.props.specimenTypes}
          containerTypesPrimary={this.props.containerTypesPrimary}
          containersNonPrimary={this.props.containersNonPrimary}
          specimenTypeAttributes={this.props.specimenTypeAttributes}
          attributeDatatypes={this.props.attributeDatatypes}
          attributeOptions={this.props.attributeOptions}
          capacities={this.props.capacities}
          containerDimensions={this.props.containerDimensions}
          containerCoordinates={this.props.containerCoordinates}
          specimenTypeUnits={this.props.specimenTypeUnits}
          units={this.props.units}
        />
      )
      
      i++;
    }

    let globalFields;
    let remainingQuantityFields;
    if (this.props.parentSpecimenIds) {
      globalFields = (
        <div>
          <StaticElement
            label="Parent Specimen"
            text={this.props.parentSpecimenBarcodes}
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

      //TODO: It may be wise to make unit static and forced, or atleast prepopulated --
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
            <SearchableDropdown
              name="pscid"
              label="PSCID"
              options={this.props.pSCIDs}
              onUserInput={this.setFormData}
              ref="pscid"
              required={true}
              value={this.state.formData.pscid}
              placeHolder='Search for a PSCID'
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

    //TODO: {barcodeForms} should eventually be moved to be after {remainingQuantityFields}
    return (
      <FormElement
        name="specimenForm"
        id='specimenForm'
        onSubmit={this.handleSubmit}
        ref="form"
      >
        <div className='row'>
          <div className="col-xs-9 col-xs-offset-1">
            {globalFields}
            {remainingQuantityFields}
          </div>
        </div>
        {barcodeForms}
        <ButtonElement
          label='Submit'
          columnSize='col-sm-2 col-sm-offset-10'
        />
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

    this.specimenSubmit();
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
   * Validate the form
   *
   * @param {object} formRefs - Object containing references to React form elements
   * @param {object} formData - Object containing form data inputed by user
   * @return {boolean} - true if all required fields are filled, false otherwise
   */
  //TODO: check media for the basis for validation
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
    // is exited
    this.props.onChange instanceof Function && this.props.onChange();
  
    if (formElement === "pscid" && value !== "" && value !== undefined) {
      this.state.visits = this.props.sessionData[this.props.pSCIDs[value]].visits;
    }

    var formData = this.state.formData;
    formData[formElement] = value;

    this.setState(
      {formData},
      this.setParentFormData()
    );
  }

  setBarcodeFormData(barcodeFormData, barcodeKey) {
    var formData = this.state.formData;
    var barcodeFormList = this.state.barcodeFormList;
    barcodeFormList[barcodeKey] = barcodeFormData;
    formData['barcodeFormList'] = barcodeFormList;

    this.setState(
      {formData},
      this.setParentFormData()
    );
  }

  addBarcodeForm() {
    let barcodeFormList = this.state.barcodeFormList;
    let count = this.state.countBarcodeForms;
    
    barcodeFormList[count+1] = {}; 

    this.setState({
      barcodeFormList: barcodeFormList,
      countBarcodeForms: count + 1
    });
  }

  copyBarcodeForm(key, multiplier) {
    let count = this.state.countBarcodeForms;
    let nextKey = count+1;
    let barcodeFormList = this.state.barcodeFormList;

    for (let i=1; i<=multiplier; i++) {
      barcodeFormList[nextKey] = JSON.parse(JSON.stringify(barcodeFormList[key])); 
      delete barcodeFormList[nextKey].barcode;
      nextKey++;
    }

    this.setState({
      barcodeFormList: barcodeFormList,
      countBarcodeForms: nextKey
    });
  }

  removeBarcodeForm(key) {
    let barcodeFormList = this.state.barcodeFormList;
    delete barcodeFormList[key];

    this.setState({
      barcodeFormList: barcodeFormList
    });
  }

  setParentFormData() {
    if (this.props.setParentFormData) {
      let formData = this.state.formData;
      this.props.setParentFormData(formData);
    }
  }
}

BiobankSpecimenForm.propTypes = {
  DataURL: React.PropTypes.string.isRequired,
  action: React.PropTypes.string.isRequired,
  barcode: React.PropTypes.string,
  refreshTable: React.PropTypes.func
};

export default BiobankSpecimenForm;
