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

  redirectURL() {
    let url;
  }

  render() {
  
  // THERE WILL ALWAYS BE AN X, Y and Z 
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
          width: nodeWidth,
        }

        if (false) {
          column.push(
              <div className='node'>{x + (this.props.dimensions.x * y)}</div>
          )

        } 

        let nodeClass = this.props.coordinates[coordinate] ? 'node occupied' : 'node'
          column.push(
              <div 
                className={nodeClass}
                style={nodeStyle}
              >
                {String.fromCharCode(65+y)+''+x}
              </div>
          )

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
