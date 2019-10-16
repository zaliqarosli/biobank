import SpecimenProcessForm from './processForm';
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
  constructor(props) {
    super(props);
    this.setSession = this.setSession.bind(this);
    this.state = {
      candidates: this.props.mapFormOptions(this.props.options.candidates, 'pscid'),
      specimenUnits: this.props.mapFormOptions(this.props.options.specimen.units, 'label'),
    };
  }

  componentWillMount() {
    // TODO: This is a band-aid solution, fix it!
    if (this.props.parent) {
      const parentSpecimenIds = Object.values(this.props.parent)
        .map((item) => item.specimen.id);
      const {setCurrent} = this.props;

      console.log(this.props.parent);
      setCurrent('candidateId', this.props.parent[0].specimen.candidateId)
      .then(() => setCurrent('sessionId', this.props.parent[0].specimen.sessionId))
      .then(() => setCurrent('typeId', this.props.parent[0].specimen.typeId))
      .then(() => setCurrent('originId', this.props.parent[0].container.originId))
      .then(() => setCurrent('centerId', this.props.parent[0].container.centerId))
      .then(() => setCurrent('parentSpecimenIds', parentSpecimenIds));

      if (this.props.parent > 1) {
        setCurrent('quantity', 0);
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
    const {current, errors, options, data, parent} = this.props;
    const {mapFormOptions, addListItem, toggleCollapse, setCurrent} = this.props;

    // Generates new Barcode Form everytime the addBarcodeForm button is pressed
    const barcodes = Object.entries(current.list).map(([key, specimen], i, list) => {
      const handleRemoveSpecimen = () => list.length > 1 ? () => this.props.removeListItem(key) : null;
      return (
        <SpecimenBarcodeForm
          current={current}
          key={key}
          barcodeKey={key}
          id={i+1}
          collapsed={current.collapsed[key]}
          toggleCollapse={toggleCollapse}
          mapFormOptions={mapFormOptions}
          setCurrent={setCurrent}
          specimen={specimen || null}
          errors={errors.list[key] || {}}
          removeSpecimen={handleRemoveSpecimen()}
          addSpecimen={i+1 == list.length ?
            () => {
              addListItem('specimen');
            } : null
          }
          multiplier={current.multiplier}
          copySpecimen={i+1 == list.length && specimen ? this.props.copyListItem : null}
          setListItem={this.props.setListItem}
          options={options}
        />
      );
    });

    const renderNote = () => {
      if (parent) {
        return (
          <StaticElement
            label='Note'
            text='To create new aliquots, enter a Barcode, fill out the coresponding
                  sub-form and press Submit. Press "New Entry" button to add
                  another barcode field, or press for the "Copy" button to
                  duplicate the previous entry.'
          />
        );
      } else {
        return (
          <StaticElement
            label='Note'
            text='To create new specimens, first select a PSCID and Visit Label.
                  Then, enter a Barcode, fill out the coresponding sub-form and press
                  submit. Press "New Entry" button to add another barcode field,
                  or press for the "Copy" button to duplicate the previous entry.'
          />
        );
      }
    };

    const renderGlobalFields = () => {
      if (parent && current.candidateId && current.sessionId) {
        const parentBarcodes = Object.values(parent).map((item) => item.container.barcode);
        const parentBarcodesString = parentBarcodes.join(', ');
        return (
          <div>
            <StaticElement
              label="Parent Specimen(s)"
              text={parentBarcodesString}
            />
            <StaticElement
              label="PSCID"
              text={options.candidates[current.candidateId].pscid}
            />
            <StaticElement
              label="Visit Label"
              text={options.sessions[current.sessionId].label}
            />
          </div>
        );
      } else {
      const sessions = current.candidateId ?
        mapFormOptions(options.candidateSessions[current.candidateId], 'label')
        : {};
        return (
          <div>
            <SearchableDropdown
              name="candidateId"
              label="PSCID"
              options={this.state.candidates}
              onUserInput={setCurrent}
              required={true}
              value={current.candidateId}
              placeHolder='Search for a PSCID'
              errorMessage={errors.specimen.candidateId}
            />
            <SelectElement
              name='sessionId'
              label='Visit Label'
              options={sessions}
              onUserInput={this.setSession}
              required={true}
              value={current.sessionId}
              disabled={current.candidateId ? false : true}
              errorMessage={errors.specimen.sessionId}
            />
          </div>
        );
      }
    };

    const renderRemainingQuantityFields = () => {
      if (parent) {
        if (loris.userHasPermission('biobank_specimen_update') && parent.length === 1) {
          return (
            <div>
              <TextboxElement
                name="quantity"
                label="Remaining Quantity"
                onUserInput={this.props.setSpecimen}
                required={true}
                value={current.specimen.quantity}
              />
              <SelectElement
                name="unitId"
                label="Unit"
                options={this.state.specimenUnits}
                onUserInput={this.props.setSpecimen}
                emptyOption={false}
                required={true}
                value={current.specimen.unitId}
              />
            </div>
          );
        }
      }
    };

    const padBarcode = (pscid, increment) => {
      let padding = '';
      if (increment/10 < 1) {
        padding ='00';
      } else if (1 <= increment/10 < 10) {
        padding = '0';
      }
      return pscid+padding+increment;
    };

    const incrementBarcode = (pscid, increment = 0) => {
      increment++;
      const barcode = padBarcode(pscid, increment);
      if (Object.values(data.containers)
           .some((container) => container.barcode === barcode)) {
        increment = incrementBarcode(pscid, increment);
      }
      if (Object.values(current.list)
           .some((specimen) => specimen.container.barcode === barcode)) {
        increment = incrementBarcode(pscid, increment);
      }
      return increment;
    };

    const generateBarcodes = () => {
      const pscid = options.candidates[current.candidateId].pscid;
      const [list] = Object.keys(current.list)
        .reduce(([result, increment], key, i) => {
          const specimen = current.list[key];
          if (!specimen.container.barcode) {
            const barcode = padBarcode(pscid, increment);
            specimen.container.barcode = barcode;
            increment = incrementBarcode(pscid, increment);
          }
          result[key] = specimen;
          return [result, increment];
      }, [{}, incrementBarcode(pscid)]);
      setCurrent('list', list);
    };

    const setContainer = (name, value) => {
      const container = current.container;
      container[name] = value;
      setCurrent('container', container);
    };

    const container = JSON.parse(JSON.stringify(current.container));
    if (container.parentContainerId) {
      container.coordinate = [];
      Object.keys(current.list).reduce((coord, key) => {
        coord = this.props.increaseCoordinate(coord, container.parentContainerId);
        const coordinates = [...container.coordinate, parseInt(coord)];
        container.coordinate = coordinates;
        return coord;
      }, 0);
    }

    return (
      <div>
        <div className='row'>
          <div className="col-xs-11">
            {renderNote()}
            <ButtonElement
              name='generate'
              label='Generate Barcodes'
              type='button'
              onUserInput={generateBarcodes}
              disabled={current.candidateId ? false : true}
            />
            <CheckboxElement
              name='printBarcodes'
              label='Print Barcodes'
              onUserInput={setCurrent}
              value={current.printBarcodes}
            />
            {renderGlobalFields()}
            <SelectElement
              name='projectIds'
              label='Project'
              options={this.props.options.projects}
              onUserInput={(name, value) => setCurrent(name, [value])}
              required={true}
              value={current.projectIds}
              disabled={current.candidateId ? false : true}
              errorMessage={errors.container.projectIds}
            />
            {renderRemainingQuantityFields()}
          </div>
        </div>
        {barcodes}
        <br/>
        <div className='form-top'/>
        <ContainerParentForm
          display={true}
          data={data}
          setContainer={setContainer}
          mapFormOptions={mapFormOptions}
          container={container}
          options={options}
        />
      </div>
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
    let container = this.props.specimen.container;
    container[name] = value;
    this.props.setListItem('container', container, this.props.barcodeKey);
  }

  setSpecimen(name, value) {
    this.props.setListItem(name, value, this.props.barcodeKey);
  }

  copy() {
    this.props.copySpecimen(this.props.barcodeKey);
  }

  render() {
    const {mapFormOptions, setCurrent} = this.props;
    const {addSpecimen, copySpecimen, removeSpecimen} = this.props;
    const {options, current, errors, specimen} = this.props;

    const renderAddSpecimenButton = () => {
      if (addSpecimen) {
        return (
          <div>
            <span className='action'>
              <div className='action-button add' onClick={addSpecimen}>+</div>
            </span>
            <span className='action-title'>
              New Entry
            </span>
          </div>
        );
      }
    };

    const renderCopySpecimenButton = () => {
      if (copySpecimen) {
        return (
          <div>
            <span className='action'>
              <div className='action-button add' onClick={this.copy}>
                <span className='glyphicon glyphicon-duplicate'/>
              </div>
            </span>
            <span className='action-title'>
              <input
                className='form-control input-sm'
                type='number'
                min='1'
                max='50'
                style={{width: 50, display: 'inline'}}
                onChange={(e) => {
                  setCurrent('multiplier', e.target.value);
                }}
                value={this.props.multiplier}
              />
              Copies
            </span>
          </div>
        );
      }
    };

    const renderRemoveSpecimenButton = () => {
      if (removeSpecimen) {
        const glyphStyle = {
          color: '#808080',
          marginLeft: 10,
          cursor: 'pointer',
          fontSize: 15,
        };
        return (
          <span
            className='glyphicon glyphicon-remove'
            onClick={removeSpecimen}
            style={glyphStyle}
          />
        );
      }
    };

    // FIXME: This was made in a rush and can likely be done better.
    // XXX: Only allow the selection of child types
    const renderSpecimenTypes = () => {
      let specimenTypes;
      if (current.typeId) {
        specimenTypes = Object.entries(options.specimen.types).reduce(
          (result, [id, type]) => {
            if (id == current.typeId) {
              result[id] = type;
            }

            if (type.parentTypeIds) {
              type.parentTypeIds.forEach((i) => {
                if (i == current.typeId) {
                  result[id] = type;
                }
              });
            }

            return result;
          }, {}
        );
      } else {
        specimenTypes = options.specimen.types;
      }

      return mapFormOptions(specimenTypes, 'label');
    };
    const containerTypesPrimary = mapFormOptions(options.container.typesPrimary, 'label');

    // FIXME: This logic was made in a rush and is a bit of a mess.
    const validContainers = {};
    if (specimen.typeId && options.specimen.typeContainerTypes[specimen.typeId]) {
      Object.keys(containerTypesPrimary).forEach((id) => {
        options.specimen.typeContainerTypes[specimen.typeId].forEach((i) => {
          if (id == i) {
            validContainers[id] = containerTypesPrimary[id];
          }
        });
      });
    }
    const handleCollapse = () => this.props.toggleCollapse(this.props.barcodeKey);
    return (
      <div>
        <div className='row'>
          <div className='col-xs-11'>
            <div>
              <TextboxElement
                name='barcode'
                label={'Barcode ' + this.props.id}
                onUserInput={this.setContainer}
                required={true}
                value={specimen.container.barcode}
                errorMessage={(errors.container||{}).barcode}
              />
            </div>
          </div>
          <div className='col-xs-1' style={{paddingLeft: 0, marginTop: 10}}>
            <span
              className= {this.props.collapsed ? 'glyphicon glyphicon-chevron-down' : 'glyphicon glyphicon-chevron-up'}
              style={{cursor: 'pointer', fontSize: 15, position: 'relative', right: 40}}
              onClick={handleCollapse}
            />
            {renderRemoveSpecimenButton()}
          </div>
        </div>
        <div className='row'>
          <div className='col-xs-9 col-xs-offset-2'>
            <div
              id={'item-' + this.props.barcodeKey}
              className={this.props.collapsed ? 'closed' : 'open'}
            >
              <SelectElement
                name="typeId"
                label="Specimen Type"
                options={renderSpecimenTypes()}
                onUserInput={this.setSpecimen}
                required={true}
                value={(specimen||{}).typeId}
                errorMessage={(errors.specimen||{}).typeId}
              />
              <SelectElement
                name="typeId"
                label="Container Type"
                options={specimen.typeId ? validContainers : containerTypesPrimary}
                onUserInput={this.setContainer}
                required={true}
                value={specimen.container.typeId}
                errorMessage={(errors.container||{}).typeId}
              />
              <TextboxElement
                name='lotNumber'
                label='Lot Number'
                onUserInput={this.setContainer}
                value={specimen.container.lotNumber}
                errorMessage={(errors.container||{}).lotNumber}
              />
              <DateElement
                name='expirationDate'
                label='Expiration Date'
                onUserInput={this.setContainer}
                value={specimen.container.expirationDate}
                errorMessage={(errors.container||{}).expirationDate}
              />
              <SpecimenProcessForm
                edit={true}
                errors={(errors.specimen||{}).collection}
                mapFormOptions={mapFormOptions}
                options={options}
                process={specimen.collection}
                processStage='collection'
                setParent={this.props.setCurrent}
                setSpecimen={this.setSpecimen}
                typeId={specimen.typeId}
              />
            </div>
          </div>
        </div>
        <div className='row'>
          <div className='col-xs-12'>
            <div className='col-xs-3'/>
            <div className='col-xs-4 action'>
              {renderAddSpecimenButton()}
            </div>
            <div className='col-xs-5 action'>
              {renderCopySpecimenButton()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

SpecimenBarcodeForm.propTypes = {
};

SpecimenBarcodeForm.defaultProps = {
  specimen: {},
};

export default BiobankSpecimenForm;
