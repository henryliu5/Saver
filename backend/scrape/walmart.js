const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const url = 'https://www.walmart.com/search/?query=';

//3.42s for 1 product
//13.60s for 5 products
//31.63s for 10 products

async function getData(query, reqZip) {
    var result = [];
    //open puppeteer browser
    const browser = await puppeteer.launch({ headless: true, defaultViewport: null, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    //set page options (viewport, useragent, and requestInterception)
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.0 Safari/537.36');
    await page.setViewport({ width: 1440, height: 900 });
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
            req.abort();
        } else {
            req.continue();
        }
    });
    //navigate to search page and wait for results to load
    await page.goto(url + query);
    await page.waitForSelector('[class="product-title-link line-clamp line-clamp-2 truncate-title"]');
    //select all product elements 
    const searchResults = await page.$$('[class="product-title-link line-clamp line-clamp-2 truncate-title"]');
    // Get product URLs from all searchResults
    const productUrls = [];
    for (res of searchResults) {
        let productUrl = await page.evaluate(body => body.getAttribute('href'), res);
        productUrls.push('https://www.walmart.com' + productUrl);
    }
    //iterate through product URLs and asynchronously get generic object for each product page
    //let productBrowser = await puppeteer.launch({ headless: true, defaultViewport: null, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    for (let i = 0; i < 9; i++) {
        try {
            result.push(getItem(await browser.newPage(), productUrls[i], i, reqZip));
        } catch (e) {
            console.log("Failed to create page: \n" + e);
        }
    }
    result = await Promise.all(result);
    console.log(result);
    await page.close();
    await browser.close();
    return result;
}

async function getItem(page, curUrl, rank, reqZip) {
    //set page options (viewport, useragent, and requestInterception (ignore styling/images))
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    //ignore styling and images to improve performance
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
            req.abort();
        } else {
            req.continue();
        }
    });
    //go to product page and check zipcode
    await page.goto(curUrl);
    await checkZipCode(page, reqZip);
    //get html for generic product object
    const html = await page.content();
    await page.close();
    return getGenericObj(html, rank);
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

    //click submit and wait for page to reload for new zipCode
    await page.waitForSelector('div[class="p_a p_c b_a b_q"] > button[id="zipcode-form-submit-button"]');
    page.click('div[class="p_a p_c b_a b_q"] > button[id="zipcode-form-submit-button"]');
    await page.waitForNavigation();
}

//Constructs genericRetailerObj from product page html
function getGenericObj(html, rank) {
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