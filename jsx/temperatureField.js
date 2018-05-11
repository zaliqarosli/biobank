/**
 * Biobank Container Temperature Form
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 * */

class TemperatureField extends React.Component {
  render() {
    return (
      <div className={this.props.className}>
        <TextboxElement
          name='temperature'
          labelClass='col-sm-0'
          onUserInput={this.props.setContainerData}
          value={this.props.container.temperature}
        />  
        <ButtonElement
          label="Update"
          onUserInput={this.props.saveContainer}
        />
        <a onClick={this.props.toggleEditTemperature}>
          Cancel
        </a>
      </div>
    );
  }
}

TemperatureField.propTypes = {
  setContainerData: React.PropTypes.func,
  container: React.PropTypes.object,
  saveContainer: React.PropTypes.func,
  className: React.PropTypes.string
};

export default TemperatureField;
