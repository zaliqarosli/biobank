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

    this.resetSpecimenFilters = this.resetSpecimenFilters.bind(this);
    this.resetContainerFilters = this.resetContainerFilters.bind(this);
    this.formatSpecimenColumns = this.formatSpecimenColumns.bind(this);
    this.formatContainerColumns = this.formatContainerColumns.bind(this);
  }

  resetSpecimenFilters() {
    this.refs.specimenFilter.clearFilter();
  }
  
  resetContainerFilters() {
    this.refs.containerFilter.clearFilter();
  }

  formatSpecimenColumns(column, cell, rowData, rowHeaders) {
    let row = {};
    let barcode;

    // Create the mapping between rowHeaders and rowData in a row object.
    rowHeaders.forEach((header, index) => {
      row[header] = rowData[index];
    });

    switch (column) {
      case 'Barcode':
        barcode = row['Barcode'];
        return (
          <td>
            <a onClick={()=>{this.props.loadSpecimen(barcode)}} style={{cursor:'pointer'}}>
              {cell}
            </a>
          </td>
        );
      case 'Parent Barcode':
        barcode = row['Parent Barcode'];
        return (
          <td>
            <a 
              onClick={()=>{this.props.loadSpecimen(barcode)}}
              style={{cursor:'pointer'}}
            >
              {cell}
            </a>
          </td> 
        );
      case 'Container Barcode':
        barcode = row['Container Barcode'];
        return (
          <td>
            <a
              onClick={()=>{this.props.loadContainer(barcode)}}
              style={{cursor:'pointer'}}
            >
              {cell}
            </a>
          </td>
        );
      case 'PSCID':
        let pscidURL = loris.BaseURL + '/' + row['PSCID'];
        return <td><a href={pscidURL}>{cell}</a></td>;
      case 'Visit Label':
        let visitLabelURL = loris.BaseURL+'/instrument_list/?candID='+row['PSCID']+
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

    let barcode;
    switch (column) {
      case 'Barcode':
        barcode = row['Barcode'];
        return (
          <td>
            <a
              onClick={()=>{this.props.loadContainer(barcode)}}
              style={{cursor:'pointer'}}
            >
              {cell}
            </a>
          </td>
        );
      case 'Status':
        switch (cell) {
          case 'Available':
            return <td style={{color: 'green'}}>{cell}</td>;
          case 'Reserved':
            return <td style={{color: 'orange'}}>{cell}</td>
          case 'Dispensed':
            return <td style={{color: 'red'}}>{cell}</td>
        }
      case 'Parent Barcode':
        barcode = row['Parent Barcode'];
        return (
          <td>
            <a
              onClick={()=>{this.props.loadContainer(barcode)}}
              style={{cursor:'pointer'}}
            >
              {cell}
            </a>
          </td> 
        );
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
      <div className='action' title='Add Specimen'>
        <div
          className='action-button add'
          onClick={()=>{this.props.edit('specimenForm').then(()=>{this.props.addListItem('specimen')});}}
        >
          +
        </div>
        <Modal
          title='Add New Specimen'
          show={this.props.editable.specimenForm}
          closeModal={this.props.close}
        >
          <BiobankSpecimenForm
            candidates={candidates}
            sessions={sessions}
            current={this.props.current}
            specimenList={this.props.list}
            errors={this.props.errors}
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
            collapsed={this.props.collapsed}
            copyMultiplier={this.props.copyMultiplier}
            mapFormOptions={this.props.mapFormOptions}
            close={this.props.close}
            toggleCollapse={this.props.toggleCollapse}
            loadFilters={this.props.loadFilters}
            loadOptions={this.props.loadOptions}
            setCopyMultiplier={this.props.setCopyMultiplier}
            setCurrent={this.props.setCurrent}
            setSpecimenList={this.props.setSpecimenList}
            setContainerList={this.props.setContainerList}
            addListItem={this.props.addListItem}
            copyListItem={this.props.copyListItem}
            removeListItem={this.props.removeListItem}
            saveSpecimenList={this.props.saveSpecimenList}
          />
        </Modal>
      </div>
    );

    //TODO: turn the following into components to avoid duplication
    //TODO: should there be a general search, or one for specimen and one for containers?
    let barcodesPrimary = this.props.mapFormOptions(this.props.options.containersPrimary, 'barcode');
    let searchSpecimenButton = (
      <div className='action' title='Go To Specimen'>
        <div className='action-button search' onClick={()=>{this.props.edit('searchSpecimen')}}>
          <span className='glyphicon glyphicon-search'/>
        </div>
        <Modal
          title='Go To Specimen'
          show={this.props.editable.searchSpecimen}
          closeModal={this.props.close}
        >
          <SearchableDropdown
            name='barcode'
            label='Barcode'
            options={barcodesPrimary}
            onUserInput={(name, value) => {
              barcodesPrimary[value] &&
              this.props.loadSpecimen(barcodesPrimary[value]).then(()=>this.props.close())
            }}
            placeHolder='Please Scan or Select Barcode'
            autoFocus={true}
          />
        </Modal>
      </div>
    );

    let barcodesNonPrimary = this.props.mapFormOptions(this.props.options.containersNonPrimary, 'barcode');
    let searchContainerButton;
    searchContainerButton = (
      <div className='action' title='Go To Container'>
        <div className='action-button search' onClick={()=>{this.props.edit('searchContainer')}}>
          <span className='glyphicon glyphicon-search'/>
        </div>
        <Modal
          title='Go To Barcode'
          show={this.props.editable.searchContainer}
          closeModal={this.props.close}
        >
          <SearchableDropdown
            name='barcode'
            label='Barcode'
            options={barcodesNonPrimary}
            onUserInput={(name, value) => {
              barcodesNonPrimary[value] &&
              this.props.loadContainer(barcodesNonPrimary[value]).then(()=>this.props.close())
            }}
            placeHolder='Please Scan or Select Barcode'
            autoFocus={true}
          />
        </Modal>
      </div>
    );


    poolSpecimenButton = (
      <div className='action' title='Pool Specimens'>
        <div className='action-button pool' onClick={()=>{this.props.edit('poolSpecimenForm')}}>
          <span className='glyphicon glyphicon-resize-small'/>
        </div>
        <Modal
          title='Pool Specimens'
          show={this.props.editable.poolSpecimenForm}
          closeModal={this.props.close}
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
      </div>
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
          onClick={()=>{this.props.edit('containerForm').then(()=>{this.props.addListItem('container')})}}
        >
          <span>+</span>
        </div>
        <Modal
          title='Add New Container'
          show={this.props.editable.containerForm}
          closeModal={this.props.close}
        >
          <BiobankContainerForm
            current={this.props.current}
            containerList={this.props.list}
            errors={this.props.errors.list}
            collapsed={this.props.collapsed}
            copyMultiplier={this.props.copyMultiplier}
            containerTypesNonPrimary={containerTypesNonPrimary}
            centers={this.props.options.centers}
            containerStati={containerStati}
            saveContainer={`${loris.BaseURL}/biobank/ajax/submitData.php?action=saveContainer`}
            close={this.props.close}
            toggleCollapse={this.props.toggleCollapse}
            loadFilters={this.props.loadFilters}
            loadOptions={this.props.loadOptions}
            setCopyMultiplier={this.props.setCopyMultiplier}
            setCurrent={this.props.setCurrent}
            setContainerList={this.props.setContainerList}
            addListItem={this.props.addListItem}
            copyListItem={this.props.copyListItem}
            removeListItem={this.props.removeListItem}
            saveContainerList={this.props.saveContainerList}
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
            <div className='row' style={{marginTop:20}}>
              <div className='col-lg-3' style={{marginTop: '10px'}}>
                <div className='filter'>
                  <FilterForm
                    Module='biobank'
                    ref='specimenFilter'
                    formElements={this.props.specimenDataTable.form}
                    onUpdate={this.props.updateSpecimenFilter}
                    filter={this.props.specimenFilter}
                  >
                    <ButtonElement
                      label="Clear Filters"
                      type="reset" 
                      onUserInput={this.resetSpecimenFilters}
                    />
                    <div className='align-row'>
                      <span className='action'>
                        {searchSpecimenButton}
                      </span>
                      <span className='action'>
                        {addSpecimenButton}
                      </span>
                      <span className='action'>
                        {poolSpecimenButton}
                      </span>
                    </div>
                  </FilterForm>
                </div>
              </div>
              <div className='col-lg-9' style={{marginTop: '10px'}}>
                <StaticDataTable
                  Data={this.props.specimenDataTable.Data}
                  Headers={this.props.specimenDataTable.Headers}
                  Filter={this.props.specimenFilter}
                  getFormattedCell={this.formatSpecimenColumns}
                />
              </div>
            </div>
          </TabPane>
          <TabPane TabId={tabList[1].id}>
            <div className='row'>
              <div className='col-lg-3' style={{marginTop: '10px'}}>
                <div className='filter'>
                  <FilterForm
                    Module='biobank' 
                    ref='containerFilter'
                    formElements={this.props.containerDataTable.form}
                    onUpdate={this.props.updateContainerFilter}
                    filter={this.props.containerFilter}
		              >
                    <ButtonElement
                      label="Clear Filters"
                      type="reset"
                      onUserInput={this.resetContainerFilters}
                    />
                    <div className='align-row'>
                      <span className='action'>
                        {searchContainerButton}
                      </span>
                      <span className='action'>
                        {addContainerButton}
                      </span>
                    </div>
                  </FilterForm>			
                </div>
              </div>
              <div className='col-lg-9' style={{marginTop: '10px'}}>
                <StaticDataTable
                  Data={this.props.containerDataTable.Data}
                  Headers={this.props.containerDataTable.Headers}
                  Filter={this.props.containerFilter}
                  getFormattedCell={this.formatContainerColumns}
                />
              </div>
            </div>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

BiobankFilter.propTypes = {
  specimenFilter: React.PropTypes.object.isRequired,
  specimenDataTable: React.PropTypes.object.isRequired,
  containerFilter: React.PropTypes.object.isRequired,
  containerDataTable: React.PropTypes.object.isRequired,
  options: React.PropTypes.object.isRequired,
  editable: React.PropTypes.object.isRequired,
  loadContainer: React.PropTypes.func.isRequired,
  loadSpecimen: React.PropTypes.func.isRequired,
  loadTransfer: React.PropTypes.func.isRequired,
  updateSpecimenFilter: React.PropTypes.func.isRequired,
  updateContainerFilter: React.PropTypes.func.isRequired,
  mapFormOptions: React.PropTypes.func.isRequired,
  edit: React.PropTypes.func.isRequired,
  close: React.PropTypes.func.isRequired,
}

BiobankFilter.defaultProps = {
  copyMultiplier: 1,
  count: 0,
}

export default BiobankFilter;
