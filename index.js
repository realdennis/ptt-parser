#!/usr/bin/env node
const fs = require('fs');
const puppeteer = require('puppeteer');

const pageParser = require('./lib/parser/pageParser');
const articleParser = require('./lib/parser/articleParser');
const ignoreImgLoad = require('./lib/request/ignoreImgLoad');

let config = {
  Board: 'Gossiping',
  nowPage: 0,
  age18: 1,
  isHeadless: true,
  interval: 5 //seconds
};

if (process.argv[2]) config.Board = process.argv[2];
if (process.argv[3]) config.nowPage = process.argv[3];
if (process.argv[4] === 'false') config.isHeadless = false;
// future work: yargs

console.log(
  `Board ${config.Board} / Page ${
    config.nowPage === 0 ? 'latest' : config.nowPage
  } / headless? ${config.isHeadless}`
);

(async () => {
  const browser = await puppeteer.launch({ headless: config.isHeadless });
  const request = async config => {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', ignoreImgLoad);
    //ignore img stylesheet font ...

    const crawler = Object.assign({}, config);
    const currentTarget = `https://www.ptt.cc/bbs/${crawler.Board}/index${
      crawler.nowPage
    }.html`;
    console.log(
      `crawler requests to ${crawler.Board} / ${
        crawler.nowPage === 0 ? 'latest' : crawler.nowPage
      }...`
    );
    let p = await page.goto(currentTarget, {
      waitUntil: 'domcontentloaded',
      timeout: 0
    });
    if ((await p.status()) >= 400) {
      console.log('此頁不存在');
      //continue;
    }
    if (crawler.age18) {
      await page.setCookie({
        name: 'over18',
        value: '1'
      });
      //不可以reload 因為頁面被跳轉了
      await page.goto(currentTarget, {
        waitUntil: 'domcontentloaded',
        timeout: 50 * 1000
      });
      crawler.age18 -= 1; // only one time to reload cookie;
    }
    //For over18 board
    const pageInfo = await page.evaluate(pageParser);
    const articleInfo = [];
    crawler.nowPage = pageInfo.pageNumber; //Now page;

    for (let i = 0; i < pageInfo.links.length; i++) {
      let article = await page.goto(pageInfo.links[i].link, {
        waitUntil: 'domcontentloaded',
        timeout: 0
      });
      if ((await article.status()) >= 400) {
        console.log('此篇文章不存在');
        continue;
      }
      articleInfo.push(await page.evaluate(articleParser));
    }
    page.close();
    fs.promises
      .mkdir(`data/${crawler.Board}`, { recursive: true })
      .then(() =>
        fs.promises
          .writeFile(
            `./data/${crawler.Board}/${crawler.Board}_${crawler.nowPage}.json`,
            JSON.stringify(articleInfo),
            { flag: 'w' }
          )
          .then(() =>
            console.log(
              `Saved as data/${crawler.Board}/${crawler.Board}_${
                crawler.nowPage
              }.json`
            )
          )
      );
    return crawler;
  };

  const { nowPage } = await request(config);
  config.nowPage = nowPage;
  // first time maybe get '0' but we need correct the page
  setInterval(() => {
    config.nowPage--;
    request(config);
  }, config.interval * 1000);
  // Async Request / process(parse) / IO
})();
