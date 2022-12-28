export const bigIntMax = (arr: bigint[]) => {
  return arr.reduce((max, e) => {
    return e > max ? e : max;
  }, arr[0]);
};

export const bigIntMin = (arr: bigint[]) => {
  return arr.reduce((min, e) => {
    return e > min ? e : min;
  }, arr[0]);
};
