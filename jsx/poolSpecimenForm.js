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
    const {current, data, errors, options, setListLength, setPool, setPoolList} = this.props;
    const list = current.list;

    // Create options for barcodes based on match candidateId, sessionId and
    // typeId and don't already belong to a pool.
    const containersPrimary = {};
    Object.values(data.containers.primary).map((container) => {
      const specimen = Object.values(data.specimens).find(
        (specimen) => specimen.containerId == container.id
      );
      const availableId = Object.keys(options.container.stati).find(
        (key) => options.container.stati[key].label === 'Available'
      );

      if (specimen.quantity != 0 &&
          container.statusId == availableId &&
          specimen.poolId == null) {
        if (current.candidateId) {
          if (
            specimen.candidateId == current.candidateId &&
            specimen.sessionId == current.sessionId &&
            specimen.typeId == current.typeId &&
            container.centerId == current.centerId
          ) {
            containersPrimary[container.id] = container;
          }
        } else {
          containersPrimary[container.id] = container;
          // TODO: potentially make a check to ensure atleast two specimens meet
          // the previous conditions
        }
      }
    });

    const barcodes = Object.keys(list).map((key) => {
      // Only allow containers that are not already in the list
      const validContainers = Object.keys(containersPrimary).reduce((result, id) => {
        let f = Object.values(list).find((i) => i.container.id == id);
        if (!f || list[key].container.id == id) {
          result[id] = containersPrimary[id];
        };
        return result;
      }, {});

      const barcodesPrimary = this.props.mapFormOptions(validContainers, 'barcode');
      return (
        <SearchableDropdown
          name={key}
          label={'Barcode ' + (parseInt(key)+1)}
          onUserInput={(key, containerId) => {
            containerId && setPoolList(key, containerId);
          }}
          options={barcodesPrimary}
          value={list[key].container.id}
          required={true}
          disabled={list[key].container.id ? true : false}
        />
      );
    });

    return (
      <FormElement name="poolSpecimenForm">
        <div className='row'>
          <div className='col-sm-10 col-sm-offset-1'>
            <StaticElement
              label='Pooling Note'
              text="Select or Scan the specimens to be pooled. Specimens must
                    be have a Status of 'Available', have a Quantity of greater
                    than 0, and share the same Type, PSCID, Visit Label
                    and Current Site. Pooled specimens cannot already belong to
                    a pool."
            />
            <div className='form-top'>
              <TextboxElement
                name='label'
                label='Label'
                onUserInput={setPool}
                required={true}
                value={current.pool.label}
                errorMessage={errors.pool.label}
              />
              <DateElement
                name='date'
                label='Date'
                minYear='2000'
                maxYear='2018'
                onUserInput={setPool}
                required={true}
                value={current.pool.date}
                errorMessage={errors.pool.date}
              />
              <TimeElement
                name='time'
                label='Time'
                onUserInput={setPool}
                required={true}
                value={current.pool.time}
                errorMessage={errors.pool.time}
              />
              <NumericElement
                name='total'
                label='№ of Specimens'
                min='2'
                max='100'
                value={Object.keys(list).length}
                onUserInput={
                  (name, value) => 1 < value < 100 && setListLength(name, value)
                }
                errorMessage={errors.pool.total}
              />
            </div>
            {barcodes}
            <StaticElement
              label='Specimen Type'
              text={
                (options.specimen.types[current.typeId]||{}).label || '—'}
            />
            <StaticElement
              label='PSCID'
              text={(options.candidates[current.candidateId]||{}).pscid || '—'}
            />
            <StaticElement
              label='Visit Label'
              text={(options.sessions[current.sessionId]||{}).label || '—'}
            />
          </div>
        </div>
      </FormElement>
    );
  }
}

PoolSpecimenForm.propTypes = {
};

export default PoolSpecimenForm;
