const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const url = 'https://www.walmart.com/search/?query=';
var zip;
var time;

//searches for given query and scrapes content
async function getData (query, requestedZip) {
    const result = []; 
    zip = requestedZip;
    time = Date.now();
    //launch puppeteer and configure userAgent
    const browser = await puppeteer.launch({headless: true});
    await browser.userAgent();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if(req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
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
    const productUrls =[];
    for(res of searchResults) {
        let productUrl = await page.evaluate(body => body.getAttribute('href'), res);
        productUrls.push('https://www.walmart.com' + productUrl);
    }
    //iterate through each productUrl and launch new puppeteer browser, asynchronously scrape all products
    for(let i = 0; i < 4; i++) {
        let productBrowser = await puppeteer.launch({headless: false, defaultViewport: null});
        result.push(getItem(productBrowser, requestedZip, productUrls[i], i));
    }
    var temp = await Promise.all(result);
    console.log(temp);
    await browser.close();
    console.log(Date.now() - time); 
    return result;
}

//Gets product info from Walmart's product page
async function getItem (browser, requestedZip, curUrl, rank) { 
    var itemTime = Date.now();
    try {
        page = await browser.newPage();
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if(req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
                req.abort();
            } else {
                req.continue();
            }
        });
        await page.goto(curUrl);
        //update zipCode if necessary
        await checkZipCode(page, requestedZip);
        await page.waitFor(1000);
        const html = await page.content();
        return getGenericObj(html, rank);
    } catch (err) {
        console.log("Error at " + curUrl + " Time taken: " + (Date.now() - itemTime));
        console.log(err);
    }
}

//check if zipCode matches the current one.
async function checkZipCode(page, requestedZip) {
    var zipTime = Date.now();
    try {
        //wait for more delivery options to load and click on it
        await page.waitForSelector('button[class="button launch-modal button--link"]');
        await page.click('button[class="button launch-modal button--link"]');

        //wait for zipCode input to load and check it.
        await page.waitForSelector('input[aria-label="Enter ZIP code or city, state"]');
        var zipCodeElement = await page.$('input[aria-label="Enter ZIP code or city, state"]');
        let zipVal = await page.evaluate(el => el.getAttribute("value"), zipCodeElement);
        console.log("Current zip: " + zipVal + ", Requested zip: " + requestedZip);

        if(zipVal != requestedZip) {
            await updateZipCode(page, requestedZip);
        }
    } catch (err) {
        console.log("Failed to check zip: " + page.url() + " Time taken: " + (Date.now() - zipTime));
        console.log(err);
    }
}
//update zipCode and refresh page
async function updateZipCode (page, zipCode) {
    try {
        //wait for input field to load
        const zipCodeField = await page.waitForSelector('input[aria-label="Enter ZIP code or city, state"]');
        //update zipCode
        for(let i = 0; i < 5; i++) {
            await zipCodeField.press('Backspace');
        }
        await zipCodeField.type(zipCode);
        await zipCodeField.type('\n');

        var zipCodeElement = await page.$('input[aria-label="Enter ZIP code or city, state"]');
        let zipVal = await page.evaluate(el => el.getAttribute("value"), zipCodeElement);
        console.log("Current zip: " + zipVal);
        zip = zipVal;

        //return to product page
        await page.waitForSelector('button[class="button icon-button modal-close"]');
        await page.click('button[class="button icon-button modal-close"]');
        
    } catch(err) {
        console.log("Failed to type zip. Time taken: " + (Date.now() - time));
        console.log(err);
    }
}

//construct genericObj
function getGenericObj (html, rank) {
    const $ = cheerio.load(html);
    var jsonObj = JSON.parse($("#item").html()).item.product;
    var walmartObj = new Object();
    walmartObj.retailer = 'Walmart';
    walmartObj.productName = jsonObj.midasContext.query;
    console.log(walmartObj.productName);
    walmartObj.price = parseFloat($('span[class="price display-inline-block arrange-fit price price--stylized"] > span[class="visuallyhidden"]').text().substring(1));
    unitPriceObj = $('div[class="display-inline-block-xs valign-bottom prod-PaddingBottom--xxs"] > div').text();
    walmartObj.unitPrice = parseFloat(unitPriceObj.substring(1, 5));
    walmartObj.unit = unitPriceObj.substring(8);
    walmartObj.inStock = $('div[class="fulfillment-text"] > span').html() == 'Pickup not available' ? false : true;
    walmartObj.img = jsonObj.buyBox.products[0].images[0].url;
    walmartObj.zipCode = zip;
    walmartObj.rank = rank;
    return walmartObj;
}

getData('apples', '73301');

module.exports = {getData, process};

// x = walmart('query') + target('query')
// x is list of generics