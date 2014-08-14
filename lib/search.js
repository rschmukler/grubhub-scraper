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

Search.prototype.getRestaurantIds = function(cb) {
  var search = this;
  if(search._ids) return cb(null, search._ids);
  request.get(this.url()).end(checkLocationMatch.call(this, function(err, res) {
    if(err) return cb(err);
    var $ = cheerio.load(res.text);
    var ids = [];
    $('[data-restaurant-id]').each(function(i, elem) {
      ids.push($(elem).data('restaurant-id'));
    });
    search._ids = ids;
    cb(null, ids);
  }));
};

Search.prototype.url = function() {
  var results =  ENDPOINT_URL.replace(/:where/, encodeURIComponent(this._where));
  if(this._onlyOpen) results += '?filters=openNow';
  return results;
};

Search.prototype.loadIds = function(ids, cb) {
  var url = ENDPOINT_URL.replace(/:where/, encodeURIComponent(this._where));
  url += '/more?where=' + encodeURIComponent(this._where);
  url += '&restaurantIds=' + ids.join(',');
  request.get(url).end(cb);
};

function checkLocationMatch(cb) {
  var search = this;
  return function(err, res) {
    if(err) return cb(err);

    if(/We found more than one match for/.test(res.text)) {
      if(!search._autolocation) { return cb(new Error('Could not determine location')); }
      var $ = cheerio.load(res.text);
      search._where = $('.addressList ul li a').first().attr('href').match(/\/search\/(.*)\//)[1];
      request.get(search.url()).end(cb);
    }
  };
}
