"use strict";
// imports
const client = require('./rest-client');
const {getRandomInt, prettyJsonPrint, printError} = require('./utils');
const {addPlace} = require('./elastic');

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
    console.log(`getPlaceData(${pageId})...`);

    return client.getPromise(`${baseUrl}json/bizpage.json`, args)
        .then((res) => {
            console.log(`getPlaceData(${pageId}) => ${res}`);
            return res.data;
        }).catch(err => {
            printError(err);
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
    console.log(`searchPlaces(${categoryId})...`);
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
            if (!res.data || !res.data.bizlist || !res.data.bizlist.list) {
                console.log('not found for categoryId:', categoryId);
                return {placeIds: [], nextPage: false};
            }
            const placeIds = res.data.bizlist.list.map(item => item.id);
            const nextPage = res.data.bizlist.nextpage;
            return {placeIds, nextPage};
        })
        .catch(err => {
            printError(err);
        })
}

function findPlaceIds(categoryIds, lat, lng, radius) {
    const placeIds = [];
    console.log('got categoryIds:', JSON.stringify(categoryIds));
    const actions = categoryIds.map(catId => Promise.delay(getRandomInt(1190, 2543))
        .then(() => loadPlaceIds(catId)));

    return Promise.each(actions, (pageIds) => {
        console.log('found pageId:', JSON.stringify(pageIds));
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

// getPlaceData(3579142).then(data => console.log(JSON.stringify(data, undefined, 2)));
// searchPlaces(31.771378, 35.22038, '17440', 50000, 1)
//     .then(data => console.log(JSON.stringify(data, undefined, 2)));

function getCategories() {
    return readJsonFile(filePath)
}

function run(lat, lng, radius) {
    getCategories()
        .then(categoryIds => {
            const actions = categoryIds.map((catId) => workWithCatId([catId]));
            return Promise.each(actions, (o) => prettyJsonPrint(o));
        }).catch(err => printError(err));


    function workWithCatId(catId) {
        return findPlaceIds(catId, lat, lng, radius)
            .then(data => {
                const pageIds = _.uniq(_.flatten(data));
                const actions = pageIds.map(placeId => getPlaceData(placeId)
                    .then(placeData => addPlace(placeData))
                    .then((data) => {
                        console.log('data saved');
                        return data;
                    })
                    .catch(err => printError(err)));

                return Promise.each(actions, (o) => o);
            })
            .catch(err => printError(err));
    }
}

run(31.7491165, 35.2157467, 1500);

// findPlaceIds(['17440'], 31.771378, 35.22038, 500)
//     .then(data => {
//         const placeIds = _.flatten(data);
//         const actions = placeIds.map(placeId => Promise.delay(getRandomInt(1190, 2543))
//             .then(() => getPlaceData(placeId).then(placeData => storagePlaceData(placeData))));
//         return Promise.each(actions, (o) => {
//             prettyJsonPrint(o);
//         });
//     })
//     .catch(err => console.log(err));

