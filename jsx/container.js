/* exported RBiobankContainer */

import Loader from 'Loader';
import FormModal from 'FormModal';
import TemperatureField from './temperatureField';
import ContainerParentForm from './containerParentForm';
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
  constructor(props) {
    super(props);

    this.state = {
      data: {},
      isLoaded: false,
      loadedData: 0,
      editTemperature: false
    };

    this.fetchContainerData = this.fetchContainerData.bind(this);
    this.fetchOptions = this.fetchOptions.bind(this);
    this.setContainerData = this.setContainerData.bind(this);
    this.saveContainer = this.saveContainer.bind(this);
    this.toggle = this.toggle.bind(this);
    this.submitCoordinate = this.submitCoordinate.bind(this);
    this.updateCoordinate = this.updateCoordinate.bind(this);
    this.drag = this.drag.bind(this);

    $('[data-toggle="tooltip"]').tooltip();
  }

  componentDidMount() {
    this.fetchContainerData();
    this.fetchOptions();
  }

  fetchContainerData() {
    var self = this;
    $.ajax(this.props.containerPageDataURL, {
      dataType: 'json',
      success: function(data) {
        let container = JSON.parse(JSON.stringify(data.container));
        self.setState({
          data: data,
          container: container,
          isLoaded: true
        });
      },
      error: function(error, errorCode, errorMsg) {
        console.error(error, errorCode, errorMsg);
        self.setState({
          error: 'An error occurred when loading the form!'
        });
      }
    });
  }

  fetchOptions() {
    var self = this;
    $.ajax(this.props.optionsURL, {
      dataType: 'json',
      success: function(data) {
        self.setState({
          options: data,
          isLoaded: true,
        });
      },
      error: function(error, errorCode, errorMsg) {
        console.error(error, errorCode, errorMsg);
        self.setState({
          error: 'An error occurred when loading the form!'
        });
      }
    });
  }

  saveContainer() {                                                                
    let container = this.state.container;                                          
    let containerObj = new FormData();                                             
    for (let key in container) {                                                   
      if(container[key] !== "") {                                                  
        containerObj.append(key, container[key]);                                  
      }                                                                            
    }                                                                              
                                                                                   
    $.ajax({                                                                       
      type: 'POST',                                                                
      url: this.props.saveContainer,                                               
      data: containerObj,                                                          
      cache: false,                                                                
      contentType: false,                                                          
      processData: false,                                                          
      xhr: function() {                                                            
        let xhr = new window.XMLHttpRequest();                                     
        return xhr;                                                                
      }.bind(this),                                                                
      success: function() {                                                        
        let data = this.state.data;                                                
        data.container = JSON.parse(JSON.stringify(this.state.container));         
        this.setState({data: data, editTemperature: false})                        
        swal("Save Successful!", "", "success");                                   
      }.bind(this),                                                                
      error: function(err) {                                                       
        console.error(err);                                                        
        let msg = err.responseJSON ? err.responseJSON.message : "Specimen error!";
        this.setState({                                                            
          errorMessage: msg,                                                       
        });                                                                        
        swal(msg, '', "error");                                                    
      }.bind(this)                                                                 
    });                                                                            
  }  

  setContainerData(name, value) {
    let container = this.state.container;

    if (name === 'parentContainerId') {
      delete container['coordinate'];
    }

    container[name] = value;


    this.setState({container});
  }

  toggle(stateKey) {
    let stateValue = this.state[stateKey];
    this.setState({
      [stateKey]: !stateValue
    });
  }

  updateCoordinate(container, newCoordinate) {
    let childContainers = this.state.data.childContainers;
    let containerCoordinates = this.state.options.containerCoordinates;
    let data = this.state.data;
    let options = this.state.options;
    
    container = JSON.parse(container);
    childContainers[container.id].coordinate = newCoordinate;
    containerCoordinates[data.container.id][newCoordinate] = container.id;

    // we can also set container.coordinate to 'previousCoordinate'
    if (container.coordinate) {
      delete containerCoordinates[data.container.id][container.coordinate];
    } else {
      delete containerCoordinates[data.container.id].Unassigned.indexOf[container.id];
    }

    data.childContainers = childContainers;
    options.containerCoordinates = containerCoordinates;

    this.setState({data, options});
  }

  submitCoordinate(container, newCoordinate) {
    console.log(container);
    let formData = {'parentContainerId': this.state.data.container.id, 
                    'container': container,
                    'coordinate': newCoordinate}

    let formObj = new FormData();
    for (let key in formData) {
      if (formData[key] !== "") {
        formObj.append(key, formData[key]);
      }   
    }  

    $.ajax({
      type: 'POST',
      url: `${loris.BaseURL}/biobank/ajax/submitData.php?action=updateContainerParent`,
      data: formObj, 
      cache: false,
      contentType: false,
      processData: false,
      xhr: function() {
        let xhr = new window.XMLHttpRequest();
        return xhr;
      }.bind(this),
      success: function() {
        this.updateCoordinate(container, newCoordinate);
      }.bind(this),
      error: function(err) {
        console.error(err);
        let msg = err.responseJSON ? err.responseJSON.message : "Error!";
        swal(msg, "", "error");
      }
    });
  }

  drag(e) {
    let container = JSON.stringify(this.state.data.childContainers[e.target.id]);
    e.dataTransfer.setData("text/plain", container);
  }

  render() {
    // Data loading error
    if (this.state.error !== undefined) {
      return (
        <div className="alert alert-danger text-center">
          <strong>
            {this.state.error}
          </strong>
        </div>
      );
    }

    // Waiting for data to load
    if (!this.state.isLoaded) {
      return (
        <Loader/>
      );
    }

	//checks if parent container exists and returns static element with href
    let parentContainerBarcodeValue
	if (this.state.data.container.parentContainerId) {
	  var containerURL = loris.BaseURL+"/biobank/container/?barcode=";
	  parentContainerBarcodeValue = (
        <div>
          <a 
          className='value'
            href={containerURL+this.state.data.parentContainers[0].barcode}
          >
            {this.state.data.parentContainers[0].barcode}
	      </a> 
          {'Coordinate '+(this.state.data.container.coordinate ? this.state.data.container.coordinate : 'Unassigned')}
        </div>
	  );
	} else {
      parentContainerBarcodeValue = (
        <div className='value'>
          None
	    </div> 
      );
    }	
    var parentContainerBarcode = (
      <div className="item">
        <div className='field'>
          Parent Container
          {parentContainerBarcodeValue}
        </div>
        <div className='action' data-toggle='tooltip' title='Move Container' data-placement='right'>
          <FormModal
            title='Update Parent Container'
            buttonClass='action-button update'
            buttonContent={<span className='glyphicon glyphicon-chevron-right'/>}   
          >   
            <ContainerParentForm
              container={this.state.container}
              containersNonPrimary={this.state.options.containersNonPrimary}
              containerDimensions={this.state.options.containerDimensions}
              containerCoordinates={this.state.options.containerCoordinates}
              containerTypes={this.state.options.containerTypes}
              containerStati={this.state.options.containerStati}
              setContainerData={this.setContainerData}
              saveContainer={this.saveContainer}
            />  
          </FormModal>
        </div>
      </div>
    );


   let temperatureField;
   if (!this.state.editTemperature) {
     temperatureField = (
        <div className="item">                                                  
          <div className='field'>                                               
            Temperature                                                         
            <div className='value'>                                             
              {this.state.data.container.temperature + '°C'}                    
            </div>                                                              
          </div>                                                                
          <div                                                                  
            className='action'                                                  
            data-toggle='tooltip'                                               
            title='Update Temperature'                                          
            data-placement='right'                                              
          >                                                                     
            <span                                                               
              className='action-button update'                                  
              onClick={() => this.toggle('editTemperature')}                              
            >                                                                   
              <span className='glyphicon glyphicon-chevron-right'/>             
            </span>                                                             
          </div>                                                                
        </div>           
     );
     } else {                                                                    
      temperatureField = (                                                      
        <div className="item">                                                  
          <div className='field'>                                               
            Temperature                                                         
            <TemperatureField                                                   
              className='centered-horizontal'                                   
              container={this.state.container}                                  
              toggleEditTemperature={() => this.toggle('editTemperature')}
              setContainerData={this.setContainerData}                          
              saveContainer={this.saveContainer}                                
            />                                                                  
          </div>                                                                
        </div>                                                                  
      )                                                                         
    }                 
 

   let globals = ( 
      <div className="globals">
        <div className='list'>
          <div className="item">
            <div className='field'>
              Type
              <div className='value'>
                {this.state.options.containerTypes[this.state.data.container.typeId].label}
              </div>
            </div>
          </div>
          {temperatureField}
          <div className="item">
            <div className='field'>
              Status
              <div className='value'>
                {this.state.options.containerStati[this.state.data.container.statusId].status}
              </div>
            </div>
            <div className='action'>
              <FormModal
                title='Update'
                buttonClass='action-button update'
                buttonContent={<span className='glyphicon glyphicon-chevron-right'/>}       
              />      
            </div>  
          </div>
          <div className="item">
            <div className='field'>
              Location
              <div className='value'>
                {this.state.options.sites[this.state.data.container.locationId]}
              </div>
            </div>
            <div className='action'>
              <FormModal
                title='Update'
                buttonClass='action-button update'
                buttonContent={<span className='glyphicon glyphicon-chevron-right'/>}
              />      
            </div>  
          </div>
          <div className="item">
            <div className='field'>
              Origin
              <div className='value'>
                {this.state.options.sites[this.state.data.container.originId]}
              </div>
            </div>
          </div>
          <div className="item">
            <div className='field'>
              Creation Date
              <div className='value'>
                {this.state.data.container.dateTimeCreate}
              </div>
            </div>
          </div>
          {parentContainerBarcode}
        </div>
      </div>
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
          updateParent = {this.submitCoordinate}
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
            containerId={this.state.data.container.id}
            parentContainerId={this.state.data.container.parentContainerId}
            refreshParent={this.fetchContainerData}
          />
          <LifeCycle
            container={this.state.data.container}
            sites={this.state.options.sites}
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

var RBiobankContainer = React.createFactory(BiobankContainer);

window.BiobankContainer = BiobankContainer;
window.RBiobankContainer = RBiobankContainer;

export default BiobankContainer;
