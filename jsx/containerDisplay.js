/**
 * ContainerDisplay
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 **/

class ContainerDisplay extends React.Component {
  constructor(props) {
    super(props);
 
    this.state = {
    };
   
    this.redirectURL = this.redirectURL.bind(this);
  }

  componentDidMount() {
    $('[data-toggle="tooltip"]').tooltip();
  }

  redirectURL(e) {
    let coordinate = e.target.id;
    if (this.props.coordinates[coordinate]) {
      let url;
      if (this.props.types[this.props.children[this.props.coordinates[coordinate]].typeId].primary) {
        url = loris.BaseURL+"/biobank/specimen/?barcode="+this.props.children[this.props.coordinates[coordinate]].barcode;
      } else {
        url = loris.BaseURL+"/biobank/container/?barcode="+this.props.children[this.props.coordinates[coordinate]].barcode;
      }

      window.location.href = url;
    }
  }

  render() {
  
  // This is eventually need to be reworked and cleaned up
  let column = [];
  let row = [];
  let display;
  var coordinate = 1;
  if (this.props.dimensions) {
    for (let y=0; y < this.props.dimensions.y; y++) {
      column = [];
      for (let x=1; x <= this.props.dimensions.x; x++) {
        
        let nodeWidth = (500/this.props.dimensions.x) - (500/this.props.dimensions.x * 0.08);
        let nodeStyle = {
          width: nodeWidth
        }

        let nodeClass = 'node';
        let tooltipTitle = null;
        if (this.props.coordinates) {
          if (this.props.coordinates[coordinate]) {
            nodeClass = 'node occupied';
            tooltipTitle = 
          '<h5>' + this.props.children[this.props.coordinates[coordinate]].barcode + '</h5>' + 
          '<h5>' + this.props.containerTypes[this.props.children[this.props.coordinates[coordinate]].typeId].label + '</h5>' + 
          '<h5>' + this.props.containerStati[this.props.children[this.props.coordinates[coordinate]].statusId].status + '</h5>';
          }
        }
      
        if (true) {
          column.push(
            <div
              className={nodeClass}
              data-html='true'
              data-toggle='tooltip'
              data-placement='top'
              title={tooltipTitle}
              style={nodeStyle}
              id={coordinate}
              onClick={this.redirectURL}
            >
              {x + (this.props.dimensions.x * y)}
            </div>
          );
        } 

        if (false) {
          column.push(
              <div 
                className={nodeClass}
                style={nodeStyle}
              >
                {String.fromCharCode(65+y)+''+x}
              </div>
          );
        }

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
      <div className='display-container'>
        <div className='display'>
          {display}
        </div>
      </div>
    );
  }
}

ContainerDisplay.propTypes = {
}

export default ContainerDisplay;
