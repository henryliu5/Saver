const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const url = 'https://www.walmart.com/search/?query=';
var zip;
var time;

//searches for given query and scrapes content
async function getData (query, requestedZip) {
    const result = []; 
    zip = requestedZip;
    time = Date.now();
    //launch puppeteer and configure userAgent
    const browser = await puppeteer.launch({headless: true, defaultViewport: null});
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
    for(let i = 0; i < 3; i++) {
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
        const page = await browser.newPage();
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if(req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
                req.abort();
            } else {
                req.continue();
            }
        });
        await page.goto(curUrl);
        console.log(page.url());
        //update zipCode if necessary
        await checkZipCode(page, requestedZip);
        const html = await page.content();
        browser.close();
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
        await page.waitForSelector('button[data-tl-id="nd-zip"]');
        var zipCodeElement = await page.$('button[data-tl-id="nd-zip"]');
        let zipVal = await page.evaluate(el => el.textContent, zipCodeElement);
        console.log("Current zip: " + zipVal + ", Requested zip: " + requestedZip);
        if(zipVal != requestedZip) {
            await page.click('button[data-tl-id="nd-zip"]');
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
        const zipCodeField = await page.waitForSelector('input[aria-describedby="zipcode-form-label"]');
       
        //update zipCode
        await zipCodeField.type(zipCode);
        await page.waitForSelector('button[id="zipcode-form-submit-button"]');
        await page.click('button[id="zipcode-form-submit-button"]');
    } catch(err) {
        console.log("Failed to type zip: " + page.url() + " Time taken: " + (Date.now() - time));
        console.log(err);
    }
}

//construct genericObj
function getGenericObj (html, rank) {
    const $ = cheerio.load(html);
    var walmartObj = new Object();
    walmartObj.retailer = 'Walmart';
    walmartObj.productName = $('[class="prod-ProductTitle font-normal"]').attr('content');    
    walmartObj.price = parseFloat($('span[class="price display-inline-block arrange-fit price price--stylized"] > span[class="visuallyhidden"]').text().substring(1));
    unitPriceObj = $('div[class="display-inline-block-xs valign-bottom prod-PaddingBottom--xxs"] > div').text();
    walmartObj.unitPrice = parseFloat(unitPriceObj.substring(1, 5));
    walmartObj.unit = unitPriceObj.substring(8);
    walmartObj.inStock = $('div[class="fulfillment-text"] > span').html() == 'Pickup not available' ? false : true;
    walmartObj.img = null;
    walmartObj.zipCode = zip;
    walmartObj.rank = rank;
    return walmartObj;
}

getData('apples', '73301');

module.exports = {getData, process};

// x = walmart('query') + target('query')
// x is list of generics