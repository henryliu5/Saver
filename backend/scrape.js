const { MongoClient } = require('mongodb');
const parseCsv = require('./parse');
const kroger = require('./scrape/kroger');
const target = require('./scrape/target');
const walmart = require('./scrape/walmart');
const retailers = [kroger, target, walmart];

// 5/15/20
// 2m 30s 75028
// 4m 45s 10001
// 4m 7s 60639

// 5/17/20
// 1m 20s 75028
// 1m 24s 10001

// 5/17/20 w/ parallelization of queries
// 0m 36s 75028
// 0m 29s 10001

const testPhrases = ['apples', 'banana', 'cookie', 'bread', 'eggs', 'milk', 'chips', 'soda', 'lettuce', 'juice'];

async function addQuery(client, query, zip) {
    client = await client;
    // Get collection name from county-zip database
    var countyObj = await client.db('county-zip').collection('county-zip').findOne({ zip: zip.toString() });
    var products = [];
    // Iterate through retailers
    for (retailer of retailers) {
        products.push(retailer.getData(query, zip));
    }
    var resolvedArray = await Promise.all(products);
    var result = [];
    for (retailerObjs of resolvedArray) {
        result.push(retailerObjs);
    }
    result = [].concat(result[0], result[1], result[2]);
    console.log(result);
    for (product of result) {
        await client.db('product_info').collection(countyObj.countyInfo).updateOne({ retailer: product.retailer, productName: product.productName }, { $set: product }, { upsert: true });
    }
    return result;
}

module.exports = { addQuery };

