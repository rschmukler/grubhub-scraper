# Grubhub-API

The api you wish grubhub had...


Full documentation coming soon

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
