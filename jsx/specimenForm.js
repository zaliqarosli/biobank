import SpecimenCollectionForm from './collectionForm';
import ContainerParentForm from './containerParentForm';

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

  componentWillMount() {
    // TODO: This is a band-aid solution, fix it!
    if (this.props.parent) {
      let parentSpecimenIds = [];
      Object.values(this.props.parent).map(
        (item) => parentSpecimenIds = [...parentSpecimenIds, item.specimen.id]
      );

      this.props.setCurrent('candidateId', this.props.parent[0].specimen.candidateId);
      this.props.setCurrent('sessionId', this.props.parent[0].specimen.sessionId);
      this.props.setCurrent('typeId', this.props.parent[0].specimen.typeId);
      this.props.setCurrent('originId', this.props.parent[0].container.originId);
      this.props.setCurrent('centerId', this.props.parent[0].container.centerId);
      this.props.setCurrent('parentSpecimenIds', parentSpecimenIds);

      if (this.props.parent > 1) {
        this.props.setCurrent('quantity', 0);
      }
    }
  }

  setSession(session, sessionId) {
    let centerId = this.props.options.sessionCenters[sessionId].centerId;
    this.props.setCurrent(session, sessionId);
    this.props.setCurrent('centerId', centerId);
    this.props.setCurrent('originId', centerId);
  }

  render() {
    // Generates new Barcode Form everytime the addBarcodeForm button is pressed
    let list = Object.entries(this.props.current.list);
    let barcodes = [];
    let i = 1;
    list.forEach(([key, item]) => {
      barcodes.push(
        <SpecimenBarcodeForm
          current={this.props.current}
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
            () => {
this.props.removeListItem(key);
} : null}
          addSpecimen={i == list.length ?
            () => {
this.props.addListItem('specimen');
} : null}
          multiplier={this.props.current.multiplier}
          copySpecimen={i == list.length && item ? this.props.copyListItem : null}
          setContainerList={this.props.setContainerList}
          setSpecimenList={this.props.setSpecimenList}
          options={this.props.options}
        />
      );

      i++;
    });

    let note;
    let globalFields;
    let remainingQuantityFields;
    if (this.props.parent) {
      let parentBarcodes = [];
      Object.values(this.props.parent).map(
        (item) => parentBarcodes = [...parentBarcodes, item.container.barcode]
      );
      parentBarcodes = parentBarcodes.join(', ');

      note = (
        <StaticElement
          label='Note'
          text='To create new aliquots, enter a Barcode, fill out the coresponding
                sub-form and press Submit. Press "New Entry" button to add
                another barcode field, or press for the "Copy" button to
                duplicate the previous entry.'
        />
      );

      globalFields = (
        <div>
          <StaticElement
            label="Parent Specimen"
            text={parentBarcodes}
          />
          <StaticElement
            label="PSCID"
            text={this.props.options.candidates[this.props.current.candidateId].pscid}
          />
          <StaticElement
            label="Visit Label"
            text={this.props.options.sessions[this.props.current.sessionId].label}
          />
        </div>
      );

      if (loris.userHasPermission('biobank_specimen_update') &&
          this.props.parent.length === 1) {
        let specimenUnits = this.props.mapFormOptions(
          this.props.options.specimen.units, 'unit'
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
      }
    } else {
      let sessions = this.props.current.candidateId ?
        this.props.mapFormOptions(
          this.props.options.candidateSessions[this.props.current.candidateId], 'label'
        ) : {};

      let candidates = this.props.mapFormOptions(
        this.props.options.candidates, 'pscid'
      );

      // TODO: not sure why, but I'm now having trouble with the SearchableDropdown
      note = (
        <StaticElement
          label='Note'
          text='To create new specimens, first select a PSCID and Visit Label.
                Then, enter a Barcode, fill out the coresponding sub-form and press
                submit. Press "New Entry" button to add another barcode field,
                or press for the "Copy" button to duplicate the previous entry.'
        />
      );
      globalFields = (
        <div>
          <SearchableDropdown
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
      <FormElement name="specimenForm">
        <div className='row'>
          <div className="col-xs-11">
            {note}
            {globalFields}
            {remainingQuantityFields}
          </div>
        </div>
        {barcodes}
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
            onChange={(e)=>{
this.props.setCurrent('multiplier', e.target.value);
}}
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
        fontSize: 15,
      };

      removeSpecimenButton = (
        <span
          className='glyphicon glyphicon-remove'
          onClick={this.props.removeSpecimen}
          style={glyphStyle}
        />
      );
    }

    let specimenTypes = this.props.mapFormOptions(
      this.props.options.specimen.types, 'type'
    );

    if (this.props.current.typeId) {
      // only allow the selection of child types
      Object.entries(this.props.options.specimen.types).forEach(([id, entry]) => {
        if (entry.parentTypeId != this.props.current.typeId
          && id != this.props.current.typeId) {
          delete specimenTypes[id];
        }
      });
    }

    let containerTypesPrimary = this.props.mapFormOptions(
      this.props.options.container.typesPrimary, 'label'
    );

    return (
      <FormElement name='biobankBarcode'>
        <div className='row'>
          <div className='col-xs-11'>
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
          <div className='col-xs-1' style={{paddingLeft: 0, marginTop: 10}}>
            <span
              className= {this.props.collapsed ? 'glyphicon glyphicon-chevron-down' : 'glyphicon glyphicon-chevron-up'}
              style={{cursor: 'pointer', fontSize: 15, position: 'relative', right: 40}}
              data-toggle='collapse'
              data-target={'#item-' + this.props.barcodeKey}
              onClick={() => {
this.props.toggleCollapse(this.props.barcodeKey);
}}
            />
            {removeSpecimenButton}
          </div>
        </div>
        <div className='row'>
          <div className='col-xs-9 col-xs-offset-2'>
            <div id={'item-' + this.props.barcodeKey} className='collapse'>
              <SelectElement
                name="typeId"
                label="Specimen Type"
                options={specimenTypes}
                onUserInput={this.setSpecimen}
                required={true}
                value={(this.props.specimen||{}).typeId}
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
                specimen={this.props.specimen || {}}
                errors={(this.props.errors.specimen||{}).process}
                setSpecimen={this.setSpecimen}
                specimenTypeUnits={this.props.options.specimen.typeUnits}
                specimenTypeAttributes={this.props.options.specimen.typeAttributes}
                attributeDatatypes={this.props.options.specimen.attributeDatatypes}
                attributeOptions={this.props.options.specimen.attributeOptions}
              />
              {/* TODO: I don't like this here anymore - reassess later
              <ContainerParentForm
                setContainer={this.setContainer}
                mapFormOptions={this.props.mapFormOptions}
                container={this.props.container}
                options={this.props.options}
              />*/}
            </div>
          </div>
        </div>
        <div className='row'>
          <div className='col-xs-11'>
            <div className='col-xs-3'/>
            <div className='col-xs-4 action'>
              {addSpecimenButton}
              {addSpecimenText}
            </div>
            <div className='col-xs-4 action'>
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
  specimen: {},
};

export default BiobankSpecimenForm;
