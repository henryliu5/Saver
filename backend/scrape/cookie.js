const puppeteer = require ('puppeteer');
process.setMaxListeners(Infinity);

async function getWalmartCookie(zip) {
    const url = 'https://www.walmart.com/ip/Bananas-each/44390948';
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
    await page.goto(url);
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
