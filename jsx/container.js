/* exported RBiobankContainer */

import Loader from 'Loader';
import FormModal from 'FormModal';
import ContainerParentForm from './containerParentForm';
import LifeCycle from './lifeCycle.js';
import ContainerDisplay from './containerDisplay.js';

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
  }

  componentDidMount() {
    this.fetchContainerData();
  }

  fetchContainerData() {
    var self = this;
    $.ajax(this.props.containerPageDataURL, {
      dataType: 'json',
      success: function(data) {
        self.setState({
          Data: data,
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
	if (this.state.Data.parentContainerBarcode) {
	  var containerURL = loris.BaseURL+"/biobank/container/?barcode=";
	  parentContainerBarcodeValue = (
        <div
        >
          <a 
          className='value'
            href={containerURL+this.state.Data.parentContainerBarcode}
          >
            {this.state.Data.parentContainerBarcode}
	      </a> 
          {this.state.Data.container.coordinate ? 'Coordinate '+this.state.Data.container.coordinate : null}
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
        <div className='action'>
          <FormModal
            title='Update Parent Container'
            buttonContent={
              <div>
                Move
                <span
                  className='glyphicon glyphicon-chevron-right'
                  style={{marginLeft: '5px'}}
                />  
              </div>
            }   
          >   
            <ContainerParentForm
              containersNonPrimary={this.state.Data.containersNonPrimary}
              containerDimensions={this.state.Data.containerDimensions}
              containerCoordinates={this.state.Data.containerCoordinates}
              container={this.state.Data.container}
              action={`${loris.BaseURL}/biobank/ajax/ContainerInfo.php?action=updateContainerParent`}
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
                {this.state.Data.containerTypes[this.state.Data.container.typeId].type}
              </div>
            </div>
          </div>
          <div className="item">
            <div className='field'>
              Status
              <div className='value'>
                {this.state.Data.containerStati[this.state.Data.container.statusId].status}
              </div>
            </div>
            <div className='action'>
              <FormModal
                title='Update'
                buttonContent={
                  <div>
                    Update
                    <span
                      className='glyphicon glyphicon-chevron-right'
                      style={{marginLeft: '5px'}}
                    />    
                  </div>  
                }       
              />      
            </div>  
          </div>
          <div className="item">
            <div className='field'>
              Location
              <div className='value'>
                {this.state.Data.sites[this.state.Data.container.locationId]}
              </div>
            </div>
            <div className='action'>
              <FormModal
                title='Ship'
                buttonContent={
                  <div>
                    Ship
                    <span
                      className='glyphicon glyphicon-chevron-right'
                      style={{marginLeft: '5px'}}
                    />
                  </div>
                }
              />
            </div>
          </div>
          <div className="item">
            <div className='field'>
              Origin
              <div className='value'>
                {this.state.Data.sites[this.state.Data.container.originId]}
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

    let display;
    if (this.state.Data.container.dimensionId) {  
      display = (
        <ContainerDisplay 
          dimensions = {this.state.Data.containerDimensions[this.state.Data.container.dimensionId]}
          children = {this.state.Data.containerChildren}
          types = {this.state.Data.containerTypes}
          coordinates = {this.state.Data.containerCoordinates[this.state.Data.container.id] ? this.state.Data.containerCoordinates[this.state.Data.container.id] : null}
          containerTypes = {this.state.Data.containerTypes}
          containerStati = {this.state.Data.containerStati}
        />
      );
    }

    let listAssigned = [];
    let listUnassigned = [];
    if (this.state.Data.containerChildren) {
      let children = this.state.Data.containerChildren;
      for (let child in children) {
        let url;
        if (this.state.Data.containerTypes[children[child].typeId].primary) {
          url = loris.BaseURL+"/biobank/specimen/?barcode="+children[child].barcode;
        } else {
          url = loris.BaseURL+"/biobank/container/?barcode="+children[child].barcode;
        }

        if (children[child].coordinate) {
          listAssigned.push(
            <div><a href={url}>{children[child].barcode}</a> at {children[child].coordinate}</div>
          );    
        } else {
          listUnassigned.push(
            <a href={url}>{children[child].barcode}</a>
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
        </div> 
        <div className='summary'> 
          {globals} 
          {display} 
          <div className='container-list'>
            <div className='title'>
              Assigned
            </div>
            {listAssigned}
            <br/>
            <div className='title'>
              Unassigned
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
