var request = require('superagent'),
    cheerio = require('cheerio');

var ENDPOINT_URL = 'https://www.grubhub.com/search/:where/';

var Search = module.exports = function Search(where) {
  this._where = where;
  this._autolocation = true;
  this._onlyOpen = true;
};

Search.prototype.run = function(opts, cb) {
  var search = this;
  if(!cb) {
    cb = opts;
    opts = {};
  }

  opts.perPage = opts.perPage || 15;
  opts.page = opts.page || 1;

  this.getRestaurantIds(function(err, ids) {
    if(err) { return cb(err); }
    var idsToLoad = ids.slice((opts.page - 1) * opts.perPage, opts.perPage);
    search.loadIds(idsToLoad, cb);
  });
};

Search.prototype.location = function(where) {
  this._where = where;
  return this;
};

Search.prototype.onlyOpen = function(onlyOpen) {
  this._onlyOpen = onlyOpen;
  return this;
};

Search.prototype.autolocate = function(autolocate) {
  this._autolocation = autolocate;
  return this;
};

Search.prototype.getRestaurantIds = function(opts, cb) {
  var search = this;
  if(!cb) { cb = opts; opts = undefined; }

  request.get(this.url(opts)).end(checkLocationMatch.call(this, function(err, res) {
    if(err) return cb(err);
    var $ = cheerio.load(res.text);
    var ids = [];
    $('[data-restaurant-id]').each(function(i, elem) {
      ids.push($(elem).data('restaurant-id'));
    });
    search._ids = ids;
    search._cuisineMap = {};
    $('[for*=cuisine-]').each(function(i, elem) {
      var $el = $(elem),
          id = $el.attr('for').match(/\d+/)[0],
          cuisine = $el.text().trim().toLowerCase();

      search._cuisineMap[cuisine] = parseInt(id, 10);
    });
    cb(null, ids);
  }));
};

Search.prototype.url = function(opts) {
  opts = opts || {
    onlyOpen: true,
    sort: 'STAR_RATING',

  };

  var results =  ENDPOINT_URL.replace(/:where/, encodeURIComponent(this._where));

  var options = [];
  if(opts.onlyOpen) options.push('filters=openNow');
  if(opts.sort) options.push('sort=' + opts.sort);

  if(options.length);
    results += '?' + options.join('&');

  return results;
};

Search.prototype.loadIds = function(ids, cb) {
  var url = ENDPOINT_URL.replace(/:where/, encodeURIComponent(this._where));
  url += '/more?where=' + encodeURIComponent(this._where);
  url += '&restaurantIds=' + ids.join(',');
  request.get(url).end(parseRestaurants(cb));
};

function parseRestaurants(cb) {
  return function(err, res) {
    if(err) return cb(err);
    var results = [];

    var $ = cheerio.load(res.text);

    $('[data-restaurant-id]').each(function(i, elem) {
      var $el = $(elem);
      var restaurant = {
        name: $el.find('.restaurant-name').html(),
        grubhubRating: parseFloat($el.find('.restaurantRating').attr('data-average-rating'), 10) || undefined,
        yelpRating: parseFloat($el.find('.yelpRating').attr('data-average-rating'), 10) || undefined,
        distance: parseFloat($el.find('.resultsLogoContainer .fine_print').html(), 10) || undefined,
        cuisines: $el.find('.cuisines').html().split(',').map(function(cusine) { return cusine.trim().toLowerCase(); })
      };
      results.push(restaurant);
    });

    cb(null, results);
  };
}

function checkLocationMatch(cb) {
  var search = this;
  return function(err, res) {
    if(err) return cb(err);

    if(/We found more than one match for/.test(res.text)) {
      if(!search._autolocation) { return cb(new Error('Could not determine location')); }
      var $ = cheerio.load(res.text);
      search._where = $('.addressList ul li a').first().attr('href').match(/\/search\/(.*)\//)[1];
      request.get(search.url()).end(cb);
    } else {
      cb(err, res);
    }
  };
}
