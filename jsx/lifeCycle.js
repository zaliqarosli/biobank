/**
 * LifeCycle
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 **/

class LifeCycle extends React.Component {
  constructor(props) {
    super(props);
 
    this.state = {
    };
   
  }

  render() {

    return (
      <div className='lifecycle-container'>
        <div className='lifecycle'>
            Test
            <span className='lifecycle-node tracking-bar__item--active'/>
            <span className='lifecycle-bar'/>
            <span className='lifecycle-node tracking-bar__item--active'/>
            <span className='lifecycle-bar'/>
            <span className='lifecycle-node tracking-bar__item--active'/>
        </div>
      </div>
    );
  }

}

LifeCycle.propTypes = {
}

export default LifeCycle;
