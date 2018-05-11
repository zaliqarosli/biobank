/**
 * Multistep Form
 *
 * This Component acts a wrapper for a form that contains multiple subforms
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 **/
class MultiStepForm extends React.Component {
  constructor(props) {
    super(props);

    this.setState = {
      step: 1
    }
  }

  render() {

    switch (this.state.step) {
      case 1:
        return this.props.formList[1];
      case 2:
        return this.props.formList[2];
      case 3:
        return this.props.formList[3];
    }
  }

  nextStep() {
    this.setState({
      step: this.state.step + 1
    });
  }

  previousStep() {
    this.setState({
      step: this.state.step - 1
    });
  }
}


MultiStepForm.propTypes = {
  
};

export default MultiStepForm;
