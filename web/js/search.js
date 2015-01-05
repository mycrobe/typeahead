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
    , containerEl = $('#facets-left div[data-filter="' + filterName + '"]')
    , isNowActive = $(this).toggleClass('active').hasClass('active')
    , filterState = hashParams.get('filters', {});

  if(isNowActive) {
    filterState[filterName] = 1;
  }
  else {
    delete filterState[filterName];
  }

  hashParams.set('filters', filterState);

  containerEl.toggle();
});

$('#speciesFilter').on('click', function () {
  $('#speciesDropdown').toggle();
});

$('#resultsStats').on('click', '#genomeCountLink', function() {
  $('#speciesDropdown').show();
});

$('#items').on('click', '.expandInlineLinks', function() {
  var docId = $(this).data().docId;
  $('.inlineLinks[data-doc-id="' + docId + '"').toggle();
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

$('#speciesDropdown').on('change', 'input[type=radio]', function() {
  updateSpeciesDisplayName();
  $('#speciesDropdown').hide();
});

function updateSpeciesDisplayName() {
  $('#speciesFilter').val($('#speciesDropdown input:checked').next().text());
}

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
  updateStatus(data);
  updateFilters(data);
}

function updateStatus(data) {
  var template = $('#resultsStatsT').html()
    , context = {counts: {results: data.response.numFound, species: data.facets.taxon_id.count}}
    , content = EJS.render(template, context)
    , element = $('#resultsStats')


  element.html(content);

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

function hideAllFilters() {
  $('#filterForm > div').hide();
  $('#filterForm').hide();
  $('#facets-top ol').hide();
  $('#toggleFilters').removeClass('active');
  $('#facets-top a.toggle').removeClass('active');
}

function showFilter(facet) {
  $('#filterForm > div[data-filter="' + facet + '"]').show();
  $('#filterForm').show();
  $('#facets-top ol').show();
  $('#toggleFilters').addClass('active');
  $('#facets-top a.toggle[data-filter="'+facet+'"]').addClass('active');
}

function resetFilterVisibility() {
  var visibleFilters = hashParams.get('filters');

  hideAllFilters();
  for(visible in visibleFilters) {
    showFilter(visible);
  }
}

function updateFilterState(data) {
  resetFilterVisibility();

  for(var facet in data.facets) {
    var selected = hashParams.get(facet);
    if(!selected) continue;
    //if(facet !== 'taxon_id') {
    //  showFilter(facet);
    //}
    checkFilters(facet, selected);
    console.log(facet + ' ' + hashParams.get(facet));
  }

  updateSpeciesDisplayName();
}

function checkFilters(facet, selected) {
  for(var i = 0; i < selected.length; i++) {
    var id = selected[i]
      , selector = 'input[data-facet="' + facet + '"][data-facet-id="' + id + '"]'
      , jqel = $(selector);

    jqel.prop('checked', true);
  }
}

window.onhashchange = updateStateFromHash;

// get state from hash when page loads
updateStateFromHash();