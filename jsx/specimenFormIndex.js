/* global ReactDOM */

import BiobankSpecimenForm from './specimenForm';
const args = QueryString.get(document.currentScript.src);

$(function() {
  const biobankSpecimenForm = (
    <div className="page-specimen-form">
      <div className="row">
        <div className="col-md-9 col-lg-12">
          <BiobankSpecimenForm
            DataURL={`${loris.BaseURL}/biobank/ajax/FileUpload.php?action=getData&barcode=${args.barcode}`}
            action={`${loris.BaseURL}/biobank/ajax/FileUpload.php?action=specimen`}
          />
        </div>
      </div>
    </div>
  );

  ReactDOM.render(biobankSpecimenForm, document.getElementById("lorisworkspace"));
});
