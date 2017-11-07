"use strict";

/**
 * appending to url <?lang=en> will change language of response.
 *
 * 1. json/home.json
 * 2. use response: go to shopping: segments[1].items
 * 3. append <link> to base url and GET each html page
 * 4. for each response from html page find <catId>
 * 5. send <catId> to "subcats.json?c=<catId>"
 * 6. use response: <bizlist.subcats> where <kind> is "cats", then <bizlist.subcats[id-that-you-will-find].cats>
 * 7. do #3 and #4
 * 8. call json/list.json params: {
 *      c: <catId>
        listpage: <page number, starts from 1>
        lat: <latitude>
        lng: <longitude>
     }
 * 9. use response: save staff in storage, check if <nextpage> exist and true to load next page, by incrementing <listpage>
 */

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


// getPlaceData(2015922);
searchPlaces('bank', 31.771378, 35.22038, 2)
    .then(data => console.log(JSON.stringify(data, undefined, 2)));

