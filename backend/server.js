const { MongoClient } = require('mongodb');
const kroger = require('./scrape/kroger.js');
const target = require('./scrape/target.js');
const walmart = require('./scrape/walmart.js');
const retailers = [kroger, target];
require('dotenv').config()

// Took 2m 20s for Kroger and Target
const testPhrases = ['apple', 'banana', 'cookie', 'bread', 'eggs', 'milk', 'chips', 'soda', 'lettuce', 'juice'];

const uri = `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASS}@saver-cluster-d2gru.mongodb.net/test?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function main(){
    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // Make the appropriate DB calls
        for(query of testPhrases){
            await addQuery(client, query, '75028');
        }
        

        // Use searchBeta aggregation pipeline to test MongoDB Atlas natural language search
        var stuff = await client.db('product_info').collection('75028').aggregate({ $searchBeta: { "search": { "query": "a banana" } } }).toArray();
        console.log(stuff);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

async function addQuery(client, query, zip) {
    var products = [];
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
        await client.db('product_info').collection(zip).updateOne({ retailer: product.retailer, productName: product.productName }, { $set: product }, { upsert: true });
    }
}

main();