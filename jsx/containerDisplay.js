import Modal from 'Modal'

/**
 * ContainerDisplay
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 **/

class ContainerDisplay extends React.Component {
  constructor() {
    super();
   
    this.redirectURL = this.redirectURL.bind(this);
    this.drag = this.drag.bind(this);
    this.drop = this.drop.bind(this);
    this.loadContainer = this.loadContainer.bind(this);
  }

  componentDidMount() {
    $('[data-toggle="tooltip"]').tooltip();
  }

  componenDidUpdate() {
    $('[data-toggle="tooltip"]').tooltip();
  }

  redirectURL(e) {
    let coordinate = e.target.id;
    if (this.props.coordinates[coordinate]) {
      let load = this.props.types[
        this.props.children[this.props.coordinates[coordinate]].typeId
      ].primary ? this.props.loadSpecimen : this.props.loadContainer;

      load(this.props.children[this.props.coordinates[coordinate]].barcode);
    }
  }

  allowDrop(e) {
      e.preventDefault();
  }
  
  drag(e) {
      let container = JSON.stringify(
        this.props.children[this.props.coordinates[e.target.id]]
      );
      e.dataTransfer.setData("text/plain", container);
  }
  
  drop(e) {
    e.preventDefault();

    let container = JSON.parse(e.dataTransfer.getData("text/plain"));
    let newCoordinate = parseInt(e.target.id);
   
    container.coordinate = newCoordinate;

    this.props.saveChildContainer(container);
  }

  increaseCoordinate(coordinate) {
    coordinate++;
    for (let c in this.props.coordinates) {
      if (c == coordinate) {
        this.props.close();
      }
    }
    return coordinate;
  }

  loadContainer(name, value) {
    if (value) {;
      let containerId = value;
      let container = this.props.containers[containerId];
      container.parentContainerId = this.props.container.id;
      container.coordinate = this.props.coordinate;

      this.props.saveChildContainer(container).then(() => {
        if (this.props.sequential) {
          this.props.edit('barcode');
          let coordinate = this.increaseCoordinate(this.props.coordinate);
          this.props.setCoordinate(coordinate);
        } else {
          this.props.close();
        }
      });
    }
  }

  render() {
  //TODO: This is eventually need to be reworked and cleaned up
  
  let barcodeField;
  
  if ((this.props.editable||{}).barcode) {
    barcodeField = (
      <Modal
        title='Load Container'
        show={this.props.editable.barcode}
        closeModal={this.props.close}
        throwWarning={false}
      >
        <StaticElement
          name='coordinate'
          label='Coordinate'
          text={this.props.coordinate}
        />
        <CheckboxElement
          name='sequential'
          label='Sequential Loading'
          value={this.props.sequential}
          onUserInput={this.props.setSequential}
        />
        <SearchableDropdown
          name='barcode'
          label='Barcode'
          options={this.props.barcodes}
          onUserInput={this.loadContainer}
          placeHolder='Please Scan or Select Barcode'
          autoFocus={true}
        />
      </Modal>
    );
  }
  

  let column = [];
  let row = [];
  let display;
  var coordinate = 1;
  if (this.props.dimensions) {
    for (let y=0; y < this.props.dimensions.y; y++) {
      column = [];
      for (let x=1; x <= this.props.dimensions.x; x++) {
        
        let nodeWidth = (500/this.props.dimensions.x) - (500/this.props.dimensions.x * 0.08);
        let nodeStyle = {width: nodeWidth}
        let nodeClass = 'node';
        let tooltipTitle = null;
        let title = null;
        let dataHtml = 'false';
        let dataToggle = null;
        let dataPlacement = null;
        let draggable = 'false';
        let onDragStart = null;
        let onDragOver = this.allowDrop;
        let onDrop = this.drop;
        let onClick = null;

        if (!this.props.select) {
          // This double if statement doesn't sound great
          if ((this.props.coordinates||{})[coordinate]) {
            nodeClass = 'node occupied';
            dataHtml = 'true';
            dataToggle = 'tooltip';
            dataPlacement = 'top';
            tooltipTitle = 
              '<h5>' + this.props.children[this.props.coordinates[coordinate]].barcode + '</h5>' + 
              '<h5>' + this.props.containerTypes[this.props.children[this.props.coordinates[coordinate]].typeId].label + '</h5>' + 
              '<h5>' + this.props.containerStati[this.props.children[this.props.coordinates[coordinate]].statusId].status + '</h5>';
            draggable = 'true';
            onDragStart = this.drag;
            onDragOver = null;
            onDrop = null;
            onClick = this.redirectURL;
          } else {
            nodeClass = 'node load';
            title = 'Load...';
            onClick = (e) => {this.props.setCoordinate(e.target.id); this.props.edit('barcode');};
          }
        }
      
        if (this.props.select) {
          if (coordinate == this.props.selectedCoordinate) {
            nodeClass = 'node occupied';
          }
          else if (!this.props.coordinates) {
            nodeClass = 'node available';
            onClick = (e) => this.props.setContainer('coordinate', e.target.id);
          } 
          else if (this.props.coordinates) {
            if (!this.props.coordinates[coordinate]) {
              nodeClass = 'node available';
              onClick = (e) => this.props.setContainer('coordinate', e.target.id);
            }
            else if (this.props.coordinates[coordinate]){
            // TODO: --- This is currently not working ---
            //  dataHtml = 'true';
            //  dataToggle = 'tooltip';
            //  dataPlacement = 'top';
            //  tooltipTitle = 
            //'<h5>' + this.props.children[this.props.coordinates[coordinate]].barcode + '</h5>' + 
            //'<h5>' + this.props.containerTypes[this.props.children[this.props.coordinates[coordinate]].typeId].label + '</h5>' + 
            //'<h5>' + this.props.containerStati[this.props.children[this.props.coordinates[coordinate]].statusId].status + '</h5>';
            }
          }
        }

        let coordinateDisplay;
        if (true) {
          coordinateDisplay = x + (this.props.dimensions.x * y);
        } else if (false) {
          coordinateDisplay = String.fromCharCode(65+y)+''+x;
        }

        column.push(
          <div
            id={coordinate}
            title={title}
            className={nodeClass}
            data-html={dataHtml}
            data-toggle={dataToggle}
            data-placement={dataPlacement}
            data-original-title={tooltipTitle}
            style={nodeStyle}
            onClick={onClick}
            draggable={draggable}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
          >
            {coordinateDisplay}
          </div>
        );

        coordinate++;
      }

      let rowHeight = (500/this.props.dimensions.y) - (500/this.props.dimensions.y * 0.08);
      let rowMargin = (500/this.props.dimensions.y * 0.04);
      let rowStyle = {
        height: rowHeight,
      }
      
      row.push(
        <div
          className='row'
          style={rowStyle} 
        >
          {column}
        </div>
      )
    }
    
    display = row;
  }
 
    return (
      <div className='display'>
        {barcodeField}
        {display}
      </div>
    );
  }
}

ContainerDisplay.propTypes = {
}

export default ContainerDisplay;
