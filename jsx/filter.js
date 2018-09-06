import FilterForm from 'FilterForm';
import BiobankSpecimenForm from './specimenForm';
import PoolSpecimenForm from './poolSpecimenForm';
import BatchPreparationForm from './batchPreparationForm';
import BiobankContainerForm from './containerForm';
import {Tabs, TabPane} from 'Tabs';
import Modal from 'Modal';
import Loader from 'Loader';
import { Link } from 'react-router-dom';

class BiobankFilter extends React.Component {
  constructor() {
    super();

    this.resetSpecimenFilters     = this.resetSpecimenFilters.bind(this);
    this.resetContainerFilters    = this.resetContainerFilters.bind(this);
    this.resetPoolFilters         = this.resetPoolFilters.bind(this);
    this.formatSpecimenColumns    = this.formatSpecimenColumns.bind(this);
    this.formatContainerColumns   = this.formatContainerColumns.bind(this);
    this.openSpecimenForm         = this.openSpecimenForm.bind(this);
    this.openPoolForm             = this.openPoolForm.bind(this);
    this.openBatchPreparationForm = this.openBatchPreparationForm.bind(this);
    this.openContainerForm        = this.openContainerForm.bind(this);
  }

  resetSpecimenFilters() {
    this.refs.specimenFilter.clearFilter();
  }
  
  resetContainerFilters() {
    this.refs.containerFilter.clearFilter();
  }

  resetPoolFilters() {
    this.refs.poolFilter.clearFilter();
  }

  openSpecimenForm() {
    this.props.edit('specimenForm')
    .then(() => this.props.addListItem('specimen'));
  }

  openPoolForm() {
    this.props.edit('poolSpecimenForm')
    .then(() => this.props.setListLength('barcode', 2));
  }

  openBatchPreparationForm() {
    this.props.edit('batchPreparationForm')
    .then(() => this.props.setListLength('barcode', 2));
  }

  openContainerForm() {
    this.props.edit('containerForm')
    .then(() => this.props.addListItem('container'))
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
        return <td><Link to={`/barcode=${barcode}`}>{cell}</Link></td>
      case 'Parent Barcode':
        barcode = row['Parent Barcode'];
        return <td><Link to={`/barcode=${barcode}`}>{cell}</Link></td> 
      case 'Container Barcode':
        barcode = row['Container Barcode'];
        return <td><Link to={`/barcode=${barcode}`}>{cell}</Link></td> 
      case 'PSCID':
        const pscidURL = loris.BaseURL + '/' + row['PSCID'];
        return <td><a href={pscidURL}>{cell}</a></td>;
      case 'Visit Label':
        const visitLabelURL = loris.BaseURL+'/instrument_list/?candID='+row['PSCID']+
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
        return <td><Link to={`/barcode=${barcode}`}>{cell}</Link></td> 
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
        return <td><Link to={`/barcode=${barcode}`}>{cell}</Link></td> 
      default:
        return <td>{cell}</td>;
     }
  }

  formPoolColumns(column, cell, rowData, rowHeaders) {
    //Create the mapping between rowHeaders and rowData in a row object.
    let row = {}
    rowHeaders.forEach((header, index) => row[header] = rowData[index]);



  }

  render() {
    const addSpecimenButton = (
      <div className='action' title='Add Specimen'>
        <div className='action-button add' onClick={this.openSpecimenForm}>+</div>
        <Modal
          title='Add New Specimen'
          show={this.props.editable.specimenForm}
          closeModal={this.props.close}
        >
          <BiobankSpecimenForm
            options={this.props.options}
            current={this.props.current}
            errors={this.props.errors}
            mapFormOptions={this.props.mapFormOptions}
            toggleCollapse={this.props.toggleCollapse}
            setCurrent={this.props.setCurrent}
            setSpecimenList={this.props.setSpecimenList}
            setContainerList={this.props.setContainerList}
            addListItem={this.props.addListItem}
            copyListItem={this.props.copyListItem}
            removeListItem={this.props.removeListItem}
            saveSpecimenList={this.props.saveSpecimenList}
            close={this.props.close}
          />
        </Modal>
      </div>
    );

    const barcodesPrimary = this.props.mapFormOptions(
      this.props.options.containersPrimary, 'barcode'
    );
    const searchSpecimenButton = (
      <Search
        title='Go To Specimen'
        action={()=>{this.props.edit('searchSpecimen')}}
        show={this.props.editable.searchSpecimen}
        close={this.props.close}
        barcodes={barcodesPrimary}
        history={this.props.history}
      />
    );

    const barcodesNonPrimary = this.props.mapFormOptions(
      this.props.options.containersNonPrimary, 'barcode'
    );
    const searchContainerButton= (
      <Search
        title='Go To Container'
        action={()=>{this.props.edit('searchContainer')}}
        show={this.props.editable.searchContainer}
        close={this.props.close}
        barcodes={barcodesNonPrimary}
        history={this.props.history}
      />
    );

    const poolSpecimenButton = (
      <div className='action' title='Pool Specimens'>
        <div 
          className='action-button pool' 
          onClick={this.openPoolForm}
        >
          <span className='glyphicon glyphicon-tint'/>
        </div>
        <Modal
          title='Pool Specimens'
          show={this.props.editable.poolSpecimenForm}
          closeModal={this.props.close}
        >
          <PoolSpecimenForm
            options={this.props.options}
            current={this.props.current}
            setCurrent={this.props.setCurrent}
            mapFormOptions={this.props.mapFormOptions}
            setListLength={this.props.setListLength}
            setPoolList={this.props.setPoolList}
            setPool={this.props.setPool}
            savePool={this.props.savePool}
          />
        </Modal>
      </div>
    );

    const batchPreparationButton = (
      <div className='action' title='Prepare Specimens'>
        <div 
          className='action-button prepare'
          onClick={this.openBatchPreparationForm}
        >
          <span className='glyphicon glyphicon-filter'/>
        </div>
        <Modal
          title='Prepare Specimens'
          show={this.props.editable.batchPreparationForm}
          closeModal={this.props.close}
        >
          <BatchPreparationForm
            options={this.props.options}
            current={this.props.current}
            errors={this.props.errors}
            setCurrent={this.props.setCurrent}
            setListLength={this.props.setListLength}
            mapFormOptions={this.props.mapFormOptions}
            saveBatchPreparation={this.props.saveBatchPreparation}
            close={this.props.close}
          />
        </Modal>
      </div>

    );

    const containerTypesNonPrimary = this.props.mapFormOptions(
      this.props.options.containerTypesNonPrimary, 'label'
    );
    const addContainerButton = (
      <div className='action' title='Add Container'>
        <div className='action-button add' onClick={this.openContainerForm}>+</div>
        <Modal
          title='Add New Container'
          show={this.props.editable.containerForm}
          closeModal={this.props.close}
        >
          <BiobankContainerForm
            current={this.props.current}
            containerList={this.props.current.list}
            errors={this.props.errors.list}
            containerTypesNonPrimary={containerTypesNonPrimary}
            centers={this.props.options.centers}
            toggleCollapse={this.props.toggleCollapse}
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

    const specimenTab = (
      <div className='row'>
        <div className='col-lg-3' style={{marginTop: '10px'}}>
          <div className='filter'>
            <FilterForm
              Module='biobank'
              id='specimen-selection-filter'
              ref='specimenFilter'
              formElements={this.props.datatable.specimen.form}
              onUpdate={this.props.updateSpecimenFilter}
              filter={this.props.filter.specimen}
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
                <span className='action'>
                  {batchPreparationButton}
                </span>
              </div>
            </FilterForm>
          </div>
        </div>
        <div className='col-lg-9' style={{marginTop: '10px'}}>
          <StaticDataTable
            Data={this.props.datatable.specimen.Data}
            Headers={this.props.datatable.specimen.Headers}
            Filter={this.props.filter.specimen}
            getFormattedCell={this.formatSpecimenColumns}
          />
        </div>
      </div>
    );

    const containerTab = (
      <div className='row'>
        <div className='col-lg-3' style={{marginTop: '10px'}}>
          <div className='filter'>
            <FilterForm
              Module='biobank' 
              id='container-selection-filter'
              ref='containerFilter'
              formElements={this.props.datatable.container.form}
              onUpdate={this.props.updateContainerFilter}
              filter={this.props.filter.container}
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
            Data={this.props.datatable.container.Data}
            Headers={this.props.datatable.container.Headers}
            Filter={this.props.filter.container}
            getFormattedCell={this.formatContainerColumns}
          />
        </div>
      </div>
    );

    const poolTab = (
      <div className='row'>
        <div className='col-lg-3' style={{marginTop: '10px'}}>
          <div className='filter'>
            <FilterForm
              Module='biobank' 
              id='pool-selection-filter'
              ref='poolFilter'
              formElements={this.props.datatable.pool.form}
              onUpdate={this.props.updatePoolFilter}
              filter={this.props.filter.pool}
		        >
              <ButtonElement
                label="Clear Filters"
                type="reset"
                onUserInput={this.resetPoolFilters}
              />
              <div className='align-row'>
                <span className='action'>
                </span>
              </div>
            </FilterForm>
          </div>
        </div>
        <div className='col-lg-9' style={{marginTop: '10px'}}>
          <StaticDataTable
            Data={this.props.datatable.pool.Data}
            Headers={this.props.datatable.pool.Headers}
            Filter={this.props.filter.pool}
            getFormattedCell={this.formatPoolColumns}
          />
        </div>
      </div>
    );

    const tabList = [
      {id: 'specimens', label: 'Specimens'},
      {id: 'containers', label: 'Containers'},
      {id: 'pools', label: 'Pools'}
    ];

    return (
      <div id='biobank-page'>
        <Tabs tabs={tabList} defaultTab="specimens" updateURL={true}>
          <TabPane TabId={tabList[0].id}>
            {specimenTab}
          </TabPane>
          <TabPane TabId={tabList[1].id}>
            {containerTab}
          </TabPane>
          <TabPane TabId={tabList[2].id}>
            {poolTab}
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

BiobankFilter.propTypes = {
  filter: React.PropTypes.object.isRequired,
  datatable: React.PropTypes.object.isRequired,
  options: React.PropTypes.object.isRequired,
  editable: React.PropTypes.object.isRequired,
  loadContainer: React.PropTypes.func.isRequired,
  loadTransfer: React.PropTypes.func.isRequired,
  updateSpecimenFilter: React.PropTypes.func.isRequired,
  updateContainerFilter: React.PropTypes.func.isRequired,
  mapFormOptions: React.PropTypes.func.isRequired,
  edit: React.PropTypes.func.isRequired,
  close: React.PropTypes.func.isRequired,
}

BiobankFilter.defaultProps = {
}

class Search extends React.Component {
  render() {
    return (
      <div className='action' title={this.props.title}>
        <div className='action-button search' onClick={this.props.action}>
          <span className='glyphicon glyphicon-search'/>
        </div>
        <Modal
          title={this.props.title}
          show={this.props.show}
          closeModal={this.props.close}
          throwWarning={false}
        >
          <SearchableDropdown
            name='barcode'
            label='Barcode'
            options={this.props.barcodes}
            onUserInput={(name, value) => {
              this.props.barcodes[value] &&
              this.props.history.push(`/barcode=${this.props.barcodes[value]}`)
            }}
            placeHolder='Please Scan or Select Barcode'
            autoFocus={true}
          />
        </Modal>
      </div>
    );
  }
}

Search.propTypes = {

}

Search.defaultProps = {

}

export default BiobankFilter;
