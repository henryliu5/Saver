const cheerio = require('cheerio');
const fetch = require('node-fetch');
const url = 'https://www.target.com/s?searchTerm=';
const result = [];
const puppeteer = require('puppeteer');

async function run (query){
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(url + query, { "waitUntil": "networkidle0" });
    const html = await page.content();
    return html;
};
//run('bananas');

module.exports = {run};