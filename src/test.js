const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.setDefaultTimeout(10000);
  await page.goto("https://m.soqi.cn/", {
    waitUntil: "networkidle2",
    timeout: 10000,
  });

  await new Promise((resolve) => {
    setTimeout(resolve, 3000);
  });

  // Generates a PDF with 'screen' media type.
  //   await page.emulateMedia("screen");
  await page.pdf({ path: "page.pdf" });

  await browser.close();
})();

// async function test() {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   page.setCookie({
//     name: "STOKEN",
//     value: "E8B072F966090D9063164723E353A1EB63E39851081DB566",
//     domain: ".soqicn.com",
//     path: "/",
//   });
//   await page.goto(
//     "https://mp.soqicn.com/fe/foreEnd/4A2834BF74DF34CC7CB0BCD31B48A3E7/theme",
//     {
//       waitUntil: "networkidle2",
//     }
//   );

//   await new Promise((resolve) => {
//     setTimeout(resolve, 3000);
//   });

//   try {
//     console.log("212342");
//     await page.pdf({ path: "hn.pdf", format: "A4" });
//     // Saves the PDF to hn.pdf.

//     console.log("PDF generated successfully.");
//   } catch (error) {
//     console.error("Failed to generate PDF:", error);
//     console.error(error.stack);
//   }

//   await browser.close();
// }

// test();
