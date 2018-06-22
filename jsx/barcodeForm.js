import SpecimenCollectionForm from './collectionForm'
import ContainerParentForm from './containerParentForm'

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
  constructor() {
    super();
    this.setContainer = this.setContainer.bind(this);
    this.setSpecimen = this.setSpecimen.bind(this);
    this.copy = this.copy.bind(this);
  }

  setContainer(name, value) {
    this.props.setContainer(name, value, this.props.barcodeKey);
  }

  setSpecimen(name, value) {
    this.props.setSpecimen(name, value, this.props.barcodeKey);
  }

  copy() {
    this.props.copyBarcode(this.props.copyMultiplier);
  }

  render() {
    let addBarcodeButton;
    let addBarcodeText;
    let copyBarcodeButton;
    let copyBarcodeText;
    if (this.props.addBarcode) {
      addBarcodeButton = (
        <span className='action'>
          <div
            className='action-button add'
            onClick={this.props.addBarcode}
          >
          +
          </div>
        </span>
      );

      addBarcodeText = (
        <span className='action-title'>
          New Entry
        </span>
      );
    }
	
    if (this.props.copyBarcode) {
      copyBarcodeButton = (
        <span className='action'>
          <div
            className='action-button add'
            onClick={this.copy}
          >
            <span className='glyphicon glyphicon-duplicate'/>
          </div>
        </span>
      );
      copyBarcodeText = (
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

    let removeBarcodeButton;
    if (this.props.removeBarcode) {
      const glyphStyle = {
        color: '#DDDDDD',
        marginLeft: 10,
        cursor: 'pointer',
        fontSize: 15
      }

      removeBarcodeButton = (
        <span 
          className='glyphicon glyphicon-remove' 
          onClick={this.props.removeBarcode}
          style={glyphStyle}
        />
      );
    }

    let specimenTypes = {};
    if (this.props.data) {
      for (let id in this.props.specimenTypes) {
        if (
             (this.props.specimenTypes[id].parentTypeId ==
             this.props.data.specimen.typeId) ||
             (id == this.props.data.specimen.typeId)
        ) {
          specimenTypes[id] = this.props.specimenTypes[id]['type'];
        }
      }
    } else {
      specimenTypes = this.props.mapFormOptions(this.props.specimenTypes, 'type');
    }

    return (
      <FormElement
        name='biobankBarcode'
      >
        <div className='row'>
          <div className='col-xs-9 col-xs-offset-1'>
            <div>   
              <TextboxElement
                name='barcode'
                label={'Barcode ' + this.props.id}
                onUserInput={this.setContainer}
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
              data-target={'#item-' + this.props.barcodeKey}
              onClick={() => this.props.toggleCollapse(this.props.barcodeKey)}
            />
            {removeBarcodeButton}
          </div>
        </div>
        <div className='row'>
          <div className='col-xs-2'/>
          <div className='col-xs-8'>
            <div id={'item-' + this.props.barcodeKey} className='collapse'>
              <SelectElement
                name="typeId"
                label="Specimen Type"
                options={specimenTypes}
                onUserInput={this.setSpecimen}
                required={true}
                value={this.props.specimen.typeId}
              />
              <SelectElement
                name="typeId"
                label="Container Type"                                              
                options={this.props.containerTypesPrimary}                          
                onUserInput={this.setContainer}
                ref="containerType"                                                 
                required={true}                                                     
                value={this.props.container.typeId}                           
              />            
              <SpecimenCollectionForm
                specimen={this.props.specimen}
                setSpecimen={this.setSpecimen}
                specimenTypeUnits={this.props.specimenTypeUnits}
                specimenTypeAttributes={this.props.specimenTypeAttributes}
                attributeDatatypes={this.props.attributeDatatypes}
                attributeOptions={this.props.attributeOptions}
              />
              <ContainerParentForm                                                    
                setContainer={this.setContainer}
                mapFormOptions={this.props.mapFormOptions}
                container={this.props.container}
                containersNonPrimary={this.props.containersNonPrimary}
                containerDimensions={this.props.containerDimensions}
                containerCoordinates={this.props.containerCoordinates}
              />
            </div>
          </div>
        </div>
        <div className='row'>
          <div className='col-xs-11'>
            <div className='col-xs-4'/>
            <div className='col-xs-3 action'>
              {addBarcodeButton}
              {addBarcodeText}
            </div>
            <div className='col-xs-3 action'>
              {copyBarcodeButton}
              {copyBarcodeText}
            </div>
          </div>
        </div>
      </FormElement>
    );
  }
}

SpecimenBarcodeForm.propTypes = {
}

export default SpecimenBarcodeForm;
