import Loader from 'Loader';
import BiobankFilter from './filter';
import BiobankSpecimen from './specimen';
import BiobankContainer from './container';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

class BiobankIndex extends React.Component {
  constructor() {
    super();

    this.state = {
      isLoaded: false,
      options: {},
      datatable: {
        specimen: {},
        container: {},
      },
      filter: {
        specimen: {},
        container: {},
      },
      current: {
        files: {},
        list: {},
        poolList: {},
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
        preparation: null,
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

    this.fetch                  = this.fetch.bind(this);
    this.loadFilters            = this.loadFilters.bind(this);
    this.loadSpecimenDataTable  = this.loadSpecimenDataTable.bind(this);
    this.loadContainerDataTable = this.loadContainerDataTable.bind(this);
    this.loadOptions            = this.loadOptions.bind(this);
    this.routeBarcode           = this.routeBarcode.bind(this);
    this.fetch                  = this.fetch.bind(this);
    this.updateSpecimenFilter   = this.updateSpecimenFilter.bind(this);
    this.updateContainerFilter  = this.updateContainerFilter.bind(this);
    this.clone                  = this.clone.bind(this);
    this.mapFormOptions         = this.mapFormOptions.bind(this);
    this.toggleCollapse         = this.toggleCollapse.bind(this);
    this.edit                   = this.edit.bind(this);
    this.editSpecimen           = this.editSpecimen.bind(this);
    this.editContainer          = this.editContainer.bind(this);
    this.close                  = this.close.bind(this);
    this.setCurrent             = this.setCurrent.bind(this);
    this.revertCurrent          = this.revertCurrent.bind(this);
    this.setErrors              = this.setErrors.bind(this);
    this.revertErrors           = this.revertErrors.bind(this);
    this.setSpecimenList        = this.setSpecimenList.bind(this);
    this.setContainerList       = this.setContainerList.bind(this);
    this.setCheckoutList        = this.setCheckoutList.bind(this);
    //TODO: rename the following two functions (and possibly move them)
    this.setPoolList            = this.setPoolList.bind(this);
    this.addListItem            = this.addListItem.bind(this);
    this.copyListItem           = this.copyListItem.bind(this);
    this.removeListItem         = this.removeListItem.bind(this);
    this.savePoolList           = this.savePoolList.bind(this);
    this.saveSpecimenList       = this.saveSpecimenList.bind(this);
    this.setSpecimen            = this.setSpecimen.bind(this);
    this.setContainer           = this.setContainer.bind(this);
    this.saveSpecimen           = this.saveSpecimen.bind(this);
    this.saveContainer          = this.saveContainer.bind(this);
    this.saveContainerList      = this.saveContainerList.bind(this);
    this.validateSpecimen       = this.validateSpecimen.bind(this);
    this.validateProcess        = this.validateProcess.bind(this);
    this.validateContainer      = this.validateContainer.bind(this);
    this.save                   = this.save.bind(this);
  }

  componentDidMount() {
    this.loadFilters()
    .then(() => this.loadOptions())
    .then(() => this.setState({isLoaded: true}))
  }

  loadFilters() {
    return new Promise(resolve => {
      this.loadContainerDataTable()
      .then(() => this.loadSpecimenDataTable())
      .then(() => resolve())
    });
  }

  loadSpecimenDataTable() {
    return new Promise(resolve => {
      this.fetch(this.props.specimenFilterDataURL).then(data => {
        let datatable = this.state.datatable;
        datatable.specimen = data;
        this.setState({datatable}, resolve());
      });
    });
  }

  loadContainerDataTable() {
    return new Promise(resolve => {
      this.fetch(this.props.containerFilterDataURL).then(data => {
        let datatable = this.state.datatable;
        datatable.container = data;
        this.setState({datatable}, resolve());
      });
    });
  }

  loadOptions() {
    return new Promise(resolve => {
      this.fetch(this.props.optionsURL).then(data => {
        let options = data;
        this.setState({options}, resolve());
      });
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

  updateSpecimenFilter(specimenFilter) {
    let filter = this.state.filter;
    filter.specimen = specimenFilter;
    this.setState({filter});
  }

  updateContainerFilter(containerFilter) {
    let filter = this.state.filter;
    filter.container = containerFilter;
    this.setState({filter});
  }

  clone(object) {
    return JSON.parse(JSON.stringify(object));
  }

  routeBarcode(barcode) {
    let data = {};
    const containerId = Object.keys(this.state.options.containers).find(key => {
      return this.state.options.containers[key].barcode == barcode;
    });
    data.container = this.state.options.containers[containerId];

    const specimenId = Object.keys(this.state.options.specimens).find(key => {
      return this.state.options.specimens[key].containerId == containerId;
    });
    data.specimen = specimenId && this.state.options.specimens[specimenId];

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
      this.close().then(() => {
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

  //TODO: change this to 'pool' list;
  setPoolList(name, value) {
    let list = this.state.current.poolList;
    //add new items to list
    for (let i=0; i<value; i++) {
      //TODO: I don't like how I need to set the list nesting in advance.
      list[i] = list[i] || {specimen: {}, container:{}};
    }
    //delete extra items
    Object.keys(list).map(key => parseInt(value) <= parseInt(key) && delete list[key]);
    this.setCurrent('poolList', list);
  }

  editSpecimen(specimen) {
    return new Promise(resolve => {
      specimen = this.clone(specimen);
      this.setCurrent('specimen', specimen).then(()=>resolve());
    });
  }

  editContainer(container) {
    return new Promise(resolve => {
      container = this.clone(container);
      this.setCurrent('container', container).then(()=>resolve());
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
      this.setCurrent('specimen', specimen).then(()=>resolve());
    });
  }

  setContainer(name, value) {
    return new Promise(resolve => {
      let container = this.state.current.container;
      value ? container[name] = value : delete container[name]; 
      this.setCurrent('container', container).then(()=>resolve());
    });
  }

  saveSpecimen(specimen) {
    this.validateSpecimen(specimen).then(() => {
      this.save(specimen, this.props.saveSpecimenURL, 'Specimen Save Successful!').then(
        () => this.close()
      );
    });
  }

  // TODO: this close flag is not great, but it was the best way to do load container
  // because of the way that SearchElement works.
  // TODO: it may be best to close in the places where saveContainer is called.
  // ¯\_(ツ)_/¯
  // TODO: or it may be best to either have two functions, or make a loadList
  saveContainer(container, close) {
    return new Promise(resolve => {
      this.validateContainer(container).then(() => {
        this.save(container, this.props.saveContainerURL, 'Container Save Successful!').then(
          () => {close && this.close(); resolve();}
        );
      });
    });
  }
  
  //TODO: This is not a great function. It can likely be integrated with 
  //saveSpecimenList()
  //This silly promise all is further reason this should be integrated
  savePoolList() {
    return new Promise(resolve => {
      let list = this.clone(this.state.current.poolList);
      let saves = [];
      for (let key in list) {
        saves.push(this.save(list[key].specimen, this.props.saveSpecimenURL, ''));
      }

      Promise.all(saves)
      .then(() => resolve());
    });
  }

  saveSpecimenList() {
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
    .then(() => {this.close(); this.loadFilters()})
    .catch(e => console.error(e));
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

    Promise.all(listValidation).then(()=> {
      this.save(list, this.props.saveContainerListURL, 'Container Creation Successful!').then(
        () => {this.close(); this.loadFilters(); this.loadOptions();}
      );
    }).catch(()=>{});
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
          this.loadOptions();
          message && swal(message, '', 'success');
        },
        error: (error, textStatus, errorThrown) => {
          let message = (error.responseJSON||{}).message || 'Submission error!';
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

  //TODO: validation might be more effective within 1 function.
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

      Object.values(this.state.options.containers).map(c => {
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

  render() {
    if (!this.state.isLoaded) {
      return (
        <div style={{height: 500}}><Loader/></div>
      );
    }

    const barcode = (props) => {
      const data = this.routeBarcode(props.match.params.barcode);
      if (data.specimen) {
        return (
          <BiobankSpecimen
            data={data}
            options={this.state.options}
            errors={this.state.errors}
            current={this.state.current}
            editable={this.state.editable}
            loadFilters={this.loadFilters}
            loadOptions={this.loadOptions}
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
            data={data}
            options={this.state.options}
            errors={this.state.errors}
            current={this.state.current}
            editable={this.state.editable}
            loadFilters={this.loadFilters}
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
        datatable={this.state.datatable}
        options={this.state.options}
        current={this.state.current}
        errors={this.state.errors}
        editable={this.state.editable}
        updateSpecimenFilter={this.updateSpecimenFilter}
        updateContainerFilter={this.updateContainerFilter}
        mapFormOptions={this.mapFormOptions}
        edit={this.edit}
        close={this.close}
        clone={this.clone}
        toggleCollapse={this.toggleCollapse}
        loadFilters={this.loadFilters}
        loadOptions={this.loadOptions}
        setCurrent={this.setCurrent}
        setErrors={this.setErrors}
        setContainerList={this.setContainerList}
        setSpecimenList={this.setSpecimenList}
        setContainerList={this.setContainerList}
        setPoolList={this.setPoolList}
        addListItem={this.addListItem}
        copyListItem={this.copyListItem}
        removeListItem={this.removeListItem}
        validateProcess={this.validateProcess}
        saveSpecimen={this.saveSpecimen}
        saveContainerList={this.saveContainerList}
        saveSpecimenList={this.saveSpecimenList}
        savePoolList={this.savePoolList}
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
      specimenFilterDataURL={`${loris.BaseURL}/biobank/?format=json`}
      containerFilterDataURL={`${request}action=getContainerFilterData`}
      specimenDataURL={`${request}action=getSpecimenData&barcode=`}
      containerDataURL={`${request}action=getContainerData&barcode=`}
      optionsURL={`${request}action=getFormOptions`}
      saveContainerURL={`${submit}action=saveContainer`}
      saveSpecimenURL={`${submit}action=saveSpecimen`}
      saveContainerListURL={`${submit}action=saveContainerList`}
      saveSpecimenListURL={`${submit}action=saveSpecimenList`}
    />
  );
  ReactDOM.render(biobankIndex, document.getElementById("lorisworkspace"));
});
