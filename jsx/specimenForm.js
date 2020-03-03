import SpecimenProcessForm from './processForm';
import ContainerParentForm from './containerParentForm';
import {ListForm, ListItem} from './listForm';
import Modal from 'Modal';
import {mapFormOptions, clone, isEmpty, padBarcode} from './helpers.js';

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
      current: {container: {}},
      list: {},
      printBarcodes: false,
      errors: {specimen: {}, container: {}, list: {}},
    };

    this.setList = this.setList.bind(this);
    this.setCurrent = this.setCurrent.bind(this);
    this.setContainer = this.setContainer.bind(this);
    this.setProject = this.setProject.bind(this);
    this.setSession = this.setSession.bind(this);
    this.generateBarcodes = this.generateBarcodes.bind(this);
    this.createSpecimens = this.createSpecimens.bind(this);
  }

  componentWillMount() {
    // If a parent specimen is provided, set the current global values.
    if (this.props.parent) {
      const current = clone(this.state.current);
      const specimen = this.props.parent[0].specimen;
      const container = this.props.parent[0].container;
      current.parentSpecimenIds = Object.values(this.props.parent)
        .map((item) => item.specimen.id);
      current.candidateId = specimen.candidateId;
      current.sessionId = specimen.sessionId;
      current.typeId = specimen.typeId;
      current.originId = container.originId;
      current.centerId = container.centerId;
      if (this.props.parent > 1) {
        current.quantity = 0;
      }

      this.setState({current});
    }
  }

  setCurrent(name, value) {
    const {current} = clone(this.state);
    current[name] = value;
    return new Promise((res) => this.setState({current}, res()));
  }

  setContainer(name, value) {
    const {current} = clone(this.state);
    current.container[name] = value;
    return new Promise((res) => this.setState({current}, res()));
  };

  setList(list) {
    this.setState({list});
  }

  setProject(name, value) {
    const {current} = clone(this.state);
    current[name] = [value];
    return new Promise((res) => this.setState({current}, res()));
  }

  /**
   * When a session is selected, set the sessionId, centerId and originId.
   *
   * @param {object} session
   * @param {in} sessionId
   */
  setSession(session, sessionId) {
    const {current} = clone(this.state);
    current.centerId = this.props.options.sessionCenters[sessionId].centerId;
    current.originId = current.centerId;
    current.sessionId = sessionId;
    this.setState({current});
  }

  incrementBarcode(pscid, increment = 0) {
    increment++;
    const barcode = padBarcode(pscid, increment);
    if (Object.values(this.props.data.containers)
         .some((container) => container.barcode === barcode)) {
      increment = this.incrementBarcode(pscid, increment);
    }
    if (Object.values(this.state.list)
         .some((specimen) => specimen.container.barcode === barcode)) {
      increment = this.incrementBarcode(pscid, increment);
    }
    return increment;
  };

  generateBarcodes() {
    const {options} = this.props;
    let {list, current} = this.state;
    const pscid = options.candidates[current.candidateId].pscid;
    [list] = Object.keys(list)
      .reduce(([result, increment], key, i) => {
        const specimen = this.state.list[key];
        if (!specimen.container.barcode) {
          const barcode = padBarcode(pscid, increment);
          specimen.container.barcode = barcode;
          increment = this.incrementBarcode(pscid, increment);
        }
        result[key] = specimen;
        return [result, increment];
    }, [{}, this.incrementBarcode(pscid)]);
    this.setState({list});
  };

  render() {
    const {errors, current, list} = this.state;
    const {options, data, parent} = this.props;

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
      const candidates = mapFormOptions(this.props.options.candidates, 'pscid');
        return (
          <div>
            <SearchableDropdown
              name="candidateId"
              label="PSCID"
              options={candidates}
              onUserInput={this.setCurrent}
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
              autoSelect={true}
            />
          </div>
        );
      }
    };

    const renderRemainingQuantityFields = () => {
      if (parent) {
        if (loris.userHasPermission('biobank_specimen_update') && parent.length === 1) {
          const specimenUnits = mapFormOptions(this.props.options.specimen.units, 'label');
          return (
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
                required={true}
                value={this.props.current.specimen.unitId}
                autoSelect={true}
              />
            </div>
          );
        }
      }
    };

    const container = clone(current.container);
    if (container.parentContainerId) {
      container.coordinate = [];
      Object.keys(list).reduce((coord, key) => {
        coord = this.props.increaseCoordinate(coord, container.parentContainerId);
        const coordinates = [...container.coordinate, parseInt(coord)];
        container.coordinate = coordinates;
        return coord;
      }, 0);
    }

    return (
      <Modal
        title={this.props.title}
        show={this.props.show}
        onClose={this.props.onClose}
        onSubmit={this.createSpecimens}
        throwWarning={true}
      >
        <FormElement>
          <div className='row'>
            <div className="col-xs-11">
              {renderNote()}
              {renderGlobalFields()}
              <SelectElement
                name='projectIds'
                label='Project'
                options={this.props.options.projects}
                onUserInput={this.setProject}
                required={true}
                value={current.projectIds}
                disabled={current.candidateId ? false : true}
                errorMessage={errors.container.projectIds}
              />
              {renderRemainingQuantityFields()}
            </div>
          </div>
          <ListForm
            list={list}
            errors={errors.list}
            setList={this.setList}
            listItem={{container: {}, collection: {}}}
          >
            <SpecimenBarcodeForm
              typeId={current.typeId}
              options={options}
              errors={errors.list}
            />
          </ListForm>
          <br/>
          <div className='form-top'/>
          <ContainerParentForm
            display={true}
            data={data}
            setContainer={this.setContainer}
            container={container}
            options={options}
          />
          <div className='form-top'/>
          <ButtonElement
            name='generate'
            label='Generate Barcodes'
            type='button'
            onUserInput={this.generateBarcodes}
            disabled={current.candidateId ? false : true}
          />
          <CheckboxElement
            name='printBarcodes'
            label='Print Barcodes'
            onUserInput={(name, value) => this.setState({[name]: value})}
            value={this.state.printBarcodes}
          />
        </FormElement>
      </Modal>
    );
  }

  createSpecimens() {
    return new Promise((resolve, reject) => {
      const labelParams = [];
      const {list, errors, current} = clone(this.state);
      errors.list = {};
      const projectIds = current.projectIds;
      const centerId = current.centerId;
      const availableId = Object.keys(this.props.options.container.stati).find(
        (key) => this.props.options.container.stati[key].label === 'Available'
      );

      Object.keys(list).reduce((coord, key) => {
        // set specimen values
        const specimen = list[key];
        specimen.candidateId = current.candidateId;
        specimen.sessionId = current.sessionId;
        specimen.quantity = specimen.collection.quantity;
        specimen.unitId = specimen.collection.unitId;
        specimen.collection.centerId = centerId;
        if ((this.props.options.specimen.types[specimen.typeId]||{}).freezeThaw == 1) {
          specimen.fTCycle = 0;
        }
        specimen.parentSpecimenIds = current.parentSpecimenIds || null;

        // set container values
        const container = specimen.container;
        container.statusId = availableId;
        container.temperature = 20;
        container.projectIds = projectIds;
        container.centerId = centerId;
        container.originId = centerId;

        // If the container is assigned to a parent, place it sequentially in the
        // parent container and inherit the status, temperature and centerId.
        if (current.container.parentContainerId) {
          container.parentContainerId = current.container.parentContainerId;
          const parentContainer = this.props.data.containers[current.container.parentContainerId];
          const dimensions = this.props.options.container.dimensions[parentContainer.dimensionId];
          const capacity = dimensions.x * dimensions.y * dimensions.z;
          coord = this.props.increaseCoordinate(coord, current.container.parentContainerId);
          if (coord <= capacity) {
            container.coordinate = parseInt(coord);
          } else {
            container.coordinate = null;
          }
          container.statusId = parentContainer.statusId;
          container.temperature = parentContainer.temperature;
          container.centerId = parentContainer.centerId;
        }

        // if specimen type id is not set yet, this will throw an error
        if (specimen.typeId) {
          labelParams.push({
            barcode: container.barcode,
            type: this.props.options.specimen.types[specimen.typeId].label,
          });
        }

        specimen.container = container;
        list[key] = specimen;

        // this is so the global params (sessionId, candidateId, etc.) show errors
        // as well.
        errors.container = this.props.validateContainer(container, key);
        errors.specimen = this.props.validateSpecimen(specimen, key);

        if (!isEmpty(errors.container)) {
          errors.list[key] = {container: errors.container};
        }
        if (!isEmpty(errors.specimen)) {
          errors.list[key] = {...errors.list[key], specimen: errors.specimen};
        }

        return coord;
      }, 0);

      const setErrors = (errors) => {
        return new Promise((resolve, reject) => {
          if (!isEmpty(errors.list) ||
              !isEmpty(errors.container) ||
              !isEmpty(errors.specimen)) {
            this.setState({errors}, reject());
          } else {
            resolve();
          }
        });
      };

      const printBarcodes = () => {
        return new Promise((resolve) => {
          if (this.state.printBarcodes) {
            swal({
              title: 'Print Barcodes?',
              type: 'question',
              confirmButtonText: 'Yes',
              cancelButtonText: 'No',
              showCancelButton: true,
            })
            .then((result) => result.value && this.printLabel(labelParams))
            .then(() => resolve())
            .catch((e) => console.error(e));
          } else {
            resolve();
          }
        });
      };

      const onSuccess = () => swal('Save Successful', '', 'success');
      setErrors(errors)
      .then(() => printBarcodes())
      .then(() => this.props.post(list, `${loris.BaseURL}/biobank/specimenendpoint/`, 'POST', onSuccess))
      .then((entities) => {
        this.props.setData('containers', entities.containers)
        .then(() => this.props.setData('specimens', entities.specimens));
      })
      .then(() => this.props.onClose())
      .then(() => resolve())
      .catch((e) => console.error(e));
    });
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
  }

  setContainer(name, value) {
    let container = this.props.item.container;
    container[name] = value;
    this.props.setListItem('container', container, this.props.itemKey);
  }

  setSpecimen(name, value) {
    this.props.setListItem(name, value, this.props.itemKey);
  }

  render() {
    const {options, errors, item} = this.props;

    // XXX: Only allow the selection of child types
    const renderSpecimenTypes = () => {
      let specimenTypes;
      if (this.props.typeId) {
        specimenTypes = Object.entries(options.specimen.types).reduce(
          (result, [id, type]) => {
            if (id == this.props.typeId) {
              result[id] = type;
            }

            if (type.parentTypeIds) {
              type.parentTypeIds.forEach((i) => {
                if (i == this.props.typeId) {
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

    const validContainers = {};
    if (item.typeId && options.specimen.typeContainerTypes[item.typeId]) {
      Object.keys(containerTypesPrimary).forEach((id) => {
        options.specimen.typeContainerTypes[item.typeId].forEach((i) => {
          if (id == i) {
            validContainers[id] = containerTypesPrimary[id];
          }
        });
      });
    }
    return (
      <ListItem {...this.props}>
        <TextboxElement
          name='barcode'
          label='Barcode'
          onUserInput={this.setContainer}
          required={true}
          value={item.container.barcode}
          errorMessage={(errors.container||{}).barcode}
        />
        <SelectElement
          name="typeId"
          label="Specimen Type"
          options={renderSpecimenTypes()}
          onUserInput={this.setSpecimen}
          required={true}
          value={item.typeId}
          errorMessage={(errors.specimen||{}).typeId}
        />
        <SelectElement
          name="typeId"
          label="Container Type"
          options={item.typeId ? validContainers : containerTypesPrimary}
          onUserInput={this.setContainer}
          required={true}
          value={item.container.typeId}
          errorMessage={(errors.container||{}).typeId}
          autoSelect={true}
        />
        <TextboxElement
          name='lotNumber'
          label='Lot Number'
          onUserInput={this.setContainer}
          value={item.container.lotNumber}
          errorMessage={(errors.container||{}).lotNumber}
        />
        <DateElement
          name='expirationDate'
          label='Expiration Date'
          onUserInput={this.setContainer}
          value={item.container.expirationDate}
          errorMessage={(errors.container||{}).expirationDate}
        />
        <SpecimenProcessForm
          edit={true}
          errors={(errors.specimen||{}).collection}
          options={options}
          process={item.collection}
          processStage='collection'
          setParent={this.setSpecimen}
          typeId={item.typeId}
        />
      </ListItem>
    );
  }
}

SpecimenBarcodeForm.propTypes = {
};

SpecimenBarcodeForm.defaultProps = {
  specimen: {},
};

export default BiobankSpecimenForm;
