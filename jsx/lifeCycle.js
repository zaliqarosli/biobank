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
  }

  mouseOver(e) {
    //this isn't a very 'react' way of doing things, so consider revision
      $('.collection').css(
        {'border': '4px solid #093782',
         'box-shadow': '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)'});
  }

  mouseLeave(e) {
    //this isn't a very 'react' way of doing things, so consider revision
      $('.collection').css({'border': '4px solid #A6D3F5', 'box-shadow': 'none'});
  }

  mouseOverPreparation(e) {
    //this isn't a very 'react' way of doing things, so consider revision
      $('.preparation').css({'border': '4px solid #093782', 'box-shadow': '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)'});
  }

  mouseLeavePreparation(e) {
    //this isn't a very 'react' way of doing things, so consider revision
      $('.preparation').css({'border': '4px solid #A6D3F5', 'box-shadow': 'none'});
  }

  render() {

    let collectionNode;
    let collectionTooltip;
    if (this.props.collection || this.props.container) {
      collectionTooltip = (
        <div>
          <h>Collection</h>
          <p>Date:</p> 
        </div>
      );

      collectionNode = (
        <div 
          onMouseEnter={(e) => this.mouseOver(e)}
          onMouseLeave={(e) => this.mouseLeave(e)}
          className='lifecycle-node collection'
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
          onMouseEnter={this.mouseOverPreparation}
          onMouseLeave={this.mouseLeavePreparation}
          className='lifecycle-node preparation' 
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
          {preparationNode ? line : null}
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
