export function arrayIsEqual (array1, array2) {
  if (!array1 || !array2)
    return false;

  // compare lengths - can save a lot of time
  if (array1.length != array2.length)
    return false;

  for (var i = 0, l = array1.length; i < l; i++) {
    // Check if we have nested arrays
    if (array1[i] instanceof Array && array2[i] instanceof Array) {
      // recurse into the nested arrays
      if (!array1[i].equals(array2[i]))
        return false;
    } else if (array1[i] != array2[i]) {
      // Warning - two different object instances will never be equal: {x:20} != {x:20}
      return false;
    }
  }
  return true;
}

export function map (val, in_min, in_max, out_min, out_max){
  return (val - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

export function encodedStr (rawStr: string) {
  const encoded = rawStr.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
    return '&#'+i.charCodeAt(0)+';';
  });
  return encoded;
}

export function highlightText (terms: Array<string>, paragraph: string) {
  let newParagraph = paragraph;
  terms.forEach(function(t, i) {
    newParagraph = newParagraph.split(terms[i]).join(`<span class="highlight term-${i+1}">${terms[i]}</span>`);
  });
  return newParagraph;
}

export function pickRandomIndex(max: number) {
  let i = Math.round(Math.random()*max);
  return Math.min(Math.max(parseInt(i), 0), max-1);
}
