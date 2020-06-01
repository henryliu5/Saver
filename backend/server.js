const { MongoClient } = require('mongodb');
const scrape = require('./scrape');
const express = require('express');
const app = express();
require('dotenv').config();
const testPhrases = ['apples', 'banana', 'cookie', 'bread', 'eggs', 'milk', 'chips', 'soda', 'lettuce', 'juice'];


var port = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Hello World!'))

// Uncached get - scrape for update
app.get('/data', async (req, res, next) => {
    var query = req.query;
    var productName = query.productName;
    var zip = query.zip;
    if(productName && zip){
        console.log(`Received get on /data for ${productName} at ${zip}`);
        var products = await scrape.addQuery(client, productName, zip);
        res.status(200).send(products);
    } else{
        res.status(400).send(`Missing parameters, received productName=${productName}, zip=${zip}`);
    }
})

//returns connected mongodb client
async function getClient() {
    const uri = `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASS}@saver-cluster-d2gru.mongodb.net/test?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log('mongoDB Connected')
    return client;
}

client = getClient();

async function test(client) {
    var instances = [];
    for(query of testPhrases){
        instances.push(scrape.addQuery(client, query, '01012'));
    }
    await Promise.all(instances);
    //await scrape.getLocationCookies(client);
}

test(client);

app.listen(port, () => console.log(`App listening at http://localhost:${port}`))