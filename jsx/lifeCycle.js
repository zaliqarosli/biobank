/**
 * LifeCycle
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 **/

class LifeCycle extends React.Component {
  constructor(props) {
    super(props);
 
    this.state = {
    };
   
  }

  componentDidMount() {
    $('[data-toggle="tooltip"]').tooltip();
  }

  render() {

    let collectionNode;
    let collectionTooltip;
    if (this.props.collection) {
      collectionTooltip = (
        <div>
          <h>Collection</h>
          <p>Date:</p> 
        </div>
      );

      collectionNode = (
        <div 
          className='lifecycle-node' 
          data-html='true'
          data-toggle='tooltip' 
          data-placement='auto'
          title={'<h5>' + this.props.sites[this.props.collection.locationId] + '</h5>' +
                 '<h5>' + this.props.collection.date + '</h5>'
                }
        >
          <div className='letter'>
            C
          </div>
        </div>
      );
    }

    let preparationNode;
    if (this.props.preparation) {
      preparationNode = (
        <div 
          className='lifecycle-node' 
          data-html='true'
          data-toggle='tooltip' 
          data-placement='auto'
          title={'<h5>' + this.props.sites[this.props.preparation.locationId] + '</h5>' +
                 '<h5>' + this.props.preparation.date + '</h5>'
                }
        >
          <div className='letter'>
            P
          </div>
        </div>
      );
    }

    let analysisNode;
    if (this.props.analysis) {
      analysisNode = (
        <div className='lifecycle-node-container'>
           <div className='lifecycle-node'/>
           <div className='lifecycle-text'>Analysis</div>
        </div>
      );
    }

    let line;
    line = (
        <div className='lifecycle-line'/>
    );

    return (
      <div className='lifecycle'>
        <div className='lifecycle-graphic'>
          {collectionNode}
          {line}
          {preparationNode}
          {analysisNode} 
        </div>
      </div>
    );
  }

}

LifeCycle.propTypes = {
}

export default LifeCycle;
