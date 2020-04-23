const cheerio = require('cheerio');
const url = 'https://www.target.com/s?searchTerm=';
const puppeteer = require('puppeteer');
var thisZip;

// Navigates to search at Target for specified query
async function getData(query, desiredZip) {
    const result = [];
    thisZip = desiredZip;
    // Opens puppeteer browser
    const browser = await puppeteer.launch({ headless: true, defaultViewport: null });
    const page = await browser.newPage();
    // Navigate to search page and wait until it loads properly
    await page.goto(url + query);
    await page.waitForSelector('[data-test=product-title]');
    // Select all elements that match the product-title selctor NOTE: Will be first six bc of viewport, others will not have loaded
    const allElements = await page.$$('[data-test=product-title]');
    // Get URLs from all elements
    var productUrls = [];
    for (ele of allElements) {
        let productURL = await page.evaluate(body => body.getAttribute('href'), ele);
        productUrls.push('https://www.target.com' + productURL);
    }
    // Iterate through product URLS, open a new browser for each page so puppeteer can work async
    for (let i = 0; i < productUrls.length; i++) {
        try {
            let newBrowser = await puppeteer.launch({ headless: true, defaultViewport: null });
            result.push(getItem(newBrowser, desiredZip, productUrls[i], i))
        } catch{
            console.log('Failed when creating new page');
        }
    }
    console.log(result);
    var resolvedArray = await Promise.all(result);
    await browser.close();
    return resolvedArray;
};

// Gets product information from Target product page
async function getItem(browser, desiredZip, url, rank) {
    const page = await browser.newPage();
    await page.goto(url);
    // Check zip code and fix it if incorrect
    await checkZipCode(page, desiredZip);
    const html = await page.content();
    browser.close();
    return getGenericObj(html, rank);
}

async function checkZipCode(page, desiredZip){
    try {
        await page.waitForSelector('[data-test="fiatsButton"]');
        // Click on edit store button
        await page.click('[data-test="fiatsButton"]');
        // Check the current zipCode
        await page.waitForSelector('[data-test="storeSearchValue"]');
        var zipCodeElement = await page.$('[data-test="storeSearchValue"]');
        let zipCode = await page.evaluate(el => el.textContent, zipCodeElement);
        console.log("Default zip: " + zipCode)

        // If the zip code is incorrect, fix it
        if (zipCode != desiredZip) {
            await typeNewZipCode(page, desiredZip);
        }
        // Expand page content
        await page.waitForSelector('[data-test="toggleContentButton"]');
        await page.click('[data-test="toggleContentButton"]');
    } catch {
        console.log('Failed on page: ' + url);
    }
}

// Fixes zip code and refreshes page
async function typeNewZipCode(page, zipCode) {
    await page.waitForSelector('[data-test="storeSearchLink"]');
    await page.click('[data-test="storeSearchLink"]');
    // Focus on zip code input
    await page.waitForSelector('input[id="storeSearch"]');
    await page.focus('input[id="storeSearch"]');
    for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Backspace');
    }
    // Type zipcode, hit enter
    await page.keyboard.type(zipCode);
    await page.keyboard.type('\n');
    await page.waitFor(1000);
    // Go to first store, expand to show deatils
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.type('\n');
    await page.waitForSelector('[data-test="chooseStoreModal-storeDetails-storeInformationSetAsMyStoreButton"]');
    // Set as store
    await page.keyboard.press("Tab");
    await page.keyboard.type('\n');
    await page.waitForSelector('[data-test="storeSearchLink"]');
    await page.keyboard.press("Escape");
}

// Constructs the genericRetailerObj
function getGenericObj(html, rank) {
    const $ = cheerio.load(html);
    var targetObj = new Object();
    targetObj.productName = $('[data-test="product-title"]').text();
    targetObj.price = parseFloat(($('[data-test="product-price"]').text()).substring(1));
    targetObj.unitPrice = null;
    targetObj.inStock = ($('[data-test="storeMessage"]').text()).substr(0, 8) == 'In stock';
    targetObj.unit = null;
    targetObj.img = null;
    targetObj.zipCode = thisZip;
    targetObj.rank = rank;
    return targetObj;
}

module.exports = { getData };