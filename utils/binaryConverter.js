/* eslint-disable eqeqeq */
/* eslint-disable no-plusplus */

const convertDecimalToBinary = (unit, value) => {
  // 1) SET GLOBAL VARIABLES
  const binaryArr = [];
  let temp = value;

  // 2) CHECK IF UNIT IS NOT OBJECT, RETURN UNDEFINED
  if (!(unit === 'bitwise')) {
    return undefined;
  }

  // 3) CONVERTING
  while (temp > 0) {
    if (temp % 2 == 0) {
      binaryArr.push(0);
    } else {
      binaryArr.push(1);
    }

    temp = Math.floor(temp / 2);
  }

  if (!(binaryArr.length === 16)) {
    for (let i = binaryArr.length; i < 16; i++) {
      binaryArr.push(0);
    }
  }

  // 4) RETURN CONVERTED VALUE
  return binaryArr;
};

module.exports = convertDecimalToBinary;
