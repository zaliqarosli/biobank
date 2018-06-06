import SpecimenBarcodeForm from './barcodeForm';
import BiobankSpecimenForm from './specimenForm';
import SpecimenPreparationForm from './preparationForm';

/**
 * Biobank Pool Specimen Form
 *
 * Fetches data from Loris backend and displays a form allowing
 * to specimen a biobank file attached to a specific instrument
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 **/
class PoolSpecimenForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      formData: {},
      barcodeList: {},
      errorMessage: null,
      formErrors: {},
      barcodeCount: 2,
      preparation: false,
      step: 1
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.setFormData = this.setFormData.bind(this);
    this.setPreparationFormData = this.setPreparationFormData.bind(this);
    this.setSpecimenFormData = this.setSpecimenFormData.bind(this);
    this.submitForm = this.submitForm.bind(this);
    this.setBarcodeCount = this.setBarcodeCount.bind(this);
    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
    this.addPreparation = this.addPreparation.bind(this);
    this.removePreparation = this.removePreparation.bind(this);
    this.validate = this.validate.bind(this);
    this.formSwitch = this.formSwitch.bind(this);
    this.preparationSwitch = this.preparationSwitch.bind(this);
    this.runAjax = this.runAjax.bind(this);
  }

  next() {
    this.validate().then(
      data => {
        this.setState({
          poolData: data,
          step: this.state.step+1
        });
      }, 
      error => {
        swal("Oops!", error.responseText, "error");
      }
    );
  }

  previous() {
    this.setState({
      step: this.state.step-1
    });
  }

  validate() {
    return this.runAjax(this.props.specimenRequest, {barcodeList: this.state.barcodeList});
  }

  runAjax(url, inputData) {
    return new Promise((resolve, reject) => {
      $.ajax(url, {
        method: "GET",
        dataType: 'json',
        data: inputData,
        success: function(data) {
          resolve(data);
        }.bind(this),
        error: function(error, textStatus, errorThrown) {
          reject(error);
          console.error(error);
        }
      });  
    })
  }

  setBarcodeCount(field, value) {
    let barcodeCount = value;
    let barcodeList = this.state.barcodeList;
    for (let barcode in barcodeList) {
      if (barcode > barcodeCount) {
        delete barcodeList[barcode];
      }
    }

    this.setState({barcodeCount, barcodeList});
  }

  formSwitch(inputForm, specimenForm) {
    switch(this.state.step) {
      case 1:
        return inputForm;
      case 2:
        return specimenForm;
    }
  }

  preparationSwitch(preparationButton, preparationForm) {
    switch(this.state.preparation) {
      case false:
        return preparationButton;
      case true:
        return preparationForm;
    }
  }

  addPreparation() {
    this.validate().then(
      data => {
        this.setState({
          poolData: data,
          preparation: true
        });
      },
      error => {
        swal('Oh no!', error.responseText, 'error');
      }
    );
  }

  removePreparation() {
    let formData = this.state.formData;
    //TODO: is it better to set it to empty, or delete it?
    formData.preparationForm = {};
    this.setState({
      preparation: false,
      formData
    });
  }

  render() {
    //Generates barcodes
    let barcodes = [];
    for (let i=1; i<=this.state.barcodeCount; i++) {
      barcodes.push(
        <TextboxElement
          name={i}
          label={'Barcode ' + i}
          onUserInput={this.setFormData}
          required={true}
          value={this.state.barcodeList[i]}
          errorMessage={this.state.formErrors[i]}
        />
      )
    }
    
    let preparationButton = ( 
      <div className='row'>
        <div className='col-xs-4'/>
        <div className='col-xs 4 action'>
            <span className='action'>
            <div 
              className='action-button add'
              onClick={this.addPreparation}
            >
              +
            </div>
            </span>
            <div className='action-title'>
              Add Preparation
            </div>
        </div>
      </div>
    );

    let preparationForm;
    if (this.state.poolData) {

      const specimenProtocolAttributes = this.props.specimenProtocolAttributes[this.state.poolData.typeId]
 
      let specimenProtocols = {};
      for (let id in specimenProtocolAttributes) {
        specimenProtocols[id] = this.props.specimenProtocols[id];
      }
      specimenProtocols = this.props.mapFormOptions(specimenProtocols, 'protocol');

      preparationForm = (
        <div className='row'>
          <div className='col-sm-9 col-sm-offset-1'>
            <SpecimenPreparationForm
              formData={this.state.formData.preparationForm}
              specimenProtocols={specimenProtocols}
              specimenProtocolAttributes={specimenProtocolAttributes}
              attributeDatatypes={this.props.attributeDatatypes}
              attributeOptions={this.props.attributeOptions}
              setParentFormData={this.setPreparationFormData}
              insertAction={`${loris.BaseURL}/biobank/ajax/submitData.php?action=insertSpecimenPreparation`}
            />
            <a className='pull-right' style={{cursor:'pointer'}} onClick={this.removePreparation}>Cancel Preparation</a>
          </div>
        </div>
      );
    }

    let inputForm = (
      <div>
        <div className='row'>
          <div className='col-sm-9 col-sm-offset-1'>
            <StaticElement
              label='Pooling Note'
              text='Select or Scan the specimens to be pooled. Please ensure that they
                    are the same type, and share the same PSCID and Visit Label'
            />
            <NumericElement
              label='№ of Specimens'
              min='2'
              max='100'
              value={this.state.barcodeCount}
              onUserInput={this.setBarcodeCount}
            />
            {barcodes}
          </div>
        </div>
        {this.preparationSwitch(preparationButton, preparationForm)}
        <div className='col-sm-3 col-xs-offset-9 action'>
          <div className='action-title'>
            Next
          </div>
          <span className='action'>
            <div 
              className='action-button update'
              onClick={this.next}
            >
              <span className='glyphicon glyphicon-chevron-right'/>
            </div>
          </span>
        </div>
      </div>
    );

    //TODO: Things here need to be in the proper order!!!
    let specimenForm;
    if (this.state.poolData) {

      // This is to provide the options for the output specimens
      let specimenTypes = {};
      if (this.state.poolData.typeId) {
        specimenTypes[this.state.poolData.typeId] = this.props.specimenTypes[this.state.poolData.typeId];
      }
  
      let pscid = this.props.pSCIDs[this.state.poolData.candidateId];
      let visit = this.props.sessionData[pscid].visits[this.state.poolData.sessionId];

      let barcodesArray = Object.values(this.state.barcodeList); 
      let barcodesString = barcodesArray.join(', ');  

      // TODO: rather than all specimen units this should really be specific to the
      // type
      let specimenUnits = this.props.mapFormOptions(this.props.specimenUnits, 'unit');

      specimenForm = (
        <div className='row'>
          <div className='col-xs-12'>
            <BiobankSpecimenForm
              formData={this.state.formData.specimenForm}
              candidateId={this.state.poolData.candidateId}
              pscid={pscid}
              sessionId={this.state.poolData.sessionId}
              visit={visit}
              parentSpecimenBarcodes={barcodesString}
              parentSpecimenIds={this.state.poolData.specimenIds}
              specimenTypes={specimenTypes}
              specimenTypeUnits={this.props.specimenTypeUnits}
              specimenUnits={specimenUnits}
              containerTypesPrimary={this.props.containerTypesPrimary}
              containersNonPrimary={this.props.containersNonPrimary}
              specimenTypeAttributes={this.props.specimenTypeAttributes}
              attributeDatatypes={this.props.attributeDatatypes}
              attributeOptions={this.props.attributeOptions}
              capacities={this.props.capacities}
              containerDimensions={this.props.containerDimensions}
              containerCoordinates={this.props.containerCoordinates}
              setParentFormData={this.setSpecimenFormData}
              action={`${loris.BaseURL}/biobank/ajax/submitData.php?action=submitSpecimen`}
              refreshParent={this.props.refreshParent}
            />
            <ButtonElement
              label='Submit'
            />
          </div>
          <div className='col-sm-3 col-xs-offset-2 action'>
            <span className='action'>
              <div 
                className='action-button update'
                onClick={this.previous}
              >
                <span className='glyphicon glyphicon-chevron-left'/>
              </div>
            </span>
            <div className='action-title'>
              Previous
            </div>
          </div>
        </div>
      );
    }

    return (
      <FormElement
        name="poolSpecimenForm"
        id='poolSpecimenForm'
        onSubmit={this.handleSubmit}
        ref="form"
      >
        {this.formSwitch(inputForm, specimenForm)}
      </FormElement>
    );
  }

/** *******************************************************************************
 *                      ******     Helper methods     *******
 *********************************************************************************/


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
    let specimenTypeFieldsObject = this.props.specimenTypeAttributes[this.state.currentSpecimenType];
    let specimenTypeFields = Object.keys(specimenTypeFieldsObject).map((attribute) => {

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

    this.submitForm();
  }

  /*
   * Uploads the file to the server
   */
  submitForm() {
    // Set form data and specimen the biobank file
    let formData = this.state.formData;
    let preparationForm = this.state.formData.preparationForm;
    let specimenForm = this.state.formData.specimenForm;
    formData['preparationForm'] = JSON.stringify(preparationForm);
    formData['specimenForm'] = JSON.stringify(specimenForm);

    console.log(formData.specimenForm);
    console.log(formData.preparationForm);

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
        //this.props.refreshParent();
        swal("Specimens Pooled Successful!", "", "success");
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
    let isValidForm = true;

    let requiredFields = {
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

    let formData = this.state.formData;
    let barcodeList = this.state.barcodeList;
 
    //TODO: there must be a better way to do this
    if (isNaN(formElement)) {
      formData[formElement] = value;
    } else {
      barcodeList[formElement] = value;
    }

    this.setState({
      formData,
      barcodeList
    });
  }

  setPreparationFormData(preparationFormData) {
    let formData = this.state.formData;
    formData.preparationForm = preparationFormData;
    
    this.setState({formData});
  }

  setSpecimenFormData(specimenFormData) {
    let formData = this.state.formData;
    formData.specimenForm = specimenFormData;
  
    this.setState({formData});
  }
}

PoolSpecimenForm.propTypes = {
  DataURL: React.PropTypes.string.isRequired,
  action: React.PropTypes.string.isRequired,
  refreshTable: React.PropTypes.func
};

export default PoolSpecimenForm;
