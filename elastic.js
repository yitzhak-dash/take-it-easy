const elasticsearch = require('elasticsearch');
const config = require('config');
const _ = require('lodash');

const client = new elasticsearch.Client({
    host: config.get('elastic').host,
    log: 'trace'
});

function ping() {
    client.ping({
        requestTimeout: 30000,
    }, function (error) {
        if (error) {
            console.error('elasticsearch cluster is down!');
        } else {
            console.log('All is well');
        }
    });
}

function deleteWholeType() {
    client.deleteByQuery({
        index: 'bowdo',
        type: 'place'
    }).then(data => console.log('finished'));
}

async function search() {
    const res = await client.search({
        index: 'bowdo',
        type: 'place',
        body: {
            query: {
                match_all: {}
            }
        }
    });

    console.log(res);
}


function parse(rawObj) {
    if (_.isNil(rawObj)) {
        throw new Error('You surprise me, param: <rawObj> may not be null');
    }
    if (_.isNil(rawObj.bizpage)) {
        throw new Error('rawObj has to have an attribute <bizpage>');
    }
    const data = rawObj.bizpage;

    return {
        id: (+data.bizid).toString(16),
        name: data.bizname,
        location: {
            coordinates: {
                lat: data.position.lat,
                lon: data.position.lng,
            },
            address: data.position.address,
            mapId: (+data.position.mapid).toString(16)
        },
        openHours: data.openhours.items,
        categories: data.features.filter(item => item.type === 'bizlist').map(item => item.title)
    };
}


async function addPlace(place) {
    // todo : validate data shape
    return await client.create({
        index: 'bowdo',
        type: 'place',
        id: (place.id),
        body: place
    });
}