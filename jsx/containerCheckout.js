/**
 * Biobank Container Checkout
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 * */

class ContainerCheckout extends React.Component {
  constructor(props) {
    super(props);

    this.checkoutContainer = this.checkoutContainer.bind(this);
  }

  checkoutContainer() {
    let formData = {'containerId': this.props.containerId}
    let formObj = new FormData();
    //TODO: this seems to be necessary, however the check could be better.
    for (let key in formData) {
      if (formData[key] !== "") {
        formObj.append(key, formData[key]);
      }
    }
    console.log(formObj);

    $.ajax({
      type: 'POST',
      url: `${loris.BaseURL}/biobank/ajax/submitData.php?action=checkoutContainer`,
      data: formObj,
      cache: false,
      contentType: false,
      processData: false,
      xhr: function() {
        let xhr = new window.XMLHttpRequest();
        return xhr;
      }.bind(this),
      success: function() {
        this.props.refreshParent();
        swal("Container is checked-out!", "", "success");
      }.bind(this),
      error: function(err) {
        console.error(err);
        let msg = err.responseJSON ? err.responseJSON.message : "Specimen error!";
        this.setState({
          errorMessage: msg,
        });
        swal(msg, '', "error");
      }.bind(this)
    });
  }

  render() {
    let checkoutButton = null;
    if (this.props.parentContainerId) { 
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
};

export default ContainerCheckout;
