const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const Browser = require('zombie');
const url = 'https://www.walmart.com/search/?query=';

//3.42s for 1 product
//13.60s for 5 products
//31.63s for 10 products

async function getData (query, reqZip) {
    var result = [];
    const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.0 Safari/537.36';
    const browser = new Browser({
        runScripts: false, 
        loadCSS: false,
        silent: true,
        userAgent: userAgent
    });
    await browser.visit(url + query);
    const searchResults = browser.queryAll('[class="product-title-link line-clamp line-clamp-2 truncate-title"]');
    const productUrls = [];
    for (res of searchResults) {
        productUrls.push('https://www.walmart.com' + res.getAttribute('href'));
    }
    console.log(productUrls);
    
}

getData('bananas', '4234');

module.exports = { getData };