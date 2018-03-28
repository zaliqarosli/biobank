import SpecimenCollectionForm from './collectionForm'

/**
 * Biobank Barcode Form
 *
 * Acts a subform for BiobankSpecimenForm
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 **/

class SpecimenBarcodeForm extends React.Component {
  constructor(props) {
    super(props);
 
    this.state = {
      formData: {},
      formErrors: {},
      collapsed: true
    };
   
    this.setFormData = this.setFormData.bind(this);
    this.setCollectionFormData = this.setCollectionFormData.bind(this);
    this.setParentFormData = this.setParentFormData.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
  }

  componentDidMount() {

    if (this.props.formData) {
      let formData = this.props.formData;
    
      this.setState({
        formData: formData
      }); 
    }   
  }

  toggleCollapse() {
    this.setState({collapsed: !this.state.collapsed});
  }

  render() {

    //HR TODO: This CSS should evenutally be moved
    let addBarcodeFormButton;
    let duplicateBarcodeFormButton;
    if (this.props.addBarcodeForm) {
      addBarcodeFormButton = (
        <button
          type='button'
          className='btn btn-success btn-sm'
          onClick={this.props.addBarcodeForm}
        >
          <span className='glyphicon glyphicon-plus' style={{marginRight: 5}}/>
          New
        </button>
      );
    }
	
    if (this.props.duplicateBarcodeForm) {
      duplicateBarcodeFormButton = (
        <button
          type='button'
          className='btn btn-success btn-sm'
          onClick={this.props.duplicateBarcodeForm}
        >
          <span className='glyphicon glyphicon-duplicate'style={{marginRight: 5}}/>
          Previous
        </button>
      );
    }


    let removeBarcodeFormButton;
    if (this.props.removeBarcodeForm) {
      const glyphStyle = {
        color: '#DDDDDD',
        marginLeft: 10,
        cursor: 'pointer',
        fontSize: 15
      }

      const buttonStyle = {
        appearance: 'non',
        outline: 'non',
        boxShadow: 'none',
        borderColor: 'transparent',
        backgroundColor: 'transparent'
      }

      removeBarcodeFormButton = (
        <span 
          className='glyphicon glyphicon-remove' 
          onClick={this.props.removeBarcodeForm}
          style={glyphStyle}
        />
      );
    }

    return (
      <FormElement
        name="biobankBarcode"
      >
        <div className="row">
          <div className="col-xs-11">
            <div>   
              <TextboxElement
                name={"barcode"}
                label={"Barcode " + this.props.id}
                onUserInput={this.setFormData}
                ref={"barcode"}
                required={true}
                value={this.state.formData["barcode"]}
              />
            </div>
          </div>
          <div className='col-xs-1' style={{paddingLeft:0, marginTop:10}}>
            <span 
              className= {this.state.collapsed ? 'glyphicon glyphicon-chevron-down' : 'glyphicon glyphicon-chevron-up'}
              style={{cursor: 'pointer', fontSize:15, position:'relative', right:40}}
              data-toggle="collapse" 
              data-target={"#" + this.props.id}
              onClick={this.toggleCollapse}
            />
            {removeBarcodeFormButton}
          </div>
        </div>
        <div className="row">
          <div className="col-xs-2"/>
          <div className="col-xs-9">
            <div id={this.props.id} className="collapse">
              <SpecimenCollectionForm
                formData={this.props.formData}
                setParentFormData={this.setCollectionFormData}
                onChange={this.props.onChange}
                specimenTypes={this.props.specimenTypes}
                specimenTypeAttributes={this.props.specimenTypeAttributes}
                attributeDatatypes={this.props.attributeDatatypes}
                containerTypesPrimary={this.props.containerTypesPrimary}
                containersNonPrimary={this.props.containersNonPrimary}
                containerDimensions={this.props.containerDimensions}
                containerCoordinates={this.props.containerCoordinates}
                specimenTypeUnits={this.props.specimenTypeUnits}
                stati={this.props.stati}
              />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-11">
            <div className="col-xs-3"/>
            <div className="col-xs-1">
              {addBarcodeFormButton}
            </div>
            <div className="col-xs-1">
              {duplicateBarcodeFormButton}
            </div>
          </div>
        </div>
      </FormElement>
    );
  }

  /**
   * Set the form data based on state values of child elements/componenets
   *
   * @param {string} formElement - name of the selected element
   * @param {string} value - selected value for corresponding form element
   */
  setFormData(formElement, value) {
    this.props.onChange instanceof Function && this.props.onChange();   

    var formData = this.state.formData;
    formData[formElement] = value;

    this.setState(
      {
      formData: formData
      },
      this.setParentFormData
    );
  }

  setCollectionFormData(collectionFormData) {
    var formData = this.state.formData;
    
    for (let field in collectionFormData) {
      formData[field] = collectionFormData[field]
    }
 
    this.setState(
      {
        formData: formData
      },
      this.setParentFormData
    );
  }

  setParentFormData() {
    this.props.setParentFormData(this.state.formData, this.props.barcodeKey);
  }
}

SpecimenBarcodeForm.propTypes = {
  
  id: React.PropTypes.string,
  specimenTypes: React.PropTypes.object.isRequired,
  containerTypesPrimary: React.PropTypes.object.isRequired,
  specimenTypeAttributes: React.PropTypes.object.isRequired,
  attributeDatatypes: React.PropTypes.object.isRequired,
  capacities: React.PropTypes.object.isRequired,
}

export default SpecimenBarcodeForm;
