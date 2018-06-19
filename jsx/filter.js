import FilterForm from 'FilterForm';
import BiobankSpecimenForm from './specimenForm';
import PoolSpecimenForm from './poolSpecimenForm';
import BiobankContainerForm from './containerForm';
import {Tabs, TabPane} from 'Tabs';
import Modal from 'Modal';
import Loader from 'Loader';

class BiobankFilter extends React.Component {
  constructor() {
    super();

    this.resetFilters = this.resetFilters.bind(this);
    this.formatSpecimenColumns = this.formatSpecimenColumns.bind(this);
    this.formatContainerColumns = this.formatContainerColumns.bind(this);
  }

  resetFilters() {
   // this.refs.biobankFilter.clearFilter();
  }

  formatSpecimenColumns(column, cell, rowData, rowHeaders) {
    // Create the mapping between rowHeaders and rowData in a row object.
    let row = {};
    rowHeaders.forEach((header, index) => {
      row[header] = rowData[index];
    });

    let barcode;
    switch (column) {
      case 'Barcode':
        barcode = row['Barcode'];
        return <td><a onClick={()=>{this.props.loadSpecimen(barcode)}}>{cell}</a></td>;
      case 'Parent Barcode':
        barcode = row['Parent Barcode'];
        return <td><a onClick={()=>{this.props.loadSpecimen(barcode)}}>{cell}</a></td>; 
      case 'Container Barcode':
        barcode = row['Container Barcode'];
        return <td><a onClick={()=>{this.props.loadContainer(barcode)}}>{cell}</a></td>;
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

  render() {

    let addSpecimenButton;
    let poolSpecimenButton;
    let addContainerButton;

    /**
     * Map Options for Form Select Elements of Specimen Form
     */
    let containerTypesPrimary = this.props.mapFormOptions(
      this.props.options.containerTypesPrimary, 'label'
    );
    let containerStati = this.props.mapFormOptions(
      this.props.options.containerStati, 'status'
    );
    let candidates = this.props.mapFormOptions(
      this.props.options.candidates, 'pscid'
    );
    let sessions = this.props.mapFormOptions(
      this.props.options.sessions, 'label'
    );
     
    addSpecimenButton = (
      <div
        className='action'
        title='Add Specimen'
      >
        <div
          className='action-button add'
          onClick={()=>{this.props.edit('specimenForm')}}
        >
          <span>+</span>
        </div>
        <Modal
          title='Add New Specimen'
          show={this.props.editable.specimenForm}
          closeModal={this.props.close}
        >
          <BiobankSpecimenForm
            candidates={candidates}
            sessions={sessions}
            candidateSessions={this.props.options.candidateSessions}
            sessionCenters={this.props.options.sessionCenters}
            specimenTypes={this.props.options.specimenTypes}
            specimenTypeUnits={this.props.options.specimenTypeUnits}
            specimenTypeAttributes={this.props.options.specimenTypeAttributes}
            attributeOptions={this.props.options.attributeOptions}
            attributeDatatypes={this.props.options.attributeDatatypes}
            containerTypesPrimary={containerTypesPrimary}
            containersNonPrimary={this.props.options.containersNonPrimary}
            containerDimensions={this.props.options.containerDimensions}
            containerCoordinates={this.props.options.containerCoordinates}
            containerStati={containerStati}
            mapFormOptions={this.props.mapFormOptions}
            saveBarcodeListURL={this.props.saveBarcodeListURL}
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
          specimenTypes={this.props.options.specimenTypes}
          containerTypesPrimary={containerTypesPrimary}
          containersNonPrimary={this.props.options.containersNonPrimary}
          specimenTypeAttributes={this.props.options.specimenTypeAttributes}
          specimenProtocols={this.props.options.specimenProtocols}
          specimenProtocolAttributes={this.props.options.specimenProtocolAttributes}
          attributeDatatypes={this.props.options.attributeDatatypes}
          attributeOptions={this.props.options.attributeOptions}
          capacities={this.props.options.capacities}
          containerDimensions={this.props.options.containerDimensions}
          containerCoordinates={this.props.options.containerCoordinates}
          specimenTypeUnits={this.props.options.specimenTypeUnits}
          specimenUnits={this.props.options.specimenUnits}
          candidates={candidates}
          candidateSessions={this.props.options.candidateSessions}
          sessionCenters={this.props.options.sessionCenters}
          specimenRequest={`${loris.BaseURL}/biobank/ajax/requestData.php?action=getSpecimenDataFromBarcode`}
          mapFormOptions={this.props.mapFormOptions}
          saveSpecimen={`${loris.BaseURL}/biobank/ajax/submitData.php?action=saveSpecimen`}
          saveContainer={`${loris.BaseURL}/biobank/ajax/submitData.php?action=saveContainer`}
        />
      </Modal>
    );

    let containerTypesNonPrimary = this.props.mapFormOptions(
      this.props.options.containerTypesNonPrimary, 'label'
    );

    addContainerButton = (
      <div
        className='action'
        title='Add Container'
      >
        <div
          className='action-button add'
          onClick={()=>{this.props.edit('containerForm')}}
        >
          <span>+</span>
        </div>
        <Modal
          title='Add New Container'
          show={this.props.editable.containerForm}
          closeModal={this.props.close}
        >
          <BiobankContainerForm
            containerTypesNonPrimary={containerTypesNonPrimary}
            centers={this.props.options.centers}
            containerStati={containerStati}
            saveContainer={`${loris.BaseURL}/biobank/ajax/submitData.php?action=saveContainer`}
            save={this.props.save}
          />
        </Modal>
      </div>
    ); 
    

    let tabList = [
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
                  formElements={this.props.specimenDataTable.form}
                  onUpdate={this.props.updateSpecimenFilter}
                  filter={this.props.specimenFilter}
                >
                  <br/>
                  <StaticElement/>
                  <StaticElement/>
                  <ButtonElement
                    label="Clear Filters"
                    type="reset" 
                    onUserInput={this.resetFilters}
                  />
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
              Data={this.props.specimenDataTable.Data}
              Headers={this.props.specimenDataTable.Headers}
              Filter={this.props.specimenFilter}
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
                  formElements={this.props.containerDataTable.form}
                  onUpdate={this.props.updateContainerFilter}
                  filter={this.props.containerFilter}
		            >
                  <br/>
                  <StaticElement/>
                  <StaticElement/>
                  <ButtonElement
                    label="Clear Filters"
                    type="reset"
                    onUserInput={this.resetFilters}
                  />
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
              Data={this.props.containerDataTable.Data}
              Headers={this.props.containerDataTable.Headers}
              Filter={this.props.containerFilter}
              getFormattedCell={this.formatContainerColumns}
            />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default BiobankFilter;
