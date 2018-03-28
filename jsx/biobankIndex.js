import FilterForm from 'FilterForm';
import BiobankSpecimenForm from './specimenForm';
import BiobankContainerForm from './containerForm';
import {Tabs, TabPane} from 'Tabs';
import FormModal from 'FormModal';
import Loader from 'Loader';
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
    };

    // Bind component instance to custom methods
    this.loadPage = this.loadPage.bind(this);
    this.fetchSpecimenData = this.fetchSpecimenData.bind(this);
    this.fetchFormData = this.fetchFormData.bind(this);
    this.fetchContainerData = this.fetchContainerData.bind(this);
    this.updateSpecimenFilter = this.updateSpecimenFilter.bind(this);
    this.updateContainerFilter = this.updateContainerFilter.bind(this);
    this.resetFilters = this.resetFilters.bind(this);
    this.mapFormOptions = this.mapFormOptions.bind(this);
  }

  componentDidMount() {
    this.loadPage();
  }

  loadPage() {
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
        <Loader/>
      );
    }

    let addSpecimenButton;
    let addContainerButton;
    if (loris.userHasPermission('biobank_write')) {

       /**
        * Map Options for Form Select Elements of Specimen Form
        */
       let specimenTypes = this.mapFormOptions(this.state.FormData.specimenTypes, 'type');
       let containerTypesPrimary = this.mapFormOptions(this.state.FormData.containerTypesPrimary, 'label');
        
       let specimenButtonContent = (
         <div>
           <span
             className='glyphicon glyphicon-plus'
             style={{marginRight: '5px'}}
           />
           Add Specimen
         </div>
       );

       addSpecimenButton = (
         <FormModal
           title='Add New Specimen'
           buttonClass='btn btn-success'
           buttonStyle={{marginLeft: '10px', border: 'none'}}
           buttonContent={specimenButtonContent}
           throwWarning={true}
         >
           <BiobankSpecimenForm
             specimenTypes={specimenTypes}
             containerTypesPrimary={containerTypesPrimary}
             containersNonPrimary={this.state.FormData.containersNonPrimary}
             specimenTypeAttributes={this.state.FormData.specimenTypeAttributes}
             attributeDatatypes={this.state.FormData.attributeDatatypes}
             capacities={this.state.FormData.capacities}
             containerDimensions={this.state.FormData.containerDimensions}
             containerCoordinates={this.state.FormData.containerCoordinates}
             specimenTypeUnits={this.state.FormData.specimenTypeUnits}
             pSCIDs={this.state.FormData.pSCIDs}
             visits={this.state.FormData.visits}
             sessionData={this.state.FormData.sessionData}
             action={`${loris.BaseURL}/biobank/ajax/SpecimenInfo.php?action=submitSpecimen`}
             refreshParent={this.loadPage}
           />
         </FormModal>
       );

       let containerTypesNonPrimary = this.mapFormOptions(this.state.FormData.containerTypesNonPrimary, 'label');

       let containerButtonContent = (
         <div>
           <span
             className='glyphicon glyphicon-plus'
             style={{marginRight: '5px'}}
           />
           Add Container
         </div>
       );

       addContainerButton = (
         <FormModal
           title='Add New Container'
           buttonClass='btn btn-success'
           buttonStyle={{marginLeft: '10px', border: 'none'}}
           buttonContent={containerButtonContent}
         >
           <BiobankContainerForm
             containerTypesNonPrimary={containerTypesNonPrimary}
             sites={this.state.FormData.sites}
             action={`${loris.BaseURL}/biobank/ajax/ContainerInfo.php?action=submitContainer`}
             refreshParent={this.loadPage}
           />
         </FormModal>
       ); 
    }

    //Look at CCNA code from Zaliqa to modify this to be more streamline
    var tabList = [
      {id: "specimens", label: "Specimens"},
      {id: "containers", label: "Containers"}
    ];

    return (
    <div id='biobank-page'>
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
            <StaticElement text={addSpecimenButton}/>
            <StaticElement/>
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
            <StaticElement text={addContainerButton}/>
            <StaticElement/>
            <ButtonElement label="Clear Filters" type="reset" onUserInput={this.resetFilters}/>
          </FilterForm>			
          <StaticDataTable
            Data={this.state.ContainerData.Data}
            Headers={this.state.ContainerData.Headers}
            Filter={this.state.containerFilter}
            getFormattedCell={formatColumnContainer}
          />
        </TabPane>
      </Tabs>
      </div>
    );
  }
}

$(function() {
  const biobankIndex = (
    <div className="page-biobank">
      <BiobankIndex 
        specimenDataURL={`${loris.BaseURL}/biobank/?format=json`} 
        containerDataURL={`${loris.BaseURL}/biobank/ajax/ContainerInfo.php?action=getContainerFilterData`} 
        formDataURL={`${loris.BaseURL}/biobank/ajax/SpecimenInfo.php?action=getFormData`}
      />
    </div>
  );

  ReactDOM.render(biobankIndex, document.getElementById("lorisworkspace"));
});
