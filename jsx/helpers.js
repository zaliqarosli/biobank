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
  return pscid+padLeft(increment, 3);
}

function padLeft(nr, n, str) {
    return Array(n-String(nr).length+1).join(str||'0')+nr;
}

export async function getStream(url, setProgress) {
  const response = await fetch(url, {credentials: 'same-origin', method: 'GET'})
  .catch((error, errorCode, errorMsg) => console.error(error, errorCode, errorMsg));
  const reader = response.body.getReader();
  const contentLength = response.headers.get('Content-Length');

  // Step 3: read the data
  let receivedLength = 0; // received that many bytes at the moment
  let chunks = ''; // array of received binary chunks (comprises the body)
  let count = 0;
  while (true) {
    const {done, value} = await reader.read();

    if (done) {
      break;
    }

    let result = new TextDecoder('utf-8').decode(value);
    chunks += result;
    receivedLength += value.length;
    count++;

    if (setProgress instanceof Function &&
      (count % 25 == 0 || receivedLength == contentLength)
    ) {
      setProgress(Math.round((receivedLength/contentLength) * 100));
    }
  }

  return JSON.parse(chunks);
}

export async function get(url) {
  const response = await fetch(url, {credientials: 'same-origin', method: 'GET'})
  .catch((error, errorCode, errorMsg) => console.error(error, errorCode, errorMsg));

  return response.json();
}

// function parsePartialJson(str) {
//   let parsed = '';
//   try {
//       parsed = JSON.parse(str+'}}');
//   } catch (e) {
//     str = str.slice(0, -1);
//     parsed = parsePartialJson(str);
//   }
//
//   return parsed;
// }

export function post(data, url, method, onSuccess) {
  return new Promise((resolve, reject) => {
    return fetch(url, {
      credentials: 'same-origin',
      method: method,
      body: JSON.stringify(clone(data)),
    })
    .then((response) => {
      if (response.ok) {
        onSuccess instanceof Function && onSuccess();
        // both then and catch resolve in case the returned data is not in
        // json format.
        response.json()
        .then((data) => resolve(data))
        .catch((data) => resolve(data));
      } else {
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
