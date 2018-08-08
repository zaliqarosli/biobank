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

  render() {
    //Generates new Barcode Form everytime the addContainer button is pressed
    let containerListArray = Object.keys(this.props.containerList);
    let containers = [];
    let i = 1;
    for (let key of containerListArray) {
      containers.push(
        <ContainerBarcodeForm
          key={key}
          containerKey={key}
          id={i}
          container={this.props.containerList[key].container}
          errors={(this.props.errors[key]||{}).container}
          collapsed={this.props.current.collapsed[key]}
          containerTypesNonPrimary={this.props.containerTypesNonPrimary}
          containerBarcodesNonPrimary={this.props.containerBarcodesNonPrimary}
          removeContainer={containerListArray.length !== 1 ? () => {this.props.removeListItem(key)} : null}
          addContainer={i == containerListArray.length ? () => {this.props.addListItem('container')} : null}
          multiplier={this.props.current.multiplier}
          copyContainer={i == containerListArray.length && this.props.containerList[key] ? this.props.copyListItem : null}
          setContainerList={this.props.setContainerList}
          setCurrent={this.props.setCurrent}
          toggleCollapse={this.props.toggleCollapse}
        />
      );
     
      i++;
    }

    return (
      <FormElement
        name="containerForm"
        onSubmit={this.props.saveContainerList}
        ref="form"
      >
        <br/>
        <div className="row">
          <div className="col-xs-11">
            <SelectElement
              name="centerId"
              label="Site"
              options={this.props.centers}
              onUserInput={this.props.setCurrent}
              required={true}
              value={this.props.current.centerId}
              errorMessage={(this.props.errors.container||{}).centerId}
            />
          </div>
        </div>
        {containers}
          <div className="col-xs-3 col-xs-offset-9">
            <ButtonElement label="Submit"/>
          </div>
      </FormElement>
    );
  }
}

BiobankContainerForm.propTypes = {
  DataURL: React.PropTypes.string.isRequired,
  barcode: React.PropTypes.string,
  refreshTable: React.PropTypes.func
};


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

  //TODO: change form.js so this isn't necessary ?
  setContainer(name, value) {
    this.props.setContainerList(name, value, this.props.containerKey);
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
            onChange={(e)=>{this.props.setCurrent('multiplier', e.target.value)}}
            value={this.props.multiplier}
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
              errorMessage={this.props.errors.barcode}
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
                errorMessage={this.props.errors.typeId}
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

ContainerBarcodeForm.defaultProps = {
  errors: {},
  multiplier: 1,
}

export default BiobankContainerForm;
