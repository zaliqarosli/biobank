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

    this.redirectURL        = this.redirectURL.bind(this);
    this.drag               = this.drag.bind(this);
    this.drop               = this.drop.bind(this);
    this.loadContainer      = this.loadContainer.bind(this);
    this.checkoutContainers = this.checkoutContainers.bind(this);
  }

  componentDidMount() {
    $('[data-toggle="tooltip"]').tooltip();
  }

  // This is to ensure that the tool-tip remounts
  componentDidUpdate() {
    $('[data-toggle="tooltip"]').tooltip();
  }

  redirectURL(e) {
    let coordinate = e.target.id;
    if (this.props.coordinates[coordinate]) {
      let barcode = this.props.data.containers.all[this.props.coordinates[coordinate]].barcode;
      this.props.history.push(`/barcode=${barcode}`);
    }
  }

  allowDrop(e) {
    e.preventDefault();
  }
  
  drag(e) {
    let container = JSON.stringify(
      this.props.data.containers.all[this.props.coordinates[e.target.id]]
    );
    e.dataTransfer.setData("text/plain", container);
  }
  
  drop(e) {
    e.preventDefault();
    let container = JSON.parse(e.dataTransfer.getData("text/plain"));
    let newCoordinate = parseInt(e.target.id);
    container.coordinate = newCoordinate;
    this.props.saveContainer(container);
  }

  increaseCoordinate(coordinate) {
      let capacity = Object.values(this.props.dimensions).reduce(
        (total, current) => {return total * current}
      );
      coordinate++;
      for (let c in this.props.coordinates) {
        if (c == coordinate || coordinate > capacity) {
          this.props.close();
        }
      }
      this.props.setCurrent('coordinate', coordinate);
  }

  loadContainer(name, value) {
    if (value) {
      let containerId = value;
      let container = this.props.data.containers.all[containerId];
      container.parentContainerId = this.props.container.id;
      container.coordinate = this.props.current.coordinate;

      this.props.saveContainer(container, false, false)
      .then(() => {
        if (this.props.current.sequential) {
          let coordinate = this.props.current.coordinate;
          this.increaseCoordinate(coordinate);
          //FIXME: This is a hack, but it works!
          this.props.setCurrent('containerId', 1)
          .then(() => this.props.setCurrent('containerId', null));
        } else {
          this.props.close();
        }

        this.props.setCurrent('prevCoordinate', container.coordinate);
      });
    }
  }

  checkoutContainers() {
    return new Promise(() => {
      let checkoutList = this.props.current.list;
      Object.values(checkoutList).forEach(container => {
        container.parentContainerId = null;
        container.coordinate = null;
        this.props.saveContainer(container);
      });
    });
  }

  render() {
    let barcodeField;

    if ((this.props.editable||{}).loadContainer) {
      barcodeField = (
        <SearchableDropdown
          name='barcode'
          label='Barcode'
          options={this.props.barcodes}
          onUserInput={this.loadContainer}
          value={this.props.current.containerId}
          placeHolder='Please Scan or Select Barcode'
          autoFocus={true}
        />
      );
    }
    
    let load = (
      <div className={((this.props.editable||{}).loadContainer) ? 'open' : 'closed'}>
        <FormElement>
          <StaticElement
            label='Note'
            text='Select or Scan Containers to be Loaded. If Sequential is Checked,
             the Coordinate will Auto-Increment after each Load.'
          />
          <CheckboxElement
            name='sequential'
            label='Sequential'
            value={this.props.current.sequential}
            onUserInput={this.props.setCurrent}
          />
          {barcodeField}
          <ButtonElement
            label='Done'
            onUserInput={this.props.close}
          />
        </FormElement>
      </div>
    );

    // place container children in an object
    let children = {};
    if (((this.props.target||{}).container||{}).childContainerIds) {
      Object.values(this.props.data.containers.all).map(c => {
        this.props.target.container.childContainerIds.forEach(id => {
          if (c.id == id) {children[id] = c}
        });
      });
    }

    if ((this.props.editable||{}).containerCheckout) {
      //Only children of the current container can be checked out.
      let barcodes = this.props.mapFormOptions(children, 'barcode');

      barcodeField = (
        <SearchableDropdown
          name='barcode'
          label='Barcode'
          options={barcodes}
          onUserInput={(name, value) => value && this.props.setCheckoutList(children[value])}
          placeHolder='Please Scan or Select Barcode'
          autoFocus={true}
        />
      );
    }

    let checkout = (
      <div className={((this.props.editable||{}).containerCheckout) ? 'open' : 'closed'}>
        <FormElement>
          <StaticElement
            label='Note'
            text="Click, Select or Scan Containers to be Unloaded and Press 'Confirm'"
          />
          {barcodeField}
          <ButtonElement
            label='Confirm'
            onUserInput={()=>{this.checkoutContainers(); this.props.close();}}
          />
          <StaticElement
            text={<a onClick={this.props.close} style={{cursor: 'pointer'}}>Cancel</a>}
          />
        </FormElement>
      </div>

    );

    //TODO: This will eventually need to be reworked and cleaned up
    let display;
    let column      = [];
    let row         = [];
    let coordinate  = 1;
    let coordinates = this.props.coordinates;
    let dimensions  = this.props.dimensions;
    if (dimensions) {
      for (let y=0; y < dimensions.y; y++) {
        column = [];
        for (let x=1; x <= dimensions.x; x++) {
          
          let nodeWidth = (500/dimensions.x) - (500/dimensions.x * 0.08);
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
          let onClick = this.redirectURL;

          if (!this.props.select) {
            if ((coordinates||{})[coordinate]) {
              if (!loris.userHasPermission('biobank_specimen_view') &&
                  children[coordinates[coordinate]] === undefined) {
                nodeClass = 'node forbidden';
                onClick   = null;
              } else {
                if (coordinate in this.props.current.list) {
                  nodeClass = 'node checkout';
                } else if (coordinate == this.props.current.prevCoordinate) {
                  nodeClass = 'node new';
                } else {
                  nodeClass = 'node occupied'
                }

                dataHtml = 'true';
                dataToggle = 'tooltip';
                dataPlacement = 'top';
                tooltipTitle = 
                  '<h5>'+children[coordinates[coordinate]].barcode+'</h5>' + 
                  '<h5>'+this.props.options.containerTypes[children[coordinates[coordinate]].typeId].label+'</h5>' + 
                  '<h5>'+this.props.options.containerStati[children[coordinates[coordinate]].statusId].status+'</h5>';
                draggable = !loris.userHasPermission('biobank_container_update') ||
                            this.props.editable.loadContainer || 
                            this.props.editable.containerCheckout 
                            ? 'false' : 'true';
                onDragStart = this.drag;

                if (this.props.editable.containerCheckout) {
                  onClick = (e) => {
                    let container = this.props.data.containers.all[coordinates[e.target.id]];
                    this.props.setCheckoutList(container);
                  };
                }
                if (this.props.editable.loadContainer) {
                  onClick = null;
                }
              }
              onDragOver = null;
              onDrop = null;
            } else if (loris.userHasPermission('biobank_container_update') &&
                       !this.props.editable.containerCheckout) {
              nodeClass = coordinate == this.props.current.coordinate ?
                'node selected' : 'node load';
              title = 'Load...';
              onClick = (e) => {
                let containerId = e.target.id;
                this.props.edit('loadContainer')
                .then(() => this.props.editContainer(this.props.target.container))
                .then(() => this.props.setCurrent('coordinate', containerId))
              };
            }
          }
        
          if (this.props.select) {
            if (coordinate == this.props.selectedCoordinate) {
              nodeClass = 'node occupied';
            }
            else if (!coordinates) {
              nodeClass = 'node available';
              onClick = (e) => this.props.setContainer('coordinate', e.target.id);
            } 
            else if (coordinates) {
              if (!coordinates[coordinate]) {
                nodeClass = 'node available';
                onClick = (e) => this.props.setContainer('coordinate', e.target.id);
              }
              else if (coordinates[coordinate]){
                dataHtml = 'true';
                dataToggle = 'tooltip';
                dataPlacement = 'top';
                tooltipTitle = 
              '<h5>test</h5>' + 
              '<h5>test</h5>' + 
              '<h5>test</h5>';
              }
            }
          }

          let coordinateDisplay;
          if (true) {
            coordinateDisplay = x + (dimensions.x * y);
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

        let rowHeight = (500/dimensions.y) - (500/dimensions.y * 0.08);
        let rowMargin = (500/dimensions.y * 0.04);
        let rowStyle = {height: rowHeight,}
        
        row.push(
          <div className='row' style={rowStyle}>{column}</div>
        );
      }
      
      display = row;
    }
 
    return (
      <div>
        <div style={{width: 500}}>
          {checkout}
          {load}
        </div>
        <div className='display'>
          {display}
        </div>
      </div>
    );
  }
}

ContainerDisplay.propTypes = {
}

ContainerDisplay.defaultProps = {
  current: {}
}

export default ContainerDisplay;
