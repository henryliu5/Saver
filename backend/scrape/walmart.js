const cheerio = require('cheerio');
const fetch = require('node-fetch');
const url = 'https://www.walmart.com/search/?query=';

async function getData(client, query, reqZip) {
    //Get location cookie from mongodb for reqZip
    client = await client;
    const countyObj = await client.db('county-zip').collection('county-zip').findOne({ zip: reqZip.toString() });
    const locationData = countyObj.walmartCookie;
    let result = [];
    const response = await fetch(url + query);
    const $ = cheerio.load(await response.text());
    const productUrls = JSON.parse($('#searchContent').html()).searchContent.preso.items.map(item => ('https://www.walmart.com/' + item.productPageUrl));
    for (let i = 0; i < productUrls.length; i++) {
        result.push(getItem(productUrls[i], '01012%3AChesterfield%3AMA%3A%3A8%3A1|28l%2C22j%2C1pw%2C42m%2C1oe%2C1in%2C1j4%2C1ua%2C1sp%2C1re||7|1|1yis%3B16%3B5%2C1xje%3B16%3B11%2C1y4s%3B16%3B12', i));
    }
    result = await Promise.all(result);
    console.log(result);
    process.exit();
}

async function getItem(url, cookie, rank) {
    const response = await fetch(url, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.0 Safari/537.36',
            cookie: `location-data=${cookie}`
        }
    });
    return genericRetailerObj(await response.text(), cookie.substring(0, 5), rank);
}

function genericRetailerObj(html, reqZip, rank) {
    const $ = cheerio.load(html);
    var walmartObj = new Object();
    walmartObj.retailer = 'Walmart';
    walmartObj.productName = $('[class="prod-ProductTitle font-normal"]').attr('content');
    walmartObj.price = parseFloat($('span[class="price display-inline-block arrange-fit price price--stylized"] > span[class="visuallyhidden"]').text().substring(1));
    unitPriceObj = $('[class="prod-ProductOffer-ppu prod-ProductOffer-ppu-enhanced display-inline-block-xs prod-PaddingRight--s copy-small font-normal prod-PaddingLeft--xs prod-PaddingTop--xxs"]').text();
    walmartObj.unitPrice = parseFloat(unitPriceObj.substring(1, 5));
    walmartObj.unit = unitPriceObj.substring(8);
    walmartObj.inStock = isNaN(walmartObj.price) ? false : true;
    walmartObj.img = null;
    walmartObj.zipCode = reqZip;
    walmartObj.timeStamp = Date.now();
    walmartObj.rank = rank;
    return walmartObj;
}

module.exports = { getData };