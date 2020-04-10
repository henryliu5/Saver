const cheerio = require('cheerio');
const http = require('http');
const fetch = require('node-fetch');

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

var url = 'https://www.walmart.com/search/?query=banana';

fetch(url).then(response => response.text()
).then((body) => {
    //console.log(body)
    runServer(body)
    const $ = cheerio.load(body);
    // Create JSON obj out of cheerio selector
    var x = JSON.parse($("#searchContent").html())
    console.log(JSON.parse(x.html()))
}).catch((err) => {
    console.log(err)
})