const { MongoClient } = require('mongodb');
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

async function addQuery(client, query, zip) {
    client = await client;
    // Get collection name from county-zip database
    var countyObj = await client.db('county-zip').collection('county-zip').findOne({ zip: zip.toString() });
    var products = [];
    // Iterate through retailers
    for (retailer of retailers) {
        products.push(retailer.getData(client, query, zip));
    }
    var resolvedArray = await Promise.all(products);
    var result = [];
    for (retailerObjs of resolvedArray) {
        result.push(retailerObjs);
    }
    result = result.flat();
    for (product of result) {
        await client.db('product_info').collection(countyObj.countyInfo).updateOne({ retailer: product.retailer, productName: product.productName }, { $set: product }, { upsert: true });
    }
    return result;
}

async function getLocationCookies(client) {
    client = await client;
    let count = 0;
    let cursor = await client.db('county-zip').collection('county-zip').find({});
    let zips = await cursor.toArray();
    let result = [];
    let failedResolves = [];
    let zipSet = new Set();
    let time = Date.now();
    for (doc of zips) {
        try {
            if (doc.zip == doc.walmartCookie.substring(0, 5)) {
                count++;
            } else {
                zipSet.add(doc.zip);
            }
        } catch {
            zipSet.add(doc.zip);
        }
    }
    count = 0;
    for (zip of zipSet) {
        result.push(walmart.getCookie(zip.trim()));
        if (result.length == 10) {
            try {
                //console.log(`Resolving Promises ${count}: ${(Date.now() - time)/1000.0}`);
                result = await Promise.all(result);
                for (cookie of result) {
                    //console.log(`Cookie from result: ${cookie.toString().substring(0, 5)}: ${cookie.toString()}`);
                    await client.db('county-zip').collection('county-zip').updateOne({ zip: cookie.toString().substring(0, 5) }, { $set: { 'walmartCookie': cookie.toString() } });
                }
                //console.log(`Promise resolved and cookies updated in mongo ${count}: ${(Date.now() - time)/1000.0}`);
                time = Date.now();
            } catch {
                console.log(`Failed resolve from ${count * 40} to ${count * 40 + 40}`);
                failedResolves.push(count);
            }
            result = [];
            count++;
        }
    }
    process.exit();
}

module.exports = { addQuery, getLocationCookies };

