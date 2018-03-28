/* global ReactDOM */

import BiobankContainer from './container';
const args = QueryString.get(document.currentScript.src);

$(function() {
  const biobankContainer = (
    <div className="page-container-form">
      <div className="row">
        <div className="col-md-9 col-lg-12">
          <BiobankContainer
            containerPageDataURL={`${loris.BaseURL}/biobank/ajax/ContainerInfo.php?action=getContainerData&barcode=${args.barcode}`}
          />
        </div>
      </div>
    </div>
  );

  ReactDOM.render(biobankContainer, document.getElementById("lorisworkspace"));
});
