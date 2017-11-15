### Notes:
* appending to url <?lang=en> will change language of response.
### Project flow: 
1. json/home.json
2. use response: go to shopping: `segments[1].items`
3. append <link> to base url and call `GET` to each html page
4. for each response find <catId>
5. send <catId> to "json/subcats.json?c=<catId>"
6. use response: <bizlist.subcats> where <kind> is "cats", then `<bizlist.subcats[id-you-will-find].cats>`
7. do #3 and #4
8. call json/list.json params: 
    ```
    {
        c: <catId>
        listpage: <page number, starts from 1>
        lat: <latitude>
        lng: <longitude>
     }
     ```
 9. use response: save staff in storage, check if <nextpage> is true to load next page, by incrementing <listpage>
 #### Here's the place to ask the question: why don't we use MongoDb  instead Postgres???
 > data-shape:
 ```javascript
 {
    name: bizpage.bizname,
    location: {
        lat: bizpage.position.lat,
        lng: bizpage.position.lng,
        address: bizpage.position.address,
        mapId:bizpage.position.mapid
    },
    bestsubcat:bizpage.bestsubcat
    openHours:[{ 
           day:bizpage.openhours.items[n].day,
           hours:bizpage.openhours.items[n].hours // array
        }],
    
 }
 ```