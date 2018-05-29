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
  constructor() {
    super();
   
    this.setContainer = this.setContainer.bind(this);
    this.copy = this.copy.bind(this);
  }

  copy() {
    this.props.copyContainer(this.props.containerKey);
  }

  //TODO: change form.js so this isn't necessary
  setContainer(name, value) {
    this.props.setContainer(name, value, this.props.containerKey);
  }

  render() {
    // HR TODO: All this CSS should eventually be moved
    let addContainerButton;
    let addContainerText;
    let copyContainerButton;
    let copyContainerText;
    if (this.props.addContainer) {
      addContainerButton = (
        <span className='action'>
          <div
            className='action-button add'
            onClick={this.props.addContainer}
          >
          +
          </div>
        </span>
      );

      addContainerText = (
        <span className='action-title'>
          New Entry
        </span>
      );
    }   
    
    if (this.props.copyContainer) {
      copyContainerButton = ( 
        <span className='action'>
          <div
            className='action-button add'
            onClick={this.copy}
          >   
            <span className='glyphicon glyphicon-duplicate'/>
          </div>
        </span>
      );  
      copyContainerText = ( 
        <span className='action-title'>
          <input 
            className='form-control input-sm'
            type='number'
            min='1'
            max='50'
            style={{width: 50, display: 'inline'}}
            onChange={this.props.setCopyMultiplier}
            value={this.props.copyMultiplier}
          />  
          Copies
        </span>
      );  
    }   

    let removeContainerButton;
    if (this.props.removeContainer) {
      const glyphStyle = { 
        color: '#DDDDDD',
        marginLeft: 10, 
        cursor: 'pointer',
        fontSize: 15
      }   

      removeContainerButton = ( 
        <span 
          className='glyphicon glyphicon-remove' 
          onClick={this.props.removeContainer}
          style={glyphStyle}
        />
      );  
    }

    return (
      <FormElement
        name='container'
      >
        <div className='row'>
          <div className='col-xs-11'>
            <div>
            <TextboxElement
              name='barcode'
              label={'Barcode ' + this.props.id}
              onUserInput={this.setContainer}
              ref='barcode'
              required={true}
              value={this.props.container.barcode}
            />
            </div>
          </div>
          <div className='col-xs-1' style={{paddingLeft:0, marginTop:10}}>
            <span
              className= {this.props.collapsed ? 'glyphicon glyphicon-chevron-down' : 'glyphicon glyphicon-chevron-up'}
              style={{cursor: 'pointer', fontSize:15, position:'relative', right:40}}
              data-toggle='collapse'
              data-target={'#item-' + this.props.containerKey}
              onClick={() => this.props.toggleCollapse(this.props.containerKey)}
            />
            {removeContainerButton}
          </div>
        </div>
        <div className='row'>
          <div className='col-xs-2'/>
          <div className='col-xs-9'>
            <div id={'item-' + this.props.containerKey} className='collapse'>
              <SelectElement
                name='typeId'
                label='Container Type'
                options={this.props.containerTypesNonPrimary}
                onUserInput={this.setContainer}
                required={true}
                value={this.props.container.typeId}
              />
            </div>
          </div>
        </div>
        <div className='row'>
          <div className='col-xs-11'>
            <div className='col-xs-3'/>
            <div className='col-xs-4 action'>
              {addContainerButton}
              {addContainerText}
            </div>
            <div className='col-xs-4 action'>
              {copyContainerButton}
              {copyContainerText}
            </div>
          </div>
        </div>
      </FormElement>
    );
  }
}

ContainerBarcodeForm.propTypes = {
}

export default ContainerBarcodeForm;
