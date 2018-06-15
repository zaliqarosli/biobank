import FilterForm from 'FilterForm';
import BiobankSpecimenForm from './specimenForm';
import PoolSpecimenForm from './poolSpecimenForm';
import BiobankContainerForm from './containerForm';
import {Tabs, TabPane} from 'Tabs';
import Modal from 'Modal';
import Loader from 'Loader';

class BiobankIndex extends React.Component {
  constructor() {
    super();

    this.state = {
      isLoaded: false,
      specimenFilter: {},
      containerFilter: {},
      isOpen: false,
      formOptions: {},
      show: {
        specimenForm: false,
        containerForm: false,
      },
    };

    this.loadPage = this.loadPage.bind(this);
    this.fetch = this.fetch.bind(this);
    this.updateSpecimenFilter = this.updateSpecimenFilter.bind(this);
    this.updateContainerFilter = this.updateContainerFilter.bind(this);
    this.resetFilters = this.resetFilters.bind(this);
    this.mapFormOptions = this.mapFormOptions.bind(this);
    this.showModal = this.showModal.bind(this);
    this.closeAll = this.closeAll.bind(this);
    this.formatSpecimenColumns = this.formatSpecimenColumns.bind(this);
    this.formatContainerColumns = this.formatContainerColumns.bind(this);
    this.save = this.save.bind(this);
  }

  componentDidMount() {
    this.loadPage();
  }

  loadPage() {
    this.fetch('specimenData', this.props.specimenDataURL);
    this.fetch('containerData', this.props.containerDataURL);
    this.fetch('formOptions', this.props.formOptionsURL);
    this.setState({isLoaded: true});
  }

  /**
   * Retrieve data from the provided URL and save it in state
   */
  fetch(request, url) {
    $.ajax(url, {
      method: "GET",
      dataType: 'json',
      success: function(data) {
        this.setState({
          [request]: data,
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

  showModal(stateKey) {
    let show = this.state.show;
    show[stateKey] = true;
    this.setState({show});
  }

  closeAll() {
    let show = this.state.show;
    for (let key in show) {
      show[key] = false;
    }
    this.setState({show});
  }

  formatSpecimenColumns(column, cell, rowData, rowHeaders) {
    // Create the mapping between rowHeaders and rowData in a row object.
    let row = {};
    rowHeaders.forEach((header, index) => {
      row[header] = rowData[index];
    });

    let barcodeURL = loris.BaseURL + '/biobank/barcode/?barcode=';
    switch (column) {
      case 'Barcode':
        let URL = barcodeURL+row['Barcode'];
        return <td><a href={URL}>{cell}</a></td>;
      case 'Parent Barcode':
        URL = barcodeURL+row['Parent Barcode'];
        return <td><a href={URL}>{cell}</a></td>; 
      case 'Container Barcode':
        URL = barcodeURL+row['Container Barcode'];
        return <td><a href={URL}>{cell}</a></td>;
      case 'PSCID':
        let pscidURL = loris.BaseURL + '/' + row['PSCID'];
        return <td><a href={pscidURL}>{cell}</a></td>;
      case 'Visit Label':
        let visitLabelURL = loris.BaseURL + '/instrument_list/?candID=' + row['PSCID'] +
          '&sessionID='+row['Visit Label'];
        return <td><a href={visitLabelURL}>{cell}</a></td>;
      case 'Status':
        switch (cell) {
          case 'Available':
            return <td style={{color: 'green'}}>{cell}</td>;
          case 'Reserved':
            return <td style={{color: 'orange'}}>{cell}</td>
          case 'Dispensed':
            return <td style={{color: 'red'}}>{cell}</td>
        }
      default:
        return <td>{cell}</td>;
     }
  }

  formatContainerColumns(column, cell, rowData, rowHeaders) {
    // Create the mapping between rowHeaders and rowData in a row object.
    let row = {};
    rowHeaders.forEach((header, index) => {
      row[header] = rowData[index];
    });

    let barcodeURL = loris.BaseURL + '/biobank/barcode/?barcode=' 
    switch (column) {
      case 'Barcode':
        let URL = barcodeURL+row['Barcode'];
        return <td><a href={URL}>{cell}</a></td>;
      case 'Parent Barcode':
        URL = barcodeURL+row['Parent Barcode'];
        return <td><a href={URL}>{cell}</a></td>; 
      default:
        return <td>{cell}</td>;
     }
  }

  save(data, url, message) {
    return new Promise(resolve => {
      $.ajax({
        type: 'POST',
        url: url,
        data: {data: JSON.stringify(data)},
        cache: false,
        success: () => {
          resolve();
          message ? swal(message, '', 'success') : swal('Save Successful!', '', 'success');
          this.closeAll();
        },
        error: (error, textStatus, errorThrown) => {
          let message = (error.responseJSON||{}).message || 'Submission error!';
          swal(message, '', 'error');
          console.error(error, textStatus, errorThrown);
        }
      });
    });
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
         <div
           className='action'
           title='Add Specimen'
         >
           <div
             className='action-button add'
             onClick={()=>{this.showModal('specimenForm')}}
           >
             <span>+</span>
           </div>
           <Modal
             title='Add New Specimen'
             show={this.state.show.specimenForm}
             closeModal={this.closeAll}
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
               saveBarcodeListURL={this.props.saveBarcodeListURL}
               save={this.save}
             />
           </Modal>
         </div>
       );

       let poolSpecimenButtonContent = (
         <span className='glyphicon glyphicon-resize-small'/>
       )

       poolSpecimenButton = (
         <Modal
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
         </Modal>
       );

       let containerTypesNonPrimary = this.mapFormOptions(this.state.formOptions.containerTypesNonPrimary, 'label');

       addContainerButton = (
         <div
           className='action'
           title='Add Container'
         >
           <div
             className='action-button add'
             onClick={()=>{this.showModal('containerForm')}}
           >
             <span>+</span>
           </div>
           <Modal
             title='Add New Container'
             show={this.state.show.containerForm}
             closeModal={this.closeAll}
           >
             <BiobankContainerForm
               containerTypesNonPrimary={containerTypesNonPrimary}
               centers={this.state.formOptions.centers}
               containerStati={containerStati}
               refreshParent={this.loadPage}
               saveContainer={`${loris.BaseURL}/biobank/ajax/submitData.php?action=saveContainer`}
               save={this.save}
             />
           </Modal>
         </div>
       ); 
    }

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
            getFormattedCell={this.formatSpecimenColumns}
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
            getFormattedCell={this.formatContainerColumns}
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
        formOptionsURL={`${loris.BaseURL}/biobank/ajax/requestData.php?action=getFormOptions`}
        saveBarcodeListURL={`${loris.BaseURL}/biobank/ajax/submitData.php?action=saveBarcodeList`}
      />
    </div>
  );

  ReactDOM.render(biobankIndex, document.getElementById("lorisworkspace"));
});
