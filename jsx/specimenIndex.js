/* global ReactDOM */

import BiobankSpecimen from './specimen';
const args = QueryString.get(document.currentScript.src);

$(function() {
  const biobankSpecimen = (
    <div className="page-specimen-form">
      <div className="row">
        <div className="col-md-9 col-lg-12">
          <BiobankSpecimen
            specimenPageDataURL={`${loris.BaseURL}/biobank/ajax/SpecimenInfo.php?action=getSpecimenData&barcode=${args.barcode}`}
          />
        </div>
      </div>
    </div>
  );

  ReactDOM.render(biobankSpecimen, document.getElementById("lorisworkspace"));
});
