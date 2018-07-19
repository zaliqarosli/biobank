/**
 * Biobank Container Status Field
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 * */

class StatusField extends React.Component {
  render() {
    return (
      <div className='inline-field'>
        <div style={{flex: '1 0 25%', minWidth: '90px'}}> 
            <SelectElement
              name='statusId'
              options={this.props.stati}
              inputClass='col-lg-11'
              onUserInput={this.props.setContainer}
              value={this.props.container.statusId}
              errorMessage={this.props.errors.statusId}
            />  
        </div>
        <div style={{flex: '0 1 15%', margin: '0 1%'}}> 
          <ButtonElement
            label='Update'
            onUserInput={this.props.saveContainer}
            columnSize= 'col-lg-11'
          />
        </div>
        <div style={{flex: '0 1 15%', margin: '0 1%'}}> 
          <a onClick={this.props.close} style={{cursor:'pointer'}}>
            Cancel
          </a>
        </div>
      </div>
    );
  }
}

StatusField.propTypes = {
  setContainer: React.PropTypes.func.isRequired,
  close: React.PropTypes.func,
  stati: React.PropTypes.object.isRequired,
  container: React.PropTypes.object.isRequired,
  saveContainer: React.PropTypes.func.isRequired,
  className: React.PropTypes.string
};

export default StatusField;
