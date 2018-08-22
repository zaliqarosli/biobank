import BiobankSpecimenForm from './specimenForm';
import SpecimenPreparationForm from './preparationForm';

/**
 * Biobank Pool Specimen Form
 *
 * TODO: DESCRIPTION
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 **/
class PoolSpecimenForm extends React.Component {
  constructor() {
    super();

    this.state = {
      step: 1
    }

    this.setPool  = this.setPool.bind(this);
    this.validate = this.validate.bind(this);
    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
  };

  setPool(key, containerId) {
    let list        = this.props.current.poolList;
    const container = this.props.options.containers[containerId];
    const specimen  = Object.values(this.props.options.specimens).find(
      specimen => {return specimen.containerId == containerId}
    );

    list[key].container = container;
    list[key].specimen  = specimen;

    this.props.setCurrent('poolList', list);
    this.props.setCurrent('candidateId', specimen.candidateId);
    this.props.setCurrent('sessionId', specimen.sessionId);
    this.props.setCurrent('typeId', specimen.typeId);
    this.props.setCurrent('centerId', container.centerId);
  }

  //TODO: refactor this mess once the whole form works.
  validate() {
    let list          = this.props.clone(this.props.current.poolList);
    let numOfBarcodes = 0;
    for (let i in list) {list[i].container.barcode && numOfBarcodes++}

    if (numOfBarcodes < 2) {
      swal('Specimen Pooling Requires Atleast 2 Specimens', '', 'warning')
    } else {
      const preparation = this.props.current.preparation;

      if (preparation) {
        preparation.centerId  = this.props.current.centerId;
        let attributes        = this.props.options.specimenProtocolAttributes[preparation.protocolId];
        this.props.validateProcess(
          preparation,
          attributes,
          ['protocolId', 'centerId', 'date', 'time']
        ).then(() => {
          //TODO: This may be best in the savePoolList() function.
          //Actually, it DEFINITELY should.
          Object.values(list).forEach(item => {
            if (item.specimen.preparation) {
              swal(`Preparation for specimen ${item.container.barcode} already 
              exists. By completing this form, the previous preparation will be 
              overwritten.`, '', 'warning');
            }
            item.specimen.preparation = this.props.clone(this.props.current.preparation);
            item.specimen.quantity    = 0;
          });
          this.props.setCurrent('poolList', list);
          this.next();
        }).catch(e => this.props.setErrors('preparation', e));

      } else {
        this.next()
      }
    }
  }

  next() {
    this.setState({step: this.state.step+1});
    this.props.addListItem('specimen');
  }

  previous() {
    this.setState({step: this.state.step-1});
  }

  // TODO: make this more global
  formSwitch(inputForm, specimenForm) {
    switch(this.state.step) {
      case 1:
        return inputForm;
      case 2:
        return specimenForm;
    }
  }

  render() {
    let list = this.props.current.poolList;
    let barcodes = [];
    let containersPrimary = {};

    //Create options for barcodes based on match candidateId, sessionId and typeId
    //TODO: there must be a better check I can do here.
    //

    Object.values(this.props.options.containersPrimary).map(container => {
      const specimen = Object.values(this.props.options.specimens).find(
        specimen => {return specimen.containerId == container.id}
      );
      const availableId = Object.keys(this.props.options.containerStati).find(
        key => this.props.options.containerStati[key].status === 'Available'
      );

      if (specimen.quantity != 0 && container.statusId == availableId) {
        if (this.props.current.candidateId) {
          if (
            specimen.candidateId == this.props.current.candidateId &&
            specimen.sessionId   == this.props.current.sessionId   &&
            specimen.typeId      == this.props.current.typeId      &&
            container.centerId   == this.props.current.centerId 
          ) {
            containersPrimary[container.id] = container;
          }
        } else {
          containersPrimary[container.id] = container;
          //TODO: potentially make a check to ensure atleast two specimens meet
          //the previous conditions
        }
      }
    });

    Object.keys(list).map(key => {

      //Only allow containers that are not already in the list
      let validContainers = {};
      for (let id in containersPrimary) {
        let f = Object.values(list).find(i => i.container.id == id);
        if (!f || list[key].container.id == id) {
          validContainers[id] = containersPrimary[id];
        }
      }

      let barcodesPrimary = this.props.mapFormOptions(validContainers, 'barcode');
      barcodes.push(
        <SearchableDropdown
          name={key}
          label={'Barcode ' + (parseInt(key)+1)}
          onUserInput={(key, containerId) => {
            containerId && this.setPool(key, containerId);
          }}
          options={barcodesPrimary}
          value={list[key].container.id}
          required={true}
          disabled={list[key].container.id ? true : false}
        />
      );
    });
    
    let preparationButton = () => {
      let protocolExists = Object.values(this.props.options.specimenProtocols).find(protocol => {
        return protocol.typeId == this.props.current.typeId
      })
      if (protocolExists && this.props.current.preparation == null) {
        //TODO: Perhaps add this.props.edit.preparationForm
        // Try it out and see if it works. It may be difficult to 'revert', because
        // it is essentially an edit within an edit.
        return (
          <ButtonElement
            label='Add Preparation'
            onUserInput={()=>{this.props.setCurrent('preparation', {})}}
          />
        );
      }
    }

    let preparationForm = () => {
      if (this.props.current.preparation) {
        return (
          <SpecimenPreparationForm
            typeId={this.props.current.typeId}
            preparation={this.props.current.preparation}
            options={this.props.options}
            errors={this.props.errors.preparation}
            setCurrent={this.props.setCurrent}
          />
        )
      }
    }
    
    const inputForm = (
      <div>
        <div className='row'>
          <div className='col-sm-10 col-sm-offset-1'>
            <StaticElement
              label='Pooling Note'
              text="Select or Scan the specimens to be pooled. Specimens must
                    be have a Status of 'Available', have a Quantity of greater
                    than 0, and share the same Type, PSCID, Visit Label
                    and Current Site. After the completion of the form, the 
                    Quantity of all Pooled Specimens will be automatically set 
                    to 0. Any previous Preparation associated with a Pooled 
                    Specimen will be overwritten if one is added on this form."
            />
            <StaticElement
              label='Specimen Type'
              text={
                (this.props.options.specimenTypes[this.props.current.typeId]||{}).type || '—'}
            />
            <StaticElement
              label='PSCID'
              text={(this.props.options.candidates[this.props.current.candidateId]||{}).pscid || '—'}
            />
            <StaticElement
              label='Visit Label'
              text={(this.props.options.sessions[this.props.current.sessionId]||{}).label || '—'}
            />
            {/*TODO: find a better way to place this 'form-top' line here*/}
            <div className='form-top'>
              <NumericElement
                name='total'
                label='№ of Specimens'
                min='2'
                max='100'
                value={Object.keys(list).length}
                onUserInput={
                  (name, value) => 1 < value < 100 && this.props.setPoolList(name, value)
                }
              />
            </div>
            {barcodes}
            <div className='form-top'>
              {preparationButton()}
              {preparationForm()}
            </div>
          </div>
        </div>
        <div className='row'>
          <div className='col-sm-3 col-sm-offset-9'>
            <div className='action-title'>
              Next
            </div>
            <span className='action'>
              <div className='action-button update' onClick={this.validate}>
                <span className='glyphicon glyphicon-chevron-right'/>
              </div>
            </span>
          </div>
        </div>
      </div>
    );

    const specimenForm = (
      <div>
        <BiobankSpecimenForm
          parent={this.props.current.poolList}
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
        />
        <div className='row'>
          <div className='col-sm-3 col-sm-offset-2'>
            <span className='action'>
              <div className='action-button update' onClick={this.previous}>
                <span className='glyphicon glyphicon-chevron-left'/>
              </div>
            </span>
            <div className='action-title'>
              Previous
            </div>
          </div>
          <div className='col-sm-3 col-sm-offset-4'>
            <ButtonElement
              label='Submit'
              onUserInput={()=>{this.props.savePoolList().then(()=>this.props.saveSpecimenList())}}
            />
          </div>
        </div>
      </div>
    );

    return (
      <FormElement
        name="poolSpecimenForm"
        id='poolSpecimenForm'
        ref="form"
      >
        {this.formSwitch(inputForm, specimenForm)}
      </FormElement>
    );
  }
}

PoolSpecimenForm.propTypes = {
  DataURL: React.PropTypes.string.isRequired,
  action: React.PropTypes.string.isRequired,
  refreshTable: React.PropTypes.func
};

export default PoolSpecimenForm;
