import Loader from 'Loader';
import Globals from './globals';
import LifeCycle from './lifeCycle.js';
import ContainerDisplay from './containerDisplay.js';
import ContainerCheckout from './containerCheckout.js';
import { Link } from 'react-router-dom';

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
    let container = JSON.stringify(this.props.data.containers[e.target.id]);
    e.dataTransfer.setData("text/plain", container);
  }

  getParentContainerBarcodes(barcodes, container) {
    barcodes.push(container.barcode);

    let parent = Object.values(this.props.data.containers).find(c => {
      return container.parentContainerId == c.id;
    });

    parent && this.getParentContainerBarcodes(barcodes, parent);

    return barcodes.slice(0).reverse();
  }

  render() {
    let barcodePath = []; 
    let parentBarcodes = this.getParentContainerBarcodes([], this.props.target.container);
    //TODO: try to introduce a specimen 'address' here. Aks Sonia for more details
    //on this feature
    //let parentCoordinates = 

    let globals = ( 
      <Globals
        container={this.props.current.container}
        data={this.props.data}
        target={this.props.target}
        options={this.props.options}
        errors={this.props.errors}
        editable={this.props.editable}
        edit={this.props.edit}
        close={this.props.close}
        mapFormOptions={this.props.mapFormOptions}
        editContainer={this.props.editContainer}
        setContainer={this.props.setContainer}
        saveContainer={this.props.saveContainer}
      />
    );  

    let checkoutButton;
    let display;
    if (this.props.target.container.dimensionId) {  
      //TODO: the styling here needs to be redone.

      checkoutButton = (
        <div style = {{marginLeft: 'auto', height: '10%', marginRight:'10%'}}>
          <div
            className={!this.props.editable.containerCheckout && !this.props.editable.loadContainer ?
              'action-button update open' : 'action-button update closed'}
            title='Checkout Child Containers'
            onClick={()=>{this.props.edit('containerCheckout')}}
          >
            <span className='glyphicon glyphicon-share'/>
          </div>
        </div>
      );

      //TODO: this seems a bit messy to me
      //delete values that are parents of the container
      let barcodes = this.props.mapFormOptions(this.props.data.containers, 'barcode');
      for (let key in parentBarcodes) {
        for (let i in barcodes) {
          if (parentBarcodes[key] == barcodes[i]) {
            delete barcodes[i];
          }
        }
      }

      display = (
        <ContainerDisplay 
          history={this.props.history}
          data={this.props.data}
          target={this.props.target}
          barcodes={barcodes}
          container={this.props.current.container}
          current={this.props.current}
          options={this.props.options}
          dimensions={this.props.options.containerDimensions[this.props.target.container.dimensionId]}
          coordinates={this.props.options.containerCoordinates[this.props.target.container.id] ? this.props.options.containerCoordinates[this.props.target.container.id] : null}
          editable={this.props.editable}
          edit={this.props.edit}
          close={this.props.close}
          setCurrent={this.props.setCurrent}
          setCheckoutList={this.props.setCheckoutList}
          mapFormOptions={this.props.mapFormOptions}
          editContainer={this.props.editContainer}
          saveContainer={this.props.saveContainer}
        />
      );
    }

    for (let i in parentBarcodes) {
      barcodePath.push(
        <span className='barcodePath'>
          {'/'}
          <Link to={`/barcode=${parentBarcodes[i]}`}>{parentBarcodes[i]}</Link>
        </span>
      );
    }

    let listAssigned   = [];
    let coordinateList = [];
    let listUnassigned = [];
    if (this.props.target.container.childContainerIds) {
      let children = this.props.target.container.childContainerIds;
      children.forEach(childId => {
        let child = this.props.data.containers[childId];

        if (child.coordinate) {
          listAssigned.push(
            <div><Link to={`/barcode=${child.barcode}`}>{child.barcode}</Link></div>
          ); 
          coordinateList.push(<div>at {child.coordinate}</div>);
        } else {
          listUnassigned.push(
            <Link
              to={`/barcode=${child.barcode}`}
              id={child.id} 
              draggable={true}
              onDragStart={this.drag}
            >
              {child.barcode}
            </Link>
          );
        }
      });
    }

    return (
      <div id='container-page'> 
        <div className="container-header"> 
          <div className='container-title'> 
            <div className='barcode'> 
              Barcode 
              <div className='value'> 
                <strong>{this.props.target.container.barcode}</strong> 
              </div> 
            </div> 
            <ContainerCheckout 
              container={this.props.target.container}
              current={this.props.current}
              editContainer={this.props.editContainer}
              setContainer={this.props.setContainer}
              saveContainer={this.props.saveContainer}
            />
          </div> 
        </div> 
        <div className='summary'> 
          {globals} 
          <div className='display-container'>
            {!(listAssigned.length === 0 && listUnassigned.length === 0) ? checkoutButton : null}
            {display} 
            <div>{barcodePath}</div>
          </div>
          <div className='container-list'>
            <div className='title'>
              {listAssigned.length === 0 && listUnassigned.length === 0 ? 'This Container is Empty!' : null}
            </div>
            <div className='title'>
              {listAssigned.length !== 0 ? 'Assigned Containers' : null}
            </div>
            <div className='container-coordinate'>
              <div>{listAssigned}</div>
              <div style={{paddingLeft: 10}}>{coordinateList}</div>
            </div>
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

export default BiobankContainer;
