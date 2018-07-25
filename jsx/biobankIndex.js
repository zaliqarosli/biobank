/* global ReactDOM */

import Loader from 'Loader';
import BiobankFilter from './filter';
import BiobankSpecimen from './specimen';
import BiobankContainer from './container';

class BiobankIndex extends React.Component {
  constructor() {
    super();

    this.state = {
      isLoaded: false,
      page: '',
      options: {},
      specimenFilter: {},
      containerDataTable: {},
      containerFilter: {},
      containerDataTable: {},
      data: {},
      specimen: {},
      container: {},
      current: {
        files: {},
        coordinate: null,
        sequential: false,
        candidateId: null,
        centerId: null,
        sessionId: null,
        list: {},
        count: null,
        collapsed: {},
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
    this.loadContainer            = this.loadContainer.bind(this);
    this.loadSpecimen             = this.loadSpecimen.bind(this);
    this.fetch                    = this.fetch.bind(this);
    this.updateSpecimenFilter     = this.updateSpecimenFilter.bind(this);
    this.updateContainerFilter    = this.updateContainerFilter.bind(this);
    this.clone                    = this.clone.bind(this);
    this.mapFormOptions           = this.mapFormOptions.bind(this);
    this.toggleCollapse           = this.toggleCollapse.bind(this);
    this.edit                     = this.edit.bind(this);
    this.close                    = this.close.bind(this);
    this.setCurrent               = this.setCurrent.bind(this);
    this.revertCurrent            = this.revertCurrent.bind(this);
    this.setSpecimenList          = this.setSpecimenList.bind(this);
    this.addListItem              = this.addListItem.bind(this);
    this.copyListItem             = this.copyListItem.bind(this);
    this.removeListItem           = this.removeListItem.bind(this);
    this.saveSpecimenList         = this.saveSpecimenList.bind(this);
    this.setSpecimen              = this.setSpecimen.bind(this);
    this.revertSpecimen           = this.revertSpecimen.bind(this);
    this.setContainerList         = this.setContainerList.bind(this);
    this.setContainer             = this.setContainer.bind(this);
    this.revertContainer          = this.revertContainer.bind(this);
    this.setCheckoutList          = this.setCheckoutList.bind(this);
    this.addPreparation           = this.addPreparation.bind(this);
    this.addAnalysis              = this.addAnalysis.bind(this);
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
          this.setState({page: 'filter'}, resolve());
        })
      )
    });
  }

  loadSpecimenDataTable() {
    return new Promise(resolve => {
      this.fetch(this.props.specimenFilterDataURL).then(data => {
        let specimenDataTable = data;
        this.setState({specimenDataTable}, resolve());
      });
    });
  }

  loadContainerDataTable() {
    return new Promise(resolve => {
      this.fetch(this.props.containerFilterDataURL).then(data => {
        let containerDataTable = data;
        this.setState({containerDataTable}, resolve());
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

  loadContainer(barcode) {
    return new Promise(resolve => {
      this.fetch(this.props.containerDataURL+barcode).then(data => {
        let container = this.clone(data.container);
        let page = 'container';
        this.close();
        this.setState({data, container, page}, resolve());
      });
    });
  }

  loadSpecimen(barcode) {
    return new Promise(resolve => {
      this.fetch(this.props.specimenDataURL+barcode).then(data => {
        let specimen = this.clone(data.specimen);
        let container = this.clone(data.container);
        let page = 'specimen';
        this.setState({data, specimen, container, page}, resolve());
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
    this.setState({specimenFilter});
  }

  updateContainerFilter(containerFilter) {
    this.setState({containerFilter});
  }

  clone(object) {
    return JSON.parse(JSON.stringify(object));
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

      this.state.data.specimen && this.revertSpecimen();
      this.state.data.container && this.revertContainer();
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
    let list = this.state.current.list
    list[container.coordinate] = container;
    this.setCurrent('list', list);
  }
  
  setCurrent(name, value) {
    let current = this.state.current;
    current[name] = value;
    this.setState({current});
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
    let specimen = this.state.specimen;
    specimen[name] = value;
    this.setState({specimen});
  }

  revertSpecimen() {
    let specimen = this.state.specimen;
    specimen = this.clone(this.state.data.specimen);
    this.setState({specimen});
  }

  setContainer(name, value) {
    let container = this.state.container;
    value ? container[name] = value : delete container[name]; 
    this.setState({container});
  }

  revertContainer() {
    let container = this.state.container;
    container = this.clone(this.state.data.container);
    this.setState({container});
  }

  addPreparation() {
    let specimen = this.state.specimen;
    specimen.preparation = {centerId: this.state.data.container.centerId};
    this.setState({specimen});
  }

  addAnalysis() {
    let specimen = this.state.specimen;
    specimen.analysis = {centerId: this.state.data.container.centerId};
    this.setState({specimen});
  }

  saveSpecimen() {
    let specimen = this.state.specimen;
    this.validateSpecimen(specimen).then(() => {
      this.save(specimen, this.props.saveSpecimenURL, 'Specimen Save Successful!').then(() => {
        let data = this.state.data;
        data.specimen = this.clone(this.state.specimen);
        this.setState({data}, ()=>{this.close()});
      }
      );
    });
  }

  saveSpecimenList() {
    let specimenList = this.clone(this.state.current.list);
    let availableId = Object.keys(this.state.options.containerStati).find(
      key => this.state.options.containerStati[key].status === 'Available'
    );
    let centerId = this.state.options.sessionCenters[this.state.current.sessionId].centerId
    let specimenListValidation = [];

    for (let key in specimenList) {
      //set container values
      let container = specimenList[key].container;
      container.statusId = availableId;
      container.temperature = 20;
      container.centerId = centerId;
      container.originId = centerId;

      //set specimen values
      let specimen = specimenList[key].specimen;
      specimen.candidateId = this.state.current.candidateId;
      specimen.sessionId = this.state.current.sessionId;
      specimen.quantity = specimen.collection.quantity;
      specimen.unitId = specimen.collection.unitId;
      specimen.collection.centerId = centerId;
      if ((this.state.options.specimenTypes[specimen.typeId]||{}).freezeThaw == 1) {
        specimen.fTCycle = 0;
      }

      //if this is an aliquot form, reset some of the values.
      //TODO: fix this later
      if (this.state.ALIQUOT) {
        specimen.candidateId = this.state.data.candidate.CandId;
        specimen.sessionId = this.state.data.session.ID;
        specimen.parentSpecimenId = this.state.data.specimen.id;
        specimen.collection.centerId = this.props.data.container.centerId;
        container.centerId = this.props.data.container.centerId;
        container.originId = this.props.data.container.centerId;
      }

      specimenList[key].container = container;
      specimenList[key].specimen = specimen;

      specimenListValidation.push(this.validateContainer(container, key));
      specimenListValidation.push(this.validateSpecimen(specimen, key));
    }

    Promise.all(specimenListValidation).then(() => {
      this.save(specimenList, this.props.saveSpecimenListURL, 'Save Successful!').then(
        () => {this.close(); this.loadFilters()}
      );
    }).catch(()=>{});
  }

  saveContainer() {
    let container = this.state.container;
    this.validateContainer(container).then(() => {
      this.save(container, this.props.saveContainerURL, 'Container Save Successful!').then(() => {
        let data = this.state.data;
        data.container = this.clone(this.state.container);
        this.setState({data}, ()=>{this.close()});
        }
      );
    });
  }
  
  saveChildContainer(container) {
    return new Promise(resolve => {
      this.save(container, this.props.saveContainerURL).then(() => {
        let data = this.state.data;
        if (container.parentContainerId === null) {
          delete data.childContainers[container.id];
        } else {
          data.childContainers[container.id] = this.clone(container);
        }
        this.setState({data}, resolve());
        }
      )
    });
  }

  saveContainerList() {
    let containerList = this.state.current.list;
    let availableId = Object.keys(this.state.options.containerStati).find(
      key => this.state.options.containerStati[key].status === 'Available'
    );
    let containerListValidation = [];

    for (let key in containerList) {
      let container = containerList[key].container;
      container.statusId = availableId;
      container.temperature = 20;
      container.originId = this.state.current.centerId;
      container.centerId = this.state.current.centerId;

      containerListValidation.push(this.validateContainer(container, key));
    }

    Promise.all(containerListValidation).then(()=> {
      this.save(containerList, this.props.saveContainerListURL, 'Container Creation Successful!').then(
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

    let display;
    switch (this.state.page) {
      case 'container':
          display = (
            <BiobankContainer
              data={this.state.data}
              options={this.state.options}
              container={this.state.container}
              errors={this.state.errors}
              current={this.state.current}
              editable={this.state.editable}
              loadContainer={this.loadContainer}
              loadSpecimen={this.loadSpecimen}
              loadFilters={this.loadFilters}
              mapFormOptions={this.mapFormOptions}
              setContainer={this.setContainer}
              revertContainer={this.revertContainer}
              saveContainer={this.saveContainer}
              setCurrent={this.setCurrent}
              setCheckoutList={this.setCheckoutList}
              saveChildContainer={this.saveChildContainer}
              edit={this.edit}
              close={this.close}
            />
          );
        break;
      case 'specimen': 
        display = (
          <BiobankSpecimen
            data={this.state.data}
            options={this.state.options}
            container={this.state.container}
            specimen={this.state.specimen}
            errors={this.state.errors}
            current={this.state.current}
            editable={this.state.editable}
            loadContainer={this.loadContainer}
            loadSpecimen={this.loadSpecimen}
            loadFilters={this.loadFilters}
            loadOptions={this.loadOptions}
            mapFormOptions={this.mapFormOptions}
            setContainer={this.setContainer}
            revertContainer={this.revertContainer}
            saveContainer={this.saveContainer}
            setSpecimen={this.setSpecimen}
            revertSpecimen={this.revertSpecimen}
            saveSpecimen={this.saveSpecimen}
            addPreparation={this.addPreparation}
            addAnalysis={this.addAnalysis}
            setCurrent={this.setCurrent}
            saveChildContainer={this.saveChildContainer}
            edit={this.edit}
            close={this.close}
            save={this.save}
          />
        );
        break;
      case 'filter':
        display = (
          <BiobankFilter
            specimenFilter={this.state.specimenFilter}
            specimenDataTable={this.state.specimenDataTable}
            containerFilter={this.state.containerFilter}
            containerDataTable={this.state.containerDataTable}
            options={this.state.options}
            current={this.state.current}
            errors={this.state.errors}
            editable={this.state.editable}
            loadContainer={this.loadContainer}
            loadSpecimen={this.loadSpecimen}
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
            addListItem={this.addListItem}
            copyListItem={this.copyListItem}
            removeListItem={this.removeListItem}
            saveContainerList={this.saveContainerList}
            saveSpecimenList={this.saveSpecimenList}
          />
        );
    }

    return (
      <div className="biobank-page">
        <div className="row">
          <div className="col-xs-12">
            {display}
          </div>
        </div>
      </div>
    );
  }
}

$(function() {
  const request = `${loris.BaseURL}/biobank/ajax/requestData.php?`;
  const submit = `${loris.BaseURL}/biobank/ajax/submitData.php?`;
  const biobankIndex = (
    <div className='page=biobank'>
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
    </div>
  );
  ReactDOM.render(biobankIndex, document.getElementById("lorisworkspace"));
});
