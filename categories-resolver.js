"use strict";
// imports
const client = require('./rest-client');
const {getRandomInt} = require('./utils');
const Promise = require("bluebird");
const config = require('config');
const request = Promise.promisify(require("request"));
const writeJsonFile = Promise.promisify(require('jsonfile').writeFile);

const path = config.get('categoryFilePath');

const baseUrl = config.get('baseUrl');

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

function getCategoryIds(links) {
    const categoryIds = [];
    const actions = links.map(link => Promise.delay(getRandomInt(1197, 2139))
        .then(() => getCatIdFromHtmlPage(link)));
    return Promise.each(actions, (catId) => categoryIds.push(catId))
        .then(() => categoryIds);
}

function getSubcategoryLinks(catId) {
    const url = `${baseUrl}/json/subcats.json?c=${catId}`;
    console.log(`go to ${url}`);
    return client.getPromise(url)
        .then(res => {
            const subcats = res.data.bizlist.subcats;
            const filteredCategories = subcats.find(item => item.kind === 'cats');
            return filteredCategories ? filteredCategories.cats.map(item => item.link) : [];
        });
}

function getAllSubcategoriesLinks(catIds) {
    const links = [];
    const actions = catIds.map(catId => Promise.delay(getRandomInt(1223, 3564))
        .then(() => getSubcategoryLinks(catId)));
    return Promise.each(actions, (catLinks) => links.push(...catLinks))
        .then(() => links);
}

function mainRetrieveAllCategories(filePath = path) {
    home()
        .then(data => getCategories(data))
        .then(links => getCategoryIds(links))
        .then(catIds => getAllSubcategoriesLinks(catIds))
        .then(links => getCategoryIds(links))
        .then(catIds => writeJsonFile(filePath, catIds))
        .catch(err => console.log(err.message));
}

module.exports = mainRetrieveAllCategories;