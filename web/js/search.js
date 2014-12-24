var $ = require('jquery')
  , EJS = require('ejs')
  , search = require('./searchInterface')
  , hashParams = require('./hashParams');

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
  if(!$(this).hasClass('active')) {
    hashParams.retain(['q', 'taxon_id']);
  }
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

$('body').on('change', 'input[type=radio]', function() {
  var selectedFilter = $(this).data();
  if(selectedFilter.facetId === 'ALL') {
    hashParams.delete(selectedFilter.facet);
  } else {
    hashParams.set(selectedFilter.facet, [selectedFilter.facetId]);
  }
  console.log(selectedFilter);
});

function updateStateFromHash() {
  var hash = hashParams.asObject()
    , q = hash.q;

  delete hash.q;

  $('#search').val(q);
  search.geneSearch(q, hash, populateResults);
};

function populateResults(data) {
  var resultCount = data.response.numFound
    , template = $('#itemsT').html();

  $('#items').html(EJS.render(template, data.response));
  updateFilters(data);
}

function updateFilters(data) {
  data.getFilters(function (filters) {
    updateSpeciesFilter(filters.taxon_id);
    updateLeftFilters(filters);
    updateFilterState(data);
  });
}

function updateSpeciesFilter(facet) {
  var template = $('script#speciesDropdownT').html();
  var html = EJS.render(template, facet);
  $('#speciesDropdown').html(html);
}

function updateLeftFilters(filters) {
  var template = $('#facets-topT').html()
    , templateLeft = $('#facets-leftT').html();
  $('#facets-top').html(EJS.render(template, {filters:filters}));
  $('#facets-left').html(EJS.render(templateLeft, {filters:filters}));
}

function updateFilterState(data) {
  $('#filterForm > div').hide();
  $('#filterForm').hide();
  $('#facets-top ol').hide();
  $('#toggleFilters').removeClass('active');
  $('#facets-top a.toggle').removeClass('active');

  for(var facet in data.facets) {
    var selected = hashParams.get(facet);
    if(!selected) continue;
    if(facet !== 'taxon_id') {
      $('#filterForm > div[data-filter="' + facet + '"]').show();
      $('#filterForm').show();
      $('#facets-top ol').show();
      $('#toggleFilters').addClass('active');
      $('#facets-top a.toggle[data-filter="'+facet+'"]').addClass('active');
    }
    for(var i = 0; i < selected.length; i++) {
      var id = selected[i]
        , selector = 'input[data-facet="' + facet + '"][data-facet-id="' + id + '"]'
        , jqel = $(selector);

      jqel.prop('checked', true);


    }
    console.log(facet + ' ' + hashParams.get(facet));
  }
}

window.onhashchange = updateStateFromHash;

// get state from hash when page loads
updateStateFromHash();