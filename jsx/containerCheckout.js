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
    this.props.setContainerData('parentContainerId', null);
    this.props.setContainerData('coordinate', null);
    this.props.saveContainer();
  }

  render() {
    let checkoutButton;
    if (this.props.container.parentContainerId) { 
      checkoutButton = (
        <div 
          className='action-button update'
          data-toggle='tooltip'
          title='Checkout Container'
          data-placement='right'
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
  setContainerData: React.PropTypes.func.isRequired,
  saveContainer: React.PropTypes.func.isRequired
};

export default ContainerCheckout;
