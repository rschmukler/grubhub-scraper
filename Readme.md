# Grubhub-API

The api you wish grubhub had...


## Install

Install with npm:

```
npm install grubhub-api
```

## Example

```js
var Search = require('grubhub-api').Search;

var search = new Search('1234 Blueberry Hill, Ny');

search.run({perPage: 15, page: 1}, function(err, results) {
  results.forEach(function(restaurant) {
    console.log(
      "Restaurant %s is %d miles away, has a rating of %d",
      restaurant.name, restaurant.distance, restaurant.grubhubRating
    );
  });
});
```

## Example Search Response

A search will include restauraunt objects in an array. The object is as follows:

```js
{ name: 'Smith Express Food ',
  grubhubRating: 3.43,
  yelpRating: 1.5391592,
  distance: 0.917472394592236,
  cuisines:[ 
    'sandwiches',
    'american',
    'breakfast',
    'wraps',
    'bagels',
    'hamburgers',
    'dinner'
   ]
}
```

## Sort Options

- onlyOpen: include only currently open restaurants
- sort: How to sort, valid options are
  - `STAR_RATING` - sort by ratings
  - `ORDER_MINIMUM` - sort by min-price
  - `DISTANCE` - can you guess?

- cuisine: include the cusines you want, currently not supported, but planned

## Configuring a Search

### location(String)

Sets the location

```js
var Search = new Search();
Search.location('1234 Blueberry Hill');
```

### onlyOpen(Boolean)

Sets whether to only search for open locations. `true` by default.

```js
var Search = new Search();
Search.onlyOpen(true);
```

### autolocate(Boolean)

Sets whether or not to auto-select when a location search returns multiple results.
Defaults to `true`. If `false`, search will throw an error if location returns multiple results.

```js
var Search = new Search();
Search.autolocate(false);
```
