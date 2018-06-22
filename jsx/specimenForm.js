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
  constructor() {
    super();

    this.state = {
      formErrors: {},
      candidateId: null,
      sessionId: null,
      centerId: null,
      barcodeList: {1: {specimen: {collection: {}}, container: {}}},
      count: 1,
      collapsed: {1: true},
      copyMultiplier: 1,
    };

    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.setSpecimen = this.setSpecimen.bind(this);
    this.setContainer = this.setContainer.bind(this);
    this.addBarcode = this.addBarcode.bind(this);
    this.setCopyMultiplier = this.setCopyMultiplier.bind(this);
    this.copyBarcode = this.copyBarcode.bind(this);
    this.removeBarcode = this.removeBarcode.bind(this);
    this.saveBarcodeList = this.saveBarcodeList.bind(this);
  }

  toggleCollapse(key) {
    let collapsed = this.state.collapsed;
    collapsed[key] = !collapsed[key];
    this.setState({collapsed});
  }

  saveBarcodeList() {
    let barcodeList = JSON.parse(JSON.stringify(this.state.barcodeList));
    let availableId = Object.keys(this.props.containerStati).find(
      key => this.props.containerStati[key] === 'Available'
    );

    for (let barcode in barcodeList) {
      //set container values
      let container = barcodeList[barcode].container;
      container.statusId = availableId;
      container.temperature = 20;
      container.locationId = this.state.centerId;
      container.originId = this.state.centerId;

      //set specimen values
      let specimen = barcodeList[barcode].specimen;
      specimen.candidateId = this.state.candidateId;
      specimen.sessionId = this.state.sessionId;
      specimen.quantity = specimen.collection.quantity;
      specimen.unitId = specimen.collection.unitId;
      specimen.collection.locationId = this.state.centerId;
      if (this.props.specimenTypes[specimen.typeId].freezeThaw === 1) {
        specimen.fTCycle = 0;
      }

      //if this is an aliquot form, reset some of the values.
      //TODO: these will eventually be higher level states.
      if (this.props.data) {
        specimen.candidateId = this.props.data.candidate.CandID;
        specimen.sessionId = this.props.data.session.ID;
        specimen.parentSpecimenId = this.props.data.specimen.id;
        specimen.collection.locationId = this.props.data.container.locationId;
        container.locationId = this.props.data.container.locationId;
        container.originId = this.props.data.container.locationId;
      }
    
      barcodeList[barcode].container = container;
      barcodeList[barcode].specimen = specimen;
    }

    this.props.save(barcodeList, this.props.saveBarcodeListURL, 'Save Successful!').then(
      () => {this.props.close(); this.props.loadFilters()}
    );
  }

  setSpecimen(name, value, key) {
    this.props.onChange instanceof Function && this.props.onChange();
    let centerId = this.state.centerId;
    let candidateId = this.state.candidateId;
    let sessionId = this.state.sessionId;
    let barcodeList = this.state.barcodeList;

    if (name === 'candidateId') {
      candidateId = value;
    } else if (name === 'sessionId') {
      sessionId = value;
      centerId = this.props.sessionCenters[sessionId].centerId;
    } else {
      //this is eliminate values if specimen type is changed
      if (name === 'typeId') {
        barcodeList[key].specimen = {collection:{}};
      }
      barcodeList[key].specimen[name] = value;
    }

    this.setState({barcodeList, centerId, candidateId, sessionId})
  }

  setContainer(name, value, key) {
    this.props.onChange instanceof Function && this.props.onChange();
    let barcodeList = this.state.barcodeList;
    barcodeList[key].container[name] = value;
    this.setState({barcodeList});
  }

  addBarcode() {
    let barcodeList = this.state.barcodeList;
    let count = this.state.count;
    let collapsed = this.state.collapsed;

    barcodeList[count+1] = {specimen: {}, container: {collection:{}}}; 
    collapsed[count+1] = true;
    count = count+1

    this.setState({barcodeList, collapsed, count});
  }

  setCopyMultiplier(e) {
    let copyMultiplier = e.target.value;
    this.setState({copyMultiplier});
  }

  copyBarcode(key) {
    let count = this.state.count;
    let collapsed = this.state.collapsed;
    let nextKey = count+1;
    let barcodeList = this.state.barcodeList;
    let multiplier = this.state.copyMultiplier

    for (let i=1; i<=multiplier; i++) {
      barcodeList[nextKey] = JSON.parse(JSON.stringify(barcodeList[key])); 
      delete barcodeList[nextKey].container.barcode;
      collapsed[nextKey] = true;
      nextKey++;
    }

    this.setState({
      barcodeList: barcodeList,
      count: nextKey,
      collapsed: collapsed,
    });
  }

  removeBarcode(key) {
    let barcodeList = this.state.barcodeList;
    delete barcodeList[key];
    this.setState({barcodeList: barcodeList});
  }

  render() {
    //Generates new Barcode Form everytime the addBarcodeForm button is pressed
    let barcodeListArray = Object.keys(this.state.barcodeList);
    let barcodes = [];
    let i = 1;
    for (let key of barcodeListArray) {
      barcodes.push(
        <SpecimenBarcodeForm
          data={this.props.data || null}
          key={key}
          barcodeKey={key}
          id={i} 
          collapsed={this.state.collapsed[key]}
          toggleCollapse={this.toggleCollapse}
          mapFormOptions={this.props.mapFormOptions}
          container={this.state.barcodeList[key].container || null}
          specimen={this.state.barcodeList[key].specimen || null}
          removeBarcode={barcodeListArray.length !== 1 ?
            () => this.removeBarcode(key) : null}
          addBarcode={i == barcodeListArray.length ? this.addBarcode : null}
          setCopyMultiplier={this.setCopyMultiplier}
          copyMultiplier={this.state.copyMultiplier}
          copyBarcode={i == barcodeListArray.length && this.state.barcodeList[key] ? 
            this.copyBarcode : null}
          setContainer={this.setContainer}
          setSpecimen={this.setSpecimen}
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
     if (this.state.candidateId) {
       sessions = this.props.mapFormOptions(this.props.candidateSessions[this.state.candidateId], 'label'); 
     }
      //TODO: not sure why, but I'm now having trouble with the SearchableDropdown
      globalFields = (
        <div>
          <SelectElement
            name="candidateId"
            label="PSCID"
            options={this.props.candidates}
            onUserInput={this.setSpecimen}
            required={true}
            value={this.state.candidateId}
            placeHolder='Search for a PSCID'
          />
          <SelectElement
            name='sessionId'
            label='Visit Label'
            options={sessions}
            onUserInput={this.setSpecimen}
            required={true}
            value={this.state.sessionId}
            disabled={this.state.candidateId ? false : true}
          />
        </div>
      );
    }

    return (
      <FormElement
        name="specimenForm"
        id='specimenForm'
        onSubmit={() => {
          this.saveBarcodeList();
          //this.props.saveSpecimen instanceof Function && this.props.saveSpecimen()
        }}
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

export default BiobankSpecimenForm;
