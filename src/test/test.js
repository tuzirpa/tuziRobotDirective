const path = require("path");

const url =
  "https://cbu01.alicdn.com/img/ibank/O1CN01JL2D631fujgOhl1Xs_!!2928754067-0-cib.jpg";
const downloadPath = "C:\\Users\\hrd\\Downloads";

console.log(path.basename(url));
console.log(path.join(downloadPath, path.basename(url)));
