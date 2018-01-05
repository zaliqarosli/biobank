/* exported RBiobankSpecimenForm */


import Panel from '../../../jsx/Panel';

/**
 * Biobank Specimen Form
 *
 * Fetches data corresponding to a given file from Loris backend and
 * displays a form allowing meta information of the biobank file
 *
 * @author Alex Ilea
 * @version 1.0.0
 *
 * */
class BiobankSpecimenForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      Data: {},
      collectionData: {},
      uploadResult: null,
      isLoaded: false,
      loadedData: 0
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.setCollectionData = this.setCollectionData.bind(this);
    this.showAlertMessage = this.showAlertMessage.bind(this);
  }

  componentDidMount() {
    var self = this;
    $.ajax(this.props.DataURL, {
      dataType: 'json',
      success: function(data) {
        var collectionData = {
          specimen: data.specimenData,
	  	  container: data.containerData,
	      parentSpecimenBarcode: data.parentSpecimenBarcode,
	      parentContainerBarcode: data.parentContainerBarcode,
        };
		  
		var mappingData = {
		  specimenTypes: data.specimenTypes,
		  containerTypes: data.containerTypes,
		};

        self.setState({
          Data: data,
          isLoaded: true,
          collectionData: collectionData,
        });
      },
      error: function(error, errorCode, errorMsg) {
        console.error(error, errorCode, errorMsg);
        self.setState({
          error: 'An error occurred when loading the form!'
        });
      }
    });
  }

  render() {
    // Data loading error
    if (this.state.error !== undefined) {
      return (
        <div className="alert alert-danger text-center">
          <strong>
            {this.state.error}
          </strong>
        </div>
      );
    }

    // Waiting for data to load
    if (!this.state.isLoaded) {
      return (
        <button className="btn-info has-spinner">
          Loading
          <span
            className="glyphicon glyphicon-refresh glyphicon-refresh-animate">
          </span>
        </button>
      );
    }

    var alertMessage = "";
    var alertClass = "alert text-center hide";
    var backURL = loris.BaseURL.concat('/biobank/');

    if (this.state.uploadResult) {
      if (this.state.uploadResult === "success") {
        alertClass = "alert alert-success text-center";
        alertMessage = "Update Successful!";
      } else if (this.state.uploadResult === "error") {
        alertClass = "alert alert-danger text-center";
        alertMessage = "Failed to update the file";
      }
    }

	//checks if parent specimen exists and returns static element with href
	if (this.state.collectionData.parentSpecimenBarcode) {
	  var specimenURL = loris.BaseURL+"/biobank/specimen/?barcode=";
	  var parentSpecimenBarcode = (
          <LinkElement
            label="Parent Specimen:"
            text={this.state.collectionData.parentSpecimenBarcode}
	        href={specimenURL+this.state.collectionData.parentSpecimenBarcode}
          />
	  );
	}	

	//checks if parent container exists and returns static element with href
	if (this.state.collectionData.parentContainerBarcode) {
	  var containerURL = loris.BaseURL+"/biobank/container/?barcode=";
	  var parentContainerBarcode = (
          <LinkElement
            label="Parent Container:"
            text={this.state.collectionData.parentContainerBarcode}
	        href={containerURL+this.state.collectionData.parentContainerBarcode}
          />
	  );
	}	

	//loops through data object to produce static elements
    var dataObject = this.state.collectionData.specimen.data;
    var dataArray = Object.keys(dataObject).map(function(key) {
      return (
        <StaticElement
          label = {key+":"}
          text = {dataObject[key]}
        />
      );
    })

	//checks if location exists, if not posts destination
    var location;
    if (this.state.Data.containerLoci[this.state.collectionData.container.locusId].location) {
      location = (
        <StaticElement
          label="Location: "
          text={this.state.Data.containerLoci[this.state.collectionData.container.locusId].location}
        />
      );
     } else {
      location = (
        <StaticElement
          label="Destination: "
          text={this.state.Data.containerLoci[this.state.collectionData.container.locusId].destination+" (In Transit)"}
        />
      );
    } 

    return (
      <div>
        <div className={alertClass} role="alert" ref="alert-message">
          {alertMessage}
        </div>
        {
          this.state.uploadResult === "success" ?
          <a className="btn btn-primary" href={backURL}>Back to biobank</a> :
          null
        }
        <h3>Specimen <strong>{this.state.collectionData.container.barcode}</strong></h3>
        <FormElement
          columns={4}
        >
            <LinkElement
              label="PSCID:"
              text={this.state.Data.candidateInfo[''].PSCID}
              href={loris.BaseURL+'/'+this.state.Data.candidateInfo[''].CandID}
            />
            <LinkElement
              label="Visit Label:"
              text={this.state.Data.sessionInfo[''].Visit_label}
              href={loris.BaseURL+'/instrument_list/?candID='+this.state.Data.candidateInfo[''].CandID+'&sessionID='+this.state.Data.sessionInfo[''].ID}
            />
            <StaticElement
              label="Status:"
              text={this.state.Data.containerStati[this.state.collectionData.container.statusId].label}
            />
            {location}
		    {parentSpecimenBarcode}
		    {parentContainerBarcode}
        </FormElement>
		<Panel
		  id="collection-panel"
		  title="Collection"
		>
          <FormElement
            name="biobankSpecimen"
            onSubmit={this.handleSubmit}
            ref="form"
            columns={4}
          >
            <StaticElement
              label="Type:"
              text={this.state.Data.specimenTypes[this.state.collectionData.specimen.typeId].label}
            />
            <StaticElement
              label="Quantity:"
              text={this.state.collectionData.specimen.quantity+' '+this.state.Data.containerUnits[this.state.Data.containerCapacities[this.state.Data.containerTypes[this.state.collectionData.container.typeId].capacity_id].unit_id].unit}
            />
            <StaticElement
              label="Container Type:"
              text={this.state.Data.containerTypes[this.state.collectionData.container.typeId].label}
            />
            <StaticElement
              label="Collection Time:"
              text={this.state.collectionData.specimen.timeCollect}
            />
	        {dataArray}
            <StaticElement
              label="Notes:"
              text={this.state.collectionData.specimen.notes}
            />
          </FormElement>
		</Panel>
		<Panel
		  id="preparation-panel"
		  title="Preparation"
		>
		</Panel>
		<Panel
		  id="analysis-panel"
		  title="Analysis"
		>
		</Panel>
      </div>
    ); 
  }

  /**
   * Handles form submission
   * @param {event} e - Form submition event
   */
  handleSubmit(e) {
    e.preventDefault();

    var self = this;
    var myCollectionData = this.state.formData;

    $('#biobankSpecimenEl').hide();
    $("#file-progress").removeClass('hide');

    $.ajax({
      type: 'POST',
      url: self.props.action,
      data: JSON.stringify(myCollectionData),
      cache: false,
      contentType: false,
      processData: false,
      xhr: function() {
        var xhr = new window.XMLHttpRequest();
        xhr.upload.addEventListener("progress", function(evt) {
          if (evt.lengthComputable) {
            var progressbar = $("#progressbar");
            var progresslabel = $("#progresslabel");
            var percent = Math.round((evt.loaded / evt.total) * 100);
            $(progressbar).width(percent + "%");
            $(progresslabel).html(percent + "%");
            progressbar.attr('aria-valuenow', percent);
          }
        }, false);
        return xhr;
      },
      success: function(data) {
        $("#file-progress").addClass('hide');
        self.setState({
          uploadResult: "success"
        });
        self.showAlertMessage();
      },
      error: function(err) {
        console.error(err);
        self.setState({
          uploadResult: "error"
        });
        self.showAlertMessage();
      }

    });
  }

  /**
   * Set the form data based on state values of child elements/componenets
   *
   * @param {string} formElement - name of the selected element
   * @param {string} value - selected value for corresponding form element
   */
  setCollectionData(formElement, value) {
    var collectionData = this.state.collectionData;

    if (value === "") {
      collectionData[formElement] = null;
    } else {
      collectionData[formElement] = value;
    }

    this.setState({
      collectionData: collectionData
    });
  }

  /**
   * Display a success/error alert message after form submission
   */
  showAlertMessage() {
    var self = this;

    if (this.refs["alert-message"] === null) {
      return;
    }

    var alertMsg = this.refs["alert-message"];
    $(alertMsg).fadeTo(2000, 500).delay(3000).slideUp(500, function() {
      self.setState({
        uploadResult: null
      });
    });
  }

}

BiobankSpecimenForm.propTypes = {
  DataURL: React.PropTypes.string.isRequired,
  action: React.PropTypes.string.isRequired
};

var RBiobankSpecimenForm = React.createFactory(BiobankSpecimenForm);

window.BiobankSpecimenForm = BiobankSpecimenForm;
window.RBiobankSpecimenForm = RBiobankSpecimenForm;

export default BiobankSpecimenForm;
