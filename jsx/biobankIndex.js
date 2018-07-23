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

      list: {},
      count: 0,
      collapsed: {},
      copyMultiplier: 1,
      coordinate: null,
      sequential: false,
      checkoutList: {},
      candidateId: null,
      centerId: null,
      sessionId: null,

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
    this.revertParameters         = this.revertParameters.bind(this);
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
    this.setCopyMultiplier        = this.setCopyMultiplier.bind(this);
    this.setCenterId              = this.setCenterId.bind(this);
    this.setSessionId             = this.setSessionId.bind(this);
    this.setCandidateId           = this.setCandidateId.bind(this);
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
      //this.revertParameters();
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
    let list = this.state.list;
    list = {};
    let count = this.state.count;
    count = 1;
    let collapsed = this.state.collapsed;
    collapsed = {1: true};
    let copyMultiplier = this.state.copyMultiplier;
    copyMultiplier = 1;
    let centerId = this.state.centerId;
    centerId = null;
    let errors = this.state.errors;
    errors = {container:{}, specimen:{}, list:{}};

    this.setState({
      coordinate,
      sequential,
      checkoutList,
      list,
      count,
      collapsed,
      copyMultiplier,
      centerId,
      errors
    });
  }

  setSpecimenList(name, value, key) {
    let list = this.state.list;
    list[key].specimen[name] = value;
    this.setState({list});
  }

  setContainerList(name, value, key) {
    let list = this.state.list;
    list[key].container[name] = value;
    this.setState({list});
  }

  addListItem(item) {
    return new Promise(resolve => {
      let list = this.state.list;
      let count = this.state.count;
      let collapsed = this.state.collapsed;

      count++;
      collapsed[count] = true;
      switch(item) {
        case 'specimen':
          list[count] = {specimen: {collection:{}}, container: {}};
          break;
        case 'container':
          list[count] = {container: {}};
          break;
      }

      this.setState({list, count, collapsed}, resolve());
    });
  }

  copyListItem(key) {
    let count = this.state.count;
    let collapsed = this.state.collapsed;
    let list = this.state.list;
    let multiplier = this.state.copyMultiplier;

    for (let i=1; i<=multiplier; i++) {
      count++;
      list[count] = this.clone(list[key]);
      list[count].container.barcode && delete list[count].container.barcode;
      collapsed[count] = true;
    }

    this.setState({list, count, collapsed});
  }

  removeListItem(key) {
    let list = this.state.list;
    delete list[key];
    this.setState({list});
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

  setCurrent(name, value) {
    let current = this.state.current;
    current[name] = value;
    this.setState({current});
  }

  setCopyMultiplier(e) {
    let copyMultiplier = this.state.copyMultiplier;
    copyMultiplier = e.target.value;
    this.setState({copyMultiplier});
  }
 
  setCandidateId(name, value) {
    let candidateId = this.state.candidateId;
    candidateId = value;
    this.setState({candidateId});
  }

  setCenterId(name, value) {
    let centerId = this.state.centerId;
    centerId = value;
    this.setState({centerId});
  }

  setSessionId(name, value) {
    let sessionId = this.state.sessionId;
    sessionId = value;
    //TODO: there must be a better way to do this.
    this.setCenterId('centerId', this.state.options.sessionCenters[sessionId].centerId);
    this.setState({sessionId});
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
    let specimenList = this.clone(this.state.list);
    let availableId = Object.keys(this.state.options.containerStati).find(
      key => this.state.options.containerStati[key].status === 'Available'
    );
    let specimenListValidation = [];

    for (let key in specimenList) {
      //set container values
      let container = specimenList[key].container;
      container.statusId = availableId;
      container.temperature = 20;
      container.centerId = this.state.centerId;
      container.originId = this.state.centerId;

      //set specimen values
      let specimen = specimenList[key].specimen;
      specimen.candidateId = this.state.candidateId;
      specimen.sessionId = this.state.sessionId;
      specimen.quantity = specimen.collection.quantity;
      specimen.unitId = specimen.collection.unitId;
      specimen.collection.centerId = this.state.centerId;
      if ((this.state.options.specimenTypes[specimen.typeId]||{}).freezeThaw == 1) {
        specimen.ftCycle = 0;
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
      this.save(specimenList, this.props.saveBarcodeListURL, 'Save Successful!').then(
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
    let containerList = this.state.list;
    let availableId = Object.keys(this.state.options.containerStati).find(
      key => this.state.options.containerStati[key].status === 'Available'
    );
    let containerListValidation = [];

    Object.entries(containerList).map(([key, container]) => {
      container.statusId = availableId;
      container.temperature = 20;
      container.originId = this.state.centerId;
      container.centerId = this.state.centerId;

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
      //TODO: Date validation will go here
      //TODO: Time validation will go here
      //TODO: Comments validation will go here
      //TODO: Custom Field validation will go here

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
            candidateId={this.state.candidateId}
            sessionId={this.state.sessionId}
            centerId={this.state.centerId}
            list={this.state.list}
            copyMultiplier={this.state.copyMultiplier}
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
            setCopyMultiplier={this.setCopyMultiplier}
            setCandidateId={this.setCandidateId}
            setCenterId={this.setCenterId}
            setSessionId={this.setSessionId}
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
        saveBarcodeListURL={`${submit}action=saveBarcodeList`}
      />
    </div>
  );
  ReactDOM.render(biobankIndex, document.getElementById("lorisworkspace"));
});
