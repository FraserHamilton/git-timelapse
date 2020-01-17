const puppeteer = require("puppeteer");
const fs = require("fs");
const pngFileStream = require("png-file-stream");
const GIFEncoder = require("gifencoder");
var looksSame = require("looks-same");
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

  let delay = 500;
  let repeat = -1;
  let outputFilename = "timelapse";
  let skip = 1;
  let startHash = null;
  let endHash = null;
  let width = 1280;
  let height = 800;
  let ditchSimiliar = false;

  if (fs.existsSync(gitPath + "\\timelapseConfig.js")) {
    const config = require(gitPath + "\\timelapseConfig.js");
    delay = config.delay || delay;
    repeat = config.repeat === 1 ? 0 : repeat;
    outputFilename = config.outputFilename || outputFilename;
    skip = config.skip || skip;
    startHash = config.start || null;
    endHash = config.end || null;
    width = config.width || width;
    heigth = config.heigth || height;
    ditchSimiliar = config.ditchSimiliar || ditchSimiliar;
  }

  const isFile = pageToCapture.includes(".html");

  await page.setViewport({
    width: width,
    height: height
  });

  const logObj = await simpleGitPromise.log();
  let logs = logObj.all;

  if (startHash) {
    var startIndex = logs.findIndex(l => l.hash === startHash);
    logs = logs.slice(0, startIndex);
  }

  if (endHash) {
    var endIndex = logs.findIndex(l => l.hash === endHash);
    logs = logs.slice(endIndex, logs.length);
  }

  if (!fs.existsSync(tmp)) {
    fs.mkdirSync(tmp);
  }

  let previousImg = null;
  let confirmedCount = 0;

  for (let [i, log] of logs.entries()) {
    if (i % skip === 0) {
      await simpleGitPromise.checkout(log.hash);
      if (isFile) {
        if (!fs.existsSync(pageToCapture)) {
          break;
        }
      }

      const newImg = `tmp/capture${logs.length - i}.png`;
      await page.goto(pageToCapture);
      await page.screenshot({
        path: newImg,
        fullPage: true
      });

      if (ditchSimiliar) {
        if (previousImg !== null) {
          looksSame(previousImg, newImg, { tolerance: 3 }, function(
            error,
            { equal }
          ) {
            if (!equal) {
              fs.rename(
                newImg,
                `tmp/confirmed${logs.length - confirmedCount}.png`,
                function(err) {
                  if (err) throw err;
                  previousImg = `tmp/confirmed${logs.length -
                    confirmedCount}.png`;
                  confirmedCount++;
                }
              );
            }
            previousImg = newImg;
          });
        }

        if (previousImg === null) {
          fs.rename(
            newImg,
            `tmp/confirmed${logs.length - confirmedCount}.png`,
            function(err) {
              if (err) throw err;
              previousImg = `tmp/confirmed${logs.length - confirmedCount}.png`;
              confirmedCount++;
            }
          );
        }
      }
    }
  }

  console.log(confirmedCount);

  await simpleGitPromise.checkout("master");

  await browser.close();

  const encoder = new GIFEncoder(width, height);

  const stream = pngFileStream(
    ditchSimiliar ? "tmp/confirmed*.png" : "tmp/capture*.png"
  )
    .pipe(
      encoder.createWriteStream({
        repeat: repeat,
        delay: delay,
        quality: 10
      })
    )
    .pipe(fs.createWriteStream(outputFilename + ".gif"));

  stream.on("finish", function() {
    deleteFolderRecursive(tmp);
  });
};

module.exports = run;
