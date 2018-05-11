/* exported RBiobankContainer */

import Loader from 'Loader';
import FormModal from 'FormModal';
import temperatureField from './temperatureField';
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
      Data: {},
      isLoaded: false,
      loadedData: 0,
    };

    this.fetchContainerData = this.fetchContainerData.bind(this);
    this.fetchOptions = this.fetchOptions.bind(this);
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
        self.setState({
          Data: data,
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

  updateCoordinate(container, newCoordinate) {
    let childContainers = this.state.Data.childContainers;
    let containerCoordinates = this.state.options.containerCoordinates;
    let Data = this.state.Data;
    let options = this.state.options;
    
    container = JSON.parse(container);
    childContainers[container.id].coordinate = newCoordinate;
    containerCoordinates[Data.container.id][newCoordinate] = container.id;

    // we can also set container.coordinate to 'previousCoordinate'
    if (container.coordinate) {
      delete containerCoordinates[Data.container.id][container.coordinate];
    } else {
      delete containerCoordinates[Data.container.id].Unassigned.indexOf[container.id];
    }

    Data.childContainers = childContainers;
    options.containerCoordinates = containerCoordinates;

    this.setState({Data, options});
  }

  submitCoordinate(container, newCoordinate) {
    console.log(container);
    let formData = {'parentContainerId': this.state.Data.container.id, 
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
    let container = JSON.stringify(this.state.Data.childContainers[e.target.id]);
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
	if (this.state.Data.container.parentContainerId) {
	  var containerURL = loris.BaseURL+"/biobank/container/?barcode=";
	  parentContainerBarcodeValue = (
        <div>
          <a 
          className='value'
            href={containerURL+this.state.Data.parentContainers[0].barcode}
          >
            {this.state.Data.parentContainers[0].barcode}
	      </a> 
          {'Coordinate '+(this.state.Data.container.coordinate ? this.state.Data.container.coordinate : 'Unassigned')}
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
              containersNonPrimary={this.state.options.containersNonPrimary}
              containerDimensions={this.state.options.containerDimensions}
              containerCoordinates={this.state.options.containerCoordinates}
              container={this.state.Data.container}
              containerTypes={this.state.options.containerTypes}
              containerStati={this.state.options.containerStati}
              action={`${loris.BaseURL}/biobank/ajax/submitData.php?action=updateContainerParent`}
              refreshParent={this.fetchContainerData}
            />  
          </FormModal>
        </div>
      </div>
    );

   let globals = ( 
      <div className="globals">
        <div className='list'>
          <div className="item">
            <div className='field'>
              Type
              <div className='value'>
                {this.state.options.containerTypes[this.state.Data.container.typeId].label}
              </div>
            </div>
          </div>
          <div className="item">
            <div className='field'>
              Temperature
              <div className='value'>
                {this.state.Data.container.temperature+'°C'}
              </div>
            </div>
            <div className='action'>
              <FormModal
                title='Update'
                buttonClass='action-button update'
                buttonContent={
                  <span
                    className='glyphicon glyphicon-chevron-right'
                  />    
                }       
              >
                <TemperatureField
                  container={this.state.Data.container}
                  action={`${loris.BaseURL}/biobank/ajax/submitData.php?action=updateContainer`}
                  refreshParent={this.fetchContainerData}
                />
              </FormModal>      
            </div>  
          </div>
          <div className="item">
            <div className='field'>
              Status
              <div className='value'>
                {this.state.options.containerStati[this.state.Data.container.statusId].status}
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
                {this.state.options.sites[this.state.Data.container.locationId]}
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
                {this.state.options.sites[this.state.Data.container.originId]}
              </div>
            </div>
          </div>
          <div className="item">
            <div className='field'>
              Creation Date
              <div className='value'>
                {this.state.Data.container.dateTimeCreate}
              </div>
            </div>
          </div>
          {parentContainerBarcode}
        </div>
      </div>
    );  

    let barcodePath = (
      <BarcodePath
        container = {this.state.Data.container}
        parentContainers = {this.state.Data.parentContainers}
      />
    );

    let display;
    if (this.state.Data.container.dimensionId) {  
      display = (
        <ContainerDisplay 
          dimensions = {this.state.options.containerDimensions[this.state.Data.container.dimensionId]}
          children = {this.state.Data.childContainers}
          types = {this.state.options.containerTypes}
          coordinates = {this.state.options.containerCoordinates[this.state.Data.container.id] ? this.state.options.containerCoordinates[this.state.Data.container.id] : null}
          containerTypes = {this.state.options.containerTypes}
          containerStati = {this.state.options.containerStati}
          updateParent = {this.submitCoordinate}
        />
      );
    }

    let listAssigned = [];
    let listUnassigned = [];
    if (this.state.Data.childContainers) {
      let children = this.state.Data.childContainers;
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
                <strong>{this.state.Data.container.barcode}</strong> 
              </div> 
            </div> 
          </div> 
          <ContainerCheckout 
            containerId={this.state.Data.container.id}
            parentContainerId={this.state.Data.container.parentContainerId}
            refreshParent={this.fetchContainerData}
          />
          <LifeCycle
            container={this.state.Data.container}
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
