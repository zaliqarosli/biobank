import FilterForm from 'FilterForm';
import BiobankCollectionForm from './collectionForm';
import {Tabs, TabPane, Modal} from 'Tabs';
//import Modal from '../../../htdocs/js/components/Modal';
import formatColumn from './columnFormatter';

class BiobankIndex extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoaded: false,
      filter: {},
      isOpen: false,
    };

    // Bind component instance to custom methods
    this.fetchSpecimenFilterData = this.fetchSpecimenFilterData.bind(this);
    this.fetchCollectionFormData = this.fetchCollectionFormData.bind(this);
    this.updateFilter = this.updateFilter.bind(this);
    this.resetFilters = this.resetFilters.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
  }

  componentDidMount() {
    this.fetchSpecimenFilterData();
    this.fetchCollectionFormData();
  }

  /**
   * Retrieve data from the provided URL and save it in state
   * Additionaly add hiddenHeaders to global loris variable
   * for easy access by columnFormatter.
   */
  fetchSpecimenFilterData() {
    $.ajax(this.props.specimenFilterDataURL, {
      method: "GET",
      dataType: 'json',
      success: function(data) {
        this.setState({
          Data: data,
          isLoaded: true
        });
      }.bind(this),
      error: function(error) {
        console.error(error);
      }
    });
  }

  fetchCollectionFormData() {
    $.ajax(this.props.specimenFormDataURL, {
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

  updateFilter(filter) {
    this.setState({filter});
  }

  resetFilters() {
    this.refs.biobankFilter.clearFilter();
  }

  toggleModal() {
    this.setState({
      isOpen: !this.state.isOpen
    });
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

    let tabList = [
      {id: "specimens", label: "Specimens"},
      {id: "containers", label: "Containers"}
    ];

    let addSpecimenButton;
    let specimenForm;
    if (loris.userHasPermission('biobank_write')) {
       addSpecimenButton = (
         <ButtonElement buttonClass="btn btn-success" onUserInput={this.toggleModal} label="Add New Specimen" type="button"/>
       );
       specimenForm = (
         <Modal show={this.state.isOpen} onClose={this.toggleModal}>
           <BiobankCollectionForm
             specimenTypes={this.state.SpecimenData.specimenTypes}
             containerTypesPrimary={this.state.SpecimenData.containerTypesPrimary}
             containerBarcodesNonPrimary={this.state.SpecimenData.containerBarcodesNonPrimary}
             specimenTypeAttributes={this.state.SpecimenData.specimenTypeAttributes}
             attributeDatatypes={this.state.SpecimenData.attributeDatatypes}
             capacities={this.state.SpecimenData.capacities}
             units={this.state.SpecimenData.units}
             pSCIDs={this.state.SpecimenData.pSCIDs}
             visits={this.state.SpecimenData.visits}
             sessionData={this.state.SpecimenData.sessionData}
             action={`${loris.BaseURL}/biobank/ajax/SpecimenInfo.php?action=submitSpecimen`}
             closeModal={this.toggleModal}
           />
         </Modal>
       );
     }

    return (
    <div>
      <Tabs tabs={tabList} defaultTab="specimens" updateURL={true}>
        <TabPane TabId={tabList[0].id}>
          <FilterForm
            Module="biobank"
            name="specimen_filter"
            id="specimen_filter_form"
            ref="specimenFilter"
            columns={3}
            formElements={this.state.Data.form}
            onUpdate={this.updateFilter}
            filter={this.state.filter}
          >
            <br/>
          {addSpecimenButton}
            <ButtonElement label="Clear Filters" type="reset" onUserInput={this.resetFilters}/>
          </FilterForm>
          <StaticDataTable
            Data={this.state.Data.Data}
            Headers={this.state.Data.Headers}
            Filter={this.state.filter}
            getFormattedCell={formatColumn}
          />
        </TabPane>
        <TabPane TabId={tabList[1].id}>
          <FilterForm
            Module="biobank"
            name="container_filter"
            id="container_filter_form"
            ref="containerFilter"
            columns={3}
            formElements={this.state.Data.form}
            onUpdate={this.updateFilter}
            filter={this.state.filter}
		  >
            <br/>
            <ButtonElement label="Clear Filters" type="reset" onUserInput={this.resetFilters}/>
          </FilterForm>			
          <StaticDataTable
            Data={this.state.Data.Data}
            Headers={this.state.Data.Headers}
            Filter={this.state.filter}
            getFormattedCell={formatColumn}
          />
        </TabPane>
      </Tabs>
      {specimenForm}
      </div>
    );
  }
}

$(function() {
  const biobankIndex = (
    <div className="page-biobank">
      <BiobankIndex 
        specimenFilterDataURL={`${loris.BaseURL}/biobank/?format=json`} 
        specimenFormDataURL={`${loris.BaseURL}/biobank/ajax/SpecimenInfo.php?action=getCollectionFormData`}
      />
    </div>
  );

  ReactDOM.render(biobankIndex, document.getElementById("lorisworkspace"));
});
