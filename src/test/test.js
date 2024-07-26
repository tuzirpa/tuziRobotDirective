const fs = require("fs");
const path = require("path");

let filePath = "F:/goods/goodsData.json";

if (fs.existsSync(filePath)) {
  const parsedPath = path.parse(filePath);
  const newName = parsedPath.name + "_" + new Date().getTime() + parsedPath.ext;
  filePath = path.join(parsedPath.dir, newName);
}

console.log(filePath);
