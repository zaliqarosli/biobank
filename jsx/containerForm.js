import ContainerBarcodeForm from './containerBarcodeForm.js';

/**
 * Biobank Collection Form
 *
 * Fetches data from Loris backend and displays a form allowing
 * to specimen a biobank file attached to a specific instrument
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 * */
class BiobankContainerForm extends React.Component {
  constructor(props) {
    super(props);

    // get Id of available status
    let availableId = Object.keys(this.props.containerStati).find(
      key => this.props.containerStati[key] === 'Available'
    );

    console.log(availableId);

    this.state = {
      formErrors: {},
      errorMessage: null,
      containerList: {1: {statusId: availableId, temperature: 20}},
      countBarcodeForms: 1
    };

    this.addContainer = this.addContainer.bind(this);
    this.copyContainer = this.copyContainer.bind(this);
    this.removeContainer = this.removeContainer.bind(this);
    this.setContainerData = this.setContainerData.bind(this);
    this.setContainerList = this.setContainerList.bind(this);
    this.saveContainerList = this.saveContainerList.bind(this);
    this.saveContainer = this.saveContainer.bind(this);
  }

  render() {
    //Generates new Barcode Form everytime the addContainer button is pressed
    let containerListArray = Object.keys(this.state.containerList);
    let containers = [];
    let i = 1;
    for (let key of containerListArray) {
      containers.push(
        <ContainerBarcodeForm
          key={key}
          containerKey={key}
          id={i}
          containerData={this.state.containerList[key] || null}
          removeContainer={containerListArray.length !== 1 ? () => this.removeContainer(key) : null}
          addContainer={i == containerListArray.length ? this.addContainer : null}
          copyContainer={i == containerListArray.length && this.state.containerList[key] ? this.copyContainer.bind(this, key) : null}
          setParentFormData={this.setContainerList}
          onChange={this.props.onChange}
          containerTypesNonPrimary={this.props.containerTypesNonPrimary}
          containerBarcodesNonPrimary={this.props.containerBarcodesNonPrimary}
        />
      );
     
      i++;
    }

    return (
      <FormElement
        name="containerForm"
        onSubmit={this.saveContainerList}
        ref="form"
      >
        <br/>
        <div className="row">
          <div className="col-xs-11">
            <SelectElement
              name="siteId"
              label="Site"
              options={this.props.sites}
              onUserInput={this.setContainerData}
              required={true}
              value={this.state.siteId}
            />
          </div>
        </div>
        {containers}
          <div className="col-xs-3 col-xs-offset-9">
            <ButtonElement label="Submit"/>
          </div>
      </FormElement>
    );
  }

  saveContainerList() {
    let containerList = this.state.containerList;
    for (let container in containerList) {
      this.saveContainer(containerList[container]);
    }
  }

  saveContainer(container) {
    let containerObj = new FormData();
    for (let key in container) {
      if (container[key] !== "") {
        containerObj.append(key, container[key]);
      }
    }

    $.ajax({
      type: 'POST',
      url: this.props.action,
      data: containerObj,
      cache: false,
      contentType: false,
      processData: false,
      xhr: function() {
        let xhr = new window.XMLHttpRequest();
        return xhr;
      }.bind(this),
      success: function() {
        this.props.refreshParent();
        swal("Container Submission Successful!", "", "success");

        //close modal window
        this.props.onSuccess();
      }.bind(this),
      error: function(err) {
        console.error(err);
        let msg = err.responseJSON ? err.responseJSON.message : "Specimen error!";
        this.setState({
          errorMessage: msg,
        });
        swal(msg, "", "error");
      }.bind(this)
    });
  }

  setContainerData(name, value) {
    this.props.onChange instanceof Function && this.props.onChange();
  
    let siteId = this.state.siteId;
    let containerList = this.state.containerList;

    if (name === 'siteId') {
       siteId = value;

       for (let container in containerList) {
         containerList[container].originId = value;
         containerList[container].locationId = value;
       }
    } else {
      containerList[name] = value;
    }
 
    this.setState({
      siteId,
      containerList
    });
  }

  setContainerList(containerData, containerKey) {
    let containerList = this.state.containerList;
    containerList[containerKey] = containerData;

    this.setState({
      containerList: containerList
    });
  }

  addContainer() {
    let containerList = this.state.containerList;
    let count = this.state.countBarcodeForms;
    let siteId = this.state.siteId;
    let temperature = 20;

    // get Id of available status
    let statusId = Object.keys(this.props.containerStati).find(
      key => this.props.containerStati[key] === 'Available'
    );

    containerList[count+1] = {
      statusId: statusId,
      originId: siteId,
      locationId: siteId,
      temperature: temperature
    };

    this.setState({
      containerList: containerList,
      countBarcodeForms: count + 1
    });
  }

  copyContainer(key, multiplier) {
    let count = this.state.countBarcodeForms;
    let nextKey = count+1;
    let containerList = this.state.containerList;

    for (let i=1; i<=multiplier; i++) {
      containerList[nextKey] = JSON.parse(JSON.stringify(containerList[key]));
      delete containerList[nextKey].barcode;
      nextKey++;
    }    

    this.setState({
      containerList: containerList,
      countBarcodeForms: nextKey
    });
  }

  removeContainer(key) {
    let containerList = this.state.containerList;
    delete containerList[key];

    this.setState({
      containerList: containerList
    });
  }

}

BiobankContainerForm.propTypes = {
  DataURL: React.PropTypes.string.isRequired,
  action: React.PropTypes.string.isRequired,
  barcode: React.PropTypes.string,
  refreshTable: React.PropTypes.func
};

export default BiobankContainerForm;
