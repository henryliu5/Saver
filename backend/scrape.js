const { MongoClient } = require('mongodb');
const kroger = require('./scrape/kroger');
const target = require('./scrape/target');
const walmart = require('./scrape/walmart');
const cookie = require('./scrape/cookie');
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
    let zipSet = new Set();
    let time = Date.now();
    for (doc of zips) {
        try {
            if (doc.zip == doc.walmartCookie.substring(0, 5) && doc.targetCookie !== null) {
                count++;
            } else {
                zipSet.add(doc.zip);
            }
        } catch {
            zipSet.add(doc.zip);
        }
    }
    count = 0;
    let batch = [];
    for (zip of zipSet) {
        zip = zip.trim();
        batch.push([zip, cookie.getWalmartCookie(zip), cookie.getTargetCookie(zip)]);
        if (batch.length == 10) {
            try {
                //console.log(`Resolving Promises ${count}: ${(Date.now() - time)/1000.0}`);
                // For each zip code, unwrap all promises for each retailer
                batch = await Promise.all(batch.map(zipCookies => Promise.all(zipCookies)));
                console.log(batch);
                for (cookies of batch) {
                    //console.log(`Cookie from result: ${cookies.toString().substring(0, 5)}: ${cookies.toString()}`);
                    await client.db('county-zip').collection('county-zip').updateOne({ zip: cookies[0] }, { $set: { 'walmartCookie': cookies[0].toString() } });
                    await client.db('county-zip').collection('county-zip').updateOne({ zip: cookies[0] }, { $set: { 'targetCookie': cookies[1].toString() } });
                }
                //console.log(`Promise resolved and cookies updated in mongo ${count}: ${(Date.now() - time)/1000.0}`);
                time = Date.now();
            } catch (err) {
                console.log(err);
                console.log(`Failed resolve from ${count * 10} to ${count * 10 + 10}`);
            }
            batch = [];
            count++;
        }
    }
    process.exit();
}

module.exports = { addQuery, getLocationCookies };

