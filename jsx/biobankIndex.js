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
        collapsed: {},
        coordinate: null,
        sequential: false,
        candidateId: null,
        centerId: null,
        originId: null,
        sessionId: null,
        count: null,
        total: null,
        multiplier: null,
      },
      errors: {
        container: {},
        specimen: {},
        list: {},
      },
      editable: {
        specimenForm: false,
        containerForm: false,
        aliquotForm: false,
        containerParentForm: false,
        barcode: false,
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

    this.fetch                    = this.fetch.bind(this);
    this.loadFilters              = this.loadFilters.bind(this);
    this.loadSpecimenDataTable    = this.loadSpecimenDataTable.bind(this);
    this.loadContainerDataTable   = this.loadContainerDataTable.bind(this);
    this.loadOptions              = this.loadOptions.bind(this);
    this.routeBarcode             = this.routeBarcode.bind(this);
    this.fetch                    = this.fetch.bind(this);
    this.updateSpecimenFilter     = this.updateSpecimenFilter.bind(this);
    this.updateContainerFilter    = this.updateContainerFilter.bind(this);
    this.clone                    = this.clone.bind(this);
    this.mapFormOptions           = this.mapFormOptions.bind(this);
    this.toggleCollapse           = this.toggleCollapse.bind(this);
    this.edit                     = this.edit.bind(this);
    this.editSpecimen             = this.editSpecimen.bind(this);
    this.editContainer            = this.editContainer.bind(this);
    this.close                    = this.close.bind(this);
    this.setCurrent               = this.setCurrent.bind(this);
    this.revertCurrent            = this.revertCurrent.bind(this);
    this.setSpecimenList          = this.setSpecimenList.bind(this);
    this.setContainerList         = this.setContainerList.bind(this);
    this.setCheckoutList          = this.setCheckoutList.bind(this);
    this.setBarcodeList           = this.setBarcodeList.bind(this);
    this.addListItem              = this.addListItem.bind(this);
    this.copyListItem             = this.copyListItem.bind(this);
    this.removeListItem           = this.removeListItem.bind(this);
    this.saveSpecimenList         = this.saveSpecimenList.bind(this);
    this.setSpecimen              = this.setSpecimen.bind(this);
    this.setContainer             = this.setContainer.bind(this);
    this.saveSpecimen             = this.saveSpecimen.bind(this);
    this.saveContainer            = this.saveContainer.bind(this);
    this.saveChildContainer       = this.saveChildContainer.bind(this);
    this.saveContainerList        = this.saveContainerList.bind(this);
    this.validateContainer        = this.validateContainer.bind(this);
    this.validateSpecimen         = this.validateSpecimen.bind(this);
    this.save                     = this.save.bind(this);
  }

  componentDidMount() {
    this.loadFilters().then(() =>
      this.loadOptions().then(() =>
        this.setState({isLoaded: true})
      )
    );
  }

  loadFilters() {
    return new Promise(resolve => {
      this.loadContainerDataTable().then(() =>
        this.loadSpecimenDataTable().then(() =>  {
          resolve();
        })
      )
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
    for (const id in object) {
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

  setBarcodeList(name, value) {
    let list = this.state.current.list;
    for (let i=1; i<=value; i++) {
      list[i] = list[i] || {specimen: {collection:{}}, container: {}}; 
    }
    this.setCurrent('list', list);
    this.setCurrent('total', value);
  }
  
  setCurrent(name, value) {
    return new Promise(resolve => {
      let current = this.state.current;
      current[name] = value;
      this.setState({current}, resolve());
    });
  }

  revertCurrent() {
    let current = this.state.current;
    for (let key in current) {
      current[key] =
        current[key] !== null && typeof current[key] === 'object' ? {} : null;
    }
    this.setState({current});
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
    let specimen = this.state.current.specimen;
    specimen[name] = value;
    this.setCurrent('specimen', specimen);
  }

  setContainer(name, value) {
    let container = this.state.current.container;
    value ? container[name] = value : delete container[name]; 
    this.setCurrent('container', container);
  }

  saveSpecimen() {
    let specimen = this.state.current.specimen;
    this.validateSpecimen(specimen).then(() => {
      this.save(specimen, this.props.saveSpecimenURL, 'Specimen Save Successful!').then(() => {
        //let data = this.state.data;
        //data.specimen = this.clone(this.state.specimen);
        //this.setState({data}, ()=>{this.close()});
        this.close();
      });
    });
  }

  saveSpecimenList() {
    let listValidation = [];
    let list           = this.clone(this.state.current.list);
    let centerId       = this.state.current.centerId;
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

      // if this is an aliquot form, reset some of the values.
      if (this.state.editable.aliquotForm) {
        specimen.candidateId         = this.state.current.specimen.candidateId;
        specimen.sessionId           = this.state.current.specimen.sessionId;
        specimen.parentSpecimenId    = this.state.current.specimen.id;
        specimen.collection.centerId = this.state.current.centerId;
        container.centerId           = this.state.current.centerId;
        container.originId           = this.state.current.originId;
      }

      list[key].container = container;
      list[key].specimen  = specimen;

      listValidation.push(this.validateContainer(container, key));
      listValidation.push(this.validateSpecimen(specimen, key));
    }

    Promise.all(listValidation).then(() => {
      this.save(list, this.props.saveSpecimenListURL, 'Save Successful!').then(
        () => {this.close(); this.loadFilters()}
      );
    }).catch(()=>{});
  }

  saveContainer() {
    let container = this.state.current.container;
    this.validateContainer(container).then(() => {
      this.save(container, this.props.saveContainerURL, 'Container Save Successful!').then(
        () => this.close()
      );
    });
  }
  
  saveChildContainer(container) {
    return new Promise(resolve => {
      this.save(container, this.props.saveContainerURL).then(
        () => resolve()
      );
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

  //TODO: validation might be more effective within 1 function.
  validateContainer(container, key) {
    return new Promise((resolve, reject) => {
      let errors = this.state.errors;
      errors.container = {};

      let required = [
        'barcode',
        'typeId',
        'temperature',
        'statusId',
        'centerId',
      ]

      let float = [
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

      //TODO: Regex check will go here
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

  validateSpecimen(specimen, key) {
    return new Promise((resolve, reject) => {
      let errors = this.state.errors;
      errors.specimen = {};

      let required = [
        'typeId',
        'quantity',
        'unitId',
        'candidateId',
        'sessionId',
        'collection',
      ];
      let float = ['quantity'];

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

      if (specimen.collection) {
        errors.specimen.collection = {};
        let required = ['quantity', 'unitId', 'centerId', 'date', 'time'];
        let float    = ['quantity'];
        let date     = ['date'];
        let time     = ['time'];

        required.map(field => {
          if (!specimen.collection[field]) {
            errors.specimen.collection[field] = 'This field is required! ';
          }
        });

        float.map(field => {
          if (isNaN(specimen.collection[field])) {
            errors.specimen.collection[field] = 'This field must be a number! ';
          }
        });

        date.map(field => {
          let regex = /^[12]\d{3}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
          if (regex.test(specimen.collection[field]) === false ) {
            errors.specimen.collection[field] = 'This field must be a date! ';
          }
        });

        time.map(field => {
          let regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
          if (regex.test(specimen.collection[field]) === false) {
            errors.specimen.collection[field] = 'This field must be a time! ';
          }
        });

        if (this.state.options.specimenTypeAttributes[specimen.typeId]) {
          errors.specimen.collection.data = {};
          let attributes = this.state.options.specimenTypeAttributes[specimen.typeId];
          let datatypes = this.state.options.attributeDatatypes;

          for (let attribute in attributes) {
            if (!specimen.collection.data[attribute]) {
              errors.specimen.collection.data[attribute] = 'This field is required!';
            }

            if (datatypes[attributes[attribute].datatypeId].datatype === 'number') {
              if (isNaN(specimen.collection.data[attribute])) {
                errors.specimen.collection.data[attribute] = 'This field must be a number!';
              }
            }

            //TODO: Decide what other validation needs to happen here:
            // - boolean?
            // - datetime?
            // - file?
          }

          if (Object.keys(errors.specimen.collection.data).length == 0) {
            delete errors.specimen.collection.data;
          }
        }

        if (Object.keys(errors.specimen.collection).length == 0) {
          delete errors.specimen.collection;
        }
      }

      if (key) {
        errors.list[key] = errors.list[key] || {};
        errors.list[key].specimen = errors.specimen;
      }

      if (Object.keys(errors.specimen).length == 0) {
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
            saveChildContainer={this.saveChildContainer}
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
            saveChildContainer={this.saveChildContainer}
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
        toggleCollapse={this.toggleCollapse}
        loadFilters={this.loadFilters}
        loadOptions={this.loadOptions}
        setCurrent={this.setCurrent}
        setContainerList={this.setContainerList}
        setSpecimenList={this.setSpecimenList}
        setContainerList={this.setContainerList}
        setBarcodeList={this.setBarcodeList}
        addListItem={this.addListItem}
        copyListItem={this.copyListItem}
        removeListItem={this.removeListItem}
        saveContainerList={this.saveContainerList}
        saveSpecimenList={this.saveSpecimenList}
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
