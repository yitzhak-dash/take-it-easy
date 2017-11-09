"use strict";
// imports
const client = require('./rest-client');
const Promise = require("bluebird");
const config = require('config');
const request = Promise.promisify(require("request"));


const baseUrl = config.get('baseUrl');

function getPlaceData(pageId) {
    const args = {
        parameters: {
            p: pageId
        }
    };
    return client.getPromise(`${baseUrl}json/bizpage.json`, args)
        .then((res) => {
            return res.data;
        }).catch(err => {
            console.log(`error: ${err.message}`);
        });
}

/**
 * @param searchedKeyword
 * @param lat
 * @param lng
 * @param rad: radius for search(meters)
 * @param c: categoryId
 * @param order
 * @param listpage: page number
 */
function searchPlaces(searchedKeyword, lat, lng, listpage = 1, rad = 300, c = 622, order = 50) {
    const args = {
        parameters: {
            searchedKeyword,
            lat,
            lng,
            rad,
            // c,
            mysearch: searchedKeyword,
            listpage
        }
    };
    return client.getPromise(`${baseUrl}json/list.json`, args)
        .then(res => {
            return res.data;
        }).catch(err => {
            console.log(`error: ${err.message}`);
            throw new Error();
        })
}

function home() {
    console.log('going to home.json....');
    return client.getPromise(`${baseUrl}/json/home.json`)
        .then(res => {
            return res.data;
        });
}

function getCategories(data) {
    console.log('retrieve categories');
    return Promise.resolve(data.segments[1].items.map(item => item.link));
}

function getCatIdFromHtmlPage(link) {
    const url = `${baseUrl}/${link}`;
    console.log('going to ' + url);
    // disable certificate validation
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    return request(url)
        .then((response) => {
            const regex = /var catid=(["'])(?:(?=(\\?))\2.)*?\1/g;
            const res = regex.exec(response.body);
            const str = res[0];
            return str.match(/\"(.*)\"/).pop();
        }).catch(err => {
            console.log(`error on downloading ${url} ${err.message}`);
            return Promise.reject();
        });
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function getCatIds(links) {
    const arr = [];
    const actions = links.map(link => Promise.delay(getRandomInt(100, 1139))
        .then(() => getCatIdFromHtmlPage(link)));
    return Promise.each(actions, (catId) => arr.push(catId))
        .then(() => arr);
}

function getSubcats(catId) {
    const url = `${baseUrl}/subcats.json`;
    console.log(`go to ${url}`);
    return client.getPromise(url, {parameters: {c: catId}})
        .then(res => {
            console.log(res.data);
            const subcats = res.data.subcats;
            return subcats.find(item => item.kind === 'cats').cats;
        });
}

function main() {
    home()
        .then(data => getCategories(data))
        .then(links => getCatIds(links))
        .then(catIds => console.log(catIds))
        .catch(err => console.log(err.message));
}

// main();


getSubcats(4850)
    .then((data) => console.log(JSON.stringify(data)));


// getPlaceData(2015922);
// searchPlaces('bank', 31.771378, 35.22038, 2)
//     .then(data => console.log(JSON.stringify(data, undefined, 2)));


