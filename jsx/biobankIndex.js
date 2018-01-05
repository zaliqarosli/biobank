import FilterForm from 'FilterForm';
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
    this.fetchData = this.fetchData.bind(this);
    this.updateFilter = this.updateFilter.bind(this);
    this.resetFilters = this.resetFilters.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  /**
   * Retrieve data from the provided URL and save it in state
   * Additionaly add hiddenHeaders to global loris vairable
   * for easy access by columnFormatter.
   */
  fetchData() {
    $.ajax(this.props.DataURL, {
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

    let addSpecimenButton;
    let addNewSpecimenForm;
    let tabList = [
      {id: "specimens", label: "Specimens"},
      {id: "containers", label: "Containers"}
    ];

    if (loris.userHasPermission('biobank_write')) {
       addSpecimenButton = (
         <ButtonElement onUserInput={this.toggleModal} label="Add New Specimen" type="button"/>
       );
       addNewSpecimenForm = (
          <Modal show={this.state.isOpen} onClose={this.toggleModal}>
            <FormElement
              name="specimenAdd"
              onSubmit={this.handleSubmit}
              ref="form"
            >
              <h3>Add New Specimen</h3>
              <br/>
              <SelectElement
                name= "pscid"
                label="PSCID"
                options=""
                onUserInput={this.setFormData}
                ref="pscid"
                hasError={false}
                required={true}
                value=""
              />
              <SelectElement
                name= "visitLabel"
                label="Visit Label"
                options=""
                onUserInput={this.setFormData}
                ref="visitLabel"
                required={true}
                value=""
              />
              <SelectElement
                name= "forSite"
                label="Site"
                options=""
                onUserInput={this.setFormData}
                ref="forSite"
                required={true}
                value=""
              />
              <SelectElement
                name= "type"
                label="Type"
                options=""
                onUserInput={this.setFormData}
                ref="type"
                required={true}
                value=""
              />
              <TextboxElement
                name= "quantity"
                label="Quantity"
                onUserInput={this.setFormData}
                ref="quantity"
                required={true}
                value=""
              />
              <SelectElement
                name= "container"
                label="Container"
                options=""
                onUserInput={this.setFormData}
                ref="container"
                required={true}
                value=""
              />
              <TextboxElement
                name= "collectionTime"
                label="Collection TIme"
                options=""
                onUserInput={this.setFormData}
                ref="collectionTime"
                required={true}
                value=""
              />
              <TextboxElement
                name="notes"
                label="Notes"
                onUserInput={this.setFormData}
                ref="notes"
                required={false}
                value=""
              />
              {/*<ButtonElement label="Cancel" type="button" onUserInput={this.toggleModal}/>*/}
              <ButtonElement label="Submit" type="submit"/>
            </FormElement>
          </Modal>  
       );
    //  tabList.push({id: "upload", label: "Upload"});
    //  uploadTab = (
    //    <TabPane TabId={tabList[1].id}>
    //      <BiobankUploadForm
    //        DataURL={`${loris.BaseURL}/biobank/ajax/FileUpload.php?action=getData`}
    //        action={`${loris.BaseURL}/biobank/ajax/FileUpload.php?action=upload`}
    //        maxUploadSize={this.state.Data.maxUploadSize}
    //      />
    //    </TabPane>
    //  );
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
      {addNewSpecimenForm}
      </div>
    );
  }
}

$(function() {
  const biobankIndex = (
    <div className="page-biobank">
      <BiobankIndex DataURL={`${loris.BaseURL}/biobank/?format=json`} />
    </div>
  );

  ReactDOM.render(biobankIndex, document.getElementById("lorisworkspace"));
});
