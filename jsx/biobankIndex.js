import {BrowserRouter, Route, Switch} from 'react-router-dom';
import {Link} from 'react-router-dom';
import swal from 'sweetalert2';

import Loader from 'Loader';

import BiobankFilter from './filter';
import BiobankSpecimen from './specimen';
import BiobankContainer from './container';
import {clone, isEmpty} from './helpers.js';

const defaultState = () => ({
  current: {
    files: {},
    list: {},
    collapsed: {},
    coordinate: null,
    sequential: false,
    candidateId: null,
    centerId: null,
    originId: null,
    sessionId: null,
    typeId: null,
    count: null,
    multiplier: 1,
    specimen: {},
    container: {},
    pool: {},
    poolId: null,
    preparation: {},
    printBarcodes: false,
  },
  errors: {
    container: {},
    specimen: {},
    pool: {},
    list: {},
    preparation: {},
  },
  editable: {
    specimenForm: false,
    containerForm: false,
    aliquotForm: false,
    containerParentForm: false,
    loadContainer: false,
    containerCheckout: false,
    temperature: false,
    quantity: false,
    status: false,
    center: false,
    collection: false,
    preparation: false,
    analysis: false,
    batchPreparationForm: false,
    poolSpecimenForm: false,
    searchSpecimen: false,
    searchContainer: false,
  },
});

class BiobankIndex extends React.Component {
  constructor() {
    super();

    this.state = {
      isLoaded: false,
      options: {
        specimen: {},
        container: {},
      },
      data: {
        specimens: {},
        containers: {},
        pools: {},
      },
      ...defaultState(),
    };

    this.fetch = this.fetch.bind(this);
    this.loadAllData = this.loadAllData.bind(this);
    this.loadData = this.loadData.bind(this);
    this.printLabel = this.printLabel.bind(this);
    this.loadOptions = this.loadOptions.bind(this);
    this.routeBarcode = this.routeBarcode.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.edit = this.edit.bind(this);
    this.editSpecimen = this.editSpecimen.bind(this);
    this.editContainer = this.editContainer.bind(this);
    this.clearAll = this.clearAll.bind(this);
    this.setData = this.setData.bind(this);
    this.setCurrent = this.setCurrent.bind(this);
    this.setErrors = this.setErrors.bind(this);
    this.setListItem = this.setListItem.bind(this);
    this.setCheckoutList = this.setCheckoutList.bind(this);
    this.addListItem = this.addListItem.bind(this);
    this.copyListItem = this.copyListItem.bind(this);
    this.removeListItem = this.removeListItem.bind(this);
    this.getCoordinateLabel = this.getCoordinateLabel.bind(this);
    this.getParentContainerBarcodes = this.getParentContainerBarcodes.bind(this);
    this.getBarcodePathDisplay = this.getBarcodePathDisplay.bind(this);
    this.increaseCoordinate = this.increaseCoordinate.bind(this);
    this.setSpecimen = this.setSpecimen.bind(this);
    this.setContainer = this.setContainer.bind(this);
    this.updateSpecimen = this.updateSpecimen.bind(this);
    this.updateContainer = this.updateContainer.bind(this);
    this.createPool = this.createPool.bind(this);
    this.saveBatchPreparation = this.saveBatchPreparation.bind(this);
    this.createContainers = this.createContainers.bind(this);
    this.validateSpecimen = this.validateSpecimen.bind(this);
    this.validateProcess = this.validateProcess.bind(this);
    this.validateContainer = this.validateContainer.bind(this);
    this.post = this.post.bind(this);
  }

  componentDidMount() {
    this.loadAllData();
  }

  loadAllData() {
    this.loadOptions()
    .then(() => this.loadData(this.props.containerAPI, 'containers'))
    .then(() => this.loadData(this.props.poolAPI, 'pools'))
    .then(() => this.loadData(this.props.specimenAPI, 'specimens'))
    .then(() => this.setState({isLoaded: true}));
  }

  loadData(url, state) {
    return new Promise((resolve) => {
      this.fetch(url, 'GET')
      .then((dataList) => {
        const data = this.state.data;
        data[state] = dataList.length !== 0 ? dataList : {};
        this.setState({data}, resolve());
      });
    });
  }

  printLabel(labelParams) {
    return new Promise((resolve) => {
      this.post(labelParams, this.props.labelAPI, 'POST')
        .then(() => resolve());
    });
  }

  loadOptions() {
    return new Promise((resolve) => {
      this.fetch(this.props.optionsAPI, 'GET')
      .then((options) => this.setState({options}, resolve()));
    });
  }

  fetch(url, method) {
    return fetch(url, {credentials: 'same-origin', method: method})
      .then((resp) => resp.json())
      .catch((error, errorCode, errorMsg) => console.error(error, errorCode, errorMsg));
  }

  routeBarcode(barcode) {
    const container = Object.values(this.state.data.containers)
      .find((container) => container.barcode == barcode);

    const specimen = Object.values(this.state.data.specimens)
      .find((specimen) => specimen.containerId == container.id);

    return {container, specimen};
  }

  edit(stateKey) {
    return new Promise((resolve) => {
      this.clearEditable()
      .then(() => {
        const editable = clone(this.state.editable);
        editable[stateKey] = true;
        this.setState({editable}, resolve());
      });
    });
  }

  clearEditable() {
    const state = clone(this.state);
    state.editable = defaultState().editable;
    return new Promise((res) => this.setState(state, res()));
  }

  clearAll() {
    const state = Object.assign(clone(this.state), defaultState());
    return new Promise((res) => this.setState(state, res()));
  }

  toggleCollapse(key) {
    const collapsed = this.state.current.collapsed;
    collapsed[key] = !collapsed[key];
    this.setCurrent('collapsed', collapsed);
  }

  setListItem(name, value, key) {
    const list = this.state.current.list;
    list[key][name] = value;
    this.setCurrent('list', list);
  }

  setCheckoutList(container) {
    // Clear current container field.
    this.setCurrent('containerId', 1)
      .then(()=>this.setCurrent('containerId', null));
    const list = this.state.current.list;
    list[container.coordinate] = container;
    this.setCurrent('list', list);
  }

  editSpecimen(specimen) {
    return new Promise((resolve) => {
      specimen = clone(specimen);
      this.setCurrent('specimen', specimen)
        .then(() => resolve());
    });
  }

  editContainer(container) {
    return new Promise((resolve) => {
      container = clone(container);
      this.setCurrent('container', container)
        .then(() => resolve());
    });
  }

  setCurrent(name, value) {
    return new Promise((resolve) => {
      // XXX: when current is cloned, this begins to cause weird problems, because
      // I didn't make proper promise chains for most things, so the current
      // object gets overwriten. Look into this soon.
      const current = this.state.current;
      current[name] = value;
      this.setState({current}, resolve());
    });
  }

  updateState(name, value) {
    this.setState({[name]: value});
  }

  setErrors(name, value) {
    const errors = this.state.errors;
    errors[name] = value;
    this.setState({errors});
  }

  addListItem(item) {
    const current = this.state.current;
    current.count++;
    current.collapsed[current.count] = false;
    switch (item) {
      case 'specimen':
        current.list[current.count] = {collection: {}, container: {}};
        break;
      case 'container':
        current.list[current.count] = {};
        break;
    }

    this.setState({current});
  }

  copyListItem(key) {
    const current = clone(this.state.current);
    for (let i=1; i<=current.multiplier; i++) {
      current.count++;
      current.list[current.count] = clone(current.list[key]);
      (current.list[current.count].container||{}).barcode &&
        delete current.list[current.count].container.barcode;
      current.list[current.count].barcode &&
        delete current.list[current.count].barcode;
      current.collapsed[current.count] = true;
    }

    this.setState({current});
  }

  removeListItem(key) {
    const current = this.state.current;
    delete current.list[key];
    if (Object.keys(current.list).length === 0) {
      // TODO: this might need to be replaced by a clearCurrent() function later.
      this.setState({current: defaultState().current});
    } else {
      this.setState({current});
    }
  }

  getCoordinateLabel(container) {
    const parentContainer = this.state.data.containers[container.parentContainerId];
    const dimensions = this.state.options.container.dimensions[parentContainer.dimensionId];
    let coordinate;
    let j = 1;
    outerloop:
    for (let y=1; y<=dimensions.y; y++) {
      innerloop:
      for (let x=1; x<=dimensions.x; x++) {
        if (j == container.coordinate) {
          if (dimensions.xNum == 1 && dimensions.yNum == 1) {
            coordinate = x + (dimensions.x * (y-1));
          } else {
            const xVal = dimensions.xNum == 1 ? x : String.fromCharCode(64+x);
            const yVal = dimensions.yNum == 1 ? y : String.fromCharCode(64+y);
            coordinate = yVal+''+xVal;
          }
          break outerloop;
        }
        j++;
      }
    }
    return coordinate;
  }

  getParentContainerBarcodes(container, barcodes=[]) {
    barcodes.push(container.barcode);

    const parent = Object.values(this.state.data.containers)
      .find((c) => container.parentContainerId == c.id);

    parent && this.getParentContainerBarcodes(parent, barcodes);

    return barcodes.slice(0).reverse();
  }

  getBarcodePathDisplay(parentBarcodes) {
    return Object.keys(parentBarcodes).map((i) => {
      const container = Object.values(this.state.data.containers)
        .find((container) => container.barcode == parentBarcodes[parseInt(i)+1]);
      let coordinateDisplay;
      if (container) {
        const coordinate = this.getCoordinateLabel(container);
        coordinateDisplay = <b>{'-'+(coordinate || 'UAS')}</b>;
      }
      return (
        <span className='barcodePath'>
          {i != 0 && ': '}
          <Link key={i} to={`/barcode=${parentBarcodes[i]}`}>{parentBarcodes[i]}</Link>
          {coordinateDisplay}
        </span>
      );
    });
  }

  setSpecimen(name, value) {
    return new Promise((resolve) => {
      const specimen = clone(this.state.current.specimen);
      specimen[name] = value;
      this.setCurrent('specimen', specimen)
      .then(() => resolve());
    });
  }

  setContainer(name, value) {
    return new Promise((resolve) => {
      const container = clone(this.state.current.container);
      value ? container[name] = value : delete container[name];
      this.setCurrent('container', container)
      .then(() => resolve());
    });
  }

  setData(type, entities) {
    return new Promise((resolve) => {
      const data = clone(this.state.data);
      entities.forEach((entity) => data[type][entity.id] = entity);
      this.setState({data}, resolve());
    });
  }

  updateSpecimen(specimen, closeOnSuccess = true) {
    const onSuccess = () => {
      closeOnSuccess && this.clearAll()
        .then(() => swal('Specimen Save Successful', '', 'success'));
    };

    const errors = clone(this.state.errors);
    errors.specimen = this.validateSpecimen(specimen);
    const setErrors = (errors) => {
      return new Promise((resolve, reject) => {
        if (!isEmpty(errors.specimen)) {
          this.setState({errors}, reject(errors.specimen));
        } else {
          resolve();
        }
      });
    };

    setErrors(errors)
    .then(() => this.post(specimen, this.props.specimenAPI, 'PUT', onSuccess))
    .then((specimens) => this.setData('specimens', specimens))
    .catch((e) => console.error(e));
  }

  updateContainer(container, closeOnSuccess = true) {
    const onSuccess = () => {
      closeOnSuccess && this.clearAll()
        .then(() => swal('Container Save Successful', '', 'success'));
    };

    const errors = clone(this.state.errors);
    errors.container = this.validateContainer(container);
    const setErrors = (errors) => {
      return new Promise((resolve, reject) => {
        if (!isEmpty(errors.container)) {
          this.setState({errors}, reject(errors.container));
        } else {
          resolve();
        }
      });
    };

    return new Promise((resolve) => {
      setErrors(errors)
      .then(() => this.post(container, this.props.containerAPI, 'PUT', onSuccess))
      .then((containers) => this.setData('containers', containers))
      .then(() => resolve())
      .catch((e) => console.error(e));
    });
  }

  increaseCoordinate(coordinate, parentContainerId) {
    const childCoordinates = this.state.data.containers[parentContainerId].childContainerIds
    .reduce((result, id) => {
      const container = this.state.data.containers[id];
      if (container.coordinate) {
        result[container.coordinate] = id;
      }
      return result;
    }, {});

    const increment = (coord) => {
      coord++;
      if (childCoordinates.hasOwnProperty(coord)) {
        coord = increment(coord);
      }

      return coord;
    };

    return increment(coordinate);
  }

  createContainers(list, current, errors) {
    return new Promise((resolve, reject) => {
      const availableId = Object.keys(this.state.options.container.stati)
      .find((key) => this.state.options.container.stati[key].label === 'Available');

      Object.entries(list).forEach(([key, container]) => {
        container.statusId = availableId;
        container.temperature = 20;
        container.projectIds = current.projectIds;
        container.originId = current.centerId;
        container.centerId = current.centerId;

        errors.container = this.validateContainer(container, key);
        errors.list[key] = this.validateContainer(container, key);
      });

      Object.keys(errors.list).forEach((key) => {
        if (!isEmpty(errors.list[key].container)) {
          reject(errors);
          return;
        }
      });

      const onSuccess = () => swal('Container Creation Successful', '', 'success');
      this.post(list, this.props.containerAPI, 'POST', onSuccess)
      .then((containers) => this.setData('containers', containers))
      .then(() => resolve());
    });
  }

  createPool(pool, list) {
    const dispensedId = Object.keys(this.state.options.container.stati)
      .find((key) => this.state.options.container.stati[key].label === 'Dispensed');
    const update = Object.values(list)
      .reduce((result, item) => {
        item.container.statusId = dispensedId;
        item.specimen.quantity = '0';
        return [...result,
                () => this.updateContainer(item.container, false),
                () => this.updateSpecimen(item.specimen, false),
              ];
      }, []);

    return new Promise((resolve, reject) => {
      this.validatePool(pool)
      .then(() => this.post(pool, this.props.poolAPI, 'POST'))
      .then((pools) => this.setData('pools', pools))
      .then(() => Promise.all(update.map((update) => update())))
      .then(() => {
        resolve();
        swal('Pooling Successful!', '', 'success');
      })
      .catch((e) => reject());
    });
  }

  saveBatchPreparation(preparation, list) {
    // TODO: There should be some form of validation to ensure that the specimens
    // belong to the same candidate - are of the same type etc.
    return new Promise((resolve) => {
      const saveList = Object.values(list)
        .map((item) => {
          const specimen = clone(item.specimen);
          specimen.preparation = preparation;
          return (() => this.post(specimen, this.props.specimenAPI, 'PUT'));
        });

      const attributes = this.state.options.specimen.protocolAttributes[preparation.protocolId];
      const preparationErrors = this.validateProcess(
        preparation,
        attributes,
        ['protocolId', 'examinerId', 'centerId', 'date', 'time'],
      );

      const setErrors = (e) => {
        return new Promise((resolve, reject) => {
          const errors = clone(this.state.errors);
          if (!isEmpty(e)) {
            errors.preparation = e;
            this.setState({errors}, reject(e));
          }
          resolve();
        });
      };

      setErrors(preparationErrors)
        .then(() => this.validateBatchPreparation(list))
        .then(() => Promise.all(saveList.map((item) => item())))
        .then(() => this.loadAllData())
        .then(() => this.clearAll())
        .then(() => swal('Batch Preparation Successful!', '', 'success'))
        .then(() => resolve())
        .catch((e) => console.error(e));
    });
  }

  validateSpecimen(specimen, key) {
    const errors = {};

    const required = ['typeId', 'quantity', 'unitId', 'candidateId', 'sessionId', 'collection'];
    const float = ['quantity'];

    required.map((field) => {
      if (specimen[field] == null) {
        errors[field] = 'This field is required! ';
      }
    });

    float.map((field) => {
      if (isNaN(specimen[field])) {
        errors[field] = 'This field must be a number! ';
      }
    });

    if (specimen.quantity < 0) {
      errors.quantity = 'This field must be greater than 0';
    }

    errors.collection =
      this.validateProcess(
        specimen.collection,
        this.state.options.specimen.protocolAttributes[specimen.collection.protocolId],
        ['protocolId', 'examinerId', 'quantity', 'unitId', 'centerId', 'date', 'time'],
        ['quantity']
      );

    // collection should only be set if there are errors associated with it.
    if (isEmpty(errors.collection)) {
      delete errors.collection;
    }

    if (specimen.preparation) {
      errors.preparation =
        this.validateProcess(
          specimen.preparation,
          this.state.options.specimen.protocolAttributes[specimen.preparation.protocolId],
          ['protocolId', 'examinerId', 'centerId', 'date', 'time']
        );
    }

    if (isEmpty(errors.preparation)) {
      delete errors.preparation;
    }

    if (specimen.analysis) {
      errors.analysis =
        this.validateProcess(
          specimen.analysis,
          this.state.options.specimen.protocolAttributes[specimen.analysis.protocolId],
          ['protocolId', 'examinerId', 'centerId', 'date', 'time']
        );
    }

    if (isEmpty(errors.analysis)) {
      delete errors.analysis;
    }

    return errors;
  }

  post(data, url, method, onSuccess) {
    return new Promise((resolve, reject) => {
      swal.fire({title: 'Loading', showConfirmButton: false, width: '180px'});
      swal.showLoading();
      return fetch(url, {
        credentials: 'same-origin',
        method: method,
        body: JSON.stringify(clone(data)),
      })
      .then((response) => {
        if (response.ok) {
          swal.close();
          onSuccess instanceof Function && onSuccess();
          // both then and catch resolve in case the returned data is not in
          // json format.
          response.json()
          .then((data) => resolve(data))
          .catch((data) => resolve(data));
        } else {
          swal.close();
          if (response.status == 403) {
            swal('Action is forbidden or session has timed out.', '', 'error');
          }
          response.json()
          .then((data) => swal(data.error, '', 'error'))
          .then(() => reject());
        }
      })
      .catch((error) => console.error(error));
    });
  }

  validateProcess(process, attributes, required, number) {
    let errors = {};
    let regex;

    // validate required fields
    required && required.map((field) => {
      if (process[field] == null) {
        errors[field] = 'This field is required! ';
      }
    });

    // validate floats
    number && number.map((field) => {
      if (isNaN(process[field])) {
        errors[field] = 'This field must be a number! ';
      }
    });

    // validate date
    regex = /^[12]\d{3}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
    if (regex.test(process.date) === false ) {
      errors.date = 'This field must be a valid date! ';
    }

    // validate time
    regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (regex.test(process.time) === false) {
      errors.time = 'This field must be a valid time! ';
    }

    // validate custom attributes
    if (!isEmpty(process.data)) {
      errors.data = {};
      const datatypes = this.state.options.specimen.attributeDatatypes;

      const protocolAttributes = this.state.options.specimen.protocolAttributes[process.protocolId];
      // FIXME: This if statement was introduced because certain processes have
      // a data object even though their protocol isn't associated with attributes.
      // This is a sign of bad importing/configuration and should be fixed in configuration
      // rather than here.
      if (protocolAttributes) {
        Object.keys(protocolAttributes)
          .forEach((attributeId) => {
          // validate required
          if (protocolAttributes[attributeId].required == 1
              && !process.data[attributeId]) {
            errors.data[attributeId] = 'This field is required!';
          }

          // validate number
          if (datatypes[attributes[attributeId].datatypeId].datatype === 'number') {
            if (isNaN(process.data[attributeId])) {
              errors.data[attributeId] = 'This field must be a number!';
            }
          }

          // validate date
          if (datatypes[attributes[attributeId].datatypeId].datatype === 'date') {
            regex = /^[12]\d{3}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
            if (regex.test(process.data[attributeId]) === false ) {
              errors.data[attributeId] = 'This field must be a valid date! ';
            }
          }

          // validate time
          if (datatypes[attributes[attributeId].datatypeId].datatype === 'time') {
            regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
            if (regex.test(process.data[attributeId]) === false) {
              errors.data[attributeId] = 'This field must be a valid time! ';
            }
          }

          // TODO: Eventually introduce file validation.
        });
      }

      if (isEmpty(errors.data)) {
        delete errors.data;
      }
    }

    // Return Errors
    return errors;
  }

  validateContainer(container, key) {
    const errors = {};

    const required = [
      'barcode',
      'typeId',
      'temperature',
      'statusId',
      'projectIds',
      'centerId',
    ];

    const float = [
      'temperature',
    ];

    required.map((field) => {
      if (!container[field]) {
        errors[field] = 'This field is required! ';
      }
    });

    float.map((field) => {
      if (isNaN(container[field])) {
        errors[field] = 'This field must be a number! ';
      }
    });

    Object.values(this.state.data.containers).map((c) => {
      if (container.barcode === c.barcode && container.id !== c.id) {
        errors.barcode = 'Barcode must be unique.';
      }
    });

    // TODO: Regex barcode check will eventually go here.
    // The regex is not currently in the schema and should be implemented here
    // when it is.

    return errors;
  }

  validatePool(pool) {
    return new Promise((resolve, reject) => {
      let regex;
      const errors = this.state.errors;
      errors.pool = {};

      const required = ['label', 'quantity', 'unitId', 'date', 'time'];

      required.forEach((field) => {
        if (!pool[field]) {
          errors.pool[field] = 'This field is required! ';
        }
      });

      if (isNaN(pool.quantity)) {
        errors.pool.quantity = 'This field must be a number! ';
      }

      // validate date
      regex = /^[12]\d{3}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
      if (regex.test(pool.date) === false ) {
        errors.pool.date = 'This field must be a valid date! ';
      }

      // validate time
      regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (regex.test(pool.time) === false) {
        errors.pool.time = 'This field must be a valid time! ';
      }

      if (pool.specimenIds == null || pool.specimenIds.length < 2) {
        errors.pool.total = 'Pooling requires at least 2 specimens';
      };

      if (isEmpty(errors.pool)) {
        this.setState({errors}, resolve());
      } else {
        this.setState({errors}, reject());
      }
    });
  }

  validateBatchPreparation(list) {
    return new Promise((resolve, reject) => {
      const barcodes = Object.values(list)
        .filter((item) => !!item.specimen.preparation)
        .map((item) => item.container.barcode);

      if (barcodes.length > 0) {
        return swal({
          title: 'Warning!',
          html: `Preparation for specimen(s) <b>${barcodes.join(', ')}</b> ` +
            `already exists. By completing this form, the previous preparation ` +
            `will be overwritten.`,
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Proceed'})
        .then((result) => result.value ? resolve() : reject());
      } else {
        return resolve();
      }
    });
  }

  render() {
    if (!this.state.isLoaded) {
      return <div style={{height: 500}}><Loader/></div>;
    }

    const barcode = (props) => {
      // TODO: Refactor 'target'. The idea is good, but it should be more clear
      // what is happening throughout the code.
      const target = this.routeBarcode(props.match.params.barcode);
      if (target.specimen) {
        return (
          <BiobankSpecimen
            data={this.state.data}
            target={target}
            options={this.state.options}
            errors={this.state.errors}
            current={this.state.current}
            editable={this.state.editable}
            setContainer={this.setContainer}
            updateContainer={this.updateContainer}
            setSpecimen={this.setSpecimen}
            updateSpecimen={this.updateSpecimen}
            setCurrent={this.setCurrent}
            printLabel={this.printLabel}
            increaseCoordinate={this.increaseCoordinate}
            edit={this.edit}
            clearAll={this.clearAll}
            createSpecimens={this.createSpecimens}
            editSpecimen={this.editSpecimen}
            editContainer={this.editContainer}
            getCoordinateLabel={this.getCoordinateLabel}
            getParentContainerBarcodes={this.getParentContainerBarcodes}
            getBarcodePathDisplay={this.getBarcodePathDisplay}
            validateSpecimen={this.validateSpecimen}
            validateContainer={this.validateContainer}
            post={this.post}
            setData={this.setData}
          />
        );
      } else {
        return (
          <BiobankContainer
            history={props.history}
            data={this.state.data}
            target={target}
            options={this.state.options}
            errors={this.state.errors}
            current={this.state.current}
            editable={this.state.editable}
            editContainer={this.editContainer}
            setContainer={this.setContainer}
            updateContainer={this.updateContainer}
            setCurrent={this.setCurrent}
            setCheckoutList={this.setCheckoutList}
            edit={this.edit}
            clearAll={this.clearAll}
            getCoordinateLabel={this.getCoordinateLabel}
            getParentContainerBarcodes={this.getParentContainerBarcodes}
            getBarcodePathDisplay={this.getBarcodePathDisplay}
          />
        );
      }
    };

    const filter = (props) => (
      <BiobankFilter
        isLoaded={this.state.isLoaded}
        history={props.history}
        data={this.state.data}
        options={this.state.options}
        current={this.state.current}
        errors={this.state.errors}
        editable={this.state.editable}
        setSpecimenHeader={this.setSpecimenHeader}
        updateFilter={this.updateFilter}
        resetFilter={this.resetFilter}
        edit={this.edit}
        clearAll={this.clearAll}
        toggleCollapse={this.toggleCollapse}
        setCurrent={this.setCurrent}
        setErrors={this.setErrors}
        setListItem={this.setListItem}
        addListItem={this.addListItem}
        copyListItem={this.copyListItem}
        removeListItem={this.removeListItem}
        increaseCoordinate={this.increaseCoordinate}
        createPool={this.createPool}
        createContainers={this.createContainers}
        createSpecimens={this.createSpecimens}
        saveBatchPreparation={this.saveBatchPreparation}
        validateSpecimen={this.validateSpecimen}
        validateContainer={this.validateContainer}
        post={this.post}
        printLabel={this.printLabel}
        setData={this.setData}
      />
    );

    return (
      <BrowserRouter basename='/biobank'>
        <div>
          <Switch>
            <Route exact path='/' render={filter}/>
            <Route exact path='/barcode=:barcode' render={barcode}/>
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}

window.addEventListener('load', () => {
  const biobank = `${loris.BaseURL}/biobank/`;
  ReactDOM.render(
    <BiobankIndex
      specimenAPI={`${biobank}specimenendpoint/`}
      containerAPI={`${biobank}containerendpoint/`}
      poolAPI={`${biobank}poolendpoint/`}
      optionsAPI={`${biobank}optionsendpoint/`}
      labelAPI={`${biobank}labelendpoint/`}
    />,
    document.getElementById('lorisworkspace'));
});
