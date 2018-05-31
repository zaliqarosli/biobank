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
      errorMessage: null,
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
    this.save = this.save.bind(this);
  }

  toggleCollapse(key) {
    let collapsed = this.state.collapsed;
    collapsed[key] = !collapsed[key];
    this.setState({collapsed});
  }

  saveBarcodeList() {
    let barcodeList = this.state.barcodeList;
    for (let barcode in barcodeList) {
      let availableId = Object.keys(this.props.containerStati).find(
        key => this.props.containerStati[key] === 'Available'
      );
      let container = JSON.parse(JSON.stringify(barcodeList[barcode].container));
      container.statusId = availableId;
      container.temperature = 20;
      container.locationId = this.state.centerId;
      container.originId = this.state.centerId;

      this.save(container, this.props.saveContainer).then(
        containerId => {
          let specimen = JSON.parse(JSON.stringify(barcodeList[barcode].specimen));
          specimen.candidateId = this.state.candidateId;
          specimen.sessionId = this.state.sessionId;
          specimen.containerId = containerId;
          specimen.quantity = specimen.collection.quantity;
          specimen.unitId = specimen.collection.unitId;
          specimen.collection.locationId = this.state.centerId;
          specimen.collection = JSON.stringify(specimen.collection);
          this.save(specimen, this.props.saveSpecimen);
        }
      );
    }
  }

  save(entity, url) {
    let entityObject = new FormData();
    for (let key in entity) {
      if (entity[key] !== "") {
        entityObject.append(key, entity[key]);
      }
    }

    return new Promise(resolve => {
      $.ajax({
        type: 'POST',
        url: url,
        data: entityObject,
        cache: false,
        contentType: false,
        processData: false,
        xhr: function() {
          let xhr = new window.XMLHttpRequest();
          return xhr;
        }.bind(this),
        success: function(containerId) {
          resolve(containerId);
          this.props.refreshParent();
          swal("Save Successful!", "", "success");
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
    });
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
      barcodeList[key].specimen[name] = value;
      //TODO: this is eliminate collection if specimen type is changed
      //May be better way of doing this.
      if (name === 'typeId') {
        barcodeList[key].specimen.collection = {};
      }
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
    if (this.props.parentSpecimenIds) {
      globalFields = (
        <div>
          <StaticElement
            label="Parent Specimen"
            text={this.props.parentSpecimenBarcodes}
          />
          <StaticElement
            label="PSCID"
            text={this.props.pscid}
          />
          <StaticElement
            label="Visit Label"
            text={this.props.visit}
          />
        </div>
      );

      remainingQuantityFields = (
        <div>
          <TextboxElement
            name="quantity"
            label="Remaining Quantity"
            onUserInput={this.setSpecimen}
            required={true}
            value={this.state.formData.quantity}
          />
          <SelectElement
            name="unitId"
            label="Unit"
            options={this.props.specimenUnits}
            onUserInput={this.setSpecimen}
            emptyOption={false}
            required={true}
            value={this.state.formData.unitId}
          />
        </div>
      );
    } else {
     let sessions = {};
     if (this.state.candidateId) {
       sessions = this.props.mapFormOptions(this.props.candidateSessions[this.state.candidateId], 'label'); 
     }
      globalFields = (
        <div>
          <SearchableDropdown
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
        onSubmit={this.saveBarcodeList}
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
