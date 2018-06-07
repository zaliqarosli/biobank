/* exported RBiobankContainer */

import Loader from 'Loader';
import Globals from './globals';
import LifeCycle from './lifeCycle.js';
import BarcodePath from './barcodePath.js';
import ContainerDisplay from './containerDisplay.js';
import ContainerCheckout from './containerCheckout.js';

/**
 * Biobank Container
 *
 * Fetches data corresponding to a given Container from Loris backend and
 * displays a page allowing viewing of meta information of the container
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 * */
class BiobankContainer extends React.Component {
  constructor() {
    super();

    this.state = {
      data: {},
      container: {},
      isLoaded: false,
      loadedData: 0,
      show: {
        containerParent: false,
      },
      edit: {
        temperature: false,
        status: false,
        location: false
      }
    };

    this.fetch = this.fetch.bind(this);
    this.loadPage = this.loadPage.bind(this);
    this.clone = this.clone.bind(this);
    this.mapFormOptions = this.mapFormOptions.bind(this);
    this.setContainerData = this.setContainerData.bind(this);
    this.revertContainerData = this.revertContainerData.bind(this);
    this.saveContainer = this.saveContainer.bind(this);
    this.saveChildContainer = this.saveChildContainer.bind(this);
    this.toggle = this.toggle.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.toggleAll = this.toggleAll.bind(this);
    this.drag = this.drag.bind(this);
    this.save = this.save.bind(this);
  }

  componentDidMount() {
    this.loadPage().then(() => {this.setState({isLoaded: true})});
  }

  loadPage() {
    return new Promise(resolve => {
      this.fetch('data', this.props.containerPageDataURL).then(
        data => {
          let container = this.clone(data.container);
          this.setState({data, container});
        }
      );
      this.fetch('options', this.props.optionsURL).then(
        data => {
          let options = data;
          this.setState({options});
        }
      );
      resolve();
    });
  }

  fetch(state, url) {
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

  mapFormOptions(rawObject, targetAttribute) {
    let data = {};
    for (let id in rawObject) {
      data[id] = rawObject[id][targetAttribute];
    }

    return data;
  }

  saveContainer() {                                                                
    let container = this.state.container;                                          
    this.save(container, this.props.saveContainer, 'Save Successful!').then(
      () => {
        let data = this.state.data;
        data.container = JSON.parse(JSON.stringify(this.state.container));
        this.setState({data})
      }
    );
  } 

  saveChildContainer(container) {
    this.save(container, this.props.saveContainer, 'Save Successful!').then(
      () => {
        //TODO: this seems like too much work. There must be an easier way
        //to adjust options.
        let options = this.state.options;
        let data = this.state.data;

        options.containerCoordinates[data.container.id][container.coordinate] = container.id;
        if (data.childContainers[container.id].coordinate) {
          delete options.containerCoordinates[data.container.id][data.childContainers[container.id].coordinate];
        } else {
          delete options.containerCoordinates[data.container.id].Unassigned.indexOf[data.container.id];
        }

        data.childContainers[container.id] = JSON.parse(JSON.stringify(container));

        this.setState({
          options,
          data
        });
      }
    );
  }

  save(data, url, message) {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: 'POST',
        url: url,
        data: {data: JSON.stringify(data)},
        cache: false,
        success: () => {
          resolve();
          this.toggleAll();
          message ? swal(message, '', 'success') : null;
        },
        error: error => {
          let msg = error.responseJSON ? error.responseJSON.message : "Submission error!";
          swal(msg, '', "error");
          console.error(error);
        }
      });
    })
  }

  setContainerData(name, value) {
    let container = this.state.container;

    //TODO: this needs to match the same function in specimen.js
    if (name === 'parentContainerId') {
      delete container['coordinate'];
    }

    if (value !== null) {
      container[name] = value;
    } else {
      delete container[name];
    }

    this.setState({container});
  }

  revertContainerData() {
    let container = this.state.container;
    container = JSON.parse(JSON.stringify(this.state.data.container));
    this.setState({
      container
    });
  }

  toggle(stateKey) {
    let edit = this.state.edit;
    let stateValue = edit[stateKey];
    edit[stateKey] = !stateValue;
    this.setState({edit});
  }

  toggleModal(stateKey) {
    let show = this.state.show;
    let stateValue = show[stateKey];
    show[stateKey] = !stateValue;
    this.setState({show});
  }

  toggleAll() {
    let edit = this.state.edit;
    for (let key in edit) {
      edit[key] = false;
    }
    let show = this.state.show;
    for (let key in show) {
      show[key] = false;
    }
    this.setState({edit, show});
  }

  drag(e) {
    let container = JSON.stringify(this.state.data.childContainers[e.target.id]);
    e.dataTransfer.setData("text/plain", container);
  }

  render() {
    // Waiting for data to load
    if (!this.state.isLoaded) {
      return (
        <Loader/>
      );
    }

   let globals = ( 
     <Globals
       container={this.state.container}
       data={this.state.data}
       options={this.state.options}
       edit={this.state.edit}
       toggle={this.toggle}
       show={this.state.show}
       toggleModal={this.toggleModal}
       mapFormOptions={this.mapFormOptions}
       setContainerData={this.setContainerData}
       revertContainerData={this.revertContainerData}
       saveContainer={this.saveContainer}
     />
   );  

    let barcodePath = (
      <BarcodePath
        container = {this.state.data.container}
        parentContainers = {this.state.data.parentContainers}
      />
    );

    let display;
    if (this.state.data.container.dimensionId) {  
      display = (
        <ContainerDisplay 
          children = {this.state.data.childContainers}
          types = {this.state.options.containerTypes}
          dimensions = {this.state.options.containerDimensions[this.state.data.container.dimensionId]}
          coordinates = {this.state.options.containerCoordinates[this.state.data.container.id] ? this.state.options.containerCoordinates[this.state.data.container.id] : null}
          containerTypes = {this.state.options.containerTypes}
          containerStati = {this.state.options.containerStati}
          saveChildContainer = {this.saveChildContainer}
        />
      );
    }

    let listAssigned = [];
    let listUnassigned = [];
    if (this.state.data.childContainers) {
      let children = this.state.data.childContainers;
      for (let child in children) {
        let url;
        if (this.state.options.containerTypes[children[child].typeId].primary) {
          url = loris.BaseURL+"/biobank/specimen/?barcode="+children[child].barcode;
        } else {
          url = loris.BaseURL+"/biobank/container/?barcode="+children[child].barcode;
        }

        if (children[child].coordinate) {
          listAssigned.push(
            <div>
              <a href={url}>{children[child].barcode}</a> at {children[child].coordinate}
            </div>
          );    
        } else {
          listUnassigned.push(
            <a 
              href={url} 
              id={children[child].id} 
              draggable={true}
              onDragStart={this.drag}
            >
              {children[child].barcode}
            </a>
          );
        }
      }     
    }

    return (
      <div id='container-page'> 
        <div className="container-header"> 
          <div className='container-title'> 
            <div className='barcode'> 
              Barcode 
              <div className='value'> 
                <strong>{this.state.data.container.barcode}</strong> 
              </div> 
            </div> 
          </div> 
          <ContainerCheckout 
            container={this.state.container}
            setContainerData={this.setContainerData}
            saveContainer={this.saveContainer}
          />
          <LifeCycle
            container={this.state.data.container}
            centers={this.state.options.centers}
          />
        </div> 
        <div className='summary'> 
          {globals} 
          <div className='display-container'>
            {display} 
            {barcodePath}
          </div>
          <div className='container-list'>
            <div className='title'>
              {listAssigned.length === 0 && listUnassigned.length === 0 ? 'This Container is Empty!' : null}
            </div>
            <div className='title'>
              {listAssigned.length !== 0 ? 'Assigned Containers' : null}
            </div>
              {listAssigned}
              {listAssigned.length !==0 ? <br/> : null}
            <div className='title'>
              {listUnassigned.length !== 0 ? 'Unassigned Containers' : null}
            </div>
            {listUnassigned}
          </div>
        </div> 
      </div> 
    ); 
  }
}

BiobankContainer.propTypes = {
  containerPageDataURL: React.PropTypes.string.isRequired,
};

let RBiobankContainer = React.createFactory(BiobankContainer);

window.BiobankContainer = BiobankContainer;
window.RBiobankContainer = RBiobankContainer;

export default BiobankContainer;
