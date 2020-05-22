const cheerio = require('cheerio');
const url = 'https://www.target.com/s?searchTerm=';
const puppeteer = require('puppeteer');
var thisZip;

// Navigates to search at Target for specified query
async function getData(query, desiredZip) {
    const result = [];
    thisZip = desiredZip;
    // Opens puppeteer browser
    const browser = await puppeteer.launch({ headless: true, defaultViewport: null, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36");
    await page.setViewport({ width: 1920, height: 1080 });
    // Navigate to search page and wait until it loads properly
    await page.goto(url + query, { waitUntil: 'networkidle2' });

    await checkZipCode(page, desiredZip);

    // Select all elements that match the product-title selctor NOTE: Will be first six bc of viewport, others will not have loaded
    await page.waitForSelector('[data-test=product-title]');
    await page.waitForSelector('[data-test="product-price"]');
    await page.waitForSelector('[data-test="LPFulfillmentSection_wrapper"]');
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
    await browser.close();
    return result;
};

async function checkZipCode(page, desiredZip) {
    //try {
    await page.waitForSelector('[data-test="storeId-store-name"]');
    // Click on edit store button
    await page.click('[data-test="storeId-store-name"]');
    // Type new zip code
    await page.waitForSelector('#zipOrCityState');
    // Delay for transition
    await page.waitFor(300);
    await page.focus('#zipOrCityState');
    await page.keyboard.type(desiredZip);
    await page.keyboard.type('\n');

    // TODO make this wait more robust/faster
    await page.waitFor(300);
    //await waitForNetworkIdle({ page: page });
    //await page.waitForNavigation({ waitUntil: 'domcontentloaded'});
    await page.waitForSelector('[data-test="storeLocationSearch-button"]', { visible: true });

    await page.focus('[data-test="storeLocationSearch-button"]');
    await page.keyboard.press("Tab");
    // Confirm new store selection
    await page.keyboard.type('\n');
    try {
        // Wait for products to enter loading state
        await page.waitForSelector('[class="Col-favj32-0 sc-AykKG eBGbtJ"]', { timeout: 5000 });
        // Wait for products to return to loaded state
        await page.waitForSelector('[class="Col-favj32-0 sc-AykKG bhTTIq"]', { timeout: 5000 });
        //await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 });
    } catch{ }
}

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
    try {
        var res = await getData(query, '75028');
        console.log(res[0]);
    } catch (error) {
        console.log(error);
    }
    try {
        var res2 = await getData(query, '10001');
        console.log(res2[0]);
    } catch (error) {
        console.log(error);
    }
}

//test('bananas');
