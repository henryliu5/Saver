const cheerio = require('cheerio');
const fetch = require('node-fetch');
const url = 'https://www.walmart.com/search/?query=';
const productUrl = 'https://www.walmart.com/'
const result = new Map();

// Retrieves search result JSON from Walmart for specified query
async function getData (query) {
    console.log('received query array element: ' + query)
    let response =  await fetch(url + query).then(response => response.text()
        ).then((body) => {
            const $ = cheerio.load(body);
            // Create JSON obj out of cheerio selector
            var jsonObj = JSON.parse($ ("#searchContent").html()).searchContent;
            //builds an array of productPageUrls
            return jsonObj.preso.items.map(item => item.productPageUrl);
        }).then((arr) => {
            //Testing first productURL to fill the genericRetailerObj
            fetch(productUrl + arr[0]).then(response => response.text()
            ).then((body) => {
                const $ = cheerio.load(body);
                var productObj = JSON.parse($("#item").html()).item.product;
                var productName = productObj.midasContext.query; //what retailer calls product
                var priceObj = productObj.buyBox.products[0].priceMap;
                console.log(productObj);
            })
        }).catch((err) => {
            console.log(err);
    })
}

// Iterates through multiple queries with appropiate async await
async function process(queryArray){
    for(query of queryArray){
        await getData(query);
    }
    console.log(result);
}

getData('bananas');


module.exports = {getData, process};

// x = walmart('query') + target('query')
// x is list of generics