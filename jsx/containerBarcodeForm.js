/**
 * Container Barcode Form
 *
 * Acts a subform for ContainerForm
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 **/

class ContainerBarcodeForm extends React.Component {
  constructor(props) {
    super(props);
 
    this.state = {
      formData: {},
      formErrors: {},
      collapsed: true,
      copyMultiplier: 1,
    };
   
    this.setFormData = this.setFormData.bind(this);
    this.setParentFormData = this.setParentFormData.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.setCopyMultiplier = this.setCopyMultiplier.bind(this);
    this.copy = this.copy.bind(this);
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

  setCopyMultiplier(e) {
    let copyMultiplier = e.target.value;
   
    this.setState({
      copyMultiplier: copyMultiplier
    });
  }

  copy() {
    this.props.copyBarcodeForm(this.state.copyMultiplier);
  }

  render() {
    // HR TODO: All this CSS should eventually be moved
    let addBarcodeFormButton;
    let addBarcodeFormText;
    let copyBarcodeFormButton;
    let copyBarcodeFormText;
    if (this.props.addBarcodeForm) {
      addBarcodeFormButton = (
        <span className='action'>
          <div
            className='action-button add'
            onClick={this.props.addBarcodeForm}
          >
          +
          </div>
        </span>
      );

      addBarcodeFormText = (
        <span className='action-title'>
          New Entry
        </span>
      );
    }   
    
    if (this.props.copyBarcodeForm) {
      copyBarcodeFormButton = ( 
        <span className='action'>
          <div
            className='action-button add'
            onClick={this.copy}
          >   
            <span className='glyphicon glyphicon-duplicate'/>
          </div>
        </span>
      );  
      copyBarcodeFormText = ( 
        <span className='action-title'>
          <input 
            className='form-control input-sm'
            type='number'
            min='1'
            max='50'
            style={{width: 50, display: 'inline'}}
            onChange={this.setCopyMultiplier}
            value={this.state.copyMultiplier}
          />  
          Copies
        </span>
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
        name='biobankBarcode'
      >
        <div className='row'>
          <div className='col-xs-11'>
            <div>
            <TextboxElement
              name='barcode'
              label={'Barcode ' + this.props.id}
              onUserInput={this.setFormData}
              ref='barcode'
              required={true}
              value={this.state.formData.barcode}
            />
            </div>
          </div>
          <div className='col-xs-1' style={{paddingLeft:0, marginTop:10}}>
            <span
              className= {this.state.collapsed ? 'glyphicon glyphicon-chevron-down' : 'glyphicon glyphicon-chevron-up'}
              style={{cursor: 'pointer', fontSize:15, position:'relative', right:40}}
              data-toggle='collapse'
              data-target={'#item-' + this.props.id}
              onClick={this.toggleCollapse}
            />
            {removeBarcodeFormButton}
          </div>
        </div>
        <div className='row'>
          <div className='col-xs-2'/>
          <div className='col-xs-9'>
            <div id={'item-' + this.props.id} className='collapse'>
              <SelectElement
                name='containerType'
                label='Container Type'
                options={this.props.containerTypesNonPrimary}
                onUserInput={this.setFormData}
                required={true}
                value={this.state.formData.containerType}
              />
            </div>
          </div>
        </div>
        <div className='row'>
          <div className='col-xs-11'>
            <div className='col-xs-3'/>
            <div className='col-xs-4 action'>
              {addBarcodeFormButton}
              {addBarcodeFormText}
            </div>
            <div className='col-xs-4 action'>
              {copyBarcodeFormButton}
              {copyBarcodeFormText}
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

  setParentFormData() {
    this.props.setParentFormData(this.state.formData, this.props.id);
  }
}

ContainerBarcodeForm.propTypes = {
  id: React.PropTypes.string,
  specimenTypes: React.PropTypes.object.isRequired,
  containerTypesPrimary: React.PropTypes.object.isRequired,
  specimenTypeAttributes: React.PropTypes.object.isRequired,
  attributeDatatypes: React.PropTypes.object.isRequired,
  capacities: React.PropTypes.object.isRequired,
}

export default ContainerBarcodeForm;
