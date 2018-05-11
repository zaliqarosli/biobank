/* global ReactDOM */

import BiobankContainer from './container';
const args = QueryString.get(document.currentScript.src);

$(function() {
  const biobankContainer = (
    <div className="page-container-form">
      <div className="row">
        <div className="col-md-9 col-lg-12">
          <BiobankContainer
            containerPageDataURL={`${loris.BaseURL}/biobank/ajax/requestData.php?action=getContainerData&barcode=${args.barcode}`}
            optionsURL={`${loris.BaseURL}/biobank/ajax/requestData.php?action=getFormOptions`}
          />
        </div>
      </div>
    </div>
  );

  ReactDOM.render(biobankContainer, document.getElementById("lorisworkspace"));
});
