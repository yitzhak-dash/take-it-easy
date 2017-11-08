"use strict";
// imports
const client = require('./rest-client');
const config = require('config');
const request = require("request");


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
    return client.getPromise(`${baseUrl}/json/home.json`)
        .then(res => {
            return res.data;
        });
}

function getShoppingCategories(data) {
    return Promise.resolve(data.segments[1].items.map(item => item.link));
}

function getCatIdFromHtmlPage(link) {

    request.get(`${baseUrl}/${link}`, (req, res) => {
        console.log(req);
    });

    return client.getPromise(`${baseUrl}/${link}`)
        .then(html => {
            console.log(html.data);
            const regex = /var catid=(["'])(?:(?=(\\?))\2.)*?\1/g;
            const res = regex.exec(html);
            return res[0];
        })
}


function main() {
    home()
        .then(data => getShoppingCategories(data))
        .then(links => getCatIdFromHtmlPage(links[0]))
        .then(catId => console.log(catId));
}

main();

// getPlaceData(2015922);
// searchPlaces('bank', 31.771378, 35.22038, 2)
//     .then(data => console.log(JSON.stringify(data, undefined, 2)));


