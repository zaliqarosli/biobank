import SpecimenCollectionForm from './collectionForm'
import ContainerParentForm from './containerParentForm'

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
  render() {

    //Generates new Barcode Form everytime the addBarcodeForm button is pressed
    let specimenListArray = Object.keys(this.props.specimenList);
    let barcodes = [];
    let i = 1;
    for (let key of specimenListArray) {
      barcodes.push(
        <SpecimenBarcodeForm
          data={this.props.data || null}
          key={key}
          barcodeKey={key}
          id={i} 
          collapsed={this.props.current.collapsed[key]}
          toggleCollapse={this.props.toggleCollapse}
          mapFormOptions={this.props.mapFormOptions}
          setCurrent={this.props.setCurrent}
          container={this.props.specimenList[key].container || null}
          specimen={this.props.specimenList[key].specimen || null}
          errors={this.props.errors.list[key] || {}}
          removeSpecimen={specimenListArray.length !== 1 ?
            () => this.props.removeListItem(key) : null}
          addSpecimen={i == specimenListArray.length ? () => {this.props.addListItem('specimen')} : null}
          multiplier={this.props.current.multiplier}
          copySpecimen={i == specimenListArray.length && this.props.specimenList[key] ? 
            this.props.copyListItem : null}
          setContainerList={this.props.setContainerList}
          setSpecimenList={this.props.setSpecimenList}
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
    if (this.props.data) {
      globalFields = (
        <div>
          <StaticElement
            label="Parent Specimen"
            text={this.props.data.container.barcode}
          />
          <StaticElement
            label="PSCID"
            text={this.props.data.candidate.PSCID}
          />
          <StaticElement
            label="Visit Label"
            text={this.props.data.session.Visit_label}
          />
        </div>
      );

      remainingQuantityFields = (
        <div>
          <TextboxElement
            name="quantity"
            label="Remaining Quantity"
            onUserInput={this.props.setSpecimen}
            required={true}
            value={this.props.specimen.quantity}
          />
          <SelectElement
            name="unitId"
            label="Unit"
            options={this.props.specimenUnits}
            onUserInput={this.props.setSpecimen}
            emptyOption={false}
            required={true}
            value={this.props.specimen.unitId}
          />
        </div>
      );
    } else {
     let sessions = {};
     if (this.props.current.candidateId) {
       sessions = this.props.mapFormOptions(this.props.candidateSessions[this.props.current.candidateId], 'label'); 
     }
      //TODO: not sure why, but I'm now having trouble with the SearchableDropdown
      globalFields = (
        <div>
          <SelectElement
            name="candidateId"
            label="PSCID"
            options={this.props.candidates}
            onUserInput={this.props.setCurrent}
            required={true}
            value={this.props.current.candidateId}
            placeHolder='Search for a PSCID'
            errorMessage={this.props.errors.specimen.candidateId}
          />
          <SelectElement
            name='sessionId'
            label='Visit Label'
            options={sessions}
            onUserInput={this.props.setCurrent}
            required={true}
            value={this.props.current.sessionId}
            disabled={this.props.current.candidateId ? false : true}
            errorMessage={this.props.errors.specimen.sessionId}
          />
        </div>
      );
    }

    return (
      <FormElement
        name="specimenForm"
        id='specimenForm'
        onSubmit={this.props.saveSpecimenList}
        ref="form"
      >
        <div className='row'>
          <div className="col-xs-9 col-xs-offset-1">
            {globalFields}
            {remainingQuantityFields}
          </div>
        </div>
        {barcodes}
        <ButtonElement
          label='Submit'
          columnSize='col-sm-2 col-sm-offset-10'
        />
      </FormElement>
    );
  }
}

BiobankSpecimenForm.propTypes = {
};

BiobankSpecimenForm.defaultProps = {
  specimenList: {},
};

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
    this.props.setContainerList(name, value, this.props.barcodeKey);
  }

  setSpecimen(name, value) {
    this.props.setSpecimenList(name, value, this.props.barcodeKey);
  }

  copy() {
    this.props.copySpecimen(this.props.barcodeKey);
  }

  render() {
    let addSpecimenButton;
    let addSpecimenText;
    let copySpecimenButton;
    let copySpecimenText;
    if (this.props.addSpecimen) {
      addSpecimenButton = (
        <span className='action'>
          <div
            className='action-button add'
            onClick={this.props.addSpecimen}
          >
          +
          </div>
        </span>
      );

      addSpecimenText = (
        <span className='action-title'>
          New Entry
        </span>
      );
    }
	
    if (this.props.copySpecimen) {
      copySpecimenButton = (
        <span className='action'>
          <div
            className='action-button add'
            onClick={this.copy}
          >
            <span className='glyphicon glyphicon-duplicate'/>
          </div>
        </span>
      );
      copySpecimenText = (
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

    let removeSpecimenButton;
    if (this.props.removeSpecimen) {
      const glyphStyle = {
        color: '#DDDDDD',
        marginLeft: 10,
        cursor: 'pointer',
        fontSize: 15
      }

      removeSpecimenButton = (
        <span 
          className='glyphicon glyphicon-remove' 
          onClick={this.props.removeSpecimen}
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
                errorMessage={(this.props.errors.container||{}).barcode}
              />
            </div>
          </div>
          <div className='col-xs-1' style={{paddingLeft:0, marginTop:10}}>
            <span 
              className= {this.props.collapsed ? 'glyphicon glyphicon-chevron-down' : 'glyphicon glyphicon-chevron-up'}
              style={{cursor: 'pointer', fontSize:15, position:'relative', right:40}}
              data-toggle='collapse' 
              data-target={'#item-' + this.props.barcodeKey}
              onClick={() => {this.props.toggleCollapse(this.props.barcodeKey)}}
            />
            {removeSpecimenButton}
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
                errorMessage={(this.props.errors.specimen||{}).typeId}
              />
              <SelectElement
                name="typeId"
                label="Container Type"                                              
                options={this.props.containerTypesPrimary}                          
                onUserInput={this.setContainer}
                ref="containerType"                                                 
                required={true}                                                     
                value={this.props.container.typeId}                           
                errorMessage={(this.props.errors.container||{}).typeId}
              />            
              <SpecimenCollectionForm
                specimen={this.props.specimen}
                errors={(this.props.errors.specimen||{}).collection}
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
              {addSpecimenButton}
              {addSpecimenText}
            </div>
            <div className='col-xs-3 action'>
              {copySpecimenButton}
              {copySpecimenText}
            </div>
          </div>
        </div>
      </FormElement>
    );
  }
}

SpecimenBarcodeForm.propTypes = {
};

SpecimenBarcodeForm.defaultProps = {
};

export default BiobankSpecimenForm;
