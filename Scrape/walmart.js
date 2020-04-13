const cheerio = require('cheerio');
const fetch = require('node-fetch');
const url = 'https://www.walmart.com/search/?query=';
let result = [];

async function walmart (query) {
    let response =  await fetch(url + query).then(response => response.text()
        ).then((body) => {
            const $ = cheerio.load(body);
            // Create JSON obj out of cheerio selector
            var jsonObj = JSON.parse($("#searchContent").html());
            return jsonObj;
        }).catch((err) => {
            console.log(err);
    })
    result.push(response);
    return result;
}

async function print(){
    await walmart('banana')
    await walmart('apples')
    console.log(result)
}
print()

//export {walmart};

// x = walmart('query') + target('query')
// x is list of generics
//export{walmart}