/* global ReactDOM */

import BiobankContainer from './container';
const args = QueryString.get(document.currentScript.src);

$(function() {
  const request = `${loris.BaseURL}/biobank/ajax/requestData.php?`;
  const submit  = `${loris.BaseURL}/biobank/ajax/submitData.php?`;
  const biobankContainer = (
    <div className="page-container-form">
      <div className="row">
        <div className="col-md-9 col-lg-12">
          <BiobankContainer
            containerPageDataURL={
              `${request}action=getContainerData&barcode=${args.barcode}`
            }
            optionsURL={
              `${request}action=getFormOptions`
            }
            saveContainer={
              `${submit}action=saveContainer`
            }
          />
        </div>
      </div>
    </div>
  );

  ReactDOM.render(biobankContainer, document.getElementById("lorisworkspace"));
});
