import BarcodePath from './barcodePath.js';
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
 **/
class BiobankTransfer extends React.Component {
  constructor() {
    super();

    this.state = {
      containerId: undefined,
    }
    this.drag = this.drag.bind(this);
  }

  drag(e) {
    let container = JSON.stringify(this.props.data.childContainers[e.target.id]);
    e.dataTransfer.setData("text/plain", container);
  }

  render() {

    let barcodes = this.props.mapFormOptions(this.props.options.containers, 'barcode');

    let barcodeSelector = (
      <FormElement>
        <SearchableDropdown
          name='barcode'
          label='Barcode'
          options={barcodes}
          value={this.state.containerId}
          placeHolder='Please Scan or Select Barcode'
          autoFocus={true}
        />
      </FormElement>
    );

    let display;

    if (((this.props.data||{}).container||{}).dimensionId) {  
      let barcodes = this.props.mapFormOptions(this.props.options.containers, 'barcode');
      //delete values that are parents of the container
      if (this.props.data.parentContainers) {
        for (let key in this.props.data.parentContainers) {
          delete barcodes[this.props.data.parentContainers[key].id];
        }
      }
      delete barcodes[this.props.data.container.id];

      display = (
        <ContainerDisplay 
          barcodes={barcodes}
          container={this.props.container}
          coordinate={this.props.coordinate}
          sequential={this.props.sequential}
          containers={this.props.options.containers}
          children={this.props.data.childContainers}
          types={this.props.options.containerTypes}
          dimensions={this.props.options.containerDimensions[this.props.data.container.dimensionId]}
          coordinates={this.props.options.containerCoordinates[this.props.data.container.id] ? this.props.options.containerCoordinates[this.props.data.container.id] : null}
          containerTypes={this.props.options.containerTypes}
          containerStati={this.props.options.containerStati}
          editable={this.props.editable}
          edit={this.props.edit}
          close={this.props.close}
          setCoordinate={this.props.setCoordinate}
          setSequential={this.props.setSequential}
          loadSpecimen={this.props.loadSpecimen}
          loadContainer={this.props.loadContainer}
          saveChildContainer={this.props.saveChildContainer}
        />
      );
    }

    let listAssigned   = [];
    let coordinateList = [];
    let listUnassigned = [];
    if ((this.props.data||{}).childContainers) {
      let children = this.props.data.childContainers;
      for (let child in children) {
        let load;
        if (this.props.options.containerTypes[children[child].typeId].primary) {
          load = this.props.loadSpecimen;
        } else {
          load = this.props.loadContainer;
        }

        if (children[child].coordinate) {
          listAssigned.push(
            <div>
              <a onClick={()=>load(children[child].barcode)} style={{cursor:'pointer'}}>
                {children[child].barcode}
              </a>
            </div>
          ); 
          coordinateList.push(
            <div>
              at {children[child].coordinate}
            </div>

          );
        } else {
          listUnassigned.push(
            <a 
              onClick={()=>load(children[child].barcode)}
              style={{cursor:'pointer'}}
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

    let returnToFilter = (
      <div>
        <br/>
        <span className='action'>
          <div
            className='action-button update'
            onClick={this.props.loadFilters}
          >
            <span className='glyphicon glyphicon-chevron-left'/>
          </div>
        </span>
        <div className='action-title'>
          Return to Filter
        </div>
      </div>
    );

    return (
      <div id='container-page'> 
        <div className="container-header"> 
          <div className='container-title'> 
              Transfer
          </div> 
        </div> 
        <div className='summary'> 
          <div className='display-container'>
            <div>{barcodeSelector}</div>
            {display} 
          </div>
          <div className='container-staging'>
            <div className='title'>
              Staging Area
            </div>
          </div>
          <div className='display-container'>
            <div>{barcodeSelector}</div>
            {display} 
          </div>
        </div> 
        {returnToFilter}
      </div> 
    ); 
  }
}

BiobankTransfer.propTypes = {
};

export default BiobankTransfer;
