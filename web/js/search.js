var $ = require('jquery')
  , EJS = require('ejs')
  , search = require('./searchInterface')
  , hashParams = require('./hashParams');

function populateResults(data) {
  var resultCount = data.response.numFound
    , template = $('#itemsT').html();
  //$('#items').text(resultCount);

  $('#items').html(EJS.render(template, data.response));

  updateSpeciesFilter();
  updateFilters();
}

function updateSpeciesFilter() {
  search.getSpecies(function(facet) {
    var template = $('script#speciesDropdownT').html();
    var html = EJS.render(template, facet);
    $('#speciesDropdown').html(html);
  });
}

function updateFilters() {
  search.getFilters(function (filters) {
    var template = $('#facets-topT').html()
      , templateLeft = $('#facets-leftT').html();
    $('#facets-top').html(EJS.render(template, {filters:filters}));
    $('#facets-left').html(EJS.render(templateLeft, {filters:filters}));
  });
}

// copy any query into the search box
var qterm = hashParams.get('q');
//var qterm = window.location.hash.split('q=')[1];
if (qterm) {
  document.getElementById('search').value = qterm;
  //search.geneSearch(qterm, populateResults);
}

// update search when search text changes
$('#search').on('keyup', function () {
  hashParams.set('q', this.value);
});

$('#toggleFilters').on('click', function () {
  $(this).toggleClass('active');
  $('#facets-top ol').toggle();
  $('#facets-left form').toggle();
});

$('#facets-top').on('click', 'a', function () {
  var filterName = $(this).attr('data-filter')
    , containerEl = $('#facets-left div[data-filter="' + filterName + '"]');
  $(this).toggleClass('active');
  containerEl.toggle();
});

$('#speciesFilter').on('click', function () {
  $('#speciesDropdown').toggle();
});

$('form').on('change', 'input[type=radio]', function() {
  var selectedFilter = $(this).data();
  //search.addFilter(selectedFilter.facet, selectedFilter.facetId, populateResults);
  hashParams.set(selectedFilter.facet, selectedFilter.facetId);
});

window.onhashchange = function() {
  search.geneSearch(hashParams.get('q'), populateResults);
};