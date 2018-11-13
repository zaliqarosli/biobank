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
    this.props.editContainer(this.props.container)
    .then(() => this.props.setContainer('parentContainerId', null))
    .then(() => this.props.setContainer('coordinate', null))
    .then(() => this.props.saveContainer(this.props.current.container));
  }

  render() {
    let checkoutButton;
    if (loris.userHasPermission('biobank_container_update') &&
        this.props.container.parentContainerId) {
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

    return <div>{checkoutButton}</div>;
  }
}

ContainerCheckout.propTypes = {
  setContainer: React.PropTypes.func.isRequired,
  saveContainer: React.PropTypes.func.isRequired,
};

export default ContainerCheckout;
