/**
 * Biobank Container Location Field
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 * */

class LocationField extends React.Component {
  render() {
    return (
      <div className={this.props.className}>
        <div className='col-xs-6'> 
            <SelectElement
              name='locationId'
              options={this.props.centers}
              labelClass='col-xl-0'
              inputClass='col-lg-12'
              onUserInput={this.props.setContainer}
              value={this.props.container.locationId}
            />  
        </div>
        <div className='col-xs-3'> 
          <ButtonElement
            label="Update"
            onUserInput={this.props.saveContainer}
            columnSize= 'col-lg-12'
          />
        </div>
        <div className='col-xs-3'> 
          <a
            onClick={this.props.close}
          >
            Cancel
          </a>
        </div>
      </div>
    );
  }
}

LocationField.propTypes = {
  setContainer: React.PropTypes.func.isRequired,
  close: React.PropTypes.func.isRequired,
  centerIds: React.PropTypes.object.isRequired,
  container: React.PropTypes.object.isRequired,
  saveContainer: React.PropTypes.func.isRequired,
  className: React.PropTypes.string
};

export default LocationField;
