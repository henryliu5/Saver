const express = require('express')
const app = express()

var port = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/data', (req, res, next) => {
    query = req.query;
    if(query.productName && query.zip){
        console.log(query.productName);
        console.log(query.zip);
        res.status(200).send('ok');
    } else{
        res.status(400).send(`Missing parameters, received productName=${query.productName}, zip=${query.zip}`);
    }
})

app.listen(port, () => console.log(`App listening at http://localhost:${port}`))