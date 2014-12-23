var cores = require('./solrCores')
  , $ = require('jquery')
  , Q = require('q');

function geneSearch(queryString, callback) {
  var coreName = 'genes'
    , url = cores.getUrlForCore(coreName)
    , params = cores.getSearchParams(coreName);

  params.q = queryString + '*';

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

  $.getJSON(url, params, function(data) {
    // intercept the results and store it here before calling the callback. Stateful!
    results = data;
    reformatFacetData();
    callback(data);
  });
};

function reformatFacetData() {
  var originalFacets = results.facet_counts.facet_fields;
  if(originalFacets && !results.facets) {
    var fixed = results.facets = {};
    for(var f in originalFacets) {
      if(originalFacets[f].length > 1) {
        fixed[f] = reformatFacet(originalFacets[f], cores.getXrefDisplayName(f));
      }
    }
    delete results.facet_counts;
  }
}

function reformatFacet( facetData, displayName ) {
  // facet data is an array of alternating ids (string) and counts (int),
  // e.g. ["4565", 99155, "3847", 54159, "109376", 46500, ... ]

  // we will make an object that contains an ordered list of ids
  // and an associative array with id key and an object for count and other values
  // e.g. { ids  : [ "4565", "3847", "109376" ],
  //        data : { "4565" : { count : 99155 }, // order here not guaranteed :-(
  //                 "3847" : { count: 54159 },
  //                 "109376" : { count: 46500 }
  //               }
  //      }
  var result = {ids: [], data: {}, displayName: displayName};
  for (var i=0;i<facetData.length;i+=2) {
    result.ids.push(facetData[i]);
    result.data[facetData[i]] = { count: facetData[i+1] };
  }
  return result;
}

function getSpecies(callback) {
  if(results && results.facets && results.facets.taxon_id) {
    var promise = facetSearch('taxonomy', results.facets.taxon_id);
    promise.then(callback);
  }
}

function getFilters(callback) {
  if(results && results.facets) {
    var promises = Object.keys(results.facets).map(function(f) {
      var facet = results.facets[f]
        , core = cores.getXrefCore(f);
      return facetSearch(core, facet);
    });
    Q.all(promises).done(function() {
      callback(results.facets);
    })
  }
}

function facetSearch(core, facet) {
  var url = cores.getUrlForCore(core)
    , params = cores.getFacetDetailsParams(core);

  if(facet.ids.length == 0) {
    return Q(facet);
  }

  params.q = 'id:('+facet.ids.join(' ')+')';
  params.rows = facet.ids.length;

  return Q($.getJSON(url, params)).then(function(data) {
    return mergeFacetData(facet, data)
  });
};

function mergeFacetData(facet, data) {
  var facetData = data.response.docs;
  for(var i = 0; i < facetData.length; i++) {
    var facetDatum = facetData[i]
      , toUpdate = facet.data['' + facetDatum.id];

    for(key in facetDatum) {
      toUpdate[key] = facetDatum[key];
    }
  }
  toUpdate.hasAdditionalData = true;
  return facet;
}

function addFilter(field, id, callback) {
  filtered[field] = id;
  geneSearch(query, callback); // query is stateful; module-scoped.
};
function hasFilters() {
  return Object.keys(filters).length;
};
function getFilter(field, callback) {
  return Object.keys(filters[field]);
  geneSearch(query, callback); // query is stateful; module-scoped.
};
function clearFilter(filter, callback) {
  delete filters[filter];
  geneSearch(query, callback); // query is stateful; module-scoped.
}
function clearFilters(callback) {
  filters = {};
  geneSearch(query, callback); // query is stateful; module-scoped.
};



exports.geneSearch = geneSearch;
exports.addFilter = addFilter;
exports.getFilters = getFilters;
exports.clearFilter = clearFilter;
exports.clearFilters = clearFilters;
exports.getSpecies = getSpecies;
exports.getFilters = getFilters;
