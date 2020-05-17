const { MongoClient } = require('mongodb');
const parseCsv = require('./parse.js');
const kroger = require('./scrape/kroger.js');
const target = require('./scrape/target.js');
const retailers = [kroger, target];
require('dotenv').config();

// 5/15/20
// 2m 30s 75028
// 4m 45s 10001
// 4m 7s 60639

// 5/17/20
// 1m 20s 75028
// 1m 24s 10001

const testPhrases = ['apples', 'banana', 'cookie', 'bread', 'eggs', 'milk', 'chips', 'soda', 'lettuce', 'juice'];

const uri = `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASS}@saver-cluster-d2gru.mongodb.net/test?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function main(){
    try {
        // Connect to the MongoDB cluster
        await client.connect();
        await parseCsv.parseCsv(client);
        // Make the appropriate DB calls
        for(query of testPhrases){
            await addQuery(client, query, '10001');
        }
        
        // Use searchBeta aggregation pipeline to test MongoDB Atlas natural language search
        //var stuff = await client.db('product_info').collection('75028').aggregate({ $searchBeta: { "search": { "query": "a banana" } } }).toArray();
        //console.log(stuff);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

async function addQuery(client, query, zip) {
    // Get collection name from county-zip database
    var countyObj = await client.db('county-zip').collection('county-zip').findOne({ zip: zip.toString() });
    var products = [];
    // Iterate through retailers
    for (retailer of retailers) {
        products.push(retailer.getData(query, zip));
    }
    var resolvedArray = await Promise.all(products);
    var result = [];
    for(retailerObjs of resolvedArray){
        result.push(retailerObjs);
    }
    result = [].concat(result[0], result[1]);
    console.log(result);
    for(product of result){
        await client.db('product_info').collection(countyObj.countyInfo).updateOne({ retailer: product.retailer, productName: product.productName }, { $set: product }, { upsert: true });
    }
}

main();
