/* global ReactDOM */

import Loader from 'Loader';
import BiobankSpecimen from './specimen';
import BiobankContainer from './container';


class BarcodeIndex extends React.Component {
  constructor() {
    super();

    this.state = {
      data: {},
      specimen: {},
      container: {},
      options: {},
      files: {},
      isLoaded: false,
      editable: {
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

    this.fetch              = this.fetch.bind(this);
    this.loadOptions        = this.loadOptions.bind(this);
    this.loadContainer      = this.loadContainer.bind(this);
    this.loadSpecimen       = this.loadSpecimen.bind(this);
    this.fetch              = this.fetch.bind(this);
    this.clone              = this.clone.bind(this);
    this.mapFormOptions     = this.mapFormOptions.bind(this);
    this.edit               = this.edit.bind(this);
    this.close              = this.close.bind(this);
    this.setSpecimen        = this.setSpecimen.bind(this);
    this.revertSpecimen     = this.revertSpecimen.bind(this);
    this.setContainer       = this.setContainer.bind(this);
    this.revertContainer    = this.revertContainer.bind(this);
    this.setFiles           = this.setFiles.bind(this)
    this.addPreparation     = this.addPreparation.bind(this);
    this.addAnalysis        = this.addAnalysis.bind(this);
    this.saveSpecimen       = this.saveSpecimen.bind(this);
    this.saveContainer      = this.saveContainer.bind(this);
    this.saveChildContainer = this.saveChildContainer.bind(this);
    this.save               = this.save.bind(this);
  }

  componentDidMount() {
    //TODO: when there is a single controller this will eventually be replaced
    let url = window.location.href;
    let name = 'barcode'.replace(/[\[\]]/g, "\\$&");
    let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    let barcode = decodeURIComponent(results[2].replace(/\+/g, " "));

    this.loadOptions().then(() => this.loadContainer(barcode).then(
      () => {
        if (this.state.options.containerTypes[this.state.data.container.typeId].primary) {
          this.loadSpecimen(barcode).then(this.setState({isLoaded: true}));
        } else {
          this.setState({isLoaded: true});
        }
      }
    ));
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
          this.setState({data, container}, resolve());
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
          this.setState({data, specimen, container}, resolve());
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
    let primary = this.state.options.containerTypes[this.state.data.container.typeId].primary;
      switch (primary) {
        case 0:
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
        case 1: 
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
  const barcodeIndex = (
    <div className='page=biobank'>
      <BarcodeIndex
        specimenDataURL={`${request}action=getSpecimenData&barcode=`}
        containerDataURL={`${request}action=getContainerData&barcode=`}
        optionsURL={`${request}action=getFormOptions`}
        saveContainerURL={`${submit}action=saveContainer`}
        saveSpecimenURL={`${submit}action=saveSpecimen`}
        saveBarcodeListURL={`${submit}action=saveBarcodeList`}
      />
    </div>
  );
  ReactDOM.render(barcodeIndex, document.getElementById("lorisworkspace"));
});
