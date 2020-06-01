const { MongoClient } = require('mongodb');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const Browser = require('zombie');
Browser.waitDuration = '30s';
const url = 'https://www.walmart.com/search/?query=';
process.setMaxListeners(Infinity);

async function getData(client, query, reqZip) {
    client = await client;
    const countyObj = await client.db('county-zip').collection('county-zip').findOne({ zip: reqZip.toString() });
    const locationData = countyObj.walmartCookie;
    let result = [];
    const zombieBrowser = new Browser({
        runScripts: false,
        loadCSS: false,
        silent: true
    });
    await zombieBrowser.visit(url + query);
    const searchResults = zombieBrowser.queryAll('[class="product-title-link line-clamp line-clamp-2 truncate-title"]');
    const productUrls = [];
    for (res of searchResults) {
        productUrls.push('https://www.walmart.com' + res.getAttribute('href'));
    }
    for (let i = 0; i < productUrls.length; i++) {
        let prodBrowser = new Browser({
            runScripts: false,
            loadCSS: false,
            silent: true,
        });
        try {
            result.push(getItem(prodBrowser, productUrls[i], i, locationData));
        } catch {
            console.log(`Failed on ${i}`);
        }

    }
    result = await Promise.all(result);
    zombieBrowser.destroy();
    process.exit();
}

async function getItem(browser, url, rank, cookie) {
    browser.setCookie({ name: 'location-data', domain: '.walmart.com', value: cookie });
    await browser.visit(url);
    const html = browser.html();
    browser.destroy();
    return genericRetailerObj(html, rank, cookie.substring(0, 5));
}

function genericRetailerObj(html, rank, reqZip) {
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
    walmartObj.zipCode = reqZip;
    walmartObj.timeStamp = Date.now();
    walmartObj.rank = rank;
    return walmartObj;
}

async function checkZipCode(page, reqZip) {
    //navigate to walmart drawer
    await page.waitForSelector('div[class="p_a p_ao p_v p_af ap_b"] > button[class="g_a ap_c g_c"]');
    await page.click('button[class="g_a ap_c g_c"]');
    await page.waitForSelector('[class="j_a zipCode j_b"]');

    //check if zip needs to be updated
    var zipCodeElem = await page.$('span[class="j_a zipCode j_b"]');
    let curZipCode = await page.evaluate(el => el.textContent, zipCodeElem);
    if (curZipCode != reqZip) {
        await updateZipCode(page, reqZip);
    }
}

async function updateZipCode(page, reqZip) {
    //Navigate to zipcode dropdown, wait 200 ms for button to be visible
    await page.waitForSelector('button[id="vh-location-button"]');
    await page.waitFor(200);
    await page.click('button[id="vh-location-button"]');

    //type in requested Zip
    const zipCodeField = await page.waitForSelector('input[class="i_a ar_c i_c"]');
    for (let i = 0; i < 5; i++) {
        await zipCodeField.press('Backspace');
    }
    await zipCodeField.type(reqZip);
    await page.waitFor(200);

    //click submit and wait for page to reload for new zipCode
    await page.waitForSelector('div[class="p_a p_c b_a b_q"] > button[id="zipcode-form-submit-button"]');
    await page.click('div[class="p_a p_c b_a b_q"] > button[id="zipcode-form-submit-button"]');
    await page.reload();
}

module.exports = { getData };