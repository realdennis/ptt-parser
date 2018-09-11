let pageParser = require('./pageParser');
let articleParser = require('./articleParser');
const fs = require('fs');
const moment = require('moment');
Date.prototype.toJSON = function() {
  return moment(this).format();
};

const Board = 'Beauty';
let Page = '1869';
let Count = 1000;

const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setRequestInterception(true);
  page.on('request', request => {
    if (
      ['image', 'stylesheet', 'font', 'script'].indexOf(
        request.resourceType()
      ) !== -1
    ) {
      request.abort();
    } else {
      request.continue();
    }
  });

  let pageInfo;

  while (Count--) {
    try {
      await page.goto(`https://www.ptt.cc/bbs/${Board}/index${Page}.html`, {
        waitUntil: 'domcontentloaded',
        timeout: 50 * 1000
      });
      pageInfo = await page.evaluate(pageParser);
      Page = pageInfo.pageNumber; //Now page;
      let articleInfo = [];

      for (let i = 0; i < pageInfo.links.length; i++) {
        let article = await page.goto(pageInfo.links[i].link, {
          waitUntil: 'domcontentloaded',
          timeout: 50 * 1000
        });
        if(article.status() >= 400){
          continue;
        }
        articleInfo.push(await page.evaluate(articleParser));
      }
      //write data to json
      if (!fs.existsSync(`${Board}`)) fs.mkdirSync(`${Board}`);

      let currentPage = Page;
      fs.writeFile(
        `${Board}/${Board}_${currentPage}.json`,
        JSON.stringify(articleInfo),
        { flag: 'w' },
        err => {
          if (err) console.log(err);
          console.log(`saved as ${Board}/${Board}_${currentPage}.json`);
        }
      );
      Page -= 1;
    } catch (e) {
      console.log(e.message);
      console.log('這頁出問題ㄌ 重來ㄦ');
    }
  }
  await browser.close();
})();
