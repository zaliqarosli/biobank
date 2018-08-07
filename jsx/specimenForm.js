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
  constructor() {
    super();

    this.setSession = this.setSession.bind(this);
  }

  componentDidMount() {
    //TODO: This is a band-aid solution, fix it!
    if (this.props.data) {
      this.props.setCurrent('originId', this.props.data.container.originId);
      this.props.setCurrent('centerId', this.props.data.container.centerId);
    }
  }

  setSession(session, sessionId) {
    let centerId = this.props.options.sessionCenters[sessionId].centerId
    this.props.setCurrent(session, sessionId);
    this.props.setCurrent('centerId', centerId);
  }

  render() {

    //Generates new Barcode Form everytime the addBarcodeForm button is pressed
    let list = Object.entries(this.props.current.list);
    let barcodes = [];
    let i = 1;
    list.forEach(([key, item]) => {
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
          container={item.container || null}
          specimen={item.specimen || null}
          errors={this.props.errors.list[key] || {}}
          removeSpecimen={list.length !== 1 ?
            () => {this.props.removeListItem(key)} : null}
          addSpecimen={i == list.length ? 
            () => {this.props.addListItem('specimen')} : null}
          multiplier={this.props.current.multiplier}
          copySpecimen={i == list.length && item ? this.props.copyListItem : null}
          setContainerList={this.props.setContainerList}
          setSpecimenList={this.props.setSpecimenList}
          options={this.props.options}
        />
      )
      
      i++;
    });

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
            text={this.props.options.candidates[this.props.data.specimen.candidateId].pscid}
          />
          <StaticElement
            label="Visit Label"
            text={this.props.options.sessions[this.props.data.specimen.sessionId].label}
          />
        </div>
      );

      let specimenUnits = this.props.mapFormOptions(
        this.props.options.specimenUnits, 'unit'
      );

      remainingQuantityFields = (
        <div>
          <TextboxElement
            name="quantity"
            label="Remaining Quantity"
            onUserInput={this.props.setSpecimen}
            required={true}
            value={this.props.current.specimen.quantity}
          />
          <SelectElement
            name="unitId"
            label="Unit"
            options={specimenUnits}
            onUserInput={this.props.setSpecimen}
            emptyOption={false}
            required={true}
            value={this.props.current.specimen.unitId}
          />
        </div>
      );
    } else {
      let sessions = this.props.current.candidateId ?
        this.props.mapFormOptions(
          this.props.options.candidateSessions[this.props.current.candidateId], 'label'
        ) : {};

      let candidates = this.props.mapFormOptions(
        this.props.options.candidates, 'pscid'
      );

      //TODO: not sure why, but I'm now having trouble with the SearchableDropdown
      globalFields = (
        <div>
          <SelectElement
            name="candidateId"
            label="PSCID"
            options={candidates}
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
            onUserInput={this.setSession}
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

    let specimenTypes = this.props.mapFormOptions(
      this.props.options.specimenTypes, 'type'
    );

    if (this.props.data) {
      //TODO: review this logic later when refactoring aliquot form.
      Object.entries(this.props.options.specimenTypes).forEach(([id, entry]) => {
        if (entry.parentTypeId != this.props.data.specimen.typeId 
          && id != this.props.data.specimen.typeId) {
          delete specimenTypes[id]
        }
      });
    }

    let containerTypesPrimary = this.props.mapFormOptions(
      this.props.options.containerTypesPrimary, 'label'
    );

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
                options={containerTypesPrimary}                          
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
                specimenTypeUnits={this.props.options.specimenTypeUnits}
                specimenTypeAttributes={this.props.options.specimenTypeAttributes}
                attributeDatatypes={this.props.options.attributeDatatypes}
                attributeOptions={this.props.options.attributeOptions}
              />
              <ContainerParentForm                                                    
                setContainer={this.setContainer}
                mapFormOptions={this.props.mapFormOptions}
                container={this.props.container}
                containersNonPrimary={this.props.options.containersNonPrimary}
                containerDimensions={this.props.options.containerDimensions}
                containerCoordinates={this.props.options.containerCoordinates}
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
