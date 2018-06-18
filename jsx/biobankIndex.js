/* global ReactDOM */

import Loader from 'Loader';
import BiobankFilter from './filter';
import BiobankSpecimen from './specimen';
import BiobankContainer from './container';

class BiobankIndex extends React.Component {
  constructor() {
    super();

    this.state = {
      specimenFilter: {},
      containerDataTable: {},
      containerFilter: {},
      containerDataTable: {},
      data: {},
      specimen: {},
      container: {},
      page: '',
      options: {},
      files: {},
      isLoaded: false,
      editable: {
        specimenForm: false,
        containerForm: false,
        aliquotForm: false,
        containerParentForm: false,
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
    this.loadDataTables           = this.loadDataTables.bind(this);
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
    this.edit                     = this.edit.bind(this);
    this.close                    = this.close.bind(this);
    this.setSpecimen              = this.setSpecimen.bind(this);
    this.revertSpecimen           = this.revertSpecimen.bind(this);
    this.setContainer             = this.setContainer.bind(this);
    this.revertContainer          = this.revertContainer.bind(this);
    this.setFiles                 = this.setFiles.bind(this)
    this.addPreparation           = this.addPreparation.bind(this);
    this.addAnalysis              = this.addAnalysis.bind(this);
    this.saveSpecimen             = this.saveSpecimen.bind(this);
    this.saveContainer            = this.saveContainer.bind(this);
    this.saveChildContainer       = this.saveChildContainer.bind(this);
    this.save                     = this.save.bind(this);
  }

  componentDidMount() {
    this.loadDataTables().then(this.loadOptions().then(() => {
      this.setState({isLoaded: true, page: 'filter'});
    }));
  }

  loadDataTables() {
    return new Promise(resolve => {
      this.loadContainerDataTable().then(this.loadSpecimenDataTable().then(() => resolve()));
    });
  }

  loadContainerDataTable() {
    return new Promise(resolve => {
      this.fetch(this.props.specimenFilterDataURL).then(
        data => {
          let specimenDataTable = data;
          this.setState({specimenDataTable}, resolve())
        }
      );
    });
  }

  loadSpecimenDataTable() {
    return new Promise(resolve => {
      this.fetch(this.props.containerFilterDataURL).then(
        data => {
          let containerDataTable = data;
          this.setState({containerDataTable}, resolve());
        }
      );
    });
  }

  loadOptions() {
    return new Promise(resolve => {
      this.fetch(this.props.optionsURL).then(
        data => {
          let options = data;
          this.setState({options}, resolve());
        }
      );
    });
  }

  loadContainer(barcode) {
    return new Promise(resolve => {
      this.fetch(this.props.containerDataURL+barcode).then(
        data => {
          let container = this.clone(data.container);
          let page = 'container';
          this.setState({data, container, page}, resolve());
        }
      );
    });
  }

  loadSpecimen(barcode) {
    return new Promise(resolve => {
      this.fetch(this.props.specimenDataURL+barcode).then(
        data => {
          let specimen = this.clone(data.specimen);
          let container = this.clone(data.container);
          let page = 'specimen';
          this.setState({data, specimen, container, page}, resolve());
        }
      );
    });
  }

  fetch(url) {
    return new Promise(resolve => {
      $.ajax(url, {
        dataType: 'json',
        success: data => {
          resolve(data);
        },
        error: (error, errorCode, errorMsg) => {
          console.error(error, errorCode, errorMsg);
        }
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
    this.close();
    let editable = this.state.editable;
    editable[stateKey] = true;
    this.setState({editable});
  }

  close() {
    let editable = this.state.editable;
    for (let key in editable) {
      editable[key] = false;
    }
    this.state.data.specimen && this.revertSpecimen();
    this.revertContainer();
    this.setState({editable});

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

  setFiles(name, value) {
    let files = this.state.files;
    files[value.name] = value;
    this.setState({files});
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
    this.save(specimen, this.props.saveSpecimenURL, 'Specimen Save Successful!').then(
      () => {
        let data = this.state.data;
        data.specimen = this.clone(this.state.specimen);
        this.setState({data});
        this.close();
      }
    );
  }

  saveContainer() {
    let container = this.state.container;
    this.save(container, this.props.saveContainerURL, 'Container Save Successful!').then(
      () => {
        let data = this.state.data;
        data.container = this.clone(this.state.container);
        this.setState({data});
        this.close();
      }
    );
  }
  
  saveChildContainer(container) {
    this.save(container, this.props.saveContainer).then(
      () => {
        let options = this.state.options;
        let data    = this.state.data;
        options.containerCoordinates[data.container.id][container.coordinate] = container.id;
        if (data.childContainers[container.id].coordinate) {
          delete options.containerCoordinates[data.container.id][data.childContainers[container.id].coordinate];
        } else {
          delete options.containerCoordinates[data.container.id].Unassigned.indexOf[data.container.id];
        }

        data.childContainers[container.id] = this.clone(container);
        this.setState({options, data});
      }
    )
  }

  save(data, url, message) {
    return new Promise(resolve => {
      let dataObject = new FormData();
      for (let file in this.state.files) {
        dataOject.append(this.state.files[file].name, this.state.files[file]);
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
          message && swal(message, '', 'success');
        },
        error: (error, textStatus, errorThrown) => {
          let message = (error.responseJSON||{}).message || 'Submission error!';
          swal(message, '', 'error');
          console.error(error, textStatus, errorThrown);
        }
      });
    });
  }

  render() {
    if (this.state.error !== undefined) {
      return (
        <div className='alert alert-danger text-center'>
          <strong>
            {this.state.error}
          </strong>
        </div>
      );
    }

    if (!this.state.isLoaded) {
      return (
        <Loader/>
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
            editable={this.state.editable}
            loadContainer={this.loadContainer}
            loadSpecimen={this.loadSpecimen}
            mapFormOptions={this.mapFormOptions}
            setContainer={this.setContainer}
            revertContainer={this.revertContainer}
            saveContainer={this.saveContainer}
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
            editable={this.state.editable}
            loadContainer={this.loadContainer}
            loadSpecimen={this.loadSpecimen}
            mapFormOptions={this.mapFormOptions}
            setContainer={this.setContainer}
            revertContainer={this.revertContainer}
            saveContainer={this.saveContainer}
            setSpecimen={this.setSpecimen}
            revertSpecimen={this.revertSpecimen}
            saveSpecimen={this.saveSpecimen}
            addPreparation={this.addPreparation}
            addAnalysis={this.addAnalysis}
            saveChildContainer={this.saveChildContainer}
            edit={this.edit}
            close={this.close}
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
            editable={this.state.editable}
            loadContainer={this.loadContainer}
            loadSpecimen={this.loadSpecimen}
            updateSpecimenFilter={this.updateSpecimenFilter}
            updateContainerFilter={this.updateContainerFilter}
            mapFormOptions={this.mapFormOptions}
            edit={this.edit}
            close={this.close}
            save={this.save}
            saveBarcodeListURL={this.props.saveBarcodeListURL}
          />
        );
    }

    return (
      <div className="barcode-page">
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
        saveBarcodeListURL={`${submit}action=saveBarcodeList`}
      />
    </div>
  );
  ReactDOM.render(biobankIndex, document.getElementById("lorisworkspace"));
});
