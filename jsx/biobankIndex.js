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
      files: {},

      containerList: {1: {}},
      countContainers: 1,
      collapsed: {1: true},
      copyMultiplier: 1,
      coordinate: null,
      sequential: false,
      checkoutList: {},

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
        location: false,
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
    this.revertParameters         = this.revertParameters.bind(this);
    this.setSpecimen              = this.setSpecimen.bind(this);
    this.revertSpecimen           = this.revertSpecimen.bind(this);
    this.setContainerList         = this.setContainerList.bind(this);
    this.addContainer             = this.addContainer.bind(this);
    this.copyContainer            = this.copyContainer.bind(this);
    this.removeContainer          = this.removeContainer.bind(this);
    this.setContainer             = this.setContainer.bind(this);
    this.revertContainer          = this.revertContainer.bind(this);
    this.setCopyMultiplier        = this.setCopyMultiplier.bind(this);
    this.setSiteId                = this.setSiteId.bind(this);
    this.setCoordinate            = this.setCoordinate.bind(this);
    this.setSequential            = this.setSequential.bind(this);
    this.setCheckoutList          = this.setCheckoutList.bind(this);
    this.setFiles                 = this.setFiles.bind(this)
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
        this.revertParameters();
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

  toggleCollapse(key) {
    let collapsed = this.state.collapsed;
    collapsed[key] = !collapsed[key];
    this.setState({collapsed});
  }

  edit(stateKey) {
    this.close().then(() => {
      let editable = this.state.editable;
      editable[stateKey] = true;
      this.setState({editable});
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
      this.revertParameters();
      this.setState({editable}, resolve());
    });
  }

  revertParameters() {
    //TODO: these should be moved to another function
    let coordinate = this.state.coordinate;
    coordinate = null;
    let sequential = this.state.sequential;
    sequential = false;
    let checkoutList = this.state.checkoutList;
    checkoutList = {};
    let containerList = this.state.containerList;
    containerList = {1: {}};
    let countContainers = this.state.countContainers;
    countContainers = 1;
    let collapsed = this.state.collapsed;
    collapsed = {1: true};
    let copyMultiplier = this.state.copyMultiplier;
    copyMultiplier = 1;
    let siteId = this.state.siteId;
    siteId = null;
    let errors = this.state.errors;
    errors = {container:{}, specimen:{}, list:{}};

    this.setState({
      coordinate,
      sequential,
      checkoutList,
      containerList,
      countContainers,
      collapsed,
      copyMultiplier,
      siteId,
      errors
    });
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

  setContainerList(name, value, key) {
    let containerList = this.state.containerList;
    containerList[key][name] = value;
    this.setState({containerList});
  }

  addContainer() {
    let containerList = this.state.containerList;
    let countContainers = this.state.countContainers;
    let collapsed = this.state.collapsed;

    countContainers++;
    containerList[countContainers] = {};
    collapsed[countContainers] = true;

    this.setState({containerList, countContainers, collapsed});
  }

  copyContainer(key) {
    let countContainers = this.state.countContainers;
    let collapsed = this.state.collapsed;
    let containerList = this.state.containerList;
    let multiplier = this.state.copyMultiplier;

    countContainers++;
    for (let i=1; i<=multiplier; i++) {
      containerList[countContainers] = this.clone(containerList[key]);
      delete containerList[countContainers].barcode;
      collapsed[countContainers] = true;
      countContainers++;
    }

    this.setState({containerList, countContainers, collapsed});
  }

  removeContainer(key) {
    let containerList = this.state.containerList;
    delete containerList[key]
    this.setState({containerList});
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

  setCopyMultiplier(e) {
    let copyMultiplier = e.target.value;
    this.setState({copyMultiplier});
  }
 
  setSiteId(name, value) {
    let siteId = this.state.siteId;
    siteId = value;
    this.setState({siteId});
  }

  setCoordinate(value) {
    let coordinate = this.state.coordinates;
    coordinate = value;
    this.setState({coordinate});
  }

  setSequential(name, value) {
    let sequential = this.state.sequential;
    sequential = value;
    this.setState({sequential});
  }

  setFiles(name, value) {
    let files = this.state.files;
    files[value.name] = value;
    this.setState({files});
  }

  setCheckoutList(container) {
    let checkoutList = this.state.checkoutList;
    checkoutList[container.coordinate] = container;
    this.setState({checkoutList});
  }
  
  addPreparation() {
    let specimen = this.state.specimen;
    specimen.preparation = {locationId: this.state.data.container.locationId};
    this.setState({specimen});
  }

  addAnalysis() {
    let specimen = this.state.specimen;
    specimen.analysis = {locationId: this.state.data.container.locationId};
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
    let containerList = this.state.containerList;
    let availableId = Object.keys(this.state.options.containerStati).find(
      key => this.state.options.containerStati[key].status === 'Available'
    );
    let containerListValidation = [];

    Object.entries(containerList).map(([key, container]) => {
      container.statusId = availableId;
      container.temperature = 20;
      container.originId = this.state.siteId;
      container.locationId = this.state.siteId;

      containerListValidation.push(this.validateContainer(container, key));
    });

    Promise.all(containerListValidation).then(()=> {
      this.save(containerList, this.props.saveContainerListURL, 'Container Creation Successful!').then(
        () => {this.close(); this.loadFilters(); this.loadOptions();}
      );
    }).catch(()=>{});
  }

  save(data, url, message) {
    return new Promise(resolve => {
      let dataObject = new FormData();
      for (let file in this.state.files) {
        dataObject.append(this.state.files[file].name, this.state.files[file]);
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

  validateContainer(container, key) {
    return new Promise((resolve, reject) => {
      let errors = this.state.errors;
      errors.container = {};

      let required = [
        'barcode',
        'typeId',
        'temperature',
        'statusId',
        'locationId',
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

      required.map(field => {
        if (!container[field]) {
          errors.container[field] = 'This field is required! ';
        }
      });

      Object.values(this.state.options.containers).map(c => {
        if (container.barcode === c.barcode) {
          errors.container.barcode = 'Barcode must be unique';
        }
      });

      if (key) {
        errors.list[key] = {};
        errors.list[key].container = errors.container;
      }

      if (Object.keys(errors.container).length == 0) {
        this.setState({errors}, resolve());
      } else {
        this.setState({errors}, reject());
      }
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
        'locationId',
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
        if (container.barcode === c.barcode) {
          errors.container.barcode = 'Barcode must be unique';
        }
      });

      if (key) {
        errors.list[key] = {};
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
        'containerId',
        'typeId',
        'quantity',
        'unitId',
        'candidateId',
        'sessionId',
        'collection',
      ]

      let float = [
        'quantity',
      ]

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

      if (key) {
        errors.list[key] = {};
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
              coordinate={this.state.coordinate}
              sequential={this.state.sequential}
              checkoutList={this.state.checkoutList}
              editable={this.state.editable}
              loadContainer={this.loadContainer}
              loadSpecimen={this.loadSpecimen}
              loadFilters={this.loadFilters}
              mapFormOptions={this.mapFormOptions}
              setContainer={this.setContainer}
              revertContainer={this.revertContainer}
              saveContainer={this.saveContainer}
              setCoordinate={this.setCoordinate}
              setSequential={this.setSequential}
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
            files={this.state.files}
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
            setFiles={this.setFiles}
            saveChildContainer={this.saveChildContainer}
            saveBarcodeListURL={this.props.saveBarcodeListURL}
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
            errors={this.state.errors}
            collapsed={this.state.collapsed}
            editable={this.state.editable}
            siteId={this.state.siteId}
            containerList={this.state.containerList}
            copyMultiplier={this.state.copyMultiplier}
            loadContainer={this.loadContainer}
            loadSpecimen={this.loadSpecimen}
            updateSpecimenFilter={this.updateSpecimenFilter}
            updateContainerFilter={this.updateContainerFilter}
            mapFormOptions={this.mapFormOptions}
            clone={this.clone}
            edit={this.edit}
            close={this.close}
            toggleCollapse={this.toggleCollapse}
            loadFilters={this.loadFilters}
            loadOptions={this.loadOptions}
            setCopyMultiplier={this.setCopyMultiplier}
            setSiteId={this.setSiteId}
            setContainerList={this.setContainerList}
            addContainer={this.addContainer}
            copyContainer={this.copyContainer}
            removeContainer={this.removeContainer}
            saveContainerList={this.saveContainerList}
            save={this.save}
            saveBarcodeListURL={this.props.saveBarcodeListURL}
            validateContainer={this.validateContainer}
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
        saveBarcodeListURL={`${submit}action=saveBarcodeList`}
      />
    </div>
  );
  ReactDOM.render(biobankIndex, document.getElementById("lorisworkspace"));
});
