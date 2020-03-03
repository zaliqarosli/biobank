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
