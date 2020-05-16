const csv = require('csv-parser')
const fs = require('fs')

async function parseCsv(client) {
    const counties = [];
    const zips = [];

    // Create promises to control file streams
    let countyPromise = new Promise((resolve, reject) => {
        fs.createReadStream('./static_data/countycensus.csv')
            .pipe(csv(['County', 'Population']))
            .on('data', (data) => counties.push(data))
            .on('end', () => {
                resolve(counties);
            });
    });

    let zipPromise = new Promise((resolve, reject) => {
        fs.createReadStream('./static_data/uszips.csv')
            .pipe(csv(['Zip', 'State', 'County']))
            .on('data', (data) => zips.push(data))
            .on('end', () => {
                resolve(zips);
            });
    });

    let data = await Promise.all([countyPromise, zipPromise]);
    let countyData = data[0];
    let zipData = data[1];

    // Create set of top 500 counties by population
    var set = new Set();
    for(var i = 0; i < 500; i++){
        set.add(countyData[i].County);
    }
    var result = [];
    await client.db('county-zip').collection('county-zip').deleteMany({});
    
    // Add all zip codes that match a county to result array
    for(zipInfo of zipData){
        if (set.has(zipInfo.County + ', ' + zipInfo.State)){
            var county = {
                countyInfo: zipInfo.County + ', ' + zipInfo.State,
                zip: zipInfo.Zip
            };
            result.push(county);
        }
    }
    await client.db('county-zip').collection('county-zip').insertMany(result);
}

module.exports = { parseCsv };
