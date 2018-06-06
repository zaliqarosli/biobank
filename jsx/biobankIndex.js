import FilterForm from 'FilterForm';
import BiobankSpecimenForm from './specimenForm';
import PoolSpecimenForm from './poolSpecimenForm';
import BiobankContainerForm from './containerForm';
import {Tabs, TabPane} from 'Tabs';
import FormModal from 'FormModal';
import Loader from 'Loader';
import formatColumnSpecimen from './columnFormatterSpecimen';
import formatColumnContainer from './columnFormatterContainer';

class BiobankIndex extends React.Component {

  constructor() {
    super();

    this.state = {
      isLoaded: false,
      specimenFilter: {},
      containerFilter: {},
      isOpen: false,
      formOptions: {},
    };

    // Bind component instance to custom methods
    this.loadPage = this.loadPage.bind(this);
    this.fetchSpecimenData = this.fetchSpecimenData.bind(this);
    this.fetchFormOptions = this.fetchFormOptions.bind(this);
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
    this.fetchFormOptions();
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
          specimenData: data,
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
          containerData: data,
          isLoaded: true
        });
      }.bind(this),
      error: function(error) {
        console.error(error);
      }
    });
  }

  fetchFormOptions() {
    $.ajax(this.props.formDataURL, {
      method: "GET",
      dataType: 'json',
      success: function(data) {
        this.setState({
          formOptions: data,
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
    let data = {}; 
    for (let id in rawObject) {
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
    let poolSpecimenButton;
    let addContainerButton;
    if (loris.userHasPermission('biobank_write')) {

       /**
        * Map Options for Form Select Elements of Specimen Form
        */
       let containerTypesPrimary = this.mapFormOptions(this.state.formOptions.containerTypesPrimary, 'label');
       let containerStati = this.mapFormOptions(this.state.formOptions.containerStati, 'status');
       let candidates = this.mapFormOptions(this.state.formOptions.candidates, 'pscid');
       let sessions = this.mapFormOptions(this.state.formOptions.sessions, 'label');
        
       addSpecimenButton = (
         <FormModal
           title='Add New Specimen'
           buttonClass='action-button add'
           buttonContent='+'
           style={{display:'inline-block'}}
         >
           <BiobankSpecimenForm
             candidates={candidates}
             sessions={sessions}
             candidateSessions={this.state.formOptions.candidateSessions}
             sessionCenters={this.state.formOptions.sessionCenters}
             specimenTypes={this.state.formOptions.specimenTypes}
             specimenTypeUnits={this.state.formOptions.specimenTypeUnits}
             specimenTypeAttributes={this.state.formOptions.specimenTypeAttributes}
             attributeOptions={this.state.formOptions.attributeOptions}
             attributeDatatypes={this.state.formOptions.attributeDatatypes}
             containerTypesPrimary={containerTypesPrimary}
             containersNonPrimary={this.state.formOptions.containersNonPrimary}
             containerDimensions={this.state.formOptions.containerDimensions}
             containerCoordinates={this.state.formOptions.containerCoordinates}
             containerStati={containerStati}
             refreshParent={this.loadPage}
             mapFormOptions={this.mapFormOptions}
             saveBarcodeList={`${loris.BaseURL}/biobank/ajax/submitData.php?action=saveBarcodeList`}
           />
         </FormModal>
       );

       let poolSpecimenButtonContent = (
         <span className='glyphicon glyphicon-resize-small'/>
       )

       poolSpecimenButton = (
         <FormModal
           title='Pool Specimens'
           buttonClass='action-button pool'
           buttonContent={poolSpecimenButtonContent}
           style={{display:'inline-block'}}
         >
           <PoolSpecimenForm
             specimenTypes={this.state.formOptions.specimenTypes}
             containerTypesPrimary={containerTypesPrimary}
             containersNonPrimary={this.state.formOptions.containersNonPrimary}
             specimenTypeAttributes={this.state.formOptions.specimenTypeAttributes}
             specimenProtocols={this.state.formOptions.specimenProtocols}
             specimenProtocolAttributes={this.state.formOptions.specimenProtocolAttributes}
             attributeDatatypes={this.state.formOptions.attributeDatatypes}
             attributeOptions={this.state.formOptions.attributeOptions}
             capacities={this.state.formOptions.capacities}
             containerDimensions={this.state.formOptions.containerDimensions}
             containerCoordinates={this.state.formOptions.containerCoordinates}
             specimenTypeUnits={this.state.formOptions.specimenTypeUnits}
             specimenUnits={this.state.formOptions.specimenUnits}
             candidates={candidates}
             candidateSessions={this.state.formOptions.candidateSessions}
             sessionCenters={this.state.formOptions.sessionCenters}
             specimenRequest={`${loris.BaseURL}/biobank/ajax/requestData.php?action=getSpecimenDataFromBarcode`}
             refreshParent={this.loadPage}
             mapFormOptions={this.mapFormOptions}
             saveSpecimen={`${loris.BaseURL}/biobank/ajax/submitData.php?action=saveSpecimen`}
             saveContainer={`${loris.BaseURL}/biobank/ajax/submitData.php?action=saveContainer`}
           />
         </FormModal>
       );

       let containerTypesNonPrimary = this.mapFormOptions(this.state.formOptions.containerTypesNonPrimary, 'label');

       addContainerButton = (
         <FormModal
           title='Add New Container'
           buttonClass='action-button add'
           buttonContent='+'
           style={{display:'inline-block'}}
         >
           <BiobankContainerForm
             containerTypesNonPrimary={containerTypesNonPrimary}
             centers={this.state.formOptions.centers}
             containerStati={containerStati}
             refreshParent={this.loadPage}
             saveContainer={`${loris.BaseURL}/biobank/ajax/submitData.php?action=saveContainer`}
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
          <div className='row'>
            <div className='col-lg-10'>
              <FilterForm
                Module="biobank"
                name="specimen_filter"
                id="specimen_filter"
                ref="specimenFilter"
                columns={3}
                formElements={this.state.specimenData.form}
                onUpdate={this.updateSpecimenFilter}
                filter={this.state.specimenFilter}
              >
                <br/>
                <StaticElement/>
                <StaticElement/>
                <ButtonElement label="Clear Filters" type="reset" onUserInput={this.resetFilters}/>
              </FilterForm>
            </div>
            <div className='col-lg-2'>
              <span className='action'>
                {addSpecimenButton}
                <div className='action-title'>
                  Add Specimen
                </div>
              </span>
              <br/><br/>
              <span className='action'>
                {poolSpecimenButton}
                <div className='action-title'>
                  Pool Specimens
                </div>
              </span>
            </div>
          </div>
          <StaticDataTable
            Data={this.state.specimenData.Data}
            Headers={this.state.specimenData.Headers}
            Filter={this.state.specimenFilter}
            getFormattedCell={formatColumnSpecimen}
          />
        </TabPane>
        <TabPane TabId={tabList[1].id}>
          <div className='row'>
            <div className='col-lg-10'>
              <FilterForm
                Module="biobank"
                name="container_filter"
                id="container_filter"
                ref="containerFilter"
                columns={3}
                formElements={this.state.containerData.form}
                onUpdate={this.updateContainerFilter}
                filter={this.state.containerFilter}
		          >
                <br/>
                <StaticElement/>
                <StaticElement/>
                <ButtonElement label="Clear Filters" type="reset" onUserInput={this.resetFilters}/>
              </FilterForm>			
            </div>
            <div className='col-lg-2'>
              <span className='action'>
                {addContainerButton}
                <div className='action-title'>
                  New Container
                </div>
              </span>
            </div>
          </div>
          <StaticDataTable
            Data={this.state.containerData.Data}
            Headers={this.state.containerData.Headers}
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
        containerDataURL={`${loris.BaseURL}/biobank/ajax/requestData.php?action=getContainerFilterData`} 
        formDataURL={`${loris.BaseURL}/biobank/ajax/requestData.php?action=getFormOptions`}
      />
    </div>
  );

  ReactDOM.render(biobankIndex, document.getElementById("lorisworkspace"));
});
