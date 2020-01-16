const puppeteer = require("puppeteer");
const fs = require("fs");
const GIFEncoder = require("gifencoder");
const pngFileStream = require("png-file-stream");
const tmp = "./tmp";

const deleteFolderRecursive = path => {
  var files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function(file, index) {
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

const run = async (gitPath, pagePath) => {
  const simpleGitPromise = require("simple-git/promise")(gitPath);
  const pageToCapture = pagePath || gitPath + "\\index.html";
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setViewport({
    width: 1280,
    height: 800
  });

  const logObj = await simpleGitPromise.log();
  const logs = logObj.all;

  if (!fs.existsSync(tmp)) {
    fs.mkdirSync(tmp);
  }

  for (let [i, log] of logs.entries()) {
    await simpleGitPromise.checkout(log.hash);
    await page.goto(pageToCapture);
    await page.screenshot({
      path: `tmp/capture${logs.length - i}.png`,
      fullPage: true
    });
  }

  await simpleGitPromise.checkout("master");

  await browser.close();

  const encoder = new GIFEncoder(1280, 800);

  const stream = pngFileStream("tmp/capture*.png")
    .pipe(
      encoder.createWriteStream({
        repeat: -1,
        delay: 500,
        quality: 10
      })
    )
    .pipe(fs.createWriteStream("timelapse.gif"));

  stream.on("finish", function() {
    deleteFolderRecursive(tmp);
  });
};

module.exports = run;
