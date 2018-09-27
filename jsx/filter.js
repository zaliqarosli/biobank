import BiobankSpecimenForm from './specimenForm';
import PoolSpecimenForm from './poolSpecimenForm';
import BatchPreparationForm from './batchPreparationForm';
import BiobankContainerForm from './containerForm';
import {Tabs, TabPane} from 'Tabs';
import Modal from 'Modal';
import Loader from 'Loader';
import { Link } from 'react-router-dom';
import {Form, Field} from "react-final-form";

class BiobankFilter extends React.Component {
  constructor() {
    super();

    this.updateSpecimenFilter         = this.updateSpecimenFilter.bind(this);
    this.updateContainerFilter        = this.updateContainerFilter.bind(this);
    this.updatePoolFilter             = this.updatePoolFilter.bind(this);
    this.resetSpecimenFilter          = this.resetSpecimenFilter.bind(this);
    this.resetContainerFilter         = this.resetContainerFilter.bind(this);
    this.resetPoolFilter              = this.resetPoolFilter.bind(this);
    this.formatSpecimenColumns        = this.formatSpecimenColumns.bind(this);
    this.formatContainerColumns       = this.formatContainerColumns.bind(this);
    this.formatPoolColumns            = this.formatPoolColumns.bind(this);
    this.openSpecimenForm             = this.openSpecimenForm.bind(this);
    this.openPoolForm                 = this.openPoolForm.bind(this);
    this.openBatchPreparationForm     = this.openBatchPreparationForm.bind(this);
    this.openContainerForm            = this.openContainerForm.bind(this);
    this.specimenTab                  = this.specimenTab.bind(this);
    this.containerTab                 = this.containerTab.bind(this);
    this.poolTab                      = this.poolTab.bind(this);
    this.createSpecimeButton          = this.createSpecimenButton.bind(this);
    this.createPoolButton             = this.createPoolButton.bind(this);
    this.createBatchPreparationButton = this.createBatchPreparationButton.bind(this);
    this.createContainerButton        = this.createContainerButton.bind(this);
  }

  updateSpecimenFilter(name, value, id, type) {
    this.props.updateFilter('specimen', name, value, type);
  }
  
  updateContainerFilter(name, value) {
    this.props.updateFilter('container', name, value);
  }

  updatePoolFilter(name, value) {
    this.props.updateFilter('pool', name, value);
  }

  resetSpecimenFilter() {
    this.props.resetFilter('specimen');
  }

  resetContainerFilter() {
    this.props.resetFilter('container');
  }

  resetPoolFilter() {
    this.props.resetFilter('pool');
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

  formatSpecimenColumns(column, value, rowData, rowHeaders) {
    if (this.props.headers.specimen.hidden.indexOf(column) > -1) {
      return null;
    }
    let row = {};
    rowHeaders.forEach((header, index) => row[header] = rowData[index]);
    switch (column) {
      case 'Barcode':
        return <td><Link to={`/barcode=${value}`}>{value}</Link></td>;
      case 'Type':
        let type = this.props.options.specimenTypes[value].type;
        return <td>{type}</td>;
      case 'Parent Specimens':
        let barcodes = value && value.map(id => {
          let barcode = this.props.data.containers.primary[this.props.data.specimens[id].containerId].barcode;
          return <Link to={`/barcode=${barcode}`}>{barcode}</Link>;
        }).reduce((prev, curr) => [prev, ', ', curr]);
        return <td>{barcodes}</td>;
      case 'PSCID':
        const pscidURL = loris.BaseURL + '/' + value;
        return <td><a href={pscidURL}>{value}</a></td>;
      case 'Visit Label':
        const visitLabelURL = loris.BaseURL+'/instrument_list/?candID='+row['PSCID']+
          '&sessionID='+value;
        return <td><a href={visitLabelURL}>{value}</a></td>;
      case 'Status':
        const status = this.props.options.containerStati[value].status;
        switch (status) {
          case 'Available':
            return <td style={{color: 'green'}}>{status}</td>;
          case 'Reserved':
            return <td style={{color: 'orange'}}>{status}</td>;
          case 'Dispensed':
            return <td style={{color: 'red'}}>{status}</td>;
        }
      case 'Site':
        const site = this.props.options.centers[value];
        return <td>{site}</td>;
      case 'Container Barcode':
        return <td><Link to={`/barcode=${value}`}>{value}</Link></td> 
      default:
        return <td>{value}</td>;
     }
  }

  formatContainerColumns(column, value) {
    switch (column) {
      case 'Barcode':
        return <td><Link to={`/barcode=${value}`}>{value}</Link></td>;
      case 'Type':
        return <td>{this.props.options.containerTypes[value].label}</td>;
      case 'Status':
        let status = this.props.options.containerStati[value].status;
        switch (status) {
          case 'Available':
            return <td style={{color: 'green'}}>{status}</td>;
          case 'Reserved':
            return <td style={{color: 'orange'}}>{status}</td>;
          case 'Dispensed':
            return <td style={{color: 'red'}}>{status}</td>;
        }
      case 'Site':
        return <td>{this.props.options.centers[value]}</td>;
      case 'Parent Barcode':
        let barcode = value && this.props.data.containers.nonPrimary[value].barcode;
        return <td><Link to={`/barcode=${barcode}`}>{barcode}</Link></td>;
      case 'Date Created':
        return <td>{value}</td>;
    }
  }

  formatPoolColumns(column, value, rowData, rowHeaders) {
    let row = {};
    rowHeaders.forEach((header, index) => row[header] = rowData[index]);
    switch (column) {
      case 'Pooled Specimens':
        let barcodes;
        if (loris.userHasPermission('biobank_specimen_view')) {
          barcodes = value.map(id => {
            let barcode = (this.props.data.containers.primary[this.props.data.specimens[id].containerId]||{}).barcode;
            return <Link to={`/barcode=${barcode}`}>{barcode}</Link>;
          }).reduce((prev, curr) => [prev, ', ', curr]);
        }
        return <td>{barcodes}</td>;
      case 'PSCID':
        const candidateURL = loris.BaseURL + '/' + value
        return <td><a href={candidateURL}>{value}</a></td>;
      case 'Visit Label':
        const sessionURL = loris.BaseURL+'/instrument_list/?candID='+row['PSCID']+
          '&sessionID='+ value;
        return <td><a href={sessionURL}>{value}</a></td>;
      default:
        return <td>{value}</td>
    }
  }

  createSpecimenButton() {
    if (loris.userHasPermission('biobank_specimen_create')) {
      return (
        <div className='action' title='Add Specimen'>
          <div className='action-button add' onClick={this.openSpecimenForm}>+</div>
          <Modal
            title='Add New Specimen'
            show={this.props.editable.specimenForm}
            closeModal={this.props.close}
            onSubmit={() => {
              this.props.saveSpecimenList()
              .then(() => this.props.close())
            }}
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
            />
          </Modal>
        </div>
      );
    }
  }

  createPoolButton() {
    if (loris.userHasPermission('biobank_pool_create')) {
      return (
        <div>
          <div className='action' title='Pool Specimens'>
            <div className='action-button pool' onClick={this.openPoolForm}>
              <span className='glyphicon glyphicon-tint'/>
            </div>
          </div>
          <Modal
            title='Pool Specimens'
            show={this.props.editable.poolSpecimenForm}
            closeModal={this.props.close}
            onSubmit={() => {this.props.savePool(this.props.current.pool)}}
          >
            <PoolSpecimenForm
              options={this.props.options}
              data={this.props.data}
              current={this.props.current}
              setCurrent={this.props.setCurrent}
              mapFormOptions={this.props.mapFormOptions}
              setListLength={this.props.setListLength}
              setPoolList={this.props.setPoolList}
              setPool={this.props.setPool}
            />
          </Modal>
        </div>
      );
    }
  }

  createBatchPreparationButton() {
    if (loris.userHasPermission('biobank_specimen_create')) {
      return (
        <div>
          <div className='action' title='Prepare Specimens'>
            <div 
              className='action-button prepare'
              onClick={this.openBatchPreparationForm}
            >
              <span className='glyphicon glyphicon-filter'/>
            </div>
          </div>
          <Modal
            title='Prepare Specimens'
            show={this.props.editable.batchPreparationForm}
            closeModal={this.props.close}
            onSubmit={this.props.saveBatchPreparation}
          >
            <BatchPreparationForm
              options={this.props.options}
              data={this.props.data}
              current={this.props.current}
              errors={this.props.errors}
              setCurrent={this.props.setCurrent}
              setListLength={this.props.setListLength}
              mapFormOptions={this.props.mapFormOptions}
            />
          </Modal>
        </div>
      );

    }
  }

  specimenTab() {
    const barcodesPrimary = this.props.mapFormOptions(
      this.props.data.containers.primary, 'barcode'
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

    //TODO: This structure may need to change if I start to use searchable dropdowns.
    let specimenTableData = Object.values(this.props.data.specimens).map(specimen => {
      const container = this.props.data.containers.primary[specimen.containerId];
      const parentContainer = container.parentContainerId ? this.props.data.containers.nonPrimary[container.parentContainerId] : {};
      
      return [
        container.barcode,
        specimen.typeId,
        specimen.quantity+' '+this.props.options.specimenUnits[specimen.unitId].unit,
        specimen.fTCycle || null,
        specimen.parentSpecimenIds,
        this.props.options.candidates[specimen.candidateId].pscid,
        this.props.options.sessions[specimen.sessionId].label,
        specimen.poolId ? this.props.data.pools[specimen.poolId].label : null,
        container.statusId,
        container.centerId,
        parentContainer.barcode
      ];
    });

    const fTFilter = () => {
      if (!this.props.headers.specimen.hidden.includes('F/T Cycle')) {
        return (
          <TextboxElement
            name='f/t cycle'
            label='F/T Cycle'
            onUserInput={this.updateSpecimenFilter}
            value={(this.props.filter.specimen['f/t cycle']||{}).value}
          />
        );
      }
    }

    const parentSpecimensFilter = () => {
      if (!this.props.headers.specimen.hidden.includes('Parent Specimens')) {
        return (
          <TextboxElement
            name='parent specimens'
            label='Parent Specimens'
            onUserInput={this.updateSpecimenFilter}
            value={(this.props.filter.specimen['parent specimens']||{}).value}
          />
        );
      }
    }
    
    const poolFilter = () => {
      if (!this.props.headers.specimen.hidden.includes('Pool')) {
        return (
          <TextboxElement
            name='pool'
            label='Pool'
            onUserInput={this.updateSpecimenFilter}
            value={(this.props.filter.specimen.pool||{}).value}
          />
        );
      }
    }

    const specimenTypes = this.props.mapFormOptions( 
      this.props.options.specimenTypes, 'type'
    );
    const stati = this.props.mapFormOptions(
      this.props.options.containerStati, 'status'
    );
    return (
      <div className='row'>
        <div className='col-lg-3' style={{marginTop: '10px'}}>
          <div className='filter'>
            <FormElement>
              <TextboxElement
                name='barcode'
                label='Barcode'
                onUserInput={this.updateSpecimenFilter}
                value={(this.props.filter.specimen.barcode||{}).value}
              />
              <SelectElement
                name='type'
                label='Type'
                options={specimenTypes}
                onUserInput={this.updateSpecimenFilter}
                value={(this.props.filter.specimen.type||{}).value}
              />
              {fTFilter()}
              {parentSpecimensFilter()}
              <TextboxElement
                name='pscid'
                label='PSCID'
                onUserInput={this.updateSpecimenFilter}
                value={(this.props.filter.specimen.pscid||{}).value}
              />
              <TextboxElement
                name='visit label'
                label='Visit Label'
                onUserInput={this.updateSpecimenFilter}
                value={(this.props.filter.specimen['visit label']||{}).value}
              />
              <SelectElement
                name='status'
                label='Status'
                options={stati}
                onUserInput={this.updateSpecimenFilter}
                value={(this.props.filter.specimen.status||{}).value}
              />
              {poolFilter()}
              <SelectElement
                name='site'
                label='Site'
                options={this.props.options.centers}
                onUserInput={this.updateSpecimenFilter}
                value={(this.props.filter.specimen.site||{}).value}
              />
              <TextboxElement
                name='container barcode'
                label='Container Barcode'
                onUserInput={this.updateSpecimenFilter}
                value={(this.props.filter.specimen['container barcode']||{}).value}
              />
              <ButtonElement
                label='Clear Filters'
                type='reset'
                onUserInput={this.resetSpecimenFilter}
              />
              <div className='align-row'>
                <span className='action'>{searchSpecimenButton}</span>
                <span className='action'>{this.createSpecimenButton()}</span>
                <span className='action'>{this.createPoolButton()}</span>
                <span className='action'>{this.createBatchPreparationButton()}</span>
              </div>
              <CheckboxElement
                name='F/T Cycle'
                label='F/T Cycle'
                value={!this.props.headers.specimen.hidden.includes('F/T Cycle')}
                onUserInput={this.props.setSpecimenHeader}
              />
              <CheckboxElement
                name='Parent Specimens'
                label='Parent Specimens'
                value={!this.props.headers.specimen.hidden.includes('Parent Specimens')}
                onUserInput={this.props.setSpecimenHeader}
              />
              <CheckboxElement
                name='Pool'
                label='Pool'
                value={!this.props.headers.specimen.hidden.includes('Pool')}
                onUserInput={this.props.setSpecimenHeader}
              />
            </FormElement>
          </div>
        </div>
        <div className='col-lg-9' style={{marginTop: '10px'}}>
          <StaticDataTable
            data={specimenTableData}
            Headers={this.props.headers.specimen.all}
            hiddenHeaders={this.props.headers.specimen.hidden}
            Filter={this.props.filter.specimen}
            getFormattedCell={this.formatSpecimenColumns}
          />
        </div>
      </div>
    );
  }

  createContainerButton() {
    if (loris.userHasPermission('biobank_container_create')) {
      const containerTypesNonPrimary = this.props.mapFormOptions(
        this.props.options.containerTypesNonPrimary, 'label'
      );
      return (
        <div>
          <div className='action' title='Add Container'>
            <div className='action-button add' onClick={this.openContainerForm}>+</div>
          </div>
          <Modal
            title='Add New Container'
            show={this.props.editable.containerForm}
            closeModal={this.props.close}
            onSubmit={this.props.saveContainerList}
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
            />
          </Modal>
        </div>
      ); 
    }
  }

  containerTab() {
    const barcodesNonPrimary = this.props.mapFormOptions(
      this.props.data.containers.nonPrimary, 'barcode'
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


    const containerHeaders = ['Barcode', 'Type', 'Status', 'Site', 'Parent Barcode', 'Date Created'];
    let containerTableData = Object.values(this.props.data.containers.nonPrimary).map(
      row => {
        return [
          row.barcode,
          row.typeId,
          row.statusId,
          row.centerId,
          row.parentContainerId,
          row.dateTimeCreate
        ];
      }
    );

    //FIXME: the whole need for this.props.filter.container.label||{}).value
    //can likely be fixed by passing the element type through to onUserInput
    const stati = this.props.mapFormOptions(
      this.props.options.containerStati, 'status'
    );
    const containerTypesNonPrimary = this.props.mapFormOptions(
      this.props.options.containerTypesNonPrimary, 'label'
    );
    return (
      <div className='row'>
        <div className='col-lg-3' style={{marginTop: '10px'}}>
          <div className='filter'>
            <FormElement>
              <TextboxElement
                name='barcode'
                label='Barcode'
                onUserInput={this.updateContainerFilter}
                value={(this.props.filter.container.barcode||{}).value}
              />
              <SelectElement
                name='type'
                label='Type'
                options={containerTypesNonPrimary}
                onUserInput={this.updateContainerFilter}
                value={(this.props.filter.container.type||{}).value}
              />
              <SelectElement
                name='status'
                label='Status'
                options={stati}
                onUserInput={this.updateContainerFilter}
                value={(this.props.filter.container.status||{}).value}
              />
              <SelectElement
                name='site'
                label='Site'
                options={this.props.options.centers}
                onUserInput={this.updateContainerFilter}
                value={(this.props.filter.container.site||{}).value}
              />
              <TextboxElement
                name='parent barcode'
                label='Parent Barcode'
                onUserInput={this.updateContainerFilter}
                value={(this.props.filter.container['parent barcode']||{}).value}
              />
              <ButtonElement
                label='Clear Filters'
                type='reset'
                onUserInput={this.resetContainerFilter}
              />
              <div className='align-row'>
                <span className='action'>{searchContainerButton}</span>
                <span className='action'>{this.createContainerButton()}</span>
              </div>
            </FormElement>
          </div>
        </div>
        <div className='col-lg-9' style={{marginTop: '10px'}}>
          <StaticDataTable
            data={containerTableData}
            Headers={containerHeaders}
            Filter={this.props.filter.container}
            getFormattedCell={this.formatContainerColumns}
          />
        </div>
      </div>
    );
  }

  poolTab() {
    //NOTE: the order of both these arrays is very important.
    let poolHeaders = ['Label', 'Pooled Specimens', 'PSCID', 'Visit Label', 'Site', 'Date', 'Time'];
    let poolTableData = Object.values(this.props.data.pools).map(row => {
      return [
        row.label,
        row.specimenIds,
        this.props.options.candidates[row.candidateId].pscid,
        this.props.options.sessions[row.sessionId].label,
        this.props.options.centers[row.centerId],
        row.date,
        row.time
      ];
    })

    return (
      <div className='row'>
        <div className='col-lg-3' style={{marginTop: '10px'}}>
          <div className='filter'>
            <FormElement>
              <TextboxElement
                name='label'
                label='Label'
                onUserInput={this.updatePoolFilter}
                value={(this.props.filter.pool.label||{}).value}
              />
              <ButtonElement
                label='Clear Filters'
                type='reset'
                onUserInput={this.resetPoolFilter}
              />
              <div className='align-row'>
                <span className='action'>
                </span>
              </div>
            </FormElement>
          </div>
        </div>
        <div className='col-lg-9' style={{marginTop: '10px'}}>
          <StaticDataTable
            data={poolTableData}
            Headers={poolHeaders}
            Filter={this.props.filter.pool}
            getFormattedCell={this.formatPoolColumns}
          />
        </div>
      </div>
    );
  }

  render() {
    const tabs = () => {
      let tabInfo = [];
      let tabList    = [];
      if (loris.userHasPermission('biobank_specimen_view')) {
        tabInfo.push({id: 'specimens', content: this.specimenTab});
        tabList.push({id: 'specimens', label: 'Specimens'})
      }
      if (loris.userHasPermission('biobank_container_view')) {
        tabInfo.push({id: 'containers', content: this.containerTab});
        tabList.push({id: 'containers', label: 'Containers'});
      }
      if (loris.userHasPermission('biobank_pool_view')) {
        tabInfo.push({id: 'pools', content: this.poolTab});
        tabList.push({id: 'pools', label: 'Pools'});
      }

      const tabContent = Object.keys(tabInfo).map(key => {
        return <TabPane TabId={tabInfo[key].id}>{tabInfo[key].content()}</TabPane>
      });

      return (
        <Tabs tabs={tabList} updateURL={true}>
          {tabContent}
        </Tabs>
      );
    }

    return (
      <div id='biobank-page'>
        {tabs()}
      </div>
    );
  }
}

BiobankFilter.propTypes = {
  filter: React.PropTypes.object.isRequired,
  data: React.PropTypes.object.isRequired,
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
      <div>
        <div className='action' title={this.props.title}>
          <div className='action-button search' onClick={this.props.action}>
            <span className='glyphicon glyphicon-search'/>
          </div>
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
