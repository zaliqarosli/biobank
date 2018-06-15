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

    this.drag = this.drag.bind(this);
  }

  drag(e) {
    let container = JSON.stringify(this.props.data.childContainers[e.target.id]);
    e.dataTransfer.setData("text/plain", container);
  }

  render() {
    let globals = ( 
      <Globals
        container={this.props.container}
        data={this.props.data}
        options={this.props.options}
        editable={this.props.editable}
        edit={this.props.edit}
        close={this.props.close}
        mapFormOptions={this.props.mapFormOptions}
        loadSpecimen={this.props.loadSpecimen}
        loadContainer={this.props.loadContainer}
        setContainer={this.props.setContainer}
        saveContainer={this.props.saveContainer}
      />
    );  

    let barcodePath = (
      <BarcodePath
        container={this.props.data.container}
        parentContainers={this.props.data.parentContainers}
        loadContainer={this.props.loadContainer}
      />
    );

    let display;
    if (this.props.data.container.dimensionId) {  
      display = (
        <ContainerDisplay 
          children={this.props.data.childContainers}
          types={this.props.options.containerTypes}
          dimensions={this.props.options.containerDimensions[this.props.data.container.dimensionId]}
          coordinates={this.props.options.containerCoordinates[this.props.data.container.id] ? this.props.options.containerCoordinates[this.props.data.container.id] : null}
          containerTypes={this.props.options.containerTypes}
          containerStati={this.props.options.containerStati}
          loadSpecimen={this.props.loadSpecimen}
          loadContainer={this.props.loadContainer}
          saveChildContainer={this.props.saveChildContainer}
        />
      );
    }

    let listAssigned = [];
    let listUnassigned = [];
    if (this.props.data.childContainers) {
      let children = this.props.data.childContainers;
      for (let child in children) {
        let load;
        if (this.props.options.containerTypes[children[child].typeId].primary) {
          load = this.props.loadSpecimen;
          //url = loris.BaseURL+"/biobank/specimen/?barcode="+children[child].barcode;
        } else {
          load = this.props.loadContainer;
          //url = loris.BaseURL+"/biobank/container/?barcode="+children[child].barcode;
        }

        if (children[child].coordinate) {
          listAssigned.push(
            <div>
              <a onClick={()=>load(children[child].barcode)}>
                {children[child].barcode}
              </a>
              at {children[child].coordinate}
            </div>
          );    
        } else {
          listUnassigned.push(
            <a 
              onClick={()=>load(children[child].barcode)}
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
                <strong>{this.props.data.container.barcode}</strong> 
              </div> 
            </div> 
          </div> 
          <ContainerCheckout 
            container={this.props.container}
            setContainer={this.props.setContainer}
            saveContainer={this.props.saveContainer}
          />
          <LifeCycle
            container={this.props.data.container}
            centers={this.props.options.centers}
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
