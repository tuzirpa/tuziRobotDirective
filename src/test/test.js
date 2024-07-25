const convertMapToObject = (map) => {
  const obj = {};
  for (const [key, value] of map.entries()) {
    obj[key] = ((value) => {
      if (value instanceof Map) {
        return convertMapToObject(value);
      }
      return value;
    })(value);
  }
  return obj;
};

const testMap = new Map();
testMap.set("c", 2);
testMap.set("q", 36);

const map = new Map();
map.set("a", 1);
map.set("d", 6);
map.set("b", testMap);

const obj = convertMapToObject(map);
console.log(JSON.stringify(obj)); // { a: 1, b: { c: 2 } }
