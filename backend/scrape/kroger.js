const fetch = require('node-fetch');
let base64 = require('base-64');
require('dotenv').config()

const apiBaseUrl = process.env.KROGER_API_BASE_URL;
const oauth2BaseUrl = process.env.KROGER_OAUTH2_BASE_URL;
const clientId = process.env.KROGER_CLIENT_ID;
const clientSecret = process.env.KROGER_CLIENT_SECRET;
var thisZip;

// Gets access token from Kroger Authorization server using client_id and client_secret
async function getAccessToken() {
    try {
        const scope = encodeURIComponent('product.compact');
        let url = `${oauth2BaseUrl}/token?grant_type=client_credentials&scope=${scope}`
        let response = await fetch(url,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${base64.encode(clientId + ":" + clientSecret)}`
                }
            });
        var responseObj = await response.json();
        return responseObj.access_token;
    } catch (error) {
        console.log('Failed to get access token');
        console.error(error);
    }
}

// TODO verify retailerSet integrity
let retailerSet = new Set(['BAKERS', 'CITYMARKET', 'COPPS', 'DILLONS', 'FOOD4LESS', 'FOODSCO', 'FRED', 'FRED MEYER STORES', 'FRYS', 'GERBES', 'JAYC', 'KROGER', 'KINGSOOPERS', 'MARIANOS', 'METRO MARKET', 'MARIANOS', 'OWENS', 'PAYLESS', 'PICK N SAVE', 'QFC', 'RALPHS', 'RULER', 'SMITHS', 'TURKEY HILL MINIT MARKETS']);
// Get location ID of desired store
async function getLocations(zipCode) {
    try {
        // Use stored access token for location request
        let accessToken = await getAccessToken();
        // Filter chains to only Kroger stores
        let url = `${apiBaseUrl}/v1/locations?filter.zipCode.near=${zipCode}`;
        let response = await fetch(url, {
            method: "GET",
            cache: "no-cache",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json; charset=utf-8"
            }
        });
        var responseObj = await response.json();
        // console.log(responseObj)
        for (location of responseObj.data) {
            if (retailerSet.has(location.chain)) {
                //console.log(location);
                return location.locationId;
            }
        }
        console.log("No Kroger locations found near this zip code");
        return null;
    } catch (error) {
        console.log('Failed to get location ID');
        console.log(responseObj);
        console.error(error);
    }
}

// Get product information for given query and zip - zip used to determine location Id of store
// TODO enable fetching of product information from multiple stores to get best prices
// TODO fix case where there are no valid products
async function getData(query, zipCode) {
    thisZip = zipCode;
    let genericObjArr = [];
    // Get necessary info for api request
    let locationId = await getLocations(zipCode);
    // Check to see if there is store in range
    if (locationId) {
        let accessToken = await getAccessToken();
        let url = `${apiBaseUrl}/v1/products?filter.locationId=${locationId}&filter.term=${query}`;
        let response = await fetch(url, {
            method: "GET",
            cache: "no-cache",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json; charset=utf-8"
            }
        });
        //console.log(response);
        // Push generic objects from response body into return
        let responseObj = await response.json();
        for (let i = 0; i < responseObj.data.length; i++) {
            genericObjArr.push(getGenericObj(responseObj.data[i], i));
        }
    }
    return genericObjArr;
}

// Converts product object from Kroger API into our generic object
function getGenericObj(krogerObj, rank) {
    //console.log(krogerObj)
    var genericObj = new Object();
    try {
        genericObj.retailer = "Kroger";
        genericObj.productName = krogerObj.description;
        genericObj.price = krogerObj.items[0].price.regular;
        genericObj.unitPrice = null;
        genericObj.inStock = krogerObj.items[0].fulfillment.inStore;
        genericObj.unit = krogerObj.items[0].size;
        genericObj.img = null;
        genericObj.zipCode = thisZip;
        genericObj.timeStamp = Date.now();
        genericObj.rank = rank;
    } catch (error) {
        genericObj.error = error;
        genericObj.timeStamp = Date.now();
        genericObj.originalObj = krogerObj;
    }
    return genericObj;
}

module.exports = { getData };

async function getChains() {
    try {
        // Use stored access token for location request
        let accessToken = await getAccessToken();
        // Filter chains to only Kroger stores
        let url = `${apiBaseUrl}/v1/chains`;
        let response = await fetch(url, {
            method: "GET",
            cache: "no-cache",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json; charset=utf-8"
            }
        });
        var responseObj = await response.json();
        console.log(responseObj)

        return responseObj
    } catch (error) {
        console.error(error);
    }
} 