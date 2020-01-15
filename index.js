const workingDirPath = "C:/Projects/FraserHamilton.github.io";
const simpleGitPromise = require("simple-git/promise")(workingDirPath);
const puppeteer = require("puppeteer");
const fs = require("fs");
const GIFEncoder = require("gifencoder");
const pngFileStream = require("png-file-stream");
var dir = "./tmp";

const getLog = async () => {
  const logObj = await simpleGitPromise.log();
  return logObj.all;
};

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

const run = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setViewport({
    width: 1280,
    height: 800
  });

  const logs = await getLog();

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  for (let [i, log] of logs.entries()) {
    await simpleGitPromise.checkout(log.hash);
    if (fs.existsSync("C:/Projects/FraserHamilton.github.io/index.html")) {
      await page.goto("C:/Projects/FraserHamilton.github.io/index.html");
      await page.screenshot({
        path: `tmp/capture${logs.length - i}.png`,
        fullPage: true
      });
    }
  }

  await simpleGitPromise.checkout("master");

  await browser.close();

  const encoder = new GIFEncoder(1280, 800);

  const stream = pngFileStream("tmp/capture??.png")
    .pipe(encoder.createWriteStream({ repeat: -1, delay: 500, quality: 10 }))
    .pipe(fs.createWriteStream("myanimated.gif"));

  stream.on("finish", function() {
    deleteFolderRecursive(dir);
  });
};

run();
