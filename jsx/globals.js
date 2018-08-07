import Modal from 'Modal';
import QuantityField from './quantityField';
import TemperatureField from './temperatureField';
import StatusField from './statusField';
import CenterField from './centerField';
import ContainerParentForm from './containerParentForm';
import { Link } from 'react-router-dom';

/**
 * Biobank Globals Component
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 * */

class Globals extends React.Component {
  constructor() {
    super();
    this.increaseCycle = this.increaseCycle.bind(this);
    this.decreaseCycle = this.decreaseCycle.bind(this);
  }

  increaseCycle() {
    this.props.editSpecimen(this.props.data.specimen).then(() => {
      let cycle = this.props.specimen.fTCycle;
      cycle++;
      console.log(cycle);
      this.props.setSpecimen('fTCycle', cycle);
      this.props.saveSpecimen();
    });
  }

  decreaseCycle() {
    this.props.editSpecimen(this.props.data.specimen).then(() => {
      let cycle = this.props.specimen.fTCycle;
      cycle--;
      this.props.setSpecimen('fTCycle', cycle);
      this.props.saveSpecimen();
    });
  }

  render() {
    let specimenTypeField;
    if (this.props.data.specimen) {
      specimenTypeField = (
        <div className="item">                                                
          <div className='field'>                                             
            Specimen Type
            <div className='value'>
              {this.props.options.specimenTypes[
                this.props.data.specimen.typeId
              ].type}
            </div>
          </div>
        </div>
      );
    }

    let containerTypeField = (
       <div className="item">                                                
         <div className='field'>                                             
           Container Type                                                              
           <div className='value'>                                           
             {this.props.options.containerTypes[
               this.props.data.container.typeId
             ].label}
           </div>                                                            
         </div>                                                              
       </div>                                                                
    );                                                                            

    let quantityField;                                                          
    if (this.props.data.specimen) {
      if (!this.props.editable.quantity) {                                             
        quantityField = (                                                         
          <div className="item">                                                  
            <div className='field'>                                               
              Quantity                                                            
              <div className='value'>                                             
                {this.props.data.specimen.quantity}                               
                {' '+this.props.options.specimenUnits[this.props.data.specimen.unitId].unit}
              </div>
            </div>
            <div
              className='action'
              title='Update Quantity'
            >
              <div                                                                
                className='action-button update'                                  
                onClick={() => {this.props.edit('quantity'); this.props.editSpecimen(this.props.data.specimen)}}
              >                                                                   
                <span className='glyphicon glyphicon-chevron-right'/>             
              </div>                                                              
            </div>                                                                
          </div>                                                                  
        );                                                                        
      } else {                                                                    
        let units = this.props.mapFormOptions(
          this.props.options.specimenTypeUnits[this.props.data.specimen.typeId], 'unit'
        );

        quantityField = (
          <div className="item">
            <div className='field'>
              Quantity
              <QuantityField
                specimen={this.props.specimen}
                errors={this.props.errors.specimen}
                units={units}
                close={this.props.close}
                setSpecimen={this.props.setSpecimen}
                saveSpecimen={this.props.saveSpecimen}
              />
            </div>
          </div>
        )
      }
    }

    let fTCycleField;
    if (this.props.data.specimen && this.props.options.specimenTypes[
      this.props.data.specimen.typeId
    ].freezeThaw == 1) {
      let decreaseCycle;
      if (this.props.data.specimen.fTCycle > 0) {
        decreaseCycle = (
          <div
            className='action'
            title='Remove Cycle'
          >
            <span
              className='action-button update'
              onClick={this.decreaseCycle}
            >
              <span className='glyphicon glyphicon-minus'/>
            </span>
          </div>
        )
      }
      fTCycleField = (
        <div className='item'>
          <div className='field'>
          Freeze-Thaw Cycle
            <div className='value'>
              {this.props.data.specimen.fTCycle}
            </div>
          </div>
          {decreaseCycle}
          <div
            className='action'
            title='Add Cycle'
          >
            <span
              className='action-button update'
              onClick={this.increaseCycle}
            >
              <span className='glyphicon glyphicon-plus'/>
            </span>
          </div>
        </div>
      );
    }

    let temperatureField;                                                        
    if (!this.props.editable.temperature) {                                     
      temperatureField = (                                                       
        <div className="item">                                                  
          <div className='field'>                                               
            Temperature                                                         
            <div className='value'>                                             
              {this.props.data.container.temperature + '°C'}                    
            </div>                                                              
          </div>                                                                
          <div                                                                  
            className='action'                                                  
            title='Update Temperature'                                          
          >                                                                     
            <span                                                               
              className='action-button update'                                  
              onClick={() => {this.props.edit('temperature'); this.props.editContainer(this.props.data.container)}}
            >                                                                   
              <span className='glyphicon glyphicon-chevron-right'/>             
            </span>                                                             
          </div>                                                                
        </div>                                                                  
      );                                                                         
    } else {                                                                   
      temperatureField = (                                                      
        <div className="item">                                                  
          <div className='field'>                                               
            Temperature                                                         
            <TemperatureField                                                   
              container={this.props.container}                                  
              errors={this.props.errors.container}
              close={this.props.close}                     
              setContainer={this.props.setContainer}
              saveContainer={this.props.saveContainer}
            />                                                                  
          </div>                                                                
        </div>                                                                  
      )                                                                         
    }                                                                           
                                                                                
   let statusField;                                                             
   if (!this.props.editable.status) {                                          
     statusField = (                                                            
        <div className="item">                                                  
          <div className='field'>                                               
            Status                                                              
            <div className='value'>                                             
              {this.props.options.containerStati[this.props.data.container.statusId].status}
            </div>                                                              
          </div>                                                                
          <div className='action' title='Update Status'>
            <span
              className='action-button update'
              onClick={() => {this.props.edit('status'); this.props.editContainer(this.props.data.container);}}
            >                                                                   
              <span className='glyphicon glyphicon-chevron-right'/>             
            </span>                                                             
          </div>                                                                
        </div>                                                                  
     );                                                                         
     } else {                                                                   
      let stati = this.props.mapFormOptions(this.props.options.containerStati, 'status');
      statusField = (                                                           
        <div className="item">                                                  
          <div className='field'>                                               
            Status                                                              
            <StatusField                                                        
              container={this.props.container}                                  
              errors={this.props.errors.container}
              stati={stati}
              close={this.props.close}
              setContainer={this.props.setContainer}                          
              saveContainer={this.props.saveContainer}                                
            />                                                                  
          </div>                                                                
        </div>                                                                  
      )                                                                         
    }                                                      

    let centerField;                                                           
    if (!this.props.editable.center) {                                        
      centerField = (                                                          
        <div className="item">                                                  
          <div className='field'>                                               
            Location                                                            
            <div className='value'>                                             
              {this.props.options.centers[this.props.data.container.centerId]}  
            </div>                                                              
          </div>                                                                
          <div                                                                  
            className='action'                                                  
            title='Update Status'                                               
          >                                                                     
            <span                                                               
              className='action-button update'                                  
              onClick={() => {this.props.edit('center'); this.props.editContainer(this.props.data.container);}}
            >                                                                   
              <span className='glyphicon glyphicon-chevron-right'/>             
            </span>                                                             
          </div>                                                                
        </div>                                                                  
      );                                                                         
    } else {                                                                   
      centerField = (                                                         
        <div className="item">                                                  
          <div className='field'>                                               
            Location                                                            
            <CenterField                                                      
              container={this.props.container}
              errors={this.props.errors.container}
              centers={this.props.options.centers}
              close={this.props.close}                        
              setContainer={this.props.setContainer}                          
              saveContainer={this.props.saveContainer}                                
            />                                                                  
          </div>                                                                
        </div>                                                                  
      );                                                                         
    }                                                                           

    let originField = (
      <div className="item">                                                
        <div className='field'>                                             
          Origin                                                            
          <div className='value'>                                           
            {this.props.options.centers[this.props.data.container.originId]}  
          </div>                                                            
        </div>                                                              
      </div>                                                                
    );

    let creationDate = (
      <div className="item">                                                
        <div className='field'>                                             
          Creation Date                                                     
          <div className='value'>                                           
            {this.props.data.container.dateTimeCreate}                      
          </div>                                                            
        </div>                                                              
      </div>                                                                
    );

    let parentSpecimenField;
    //TODO: allow for multiple parents
    if ((this.props.data.specimen||{}).parentSpecimenId) {
      let barcode = this.props.options.containers[
        this.props.options.specimens[
          this.props.data.specimen.parentSpecimenId
        ].containerId
      ].barcode;
      let parentSpecimenFieldValue = (
        <Link to={`/barcode=${barcode}`}>{barcode}</Link>
      );

      parentSpecimenField = (
        <div className='item'>
          <div className='field'>
          Parent Specimen
            <div className='value'>
              {parentSpecimenFieldValue || 'None'}
            </div>
          </div>
        </div>
      );
    }

    //checks if parent container exists and returns static element with href
    let parentContainerBarcodeValue;
    if (this.props.data.container.parentContainerId) {
      let barcode = this.props.options.containers[this.props.data.container.parentContainerId].barcode
      parentContainerBarcodeValue = (
        <Link to={`/barcode=${barcode}`}>{barcode}</Link>
      );                                                                          
    }                                                                             

    let parentContainerField = (
      <div className="item">
        <div className='field'>
          Parent Container
          <div className='value'>
            {parentContainerBarcodeValue || 'None'}
          </div>
          {(parentContainerBarcodeValue && this.props.data.container.coordinate) ? 
          'Coordinate '+this.props.data.container.coordinate : null}
        </div>                                                                    
        <div                                                                      
          className='action'                                                      
          title='Move Container'                                                  
        >                                                                         
          <span                                                               
            className='action-button update'                                  
            onClick={() => {this.props.edit('containerParentForm'); this.props.editContainer(this.props.data.container);}}
          >                                                                   
            <span className='glyphicon glyphicon-chevron-right'/>             
          </span>                                                             
          <Modal                                                              
            title='Update Parent Container'                                       
            closeModal={this.props.close}
            show={this.props.editable.containerParentForm}
          >                                                                       
            <ContainerParentForm
              data={this.props.data}
              container={this.props.container}
              containersNonPrimary={this.props.options.containersNonPrimary}      
              containerDimensions={this.props.options.containerDimensions}        
              containerCoordinates={this.props.options.containerCoordinates}      
              containerTypes={this.props.options.containerTypes}                  
              containerStati={this.props.options.containerStati}                  
              mapFormOptions={this.props.mapFormOptions}
              setContainer={this.props.setContainer}                            
              saveContainer={this.props.saveContainer}
            />                                                                    
          </Modal>                                                            
        </div>                                                                
      </div>                                                                      
    );                                                                            

    let candidateSessionField;
    if (this.props.data.specimen) {
      candidateSessionField = (
        <div className="item">                                                
            <div className='field'>                                             
              PSCID                                                             
              <div className='value'>                                           
                <a href={loris.BaseURL+'/'+this.props.data.specimen.candidateId}>
                  {this.props.options.candidates[this.props.data.specimen.candidateId].pscid}                             
                </a>                                                            
              </div>                                                            
            </div>                                                              
            <div className='field'>                                             
              Visit Label                                                       
              <div className='value'>                                           
                <a href={
                  loris.BaseURL+'/instrument_list/?candID='+
                  this.props.data.specimen.candidateId+'&sessionID='+
                  this.props.data.specimen.sessionId
                }>
                  {this.props.options.sessions[this.props.data.specimen.sessionId].label}
                </a>                                                            
              </div>                                                            
            </div>                                                              
          </div>
        );
    }

    let fieldList = (                                                              
      <div className='list'>                                                  
        {specimenTypeField}
        {containerTypeField}
        {quantityField}
        {fTCycleField}
        {temperatureField}
        {statusField}
        {centerField}
        {originField}
        {parentSpecimenField}
        {parentContainerField}
        {candidateSessionField}
      </div>                                                                  
    );                                                  

    return (
      <div className="globals">                                                 
        {fieldList}
      </div>
    );
  }
}

Globals.propTypes = {
};

export default Globals;
