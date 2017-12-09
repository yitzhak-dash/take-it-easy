"use strict";
// imports
const client = require('./rest-client');
const {getRandomInt, prettyJsonPrint} = require('./utils');

const config = require('config');
const Promise = require("bluebird");
const readJsonFile = Promise.promisify(require('jsonfile').readFile);
const _ = require('lodash');

const baseUrl = config.get('baseUrl');
const filePath = config.get('categoryFilePath');

/**
 *
 * @param pageId
 * @return {Promise.<TResult>}
 */
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
 * @param radius
 * @param listpage: page number
 * @return {Promise<{placeIds:[], nextPage:boolean}>}
 */
function searchPlaces(lat, lng, categoryId, radius = 500, listpage = 1) {
    const args = {
        parameters: {
            lat,
            lng,
            radius,
            c: categoryId,
            listpage
        }
    };
    return client.getPromise(`${baseUrl}json/list.json`, args)
        .then(res => {
            if (!res.data.bizlist.list) {
                return {placeIds: [], nextPage: false};
            }
            const placeIds = res.data.bizlist.list.map(item => item.id);
            const nextPage = res.data.bizlist.nextpage;
            return {placeIds, nextPage};
        }).catch(err => {
            throw new Error(`error: ${err.message}`);
        })
}

function findPlaceIds(categoryIds, lat, lng, radius) {
    const placeIds = [];

    const actions = categoryIds.map(catId => Promise.delay(getRandomInt(1190, 2543))
        .then(() => loadPlaceIds(catId)));

    return Promise.each(actions, (pageIds) => {
        return pageIds;
    });

    function loadPlaceIds(categoryId, listpage = 1) {
        return searchPlaces(lat, lng, categoryId, radius, listpage)
            .then(data => {
                placeIds.push(...data.placeIds);
                if (data.nextPage) {
                    return loadPlaceIds(categoryId, listpage + 1);
                } else {
                    return placeIds;
                }
            });
    }
}

function storagePlaceData(data) {
    const obj = {
        name: data.bizpage.bizname,
        location: {
            lat: data.bizpage.position.lat,
            lng: data.bizpage.position.lng,
            address: data.bizpage.position.address,
            mapId: data.bizpage.position.mapid
        },
        categories: data.bizpage.features.map(item => item.title),
        openHours: data.bizpage.openhours.items,
    };
    return obj;
}

// getPlaceData(3579142).then(data => console.log(JSON.stringify(data, undefined, 2)));
// searchPlaces(31.771378, 35.22038, '17440', 50000, 1)
//     .then(data => console.log(JSON.stringify(data, undefined, 2)));

function run(lat, lng, radius) {
    readJsonFile(filePath)
        .then(categoryIds => findPlaceIds(categoryIds, lat, lng, radius))
        .then(data => console.log(JSON.stringify(data, undefined, 2)))
        .catch(err => console.log(err));
}

findPlaceIds(['17440'], 31.771378, 35.22038, 500)
    .then(data => {
        const placeIds = _.flatten(data);
        const actions = placeIds.map(placeId => Promise.delay(getRandomInt(1190, 2543))
            .then(() => getPlaceData(placeId).then(placeData => storagePlaceData(placeData))));
        return Promise.each(actions, (o) => {
            prettyJsonPrint(o);
        });
    })
    .catch(err => console.log(err));

