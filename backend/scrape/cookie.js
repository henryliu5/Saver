const puppeteer = require ('puppeteer');
process.setMaxListeners(Infinity);

async function getWalmartCookie(zip) {
    const url = 'https://www.walmart.com/';
    let locationData = '';
    const browser = await puppeteer.launch({ headless: true, defaultViewport: null, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    //set page options (viewport, useragent, and requestInterception)
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image' || req.resourceType() == 'href') {
            req.abort();
        } else {
            req.continue();
        }
    });
    //navigate to search page and wait for results to load
    await page.goto(url + 'apples');
    await checkZipCode(page, zip);
    let cookies = await page.cookies();
    for (cookie of cookies) {
        if (cookie.name == 'location-data') {
            locationData = cookie.value;
            break;
        }
    }
    await page.close();
    await browser.close();
    return locationData;
}

async function getTargetCookie(zip){
    const url = `https://www.target.com/store-locator/find-stores/${zip}`
    let locationData = '';
    const browser = await puppeteer.launch({ headless: true, defaultViewport: null, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url);
    await page.waitForSelector('[data-test="storeCard-makeItMyStoreButton"]');
    let alreadySelected = await page.$('[color="greenDark"]');
    if(!alreadySelected){
        await page.click('[data-test="storeCard-makeItMyStoreButton"]');
    }
    let cookies = await page.cookies();
    for (cookie of cookies) {
        if (cookie.name == 'fiatsCookie') {
            locationData = cookie.value;
            break;
        }
    }
    await page.close();
    await browser.close();
    return locationData;
}

module.exports = { getWalmartCookie, getTargetCookie }
