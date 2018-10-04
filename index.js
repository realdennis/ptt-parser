#!/usr/bin/env node
let pageParser = require('./lib/pageParser');
let articleParser = require('./lib/articleParser');
const fs = require('fs');
const puppeteer = require('puppeteer');

let Board = 'Gossiping';
let PageNumber = 0;
let age18 = 1;
let headlessOption = true;
if (process.argv[2]) Board = process.argv[2];
if (process.argv[3]) PageNumber = process.argv[3];
if (process.argv[4]) headlessOption = process.argv[4];
console.log(
  `Board ${Board} / Page ${PageNumber} / headless? ${headlessOption}`
);

(async () => {
  const browser = await puppeteer.launch({ headless: headlessOption });
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

  while (true) {
    let p = await page.goto(
      `https://www.ptt.cc/bbs/${Board}/index${PageNumber}.html`,
      {
        waitUntil: 'domcontentloaded',
        timeout: 0
      }
    );

    if ((await p.status()) >= 400) {
      console.log('此頁不存在');
      continue;
    }
    if (age18) {
      await page.setCookie({
        name: 'over18',
        value: '1'
      });
      //不可以reload 因為頁面被跳轉了
      await page.goto(
        `https://www.ptt.cc/bbs/${Board}/index${PageNumber}.html`,
        {
          waitUntil: 'domcontentloaded',
          timeout: 50 * 1000
        }
      );
      age18 -= 1; // only one time to reload cookie;
    }
    //For over18 board
    pageInfo = await page.evaluate(pageParser);
    PageNumber = pageInfo.pageNumber; //Now page;
    let articleInfo = [];

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
    //write data to json
    if (!fs.existsSync(`data/${Board}`)) fs.mkdirSync(`data/${Board}`);

    fs.writeFileSync(
      `data/${Board}/${Board}_${PageNumber}.json`,
      JSON.stringify(articleInfo),
      { flag: 'w' }
    );
    console.log(`Saved as data/${Board}/${Board}_${PageNumber}.json`);
    PageNumber -= 1;
    if (PageNumber === 0) break;
  }
  await browser.close();
})();
