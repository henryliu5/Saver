import {walmart} from 'walmart.js'
const http = require('http');

const runServer = (body) => {
    //console.log(body);
    // Creates info for server
    const server = http.createServer((req, res) => {
        res.statusCode = 200;
        // requires charset=UTF in header (or html body can contain meta UTF-8 tag)
        res.setHeader('Content-Type', 'text/html; charset=UTF-8');
        res.end(body)
    })

    const hostname = '127.0.0.1';
    const port = 3000;
    // Starts server
    server.listen(port, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
    });
}
//runServer('<h1>Saver</h1><p>Saving money made simple.</p>');
/*
const genericRetailerObj = {
    'name': 'Bananas, bunch',
    'retailer': 'Walmart',
    'price': 1,
    'unitPrice': 0.18,
    'unit': 'lb',
    'inStock': true,
    'img': './imgs/thumbnail.png'
}
*/


