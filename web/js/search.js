var $ = require('jquery')
  , EJS = require('ejs')
  , search = require('./searchInterface');

function populateResults(data) {
  $('#items').text(data.response.numFound);
}

// copy any query into the search box
var qterm = window.location.hash.split('q=')[1];
if (qterm) {
  document.getElementById('search').value = qterm;
  search.geneSearch(qterm, populateResults);
}

// update search when search text changes
$('#search').on('keyup', function () {
  window.location.hash = this.value ? 'q=' + this.value : '';
  search.geneSearch(this.value, populateResults);
});

$('#toggleFilters').on('click', function () {
  $('#facets-top').toggle();
  $('#facets-left ol').toggle();
  $(this).toggleClass('active');
});

$('#facets-top a').on('click', function () {
  var filter = $(this).attr('data-filter')
    , containerEl = $('#facets-left div[data-filter="' + filter + '"]')
    , template = containerEl.find('script[type="text/template"]').html();
  $(this).toggleClass('active');
  containerEl.toggle();

  var html = EJS.render(template, {things: {foo: 'bar'}});
  containerEl.html(html);
});