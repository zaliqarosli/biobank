/**
 * Biobank Container Checkout
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 * */

class ContainerCheckout extends React.Component {
  constructor() {
    super();

    this.checkoutContainer = this.checkoutContainer.bind(this);
  }

  checkoutContainer() {
    this.props.setContainer('parentContainerId', null);
    this.props.setContainer('coordinate', null);
    this.props.saveContainer();
  }

  render() {
    let checkoutButton;
    if (this.props.container.parentContainerId) { 
      checkoutButton = (
        <div 
          className='action-button update'
          title='Checkout Container'
          onClick={this.checkoutContainer}
        >   
          <span className='glyphicon glyphicon-share'/>
        </div>
      );
    }

    return (
      <div>
        {checkoutButton}
      </div>
    );
  }
}

ContainerCheckout.propTypes = {
  container: React.PropTypes.object.isRequired,
  setContainer: React.PropTypes.func.isRequired,
  saveContainer: React.PropTypes.func.isRequired
};

export default ContainerCheckout;
