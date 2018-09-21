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

  render() {
    let list = this.props.current.list;
    let barcodes = [];
    let containersPrimary = {};

    //Create options for barcodes based on match candidateId, sessionId and typeId
    Object.values(this.props.options.containersPrimary).map(container => {
      const specimen = Object.values(this.props.data.specimens).find(
        specimen => specimen.containerId == container.id
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
            containerId && this.props.setPoolList(key, containerId);
          }}
          options={barcodesPrimary}
          value={list[key].container.id}
          required={true}
          disabled={list[key].container.id ? true : false}
        />
      );
    });
    
    const poolForm = (
      <div>
        <div className='row'>
          <div className='col-sm-10 col-sm-offset-1'>
            <StaticElement
              label='Pooling Note'
              text="Select or Scan the specimens to be pooled. Specimens must
                    be have a Status of 'Available', have a Quantity of greater
                    than 0, and share the same Type, PSCID, Visit Label
                    and Current Site."
            />
            {/*TODO: find a better way to place this 'form-top' line here*/}
            <div className='form-top'>
              <TextboxElement
                name='label'
                label='Label'
                onUserInput={this.props.setPool}
                required={true}
                value={this.props.current.pool.label}
                errorMessage={''}
              />
              <DateElement
                name='date'
                label='Date'
                minYear='2000'
                maxYear='2018'
                onUserInput={this.props.setPool}
                required={true}
                value={this.props.current.pool.date}
                errorMessage={''}
              />
              <TimeElement
                name='time'
                label='Time'
                onUserInput={this.props.setPool}
                required={true}
                value={this.props.current.pool.time}
                errorMessage={''}
              />
              <NumericElement
                name='total'
                label='№ of Specimens'
                min='2'
                max='100'
                value={Object.keys(list).length}
                onUserInput={
                  (name, value) => 1 < value < 100 && this.props.setListLength(name, value)
                }
              />
            </div>
            {barcodes}
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
          </div>
        </div>
      </div>
    );

    return (
      <FormElement name="poolSpecimenForm">
        {poolForm}
      </FormElement>
    );
  }
}

PoolSpecimenForm.propTypes = {
};

export default PoolSpecimenForm;
