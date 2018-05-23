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
      <div className={this.props.className}>
        <div className='col-xs-6'> 
            <SelectElement
              name='statusId'
              options={this.props.stati}
              labelClass='col-xl-0'
              inputClass='col-lg-12'
              onUserInput={this.props.setContainerData}
              value={this.props.container.statusId}
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
            onClick={() => 
              {this.props.revertContainerData(); this.props.toggle();}
            }
          >
            Cancel
          </a>
        </div>
      </div>
    );
  }
}

StatusField.propTypes = {
  setContainerData: React.PropTypes.func.isRequired,
  revertContainerData: React.PropTypes.func.isRequired,
  stati: React.PropTypes.object.isRequired,
  container: React.PropTypes.object.isRequired,
  saveContainer: React.PropTypes.func.isRequired,
  className: React.PropTypes.string
};

export default StatusField;
