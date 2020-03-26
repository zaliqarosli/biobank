import swal from 'sweetalert2';

export function clone(object) {
  return JSON.parse(JSON.stringify(object));
}

export function mapFormOptions(object, attribute) {
  return Object.keys(object).reduce((result, id) => {
    result[id] = object[id][attribute];
    return result;
  }, {});
}

export function isEmpty(object) {
  if (object == null) {
    return true;
  }

  for (let prop in object) {
    if (object.hasOwnProperty(prop)) {
      return false;
    }
  }

  return JSON.stringify(object) === JSON.stringify({});
}

export function padBarcode(pscid, increment) {
  let padding = '';
  if (increment/10 < 1) {
    padding ='00';
  } else if (1 <= increment/10 < 10) {
    padding = '0';
  }
  return pscid+padding+increment;
}

export function get(url, method) {
  return fetch(url, {credentials: 'same-origin', method: method})
    .then((resp) => resp.json())
    .catch((error, errorCode, errorMsg) => console.error(error, errorCode, errorMsg));
}

export function post(data, url, method, onSuccess) {
  return new Promise((resolve, reject) => {
    swal.fire({title: 'Loading', showConfirmButton: false, width: '180px'});
    swal.showLoading();
    return fetch(url, {
      credentials: 'same-origin',
      method: method,
      body: JSON.stringify(clone(data)),
    })
    .then((response) => {
      if (response.ok) {
        swal.close();
        onSuccess instanceof Function && onSuccess();
        // both then and catch resolve in case the returned data is not in
        // json format.
        response.json()
        .then((data) => resolve(data))
        .catch((data) => resolve(data));
      } else {
        swal.close();
        if (response.status == 403) {
          swal('Action is forbidden or session has timed out.', '', 'error');
        }
        response.json()
        .then((data) => swal(data.error, '', 'error'))
        .then(() => reject());
      }
    })
    .catch((error) => console.error(error));
  });
}
