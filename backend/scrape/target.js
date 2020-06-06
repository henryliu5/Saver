const cheerio = require('cheerio');
const url = 'https://www.target.com/s?searchTerm=';
const puppeteer = require('puppeteer');
var thisZip;

// Navigates to search at Target for specified query
async function getData(client, query, reqZip) {
    thisZip = reqZip;
    client = await client;
    const countyObj = await client.db('county-zip').collection('county-zip').findOne({ zip: reqZip.toString() });
    const locationData = countyObj.targetCookie;
    const result = [];

    var time = Date.now();
    // Open puppeteer browser
    const browser = await puppeteer.launch({ headless: true, defaultViewport: null, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 1920, height: 1080 });

    // Set location cookie and navigate
    await page.setCookie({ name: "fiatsCookie", value: locationData, domain:".target.com"})
    await page.goto(url + query, { waitUntil: 'networkidle2' });

    // Select all elements that match the product-title selctor NOTE: Will be first six bc of viewport, others will not have loaded
    await page.waitForSelector('[data-test=product-title]');
    // await page.waitForSelector('[data-test="product-price"]');
    // await page.waitForSelector('[data-test="LPFulfillmentSection_wrapper"]');
    var productTitles = [];
    var productPrices = [];
    var productStock = [];
    let html = await page.content();
    const $ = cheerio.load(html);
    $('[data-test=product-title]').each(function (i) {
        productTitles[i] = $(this).text();
    });
    $('[data-test="product-price"]').each(function (i) {
        productPrices[i] = $(this).text();
    });
    $('[data-test="LPFulfillmentSection_wrapper"]').each(function (i) {
        productStock[i] = $(this).text();
    });
    // Get URLs from all elements
    for (var i = 0; i < productTitles.length; i++) {
        result.push(getGenericObj(productTitles[i], productPrices[i], i, productStock[i]));
    }
    await page.close();
    await browser.close();
    return result;
};

// Constructs the genericRetailerObj
function getGenericObj(productName, productPrice, rank, inStock) {
    var targetObj = new Object();
    targetObj.retailer = 'Target';
    targetObj.productName = productName;
    targetObj.price = parseFloat((productPrice).substring(1));
    targetObj.unitPrice = null;
    targetObj.inStock = !inStock.includes('Not at');//;($('[data-test="storeMessage"]').text()).substr(0, 8) == 'In stock';
    targetObj.unit = null;
    targetObj.img = null;
    targetObj.zipCode = thisZip;
    targetObj.timeStamp = Date.now();
    targetObj.rank = rank;
    return targetObj;
}

module.exports = { getData };

async function test(query) {
    // try {
    //     var res = await getData(query, '75028');
    //     console.log(res[0]);
    // } catch (error) {
    //     console.log(error);
    // }
    // try {
    //     var res2 = await getData(query, '10001');
    //     console.log(res2[0]);
    // } catch (error) {
    //     console.log(error);
    // }
}

//test('bananas');
