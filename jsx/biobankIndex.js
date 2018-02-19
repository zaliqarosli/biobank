import FilterForm from 'FilterForm';
import BiobankSpecimenForm from './specimenForm';
import BiobankContainerForm from './containerForm';
import {Tabs, TabPane, Modal} from 'Tabs';
//import Modal from '../../../htdocs/js/components/Modal';
import formatColumnSpecimen from './columnFormatterSpecimen';
import formatColumnContainer from './columnFormatterContainer';

class BiobankIndex extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoaded: false,
      specimenFilter: {},
      containerFilter: {},
      isOpen: false,
      containerForm: false
    };

    // Bind component instance to custom methods
    this.fetchSpecimenData = this.fetchSpecimenData.bind(this);
    this.fetchFormData = this.fetchFormData.bind(this);
    this.fetchContainerData = this.fetchContainerData.bind(this);
    this.updateSpecimenFilter = this.updateSpecimenFilter.bind(this);
    this.updateContainerFilter = this.updateContainerFilter.bind(this);
    this.resetFilters = this.resetFilters.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.toggleContainerModal = this.toggleContainerModal.bind(this);
    this.mapFormOptions = this.mapFormOptions.bind(this);
  }

  componentDidMount() {
    this.fetchSpecimenData();
    this.fetchFormData();
    this.fetchContainerData();
  }

  /**
   * Retrieve data from the provided URL and save it in state
   * Additionaly add hiddenHeaders to global loris variable
   * for easy access by columnFormatter.
   */
  fetchSpecimenData() {
    $.ajax(this.props.specimenDataURL, {
      method: "GET",
      dataType: 'json',
      success: function(data) {
        this.setState({
          SpecimenData: data,
          isLoaded: true
        });
      }.bind(this),
      error: function(error) {
        console.error(error);
      }
    });
  }

  fetchContainerData() {
    $.ajax(this.props.containerDataURL, {
      method: "GET",
      dataType: 'json',
      success: function(data) {
        this.setState({
          ContainerData: data,
          isLoaded: true
        });
      }.bind(this),
      error: function(error) {
        console.error(error);
      }
    });
  }

  fetchFormData() {
    $.ajax(this.props.formDataURL, {
      method: "GET",
      dataType: 'json',
      success: function(data) {
        this.setState({
          FormData: data,
          isLoaded: true
        });
      }.bind(this),
      error: function(error) {
        console.error(error);
      }
    });
  }

  updateSpecimenFilter(specimenFilter) {
    this.setState({specimenFilter});
  }

  // This works,
  // but there must be a way to do this with just one updateFilter function
  updateContainerFilter(containerFilter) {
    this.setState({containerFilter});
  }

  resetFilters() {
    this.refs.biobankFilter.clearFilter();
  }

  toggleModal() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  toggleContainerModal() {
    this.setState({
      containerForm: !this.state.containerForm
    });
  }

 //map options for forms
  mapFormOptions(rawObject, targetAttribute) {
    var data = {}; 
    for (var id in rawObject) {
      data[id] = rawObject[id][targetAttribute];
    }   

    return data;
  }

  render() {
    // Waiting for async data to load
    if (!this.state.isLoaded) {
      return (
        <button className="btn-info has-spinner">
          Loading
          <span
            className="glyphicon glyphicon-refresh glyphicon-refresh-animate">
          </span>
        </button>
      );
    }

    let addSpecimenButton;
    let specimenForm;
    let addContainerButton;
    let containerForm;
    if (loris.userHasPermission('biobank_write')) {
       addSpecimenButton = (
         <button 
           type="button" 
           className="btn-xs btn-success"
           onClick={this.toggleModal} 
           style={{marginLeft: '10px', border: 'none'}}
         >   
           <span 
             className="glyphicon glyphicon-plus"
             style={{marginRight: '5px'}}
           />  
           Add
         </button>
       ); 

       /**
        * Map Options for Form Select Elements of Specimen Form
        */
       let specimenTypes = this.mapFormOptions(this.state.FormData.specimenTypes, 'type');
       let containerTypesPrimary = this.mapFormOptions(this.state.FormData.containerTypesPrimary, 'label');
       let containerBarcodesNonPrimary = this.mapFormOptions(this.state.FormData.containersNonPrimary, 'barcode');

       specimenForm = (
         <Modal show={this.state.isOpen} onClose={this.toggleModal}>
           <BiobankSpecimenForm
             specimenTypes={specimenTypes}
             containerTypesPrimary={containerTypesPrimary}
             containerBarcodesNonPrimary={containerBarcodesNonPrimary}
             specimenTypeAttributes={this.state.FormData.specimenTypeAttributes}
             attributeDatatypes={this.state.FormData.attributeDatatypes}
             capacities={this.state.FormData.capacities}
             specimenTypeUnits={this.state.FormData.specimenTypeUnits}
             pSCIDs={this.state.FormData.pSCIDs}
             visits={this.state.FormData.visits}
             sessionData={this.state.FormData.sessionData}
             action={`${loris.BaseURL}/biobank/ajax/SpecimenInfo.php?action=submitSpecimen`}
             closeModal={this.toggleModal}
             refreshTable={this.fetchSpecimenData}
           />
         </Modal>
       );

       addContainerButton = (
         <button 
           type="button" 
           className="btn btn-success"
           onClick={this.toggleContainerModal} 
           style={{marginLeft: '10px', border: 'none'}}
         >   
           <span 
             className="glyphicon glyphicon-plus"
             style={{marginRight: '5px'}}
           />  
           Add
         </button>
       ); 

       let containerTypesNonPrimary = this.mapFormOptions(this.state.FormData.containerTypesNonPrimary, 'label');

       containerForm = (
         <Modal show={this.state.containerForm} onClose={this.toggleContainerModal}>
           <BiobankContainerForm
             containerTypesNonPrimary={containerTypesNonPrimary}
             sites={this.state.FormData.sites}
             action={`${loris.BaseURL}/biobank/ajax/SpecimenInfo.php?action=submitContainer`}
             closeModal={this.toggleContainerModal}
             refreshTable={this.fetchContainerData}
           />
         </Modal>
       );
    }

    //Look at CCNA code from Zaliqa to modify this to be more streamline
    var tabList = [
      {id: "specimens", label: ["Specimens", addSpecimenButton]},
      {id: "containers", label: "Containers"}
    ];

    return (
    <div>
      <Tabs tabs={tabList} defaultTab="specimens" updateURL={true}>
        <TabPane TabId={tabList[0].id}>
          <FilterForm
            Module="biobank"
            name="specimen_filter"
            id="specimen_filter"
            ref="specimenFilter"
            columns={3}
            formElements={this.state.SpecimenData.form}
            onUpdate={this.updateSpecimenFilter}
            filter={this.state.specimenFilter}
          >
            <br/>
            <ButtonElement label="Clear Filters" type="reset" onUserInput={this.resetFilters}/>
          </FilterForm>
          <StaticDataTable
            Data={this.state.SpecimenData.Data}
            Headers={this.state.SpecimenData.Headers}
            Filter={this.state.specimenFilter}
            getFormattedCell={formatColumnSpecimen}
          />
        </TabPane>
        <TabPane TabId={tabList[1].id}>
          <FilterForm
            Module="biobank"
            name="container_filter"
            id="container_filter"
            ref="containerFilter"
            columns={3}
            formElements={this.state.ContainerData.form}
            onUpdate={this.updateContainerFilter}
            filter={this.state.containerFilter}
		  >
            <br/>
            <ButtonElement label="Clear Filters" type="reset" onUserInput={this.resetFilters}/>
          </FilterForm>			
          {addContainerButton}
          <StaticDataTable
            Data={this.state.ContainerData.Data}
            Headers={this.state.ContainerData.Headers}
            Filter={this.state.containerFilter}
            getFormattedCell={formatColumnContainer}
          />
        </TabPane>
      </Tabs>
      {specimenForm}
      {containerForm}
      </div>
    );
  }
}

$(function() {
  const biobankIndex = (
    <div className="page-biobank">
      <BiobankIndex 
        specimenDataURL={`${loris.BaseURL}/biobank/?format=json`} 
        containerDataURL={`${loris.BaseURL}/biobank/ajax/SpecimenInfo.php?action=getContainerFilterData`} 
        formDataURL={`${loris.BaseURL}/biobank/ajax/SpecimenInfo.php?action=getFormData`}
      />
    </div>
  );

  ReactDOM.render(biobankIndex, document.getElementById("lorisworkspace"));
});
