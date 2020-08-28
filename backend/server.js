const { MongoClient } = require('mongodb');
const scrape = require('./scrape');
const express = require('express');
const app = express();
const Retrieval = require('retrieval');
const fs = require('fs');
const readLine = require('readline');

require('dotenv').config();
const testPhrases = ['apples', 'banana', 'cookie', 'bread', 'eggs', 'milk', 'chips', 'soda', 'lettuce', 'juice'];
process.setMaxListeners(Infinity);

var port = process.env.PORT || 7000;

app.get('/', (req, res) => res.send('Hello World!'))

// Uncached get - scrape for update
app.get('/data', async (req, res, next) => {
    var query = req.query;
    var productName = query.productName;
    var zip = query.zip;
    if(productName && zip) {
        console.log(`Received get on /data for ${productName} at ${zip}`);
        var products = await scrape.addQuery(client, productName, zip);
        res.status(200).send(products);
    } else {
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

async function search(){
    let rt = new Retrieval((K = 0.05), (B = 1.0));
    client = await client;
    let data = await client.db("product_info").collection("Denton, Texas").find({}).toArray();
    let productNames = data
      .map((prod) => prod.productName)
      .filter((prod) => prod != null);
    rt.index(productNames);
    let results = rt.search("bread", 15);
    console.log(results);
}

function search2(){
    //const src = fs.createReadStream("./glove.840B.300d.txt");
    const readInterface = readLine.createInterface({
        input: fs.createReadStream("./glove.840B.300d.txt"),
        console: false
    });
    let dict = new Map();
    readInterface.on('line', function(line) {
        let values = line.split(' ');
        dict.set(values[0], values.slice(1));
        console.log(dict.size);
    });
}


// async function test(client) {
// //     var instances = [];
// //     for(query of testPhrases){
// //         instances.push(scrape.addQuery(client, query, '75028'));
// //     }
// //     await Promise.all(instances);
//     await scrape.getLocationCookies(client); 
//     process.exit();
// }

// test(client);

app.listen(port, () => console.log(`App listening at http://localhost:${port}`))
// search();