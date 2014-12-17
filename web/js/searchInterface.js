var cores = require('./solrCores')
  , $ = require('jquery')
  , query, results, facets;

function geneSearch(queryString, callback) {
  var coreName = 'genes'
    , url = cores.getUrlForCore(coreName)
    , params = cores.getSearchParams(coreName);

  query = queryString; // stateful!
  results = {};
  facets = {};

  params.q = queryString + '*';

  if (cores.hasXrefs(coreName)) {
    if (hasFilters()) {
      for (var c in getFilters()) {
        var ids = getFilter(c);
        if (ids.length > 0) {
          if (c === 'taxonomy') {
            params.fq.push('NCBITaxon_ancestors:('+ids.join(' ')+')');
          }
          else {
            fq.push(c+'_ancestors:('+ids.join(' AND ')+')');
          }
        }
      }
    }
  }

  $.getJSON(url, params, function(data) {
    // intercept the results and store it here before calling the callback. Stateful!
    results = data;
    callback(data);
  });
};


function getFacetDetails(callback) {

};

function addFilter(field, ids) {};
function hasFilters() { return false };
function getFilters() {};
function getFilter(field) {};
function clearFilters() {};



exports.geneSearch = geneSearch;
exports.addFilter = addFilter;
exports.getFilters = getFilters;
exports.clearFilters = clearFilters;
exports.getFacetDetails = getFacetDetails;
