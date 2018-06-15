/**
 * Container Path
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 **/

class BarcodePath extends React.Component {

  render() {

    let path = [];
    let pathLength = this.props.parentContainers.length - 1;
    let containerURL = loris.BaseURL+'/biobank/container/?barcode=';
    for (let i=pathLength; i>=0; i--) {
      path.push(
        <span className='barcodePath'> 
          {'/'}
          <a onClick={()=>this.props.loadContainer(this.props.parentContainers[i].barcode)}>
            {this.props.parentContainers[i].barcode}
          </a>
        </span>
      );
    }
    path.push(
      <span className='barcodePath'> 
        {'/'}
        <a onClick={()=>this.props.loadContainer(this.props.container.barcode)}>
          {this.props.container.barcode}
        </a>
      </span>
    );

    return (
      <div>
        {path}
      </div>
    );
  }
}

BarcodePath.propTypes = {
}

export default BarcodePath;
