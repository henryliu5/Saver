const cheerio = require('cheerio');
const fetch = require('node-fetch');
const url = 'https://www.walmart.com/search/?query=';
const productUrl = 'https://www.walmart.com/'
const result = []; //stores genericRetailerObjs

// Retrieves search result JSON from Walmart for specified query
async function getData (query) {
    console.log('received query array element: ' + query)
    let response = await fetch(url + query).then(response => response.text()
        ).then((body) => {
            const $ = cheerio.load(body);
            // Create JSON obj out of cheerio selector
            var jsonObj = JSON.parse($ ("#searchContent").html()).searchContent;
            //builds an array of productPageUrls
            return jsonObj.preso.items.map(item => item.productPageUrl);
        }).catch((err) => {
            console.log(err);
    })
   await getItems(response).catch((err) => console.log(err));
}

// Iterates through multiple queries with appropiate async await
async function process(queryArray){
    for(query of queryArray){
         await getData(query);
    }
    console.log(result);
}

//Retrieve productPage and generate a genericRetailerObj for each search result
async function getItems(arr) {
    for(var i = 0; i < arr.length; i++) {
        let temp = await fetch(productUrl + arr[i]).then(response => response.text()
        ).then((body) => {
            const $ = cheerio.load(body);
            //create JSON obj out of cheerio selector
            var productObj = JSON.parse($("#item").html()).item.product.buyBox.products[0];
            var genericObj = getGenericObj(productObj, 'Walmart');
            return genericObj;
        }).catch((err) => {console.log(err)});
        result.push(temp);
    }
}

//constructs the genericRetailerObj
function getGenericObj(productObj, retailer) {
    var productName = productObj.productName; //what retailer calls product
    var price = productObj.priceMap.price;
    var unitPrice = productObj.priceMap.unitPrice;
    var inStock = productObj.availabilityStatus == 'IN_STOCK';
    var unit = productObj.priceMap.unitOfMeasure;
    var img = productObj.images[0].url;
    return {name: productName, 
            retailer: retailer, 
            prices: price, 
            unitPrice: unitPrice, 
            unit: unit, 
            inStock: inStock, 
            img: img
    };
}

module.exports = {getData, process};

// x = walmart('query') + target('query')
// x is list of generics