export const withTime = async (cb: Function) => {
  const hrstart = process.hrtime();
  await cb();
  const hrend = process.hrtime(hrstart);
  console.log("=========================");
  console.info(
    "Execution time: %ds %dms",
    hrend[0],
    Math.ceil(hrend[1] / 1000000)
  );
  console.log("=========================");
};
