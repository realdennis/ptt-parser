# ptt-parser 

## Introduction
使用puppeteer(pptr)撰寫的爬蟲，核心方法是使用DOM操作(querySelector)，再把腳本傳進去pptr跑，讓前端人們輕而一舉的撰寫爬蟲，此repo作為教學/介紹用途，安裝方法請參考以下，或是自行clone下來install。

## Dependency
Only one -- Puppeteer!


## Demo
![](https://raw.githubusercontent.com/realdennis/ptt-parser/master/demo/demo.jpg)

## Async request/file save
![](https://raw.githubusercontent.com/realdennis/ptt-parser/master/demo/async.jpg)

## Usage
```
$  npm install ptt-parser -g
$  ptt-parser gossiping 1000 false
    or
$  ptt-parser beauty //預設從最新一頁爬取
```
解釋:
ptt-parser ${看板名} ${欲往前爬取的頁數} ${是否headless}

## Result
![](https://raw.githubusercontent.com/realdennis/ptt-parser/master/demo/demo2.jpg)
