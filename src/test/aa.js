let keys = "test.aa.ww.n.v.f.sd.rwe";
const namespace = keys.split(".");
const ess = {};

let t1, t2;

// namespace.forEach((name, index) => {
//   console.log("=========", index);

//   if (index === 0) {
//     tempObj[index] = ess[name] || {};
//     ess[name] = t1;
//   } else {
//     tempObj[index - 1][name] = tempObj[index - 1][name] || {};
//     tempObj[index] = tempObj[index - 1][name];
//   }
// });
namespace.forEach((name, index) => {
  if (index === 0) {
    t1 = ess[name] || {};
    ess[name] = t1;
  } else {
    t1[name] = t1[name] || {};
    console.log("=========", t1);
    // t2 = t1[name];
    // t1 = t2;
  }
});

console.log(JSON.stringify(ess));
