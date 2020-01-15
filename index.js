const workingDirPath = "C:/Projects/test-timelapse";
const simpleGitPromise = require("simple-git/promise")(workingDirPath);
const puppeteer = require("puppeteer");

const getLog = async () => {
  const logObj = await simpleGitPromise.log();
  return logObj.all;
};

const capture = async (page, i) => {
  await page.goto("C:/Projects/test-timelapse/index.html");
  await page.screenshot({
    path: `capture${i}.png`,
    fullPage: true
  });
};

const run = async () => {
  //   const browser = await puppeteer.launch();
  //   const page = await browser.newPage();

  //   await page.setViewport({
  //     width: 1280,
  //     height: 800
  //   });

  const logs = await getLog();

  //   await page.goto("C:/Projects/test-timelapse/index.html");

  logs.forEach(async (log, i) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setViewport({
      width: 1280,
      height: 800
    });

    await simpleGitPromise.checkout(log.hash);

    await page.goto("C:/Projects/test-timelapse/index.html");

    await page.screenshot({
      path: `capture${i}.png`,
      fullPage: true
    });

    await browser.close();
  });

  //   await page.goto("C:/Projects/test-timelapse/index.html");

  //   await page.screenshot({
  //     path: `capture${12}.png`,
  //     fullPage: true
  //   });

  //   await simpleGitPromise.checkout(logs[3].hash);

  //   await page.goto("C:/Projects/test-timelapse/index.html");

  //   await page.screenshot({
  //     path: `capture${13}.png`,
  //     fullPage: true
  //   });

  //   logs.forEach(async (log, i) => {
  //     await simpleGitPromise.checkout(log.hash);
  //     await page.screenshot({
  //       path: `capture${i}.png`,
  //       fullPage: true
  //     });
  //   });

  await simpleGitPromise.checkout("master");

  // close the browser
  //   await browser.close();
};

run();
