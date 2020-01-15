const workingDirPath = "C:/Projects/test-timelapse";
const simpleGitPromise = require("simple-git/promise")(workingDirPath);
const puppeteer = require("puppeteer");

const getLog = async () => {
  const logObj = await simpleGitPromise.log();
  return logObj.all;
};

const run = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setViewport({
    width: 1280,
    height: 800
  });

  const logs = await getLog();

  for (let [i, log] of logs.entries()) {
    await simpleGitPromise.checkout(log.hash);
    await page.goto("C:/Projects/test-timelapse/index.html");
    await page.screenshot({
      path: `capture${i}.png`,
      fullPage: true
    });
  }

  await simpleGitPromise.checkout("master");

  await browser.close();
};

run();
