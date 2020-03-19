import React, {Component} from 'react';

import Modal from 'Modal';
import LifeCycle from './lifeCycle.js';
import ContainerCheckout from './containerCheckout.js';
import SpecimenForm from './specimenForm.js';

import swal from 'sweetalert2';

class Header extends Component {
  render() {
    const {options, container, specimen, editable, current} = this.props;

    const status = options.container.stati[container.statusId].label;
    const renderActionButton = () => {
      if (status == 'Available' &&
          specimen.quantity > 0 &&
          !specimen.poolId) {
        const openAliquotForm = () => this.props.edit('aliquotForm');
        return (
          <div className='action-button add' onClick={openAliquotForm}>
            +
          </div>
        );
      } else {
        return <div className='action-button disabled'>+</div>;
      }
    };
    const addAliquotForm = () => {
      if (specimen && loris.userHasPermission('biobank_specimen_create')) {
        return (
          <div>
            <div className='action' title='Make Aliquots'>
              {renderActionButton()}
            </div>
            <SpecimenForm
              title='Add Aliquots'
              parent={[{specimen: specimen, container: container}]}
              options={this.props.options}
              data={this.props.data}
              current={this.props.current}
              increaseCoordinate={this.props.increaseCoordinate}
              show={editable.aliquotForm}
              onClose={this.props.clearAll}
              setSpecimen={this.props.setSpecimen}
              onSubmit={this.props.createSpecimens}
            />
          </div>
        );
      }
    };

    const alterLotNumber = () => {
      if (loris.userHasPermission('biobank_specimen_alter')) {
        return (
          <div className='action' title='Alter Lot Number'>
            <span
              style={{color: 'grey'}}
              className='glyphicon glyphicon-pencil'
              onClick={() => {
                this.props.editContainer(this.props.container);
                this.props.edit('lotForm');
              }}
            />
          </div>
        );
      }
    };

    const alterExpirationDate = () => {
      if (loris.userHasPermission('biobank_specimen_alter')) {
        return (
          <div className='action' title='Alter Expiration Date'>
            <span
              style={{color: 'grey'}}
              className='glyphicon glyphicon-pencil'
              onClick={() => {
                this.props.editContainer(this.props.container);
                this.props.edit('expirationForm');
              }}
            />
          </div>
        );
      }
    };

    const lotForm = (
      <Modal
        title='Edit Lot Number'
        onClose={this.props.clearAll}
        show={editable.lotForm}
        onSubmit={() => this.props.updateContainer(current.container)}
      >
        <FormElement>
          <TextboxElement
            name='lotNumber'
            label='Lot Number'
            onUserInput={this.props.setContainer}
            value={current.container.lotNumber}
          />
        </FormElement>
     </Modal>
    );

    const expirationForm = (
      <Modal
        title='Edit Expiration Date'
        onClose={this.props.clearAll}
        show={editable.expirationForm}
        onSubmit={() => this.props.updateContainer(current.container)}
      >
        <FormElement>
          <DateElement
            name='expirationDate'
            label='Expiration Date'
            onUserInput={this.props.setContainer}
            value={current.container.expirationDate}
          />
        </FormElement>
     </Modal>
    );

    const parentBarcodes = this.props.getParentContainerBarcodes(container);
    const barcodePathDisplay = this.props.getBarcodePathDisplay(parentBarcodes);
    const printBarcode = () => {
      const labelParams = [{
        barcode: container.barcode,
        type: options.specimen.types[specimen.typeId].label,
      }];
      this.props.printLabel(labelParams)
        .then(() => (swal.fire('Print Barcode Number: ' + container.barcode)));
    };

    return (
      <div className="specimen-header">
        <div className='specimen-title'>
          <div className='barcode'>
            Barcode
            <div className='value'>
              <strong>{container.barcode}</strong>
            </div>
            <span className='barcodePath'>
              Address: {barcodePathDisplay} <br/>
              Lot Number: {container.lotNumber} {alterLotNumber()}<br/>
              Expiration Date: {container.expirationDate}{alterExpirationDate()}
            </span>
            {lotForm}{expirationForm}
          </div>
          <div className='action' title='Print Barcode'>
            <div className='action-button update' onClick={printBarcode}>
              <span className='glyphicon glyphicon-print'/>
            </div>
          </div>
          {addAliquotForm()}
          <ContainerCheckout
            container={container}
            current={current}
            editContainer={this.props.editContainer}
            setContainer={this.props.setContainer}
            updateContainer={this.props.updateContainer}
          />
        </div>
        <LifeCycle
          specimen={specimen}
          centers={options.centers}
        />
      </div>
    );
  }
}

export default Header;
