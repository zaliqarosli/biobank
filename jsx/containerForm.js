import ContainerBarcodeForm from './containerBarcodeForm.js';

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
class BiobankContainerForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      formData: {},
      barcodeFormList: {},
      formErrors: {},
      countBarcodeForms: [1],
      errorMessage: null
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.setFormData = this.setFormData.bind(this);
    this.containerSubmit = this.containerSubmit.bind(this);
    this.addBarcodeForm = this.addBarcodeForm.bind(this);
    this.setBarcodeFormData = this.setBarcodeFormData.bind(this);
  }

  componentDidMount() {

    //if this is a child specimen form then certain formData is set when component mounts
    if (this.props.child) {
      var formData = this.state.formData;
      formData['parentSpecimen'] = this.props.specimenId;
      formData['visitLabel'] = this.props.sessionId;

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
        <ContainerBarcodeForm
          setParentFormData={this.setBarcodeFormData}
          id={this.state.countBarcodeForms[i]}
          containerTypesNonPrimary={this.props.containerTypesNonPrimary}
          containerBarcodesNonPrimary={this.props.containerBarcodesNonPrimary}
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

    //ALLOW THEM TO CANCEL THE FORM AND DELETE BARCODE FORMS
    return (
      <FormElement
        name="specimenForm"
        onSubmit={this.handleSubmit}
        ref="form"
      >
        <br/>
        <div className="row">
          <div className="col-xs-11">
            <SelectElement
              name="site"
              label="Site"
              options={this.props.sites}
              onUserInput={this.setFormData}
              ref="site"
              required={true}
              value={this.state.formData.site}
            />
          </div>
        </div>
        {barcodeForms}
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
   * @param {string} visitLabel - Visit label selected from the dropdown
   * @param {string} instrument - Instrument selected from the dropdown
   * @return {string} - Generated valid filename for the current selection
   */


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

    this.containerSubmit();
  }

  containerSubmit() {
    // Set form data
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
 
        //refreshes table 
        this.props.refreshParent();

        //provide success message
        swal("Container Submission Successful!", "", "success");

        //close modal window
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
    //let visitLabel = this.state.formData.visitLabel;
  
    //LOOK AT THIS LATER - THE SWITCH TO PROPS MESSED THIS ALL UP 
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

BiobankContainerForm.propTypes = {
  DataURL: React.PropTypes.string.isRequired,
  action: React.PropTypes.string.isRequired,
  barcode: React.PropTypes.string,
  refreshTable: React.PropTypes.func
};

export default BiobankContainerForm;
