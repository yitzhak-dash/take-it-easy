"use strict";
// imports
const client = require('./rest-client');


function getPlaceData(pageId) {
    const args = {
        parameters: {
            p: pageId
        }
    };
    return client.getPromise("https://easy.co.il/json/bizpage.json", args)
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
    return client.getPromise("https://easy.co.il/json/list.json", args)
        .then(res => {
            return res.data;
        }).catch(err => {
            console.log(`error: ${err.message}`);
            throw new Error();
        })
}


function getHome() {

}

// getPlaceData(2015922);
searchPlaces('bank', 31.771378, 35.22038, 2)
    .then(data => console.log(JSON.stringify(data, undefined, 2)));


