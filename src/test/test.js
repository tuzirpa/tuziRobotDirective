function convert(content) {
  const cacheMap = new Map();
  const convertMapToObject = (map) => {
    const obj = {};
    for (const [key, value] of map.entries()) {
      obj[key] = ((value) => {
        if (cacheMap.has(key)) {
          return cacheMap.get(key);
        }
        if (value instanceof Map) {
          return convertMapToObject(value);
        } else if (Array.isArray(value)) {
          return value.map((item) => {
            if (item instanceof Map) {
              return convertMapToObject(item);
            }
            cacheMap.set(key, value);
            return item;
          });
        }

        cacheMap.set(key, value);
        return value;
      })(value);
    }
    return obj;
  };

  if (content instanceof Map) {
    content = convertMapToObject(content);
  } else if (Array.isArray(content)) {
    const arr = [];
    for (let item of content) {
      if (item instanceof Map) {
        arr.push(convertMapToObject(item));
      } else {
        arr.push(item);
      }
    }
    content = arr;
  }

  return content;
}

// const obj = {};
// obj.a = 1;
// obj.b = { c: 2, obj: obj };
// obj.d = obj.b;

// const testMap2 = new Map();
// testMap2.set("c", 2);
// testMap2.set("q", 36);

// const testMap = new Map();
// testMap.set("c", 2);
// testMap.set("q", 36);
// testMap.set("map", testMap2);
// testMap.set("testMap2", [testMap2]);

// const map = new Map();
// map.set("a", 1);
// map.set("d", 6);
// map.set("b", testMap);

// let arr = [map, testMap, testMap2];
// let arr2 = [];
// for (let value of arr) {
//   if (value instanceof Map) {
//     arr2.push(convert(value));
//   }
// }
// arr = arr2;
// console.log(JSON.stringify(arr)); // { a: 1, b: { c: 2 } }
