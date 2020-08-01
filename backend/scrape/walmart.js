const cheerio = require('cheerio');
const fetch = require('node-fetch');
const url = 'https://www.walmart.com/search/?query=';

async function getData(client, query, reqZip) {
    //Get location cookie from mongodb for reqZip
    client = await client;
    const countyObj = await client.db('county-zip').collection('county-zip').findOne({ zip: reqZip.toString() });
    const locationData = countyObj.walmartCookie;
    let result = [];
    //Get product urls from search results' html (roughly 40 products)
    const response = await fetch(url + query);
    const $ = cheerio.load(await response.text());
    const productUrls = JSON.parse($('#searchContent').html()).searchContent.preso.items.map(item => ('https://www.walmart.com/' + item.productPageUrl));
    //Get genericRetailerObj for each product
    for (let i = 0; i < productUrls.length; i++) {
        result.push(getItem(productUrls[i], locationData, i));
    }
    result = await Promise.all(result);
    return result;
}

async function getItem(url, cookie, rank) {
    //fetch product page's html with location cookie
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

//Construct genericRetailerObj
function genericRetailerObj(html, reqZip, rank) {
    const $ = cheerio.load(html);
    var walmartObj = new Object();
    walmartObj.retailer = 'Walmart';
    walmartObj.productName = $('[class="prod-ProductTitle font-bold"]').attr('content');
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