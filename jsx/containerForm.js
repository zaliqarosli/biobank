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

    this.state = {
      formErrors: {},
      errorMessage: null,
      containerList: {1: {}},
      countContainers: 1,
      collapsed: {1: true},
      copyMultiplier: 1,
    };

    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.addContainer = this.addContainer.bind(this);
    this.setContainer = this.setContainer.bind(this);
    this.setCopyMultiplier = this.setCopyMultiplier.bind(this);
    this.copyContainer = this.copyContainer.bind(this);
    this.removeContainer = this.removeContainer.bind(this);
    this.saveContainerList = this.saveContainerList.bind(this);
  }

  toggleCollapse(key) {
    let collapsed = this.state.collapsed;
    collapsed[key] = !collapsed[key];
    this.setState({collapsed});
  }

  saveContainerList() {
    let containerList = this.state.containerList;
    let availableId = Object.keys(this.props.containerStati).find(
      key => this.props.containerStati[key] === 'Available'
    );

    for (let container in containerList) {
      containerList[container].statusId = availableId;
      containerList[container].temperature = 20;
      this.props.save(containerList[container], this.props.saveContainer, 'Container Creation Successful!').then(
        () => {this.props.close(); this.props.loadFilters(); this.props.loadOptions();}
      );
    }
  }

  setContainer(name, value, key) {
    this.props.onChange instanceof Function && this.props.onChange();
    let siteId = this.state.siteId;
    let containerList = this.state.containerList;
    if (name === 'siteId') {
       siteId = value;
       for (let container in containerList) {
         containerList[container].originId = siteId;
         containerList[container].locationId = siteId;
       }
    } else {
      containerList[key][name] = value;
    }
    this.setState({containerList, siteId});
  }

  addContainer() {
    let containerList = this.state.containerList;
    let count = this.state.countContainers;
    let collapsed = this.state.collapsed;
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

    collapsed[count+1] = true;  

    this.setState({
      containerList: containerList,
      countContainers: count + 1,
      collapsed: collapsed,
    });
  }

  setCopyMultiplier(e) {
    let copyMultiplier = e.target.value;
    this.setState({copyMultiplier});
  }

  copyContainer(key) {
    let count = this.state.countContainers;
    let collapsed = this.state.collapsed;
    let nextKey = count+1;
    let containerList = this.state.containerList;
    let multiplier = this.state.copyMultiplier

    for (let i=1; i<=multiplier; i++) {
      containerList[nextKey] = JSON.parse(JSON.stringify(containerList[key]));
      delete containerList[nextKey].barcode;
      collapsed[nextKey] = true;
      nextKey++;
    }    

    this.setState({
      containerList: containerList,
      countContainers: nextKey,
      collapsed: collapsed
    });
  }

  removeContainer(key) {
    let containerList = this.state.containerList;
    delete containerList[key];
    this.setState({containerList});
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
          collapsed={this.state.collapsed[key]}
          toggleCollapse={this.toggleCollapse}
          container={this.state.containerList[key] || null}
          removeContainer={containerListArray.length !== 1 ? () => this.removeContainer(key) : null}
          addContainer={i == containerListArray.length ? this.addContainer : null}
          setCopyMultiplier={this.setCopyMultiplier}
          copyMultiplier={this.state.copyMultiplier}
          copyContainer={i == containerListArray.length && this.state.containerList[key] ? this.copyContainer : null}
          setContainer={this.setContainer}
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
              options={this.props.centers}
              onUserInput={this.setContainer}
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
}

BiobankContainerForm.propTypes = {
  DataURL: React.PropTypes.string.isRequired,
  barcode: React.PropTypes.string,
  refreshTable: React.PropTypes.func
};

export default BiobankContainerForm;
