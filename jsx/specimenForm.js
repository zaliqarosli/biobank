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
  constructor(props) {
    super(props);

    // get Id of available status
    let availableId = Object.keys(this.props.containerStati).find(
      key => this.props.containerStati[key] === 'Availabale'
    );

    this.state = {
      errorMessage: null,
      formErrors: {},
      barcodeList: {
        1: {
          specimen: {},
          container: {statusId: availableId, temperature: 20}
        }
      },
      countBarcodes: 1
    };

    this.saveBarcodeList = this.saveBarcodeList.bind(this);
    this.save = this.save.bind(this);
  }

  saveBarcodeList() {
    let barcodeList = this.state.barcodeList;
    for (let barcode in barcodeList) {
      this.save(barcodeList[barcode].container, this.props.saveContainer);
      this.save(barcodeList[barcode].specimen, this.props.saveSpecimen);
    }
  }

  save(entity, url) {
    let entityObject = new FormData();
    for (let key in entity) {
      if (entity[key] !== "") {
        entityObject.append(key, entity[key]);
      }
    }

    $.ajax({
      type: 'POST',
      url: url,
      data: entityObj,
      cache: false,
      contentType: false,
      processData: false,
      xhr: function() {
        let xhr = new window.XMLHttpRequest();
        return xhr;
      }.bind(this),
      success: function() {
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
  }

  setContainer(name, value) {
    let siteId = this.state.siteId;
    let containerList = this.state.containerList;

    if (name === 'siteId') {
      siteId = value;

    }

    
  }

  setSpecimen(name, value) {

  }

  setBarcodeList(barcodeData, barcodeKey) {
    let barcodeList = this.state.barcodeList;
    barcodeList[barcodeKey] = barcodeData;
    
    this.setState({ barcodeList});
  };

  addBarcode() {
    let barcodeList = this.state.barcodeList;
    let count = this.state.countBarcodes;

    barcodeList[count+1] = {
      specimen: {},
      container: {}
    }; 

    this.setState({
      barcodeList: barcodeList,
      countBarcodes: count + 1
    });
  }

  copyBarcode(key, multiplier) {
    let count = this.state.countBarcodes;
    let nextKey = count+1;
    let barcodeList = this.state.barcodeList;

    for (let i=1; i<=multiplier; i++) {
      barcodeList[nextKey] = JSON.parse(JSON.stringify(barcodeList[key])); 
      delete barcodeList[nextKey].barcode;
      nextKey++;
    }

    this.setState({
      barcodeList: barcodeList,
      countBarcodes: nextKey
    });
  }

  removeBarcode(key) {
    let barcodeList = this.state.barcodeList;
    delete barcodeList[key];

    this.setState({
      barcodeList: barcodeList
    });
  }

  render() {

    //Generates new Barcode Form everytime the addBarcodeForm button is pressed
    let barcodeListArray = Object.keys(this.state.barcodeFormList);
    let barcodes = [];
    let i = 1;
    for (let key of barcodeListArray) {
      barcodes.push(
        <SpecimenBarcodeForm
          key={key}
          barcodeKey={key}
          id={i} 
          barcodeData={this.state.barcodeFormList[key] ? 
            this.state.barcodeFormList[key] : null}
          removeBarcode={barcodeListArray.length !== 1 ?
            () => this.removeBarcode(key) : null}
          addBarcode={i == barcodeListArray.length ? this.addBarcode : null}
          copyBarcode={i == barcodeListArray.length && this.state.barcodeList[key] ? 
            this.copyBarcode.bind(this, key) : null}
          setParentFormData={this.setBarcodeList}
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

      //TODO: It may be wise to make unit static and forced, or atleast prepopulated --
      remainingQuantityFields = (
        <div>
          <TextboxElement
            name="quantity"
            label="Remaining Quantity"
            onUserInput={this.setFormData}
            required={true}
            value={this.state.formData.quantity}
          />
          <SelectElement
            name="unitId"
            label="Unit"
            options={this.props.specimenUnits}
            onUserInput={this.setFormData}
            emptyOption={false}
            required={true}
            value={this.state.formData.unitId}
          />
        </div>
      );
    } else {
      globalFields = (
          <div>
            <SearchableDropdown
              name="pscid"
              label="PSCID"
              options={this.props.pSCIDs}
              onUserInput={this.setFormData}
              ref="pscid"
              required={true}
              value={this.state.formData.pscid}
              placeHolder='Search for a PSCID'
            />
            <SelectElement
              name="visitLabel"
              label="Visit Label"
              options={this.state.visits}
              onUserInput={this.setFormData}
              ref="visitLabel"
              required={true}
              value={this.state.formData.visitLabel}
              disabled={this.state.formData.pscid ? false : true}
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
