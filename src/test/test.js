// const puppeteer = require("puppeteer");
// (async () => {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
// 打开页面
//   await page.goto(
//     "https://mp.vtool.vip/fe/foreEnd/CB77CB50C2065C317CB0BCD31B48A3E7/theme"
//   );
//   // 等待一段时间，确保页面加载完毕
//   await new Promise((resolve) => setTimeout(resolve, 2000));
//   const elem = await page.$("div");
//   const boundingBox = await elem.boundingBox();
//   await page.mouse.move(
//     boundingBox.x + boundingBox.width / 2,
//     boundingBox.y + boundingBox.height / 2
//   );
//   await page.mouse.wheel({ deltaY: -100 });
// })();
