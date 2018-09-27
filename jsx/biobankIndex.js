import Loader from 'Loader';
import BiobankFilter from './filter';
import BiobankSpecimen from './specimen';
import BiobankContainer from './container';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import swal from 'sweetalert2';

class BiobankIndex extends React.Component {
  constructor() {
    super();

    this.state = {
      isLoaded: false,
      options: {},
      data: {
        specimens: {},
        containers: {},
        pools: {},
      },
      filter: {
        specimen: {},
        container: {},
        pool: {},
      },
      headers: {
        specimen: {
          all: [
            'Barcode',
            'Type',
            'Quantity',
            'F/T Cycle',
            'Parent Specimens',
            'PSCID',
            'Visit Label',
            'Pool',
            'Status',
            'Site',
            'Container Barcode',
          ],
          hidden: [
            'F/T Cycle',
            'Parent Specimens',
            'Pool',
          ]
        }
      },
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
        multiplier: null,
        specimen: {},
        container: {},
        pool: {},
        preparation: {},
      },
      errors: {
        container: {},
        specimen: {},
        list: {},
        preparation: {}
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
      }
    };

    this.fetch                = this.fetch.bind(this);
    this.loadAllData          = this.loadAllData.bind(this);
    this.loadData             = this.loadData.bind(this);
    this.groupContainers      = this.groupContainers.bind(this);
    this.loadOptions          = this.loadOptions.bind(this);
    this.routeBarcode         = this.routeBarcode.bind(this);
    this.fetch                = this.fetch.bind(this);
    this.setSpecimenHeader    = this.setSpecimenHeader.bind(this);
    this.updateFilter         = this.updateFilter.bind(this);
    this.resetFilter          = this.resetFilter.bind(this);
    this.clone                = this.clone.bind(this);
    this.mapFormOptions       = this.mapFormOptions.bind(this);
    this.toggleCollapse       = this.toggleCollapse.bind(this);
    this.edit                 = this.edit.bind(this);
    this.editSpecimen         = this.editSpecimen.bind(this);
    this.editContainer        = this.editContainer.bind(this);
    this.close                = this.close.bind(this);
    this.setCurrent           = this.setCurrent.bind(this);
    this.revertCurrent        = this.revertCurrent.bind(this);
    this.setErrors            = this.setErrors.bind(this);
    this.revertErrors         = this.revertErrors.bind(this);
    this.setSpecimenList      = this.setSpecimenList.bind(this);
    this.setContainerList     = this.setContainerList.bind(this);
    this.setPoolList          = this.setPoolList.bind(this);
    this.setCheckoutList      = this.setCheckoutList.bind(this);
    this.setListLength        = this.setListLength.bind(this);
    this.addListItem          = this.addListItem.bind(this);
    this.copyListItem         = this.copyListItem.bind(this);
    this.removeListItem       = this.removeListItem.bind(this);
    this.saveSpecimenList     = this.saveSpecimenList.bind(this);
    this.setSpecimen          = this.setSpecimen.bind(this);
    this.setContainer         = this.setContainer.bind(this);
    this.setPool              = this.setPool.bind(this);
    this.saveSpecimen         = this.saveSpecimen.bind(this);
    this.saveContainer        = this.saveContainer.bind(this);
    this.savePool             = this.savePool.bind(this);
    this.saveBatchPreparation = this.saveBatchPreparation.bind(this);
    this.saveContainerList    = this.saveContainerList.bind(this);
    this.validateSpecimen     = this.validateSpecimen.bind(this);
    this.validateProcess      = this.validateProcess.bind(this);
    this.validateContainer    = this.validateContainer.bind(this);
    this.save                 = this.save.bind(this);
  }

  componentDidMount() {
    this.loadAllData();
  }

  loadAllData() {
    this.loadOptions()
    .then(() => this.loadData('container', this.props.containerDataURL))
    .then(() => this.loadData('pool', this.props.poolDataURL))
    .then(() => this.loadData('specimen', this.props.specimenDataURL))
    .then(() => this.setState({isLoaded: true}))
  }

  loadData(type, url) {
    return new Promise(resolve => {
      this.fetch(url)
      .then(dataList => {
        let data = this.state.data;
        data[type+'s'] = type === 'container' ? this.groupContainers(dataList) : dataList;
        this.setState({data}, resolve());
      });
    });
  }

  // This function groups containers into three categories: all, primary and nonPrimary
  groupContainers(dataList) {
    let data = {all: {}, primary: {}, nonPrimary: {}};
    data.all = dataList;
    for (let k in dataList) {
      if (this.state.options.containerTypes[dataList[k].typeId].primary === '1') {
        data.primary[k] = dataList[k];
      } else {
        data.nonPrimary[k] = dataList[k];
      }
    }
    return data;
  }

  loadOptions() {
    return new Promise(resolve => {
      this.fetch(this.props.optionsURL)
      .then(options => {this.setState({options}, resolve())});
    });
  }

  fetch(url) {
    return new Promise(resolve => {
      $.ajax(url, {
        dataType: 'json',
        success: data => resolve(data),
        error: (error, errorCode, errorMsg) => console.error(error, errorCode, errorMsg)
      });
    });
  }

  //value is a boolean
  setSpecimenHeader(name, value) {
    let headers = this.state.headers;
    if (value) {
      headers.specimen.hidden.splice(headers.specimen.hidden.indexOf(name), 1);
    } else {
      headers.specimen.hidden.push(name);
    }
    this.setState({headers});
  }

  updateFilter(filterName, fieldName, fieldValue, fieldType) {
    let filter = this.state.filter;
    let field = {};
    if (fieldValue !== '') {
      field.value = fieldValue;
      field.exactMatch = fieldType === 'select' ? true : false;
      filter[filterName][fieldName] = field;
    } else {
      delete filter[filterName][fieldName];
    }
    this.setState({filter});
  }

  resetFilter(filterName) {
    let filter = this.state.filter;
    filter[filterName] = {};
    this.setState({filter});
  }

  clone(object) {
    return JSON.parse(JSON.stringify(object));
  }

  routeBarcode(barcode) {
    const container = Object.values(this.state.data.containers.all).find(
      container => container.barcode == barcode
    );
    
    const specimen = Object.values(this.state.data.specimens).find(
      specimen => specimen.containerId == container.id
    );

    let data = {};
    data.container = container;
    data.specimen = specimen;

    return data;
  }

  mapFormOptions(object, attribute) {
    let data = {};
    for (let id in object) {
      data[id] = object[id][attribute];
    }
    return data;
  }

  edit(stateKey) {
    return new Promise(resolve => {
      this.close()
      .then(() => {
        let editable = this.state.editable;
        editable[stateKey] = true;
        this.setState({editable}, resolve());
      });
    });
  }

  close() {
    return new Promise(resolve => {
      let editable = this.state.editable;
      for (let key in editable) {
        editable[key] = false;
      }
      this.revertCurrent();
      this.revertErrors();

      this.setState({editable}, resolve());
    });
  }

  toggleCollapse(key) {
    let collapsed = this.state.current.collapsed;
    collapsed[key] = !collapsed[key];
    this.setCurrent('collapsed', collapsed);
  }

  setSpecimenList(name, value, key) {
    let list = this.state.current.list;
    list[key].specimen[name] = value;
    this.setCurrent('list', list);
  }

  setContainerList(name, value, key) {
    let list = this.state.current.list;
    list[key].container[name] = value;
    this.setCurrent('list', list);
  }

  setCheckoutList(container) {
    let list = this.state.current.list;
    list[container.coordinate] = container;
    this.setCurrent('list', list);
  }

  setListLength(name, value) {
    let list = this.state.current.list;
    //add new items to list
    for (let i=0; i<value; i++) {
      //TODO: I don't like how I need to set the list nesting in advance.
      list[i] = list[i] || {specimen: {}, container: {}};
    }
    //delete extra items
    Object.keys(list).map(key => parseInt(value) <= parseInt(key) && delete list[key]);
    this.setCurrent('list', list);
  }

  //TODO: revisit if this should be here, or in specimenPoolForm.js
  // I am now thinking that it might be best to put it in specimenPoolForm.js
  setPoolList(key, containerId) {
    let list = this.state.current.list;
    let specimenIds = this.state.current.pool.specimenIds || [];
    const container = this.state.data.containers.primary[containerId];
    const specimen = Object.values(this.state.data.specimens).find(
      specimen => specimen.containerId == containerId
    );

    list[key].container = container;
    list[key].specimen = specimen;
    specimenIds.push(specimen.id);

    this.setCurrent('list', list);
    this.setCurrent('candidateId', specimen.candidateId);
    this.setCurrent('sessionId', specimen.sessionId);
    this.setCurrent('typeId', specimen.typeId);
    this.setCurrent('centerId', container.centerId);
    this.setPool('centerId', container.centerId);
    this.setPool('specimenIds', specimenIds);
  }

  editSpecimen(specimen) {
    return new Promise(resolve => {
      specimen = this.clone(specimen);
      this.setCurrent('specimen', specimen)
      .then(() => resolve());
    });
  }

  editContainer(container) {
    return new Promise(resolve => {
      container = this.clone(container);
      this.setCurrent('container', container)
      .then(() => resolve());
    });
  }
  
  setCurrent(name, value) {
    return new Promise(resolve => {
      let current = this.state.current;
      current[name] = value;
      this.setState({current}, resolve());
    });
  }

  //TODO: perhaps allow the passing of a parameter that allows the selection
  //of the value to revert.
  revertCurrent() {
    let current = this.state.current;
    for (let key in current) {
      current[key] =
        current[key] !== null && typeof current[key] === 'object' ? {} : null;
    }
    this.setState({current});
  }

  setErrors(name, value) {
    let errors = this.state.errors;
    errors[name] = value;
    this.setState({errors});
  }

  revertErrors() {
    let errors = this.state.errors;
    for (let key in errors) {
      errors[key] = {};
    }
    this.setState({errors});
  }

  addListItem(item) {
    let current = this.state.current;
    current.count++;
    current.collapsed[current.count] = true;
    switch(item) {
      case 'specimen':
        current.list[current.count] = {specimen: {collection:{}}, container: {}};
        break;
      case 'container':
        current.list[current.count] = {container: {}};
        break;
    }

    this.setState({current});
  }

  copyListItem(key) {
    let current = this.state.current;
    for (let i=1; i<=current.multiplier; i++) {
      current.count++;
      current.list[current.count] = this.clone(current.list[key]);
      current.list[current.count].container.barcode &&
        delete current.list[current.count].container.barcode;
      current.collapsed[current.count] = true;
    }

    this.setState({current});
  }

  removeListItem(key) {
    let current = this.state.current;
    delete current.list[key];
    this.setState({current});
  }

  setSpecimen(name, value) {
    return new Promise(resolve => {
      let specimen = this.state.current.specimen;
      specimen[name] = value;
      this.setCurrent('specimen', specimen)
      .then(() => resolve());
    });
  }

  setContainer(name, value) {
    return new Promise(resolve => {
      let container = this.state.current.container;
      value ? container[name] = value : delete container[name]; 
      this.setCurrent('container', container)
      .then(() => resolve());
    });
  }

  setPool(name, value) {
    return new Promise(resolve => {
      let pool = this.state.current.pool;
      pool[name] = value;
      this.setCurrent('pool', pool)
      .then(() => resolve());
    });
  }

  saveSpecimen(specimen) {
    this.validateSpecimen(specimen)
    .then(() => this.save(specimen, this.props.saveSpecimenURL, 'Specimen Save Successful!'))
    .then(() => this.close());
  }

  savePool(pool) {
    this.validatePool(pool)
    .then(() => this.save(pool, this.props.savePoolURL, 'Pooling Successful!'))
    .then(() => this.close());
  }

  // TODO: this close flag is not great, but it was the best way to do load container
  // because of the way that SearchElement works.
  // TODO: it may be best to close in the places where saveContainer is called.
  // ¯\_(ツ)_/¯
  saveContainer(container, message = true, close = true) {
    return new Promise(resolve => {
      message = message ? 'Container Save Successful' : null;
      this.validateContainer(container)
      .then(() => this.save(container, this.props.saveContainerURL, message))
      .then(() => {close && this.close(); resolve();});
    });
  }
  
  saveSpecimenList() {
    return new Promise (resolve => {
      let listValidation = [];
      let list           = this.clone(this.state.current.list);
      let centerId       = this.state.current.centerId;
      //TODO: consider making a getAvailableId() function;
      let availableId    = Object.keys(this.state.options.containerStati).find(
        key => this.state.options.containerStati[key].status === 'Available'
      );

      for (let key in list) {
        // set container values
        let container         = list[key].container;
        container.statusId    = availableId;
        container.temperature = 20;
        container.centerId    = centerId;
        container.originId    = centerId;

        // set specimen values
        let specimen                 = list[key].specimen;
        specimen.candidateId         = this.state.current.candidateId;
        specimen.sessionId           = this.state.current.sessionId;
        specimen.quantity            = specimen.collection.quantity;
        specimen.unitId              = specimen.collection.unitId;
        specimen.collection.centerId = centerId;
        if ((this.state.options.specimenTypes[specimen.typeId]||{}).freezeThaw == 1) {
          specimen.fTCycle = 0;
        }
        specimen.parentSpecimenIds = this.state.current.parentSpecimenIds || null;

        list[key].container = container;
        list[key].specimen  = specimen;

        listValidation.push(this.validateContainer(container, key));
        listValidation.push(this.validateSpecimen(specimen, key));
      }

      Promise.all(listValidation)
      .then(() => this.save(list, this.props.saveSpecimenListURL, 'Save Successful!'))
      .then(() => {resolve()})
      .catch(e => console.error(e));
    });
  }

  saveContainerList() {
    let listValidation = [];
    let list           = this.state.current.list;
    let availableId    = Object.keys(this.state.options.containerStati).find(
      key => this.state.options.containerStati[key].status === 'Available'
    );

    for (let key in list) {
      let container         = list[key].container;
      container.statusId    = availableId;
      container.temperature = 20;
      container.originId    = this.state.current.centerId;
      container.centerId    = this.state.current.centerId;

      listValidation.push(this.validateContainer(container, key));
    }

    Promise.all(listValidation)
    .then(() => this.save(list, this.props.saveContainerListURL, 'Container Creation Successful!'))
    .then(() => this.close())
    .catch(()=>{});
  }

  saveBatchPreparation() {
    let list          = this.state.current.list;
    const preparation = this.state.current.preparation;

    preparation.centerId = this.state.current.centerId;
    let attributes       = this.state.options.specimenProtocolAttributes[preparation.protocolId];
    this.validateProcess(
      preparation,
      attributes,
      ['protocolId', 'centerId', 'date', 'time'])
    .then(() => this.validateBatchPreparation(list))
    .then(() => this.submitBatchPreparation(list))
    .then(() => {swal('Preparation Successful!', '', 'success'); this.close()})
    .catch(e => this.setErrors('preparation', e))
  }

  submitBatchPreparation(list) {
    return new Promise(resolve => {
      let saveList = [];
      Object.values(list).forEach(item => {
        item.specimen.preparation = this.state.current.preparation;
        saveList.push(this.save(item.specimen, this.props.saveSpecimenURL))
      });
      Promise.all(saveList).then(() => resolve());
    });
  }

  save(data, url, message) {
    return new Promise(resolve => {
      let dataObject = new FormData();
      for (let file in this.state.current.files) {
        dataObject.append(this.state.current.files[file].name, this.state.current.files[file]);
      }
      dataObject.append('data', JSON.stringify(data));
      $.ajax({
        type: 'POST',
        url: url,
        data: dataObject,
        cache: false,
        contentType: false,
        processData: false,
        success: () => {
          resolve();
          this.loadAllData();
          message && swal(message, '', 'success');
        },
        error: (error, textStatus, errorThrown) => {
          let message = error.responseJSON.message;
          swal('Error', message, 'error');
          console.error(error, textStatus, errorThrown);
        }
      });
    });
  }

  validateSpecimen(specimen, key) {
    return new Promise((resolve, reject) => {
      let errors = this.clone(this.state.errors);
      errors.specimen = {};

      let required = ['typeId', 'quantity', 'unitId', 'candidateId', 'sessionId', 'collection'];
      let float    = ['quantity'];

      required.map(field => {
        if (!specimen[field]) {
          errors.specimen[field] = 'This field is required! ';
        }
      });

      float.map(field => {
        if (isNaN(specimen[field])) {
          errors.specimen[field] = 'This field must be a number! ';
        }
      });

      let validateProcess = [
        this.validateProcess(
          specimen.collection,
          this.state.options.specimenTypeAttributes[specimen.typeId],
          ['quantity', 'unitId', 'centerId', 'date', 'time'],
          ['quantity']
        )
      ]

      if (specimen.preparation) {
        validateProcess.push(
          this.validateProcess(
            specimen.preparation,
            this.state.options.specimenProtocolAttributes[specimen.preparation.protocolId],
            ['protocolId', 'centerId', 'date', 'time']
          )
        )
      }

      if (specimen.analysis) {
        validateProcess.push(
          this.validateProcess(
            specimen.analysis,
            this.state.options.specimenMethodAttributes[specimen.analysis.methodId],
            ['methodId', 'centerId', 'date', 'time']
          )
        );
      }

      Promise.all(validateProcess)
      .catch(e => errors.specimen.process = e)
      .then(() => {
        //TODO: try to use setErrors function here
        if (key) {
          errors.list[key] = errors.list[key] || {};
          errors.list[key].specimen = errors.specimen;
        }

        if (this.isEmpty(errors.specimen)) {
          this.setState({errors}, resolve());
        } else {
          this.setState({errors}, reject(errors));
        }
      });
    });
  }

  //TODO: make use of this function elsewhere in the code
  isEmpty(obj) {
   for (let x in obj) {
     return false;
   }
   return true;
  }

  validateProcess(process, attributes, required, number) {
    return new Promise((resolve, reject) => {
      let errors = {};
      let regex  = '';

      // validate required fields
      required && required.map(field => {
        if (!process[field]) {
          errors[field] = 'This field is required! ';
        }
      });

      // validate floats
      number && number.map(field => {
        if (isNaN(process[field])) {
          errors[field] = 'This field must be a number! ';
        }
      });

      // validate date
      regex = /^[12]\d{3}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
      if (regex.test(process['date']) === false ) {
        errors['date'] = 'This field must be a date! ';
      }

      // validate time
      regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (regex.test(process['time']) === false) {
        errors['time'] = 'This field must be a time! ';
      }

      // validate custom attributes
      if (attributes) {
        errors.data = {};
        let datatypes = this.state.options.attributeDatatypes;

        for (let attribute in attributes) {
          if (!process.data[attribute]) {
            errors.data[attribute] = 'This field is required!';
          }

          if (datatypes[attributes[attribute].datatypeId].datatype === 'number') {
            if (isNaN(process.data[attribute])) {
              errors.data[attribute] = 'This field must be a number!';
            }
          }

          //TODO: Decide what other validation needs to happen here:
          // - boolean?
          // - datetime?
          // - file?
        }

        if (Object.keys(errors.data).length == 0) {
          delete errors.data;
        }
      }

      // return errors if they exist
      if (Object.keys(errors).length != 0) {
        reject(errors);
      } else {
        resolve();
      }
    });
  }

  validateContainer(container, key) {
    return new Promise((resolve, reject) => {
      let errors = this.state.errors;
      errors.container = {};

      const required = [
        'barcode',
        'typeId',
        'temperature',
        'statusId',
        'centerId',
      ]

      const float = [
        'temperature',
      ]

      required.map(field => {
        if (!container[field]) {
          errors.container[field] = 'This field is required! ';
        }
      });

      float.map(field => {
        if (isNaN(container[field])) {
          errors.container[field] = 'This field must be a number! ';
        }
      });

      Object.values(this.state.data.containers.all).map(c => {
        if (container.barcode === c.barcode && container.id !== c.id) {
          errors.container.barcode = 'Barcode must be unique';
        }
      });

      //TODO: Regex barcode check will go here
      // This involves finding out a specimen type... or perhaps a container type?
      // This is confusing... ask Rida.

      //TODO: try to use setErrors function here
      if (key) {
        errors.list[key] = errors.list[key] || {};
        errors.list[key].container = errors.container;
      }

      if (Object.keys(errors.container).length == 0) {
        this.setState({errors}, resolve());
      } else {
        this.setState({errors}, reject());
      }
    });
  }

  validatePool(pool) {
    return new Promise(resolve => {
      //TODO: This validation is useless at the moment. It should be fixed.
      //Check for label, date, time.
      //
      //let numOfBarcodes = 0;
      //for (let i in pool) {
      //  pool[i].container.barcode && numOfBarcodes++
      //  //TODO: check that there are no empty barcodes
      //}

      //if (numOfBarcodes < 2) {
      //  swal('Oops!', 'SpecimenPooling Requires Alteast 2 Specimen', 'warning');
      //} else {
      //  resolve();
      //}

      resolve();
    });
  }

  validateBatchPreparation(list) {
    return new Promise((resolve, reject) => {
      let barcodes = [];
      Object.values(list).forEach(item => {
        item.specimen.preparation && barcodes.push(item.container.barcode);
      });

      if (barcodes.length > 0) {
        swal({
          title: 'Warning!',
          html: `Preparation for specimen(s) <b>${barcodes.join(', ')}</b> ` +
            `already exists. By completing this form, the previous preparation ` +
            `will be overwritten.`,
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Proceed'})
        .then(result => result.value ? resolve() : reject());
      } else {
        resolve();
      }
    });
  }

  render() {
    if (!this.state.isLoaded) {
      return (
        <div style={{height: 500}}><Loader/></div>
      );
    }

    const barcode = (props) => {
      //TODO: Refactor 'target'. The idea is good, but it should be more clear
      //what is happening throughout the code.
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
            mapFormOptions={this.mapFormOptions}
            setContainer={this.setContainer}
            saveContainer={this.saveContainer}
            setSpecimen={this.setSpecimen}
            saveSpecimen={this.saveSpecimen}
            setCurrent={this.setCurrent}
            toggleCollapse={this.toggleCollapse}
            setSpecimenList={this.setSpecimenList}
            setContainerList={this.setContainerList}
            addListItem={this.addListItem}
            copyListItem={this.copyListItem}
            removeListItem={this.removeListItem}
            edit={this.edit}
            close={this.close}
            save={this.save}
            saveSpecimenList={this.saveSpecimenList}
            editSpecimen={this.editSpecimen}
            editContainer={this.editContainer}
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
            mapFormOptions={this.mapFormOptions}
            editContainer={this.editContainer}
            setContainer={this.setContainer}
            saveContainer={this.saveContainer}
            setCurrent={this.setCurrent}
            setCheckoutList={this.setCheckoutList}
            edit={this.edit}
            close={this.close}
          />
        );
      }
    };

    const filter = (props) => (
      <BiobankFilter
        history={props.history}
        filter={this.state.filter}
        data={this.state.data}
        headers={this.state.headers}
        options={this.state.options}
        current={this.state.current}
        errors={this.state.errors}
        editable={this.state.editable}
        setSpecimenHeader={this.setSpecimenHeader}
        updateFilter={this.updateFilter}
        resetFilter={this.resetFilter}
        mapFormOptions={this.mapFormOptions}
        edit={this.edit}
        close={this.close}
        toggleCollapse={this.toggleCollapse}
        setCurrent={this.setCurrent}
        setErrors={this.setErrors}
        setContainerList={this.setContainerList}
        setSpecimenList={this.setSpecimenList}
        setPool={this.setPool}
        setPoolList={this.setPoolList}
        addListItem={this.addListItem}
        copyListItem={this.copyListItem}
        removeListItem={this.removeListItem}
        setListLength={this.setListLength}
        savePool={this.savePool}
        saveContainerList={this.saveContainerList}
        saveSpecimenList={this.saveSpecimenList}
        saveBatchPreparation={this.saveBatchPreparation}
      />
    );

    return (
      <BrowserRouter basename='/biobank'>
        <Switch>
          <Route exact path='/' render={filter}/>
          <Route exact path='/barcode=:barcode' render={barcode}/>
        </Switch>
      </BrowserRouter>
    );
  }
}

$(document).ready(function() {
  const request      = `${loris.BaseURL}/biobank/ajax/requestData.php?`;
  const submit       = `${loris.BaseURL}/biobank/ajax/submitData.php?`;
  const biobankIndex = (
    <BiobankIndex
      specimenDataURL={`${loris.BaseURL}/biobank/specimencontroller/?format=json`}
      containerDataURL={`${loris.BaseURL}/biobank/containercontroller/?format=json`}
      poolDataURL={`${loris.BaseURL}/biobank/poolcontroller/?format=json`}
      optionsURL={`${request}action=getOptions`}
      saveSpecimenURL={`${submit}action=saveSpecimen`}
      saveContainerURL={`${submit}action=saveContainer`}
      savePoolURL={`${submit}action=savePool`}
      saveSpecimenListURL={`${submit}action=saveSpecimenList`}
      saveContainerListURL={`${submit}action=saveContainerList`}
    />
  );
  ReactDOM.render(biobankIndex, document.getElementById("lorisworkspace"));
});
