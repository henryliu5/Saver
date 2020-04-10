const cheerio = require('cheerio');
const fetch = require('node-fetch');
const url = 'https://www.walmart.com/search/?query=';


var getJSON = function (query) {
    fetch(url + query).then(response => response.text()
        ).then((body) => {
            const $ = cheerio.load(body);
            // Create JSON obj out of cheerio selector
            var jsonObj = JSON.parse($("#searchContent").html())
            // console.log(JSON.parse(x.html()))
        }).catch((err) => {
            console.log(err)
        })
}

function walmart (query) {
    let result = []
    data = getJSON(query)
    return result
}


export {walmart};

// x = walmart('query') + target('query')
// x is list of generics
//export{walmart}