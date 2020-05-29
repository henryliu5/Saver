const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const Browser = require('zombie');
const url = 'https://www.walmart.com/search/?query=';

//3.42s for 1 product
//13.60s for 5 products
//31.63s for 10 products

async function getData (query, reqZip) {
    var result = [];
    const browser = new Browser({
        runScripts: false, 
        loadCSS: false,
        silent: true
    });
    await browser.visit(url + query);
    const searchResults = browser.queryAll('[class="product-title-link line-clamp line-clamp-2 truncate-title"]');
    const productUrls = [];
    for (res of searchResults) {
        productUrls.push('https://www.walmart.com' + res.getAttribute('href'));
    }
    console.log(productUrls);
    process.exit();
    for(let i = 0; i < productUrls.length; i++) {
        let prodBrowser = new Browser({
            runScripts: false,
            loadCSS: false,
            silent: true,
        });
        result.push(getItem(prodBrowser, productUrls[i], i, reqZip));
    }
    result = await Promise.all(result);
    console.log(result);
    browser.destroy();
    
}

async function getItem (browser, url, rank, reqZip) {
    await browser.visit(url);
    //await checkZipCode (browser, reqZip);
    const html = browser.html();
    browser.destroy();
    return genericRetailerObj(html, rank);
}

async function checkZipCode (browser, reqZip) {

}

async function updateZipCode (browser, reqZip) {

}

function genericRetailerObj (html, rank) {
    const $ = cheerio.load(html);
    var walmartObj = new Object();
    walmartObj.retailer = 'Walmart';
    walmartObj.productName = $('[class="prod-ProductTitle font-normal"]').attr('content');
    walmartObj.price = parseFloat($('span[class="price display-inline-block arrange-fit price price--stylized"] > span[class="visuallyhidden"]').text().substring(1));
    unitPriceObj = $('[class="prod-ProductOffer-ppu prod-ProductOffer-ppu-enhanced display-inline-block-xs prod-PaddingRight--s copy-small font-normal prod-PaddingLeft--xs prod-PaddingTop--xxs"]').text();
    walmartObj.unitPrice = parseFloat(unitPriceObj.substring(1, 5));
    walmartObj.unit = unitPriceObj.substring(8);
    walmartObj.inStock = $('div[class="prod-ProductOffer-oosMsg prod-PaddingTop--xxs"] > span').text() == 'Out of stock' ? false : true;
    walmartObj.img = null;
    walmartObj.zipCode = $('span[class="j_a zipCode j_b"]').text();
    walmartObj.timeStamp = Date.now();
    walmartObj.rank = rank;
    return walmartObj;
}

module.exports = { getData };