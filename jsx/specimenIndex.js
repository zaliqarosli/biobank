/* global ReactDOM */

import BiobankSpecimen from './specimen';
const args = QueryString.get(document.currentScript.src);

$(function() {
  const biobankSpecimen = (
    <div className="page-specimen-form">
      <div className="row">
        <div className="col-md-9 col-lg-12">
          <BiobankSpecimen
            specimenPageDataURL={`${loris.BaseURL}/biobank/ajax/requestData.php?action=getSpecimenData&barcode=${args.barcode}`}
            optionsURL={`${loris.BaseURL}/biobank/ajax/requestData.php?action=getFormOptions`}
            saveContainer={`${loris.BaseURL}/biobank/ajax/submitData.php?action=saveContainer`}
            saveSpecimen={`${loris.BaseURL}/biobank/ajax/submitData.php?action=saveSpecimen`}
          />
        </div>
      </div>
    </div>
  );

  ReactDOM.render(biobankSpecimen, document.getElementById("lorisworkspace"));
});
