/* exported RBiobankContainer */

import Loader from 'Loader';
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
	if (this.state.Data.parentContainerBarcode) {
	  var containerURL = loris.BaseURL+"/biobank/container/?barcode=";
	  var parentContainerBarcode = (
          <a className="item" href={containerURL+this.state.Data.parentContainerBarcode}>
            <div className='field'>
              <div className='value'>
                {this.state.Data.parentContainerBarcode}
	          </div> 
              Parent Container
            </div>
            <div className='glyphicon glyphicon-menu-right'/>
          </a>
	  );
	} else {
      var parentContainerBarcode = (
          <div className="item">
            <div className='field'>
              <div className='value'>
                None
	          </div> 
              Parent Container
            </div>
            <div className='glyphicon glyphicon-menu-right'/>
          </div>
      );
    }	

   let globals = ( 
      <div className="globals">
        <div className='list-group'>
          <div className="item">
            <div className='field'>
              <div className='value'>
                {this.state.Data.containerTypes[this.state.Data.container.typeId].type}
              </div>
              Type
            </div>
          </div>
          <div className="item">
            <div className='field'>
              <div className='value'>
                {this.state.Data.containerStati[this.state.Data.container.statusId].status}
              </div>
              Status
            </div>
            <div className='glyphicon glyphicon-menu-right'/>
          </div>
          <div className="item">
            <div className='field'>
              <div className='value'>
                {this.state.Data.sites[this.state.Data.container.locationId]}
              </div>
              Location
            </div>
            <div className='glyphicon glyphicon-menu-right'/>
          </div>
          <div className="item">
            <div className='field'>
              <div className='value'>
                {this.state.Data.sites[this.state.Data.container.originId]}
              </div>
              Origin
            </div>
          </div>
          <div className="item">
            <div className='field'>
              <div className='value'>
                {this.state.Data.container.dateTimeCreate}
              </div>
              Creation Date
            </div>
          </div>
          {parentContainerBarcode}
        </div>
      </div>
    );  

    let list = [];
    if (this.state.Data.containerChildren) {
      let children = this.state.Data.containerChildren;
      for (let child in children) {
        let url;
        if (this.state.Data.containerTypes[children[child].typeId].primary) {
          url = loris.BaseURL+"/biobank/specimen/?barcode="+children[child].barcode;
        } else {
          url = loris.BaseURL+"/biobank/container/?barcode="+children[child].barcode;
        }

        list.push(
            <a href={url}>{children[child].barcode}</a>
        );    
      }     
    }

    return (
      <div id='container-page'> 
        <div className="container-header"> 
          <div className='container-title'> 
            <div className='barcode'> 
              <div className='value'> 
                <strong>{this.state.Data.container.barcode}</strong> 
              </div> 
              Barcode 
            </div> 
          </div> 
        </div> 
        <div className='summary'> 
          {globals} 
          <ContainerDisplay 
            dimensions = {this.state.Data.containerDimensions[this.state.Data.containerTypes[this.state.Data.container.typeId].dimensionId]}
            children = {this.state.Data.containerChildren}
            types = {this.state.Data.containerTypes}
            coordinates = {this.state.Data.containerCoordinates}
          />
          <div className='list'>
            {list}
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
