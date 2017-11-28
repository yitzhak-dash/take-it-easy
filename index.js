"use strict";
// imports
const client = require('./rest-client');
const config = require('config');


const baseUrl = config.get('baseUrl');

function getPlaceData(pageId) {
    const args = {
        parameters: {
            lang: 'en',
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
 * @param lat
 * @param lng
 * @param categoryId
 * @param listpage: page number
 */
function searchPlaces(lat, lng, categoryId, listpage = 1) {
    const args = {
        parameters: {
            lat,
            lng,
            c: categoryId,
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

function placesInfo(categoryIds) {

}


// mainRetrieveAllCategories();


// getPlaceData(3579142).then(data => console.log(JSON.stringify(data, undefined, 2)));
// searchPlaces(31.771378, 35.22038, '17440', 1)
//     .then(data => console.log(JSON.stringify(data, undefined, 2)));



