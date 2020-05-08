require('dotenv').config()
var r = require('jsrsasign');
const fetch = require('node-fetch');


function keySign() {
    const consumerId = "2db67560-d48d-44bd-a3e4-2076246e262a";
    const privateKeyVersion = "2";
    const privateKey = process.env.WALMART_PRIVATE_KEY;

    var inTimeStamp = (new Date()).getTime();

    console.log("consumerID: " + consumerId);
    console.log("intimestamp: " + inTimeStamp);

    var arr1 = consumerId + '\n' + inTimeStamp + '\n' + privateKeyVersion + '\n';
    let decodedPrivateKey = Buffer.from(privateKey, 'base64').toString('hex');
    //console.log(decodedPrivateKey);

    var rsa = new (r.RSAKey)();
    rsa.readPKCS8PrvKeyHex(decodedPrivateKey);
    var key = r.KEYUTIL.getKey(rsa);

    var sig = new r.KJUR.crypto.Signature({ "alg": "SHA256withRSA" });
    sig.init(key);

    var base64EncodedSignature = Buffer.from(sig.signString(arr1), 'hex').toString('base64');
    console.log(base64EncodedSignature);

    var myHeaders = new fetch.Headers();
    myHeaders.append("WM_SEC.KEY_VERSION", "2");
    myHeaders.append("WM_CONSUMER.ID", consumerId);
    myHeaders.append("WM_CONSUMER.INTIMESTAMP", inTimeStamp);
    myHeaders.append("WM_SEC.AUTH_SIGNATURE", base64EncodedSignature);

    return myHeaders;
}

async function getStoreID(zip) {
    try {
        var response = await fetch(`https://developer.api.walmart.com/api-proxy/service/affil/product/v2/stores?zip=${zip}`,
            {
                method: 'GET',
                headers: keySign()
            });
        var responseObj = await response.text();
        responseObj = JSON.parse(responseObj);
        console.log(responseObj[0].no);
        return responseObj[0].no;
    } catch (error) {
        console.log(error);
    }
}

async function getData(query, zip) {
    try {
        var storeId = await getStoreID(zip);
        var response = await fetch(`https://developer.api.walmart.com/api-proxy/service/affil/product/preso/v2`,
            {
                method: 'GET',
                headers: keySign()
            });
        var responseObj = await response.text();
        console.log(responseObj);
        responseObj = JSON.parse(responseObj);
        console.log(responseObj);
        return responseObj;
    } catch (error) {
        console.log(error);
    }
}
getData('bananas','75022');

