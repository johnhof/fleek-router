'use strict';

module.exports = (array=[]) => {
  let final = [];
  let nested = array
  while (nested.length) {
    let current = nested.pop();
    if (Array.isArray(current)) for (let val of current) nested.unshift(val);
    else final.push(current);
  }

  return final;
}
