var lastQueryTime = new Date();

// given a data structure and a path --a list of hierarchical elements to traverse--
// return the part of the datastructure specified by the path.
function getNested(data, path) {
  var result = data;
  if(path) {
    path.forEach(function (p) {
      result = result[p];
      if (!result && result !== 0) throw new Error("Can't find item in data");
    });
  }
  return result;
}

function typeahead(q) {
  var queryTime = new Date();
  $.getJSON('search', {'q': q}, function (data, status, xhr) {
    var xhrRespTime = xhr.getResponseHeader('X-Response-Time');
    if(queryTime < lastQueryTime) {
      console.error('query for "' + q + '" was ignored because a later query arrived sooner. The slow one took ' + xhrRespTime + ' to be generated on the server');
      return;
    }
    else {
      lastQueryTime = queryTime;
    }

    $('#qTime').text(xhrRespTime || '0ms');
    $('#results').empty();
    data.searches.forEach(function (search) {
      var searchLi = $(document.createElement('li')).addClass('search').addClass('col-md-4'),
        searchOl = $(document.createElement('ol')).addClass('resultList'),
        searchResponse = data.results[search.name] || {},
        results = getNested(searchResponse, search.resultPath),
        time = getNested(searchResponse, search.timePath),
        count = getNested(searchResponse, search.countPath);

      $('#results').append(searchLi);

      searchLi.html('<h3>' + search.name + ' <small>found ' + count + ' in ' + time + 'ms</small></h3>');
      searchLi.append(searchOl);

      results.forEach(function (result) {
        var resultLi = $(document.createElement('li'));
        search.displayProps.forEach(function (displayProp) {
          if (result[displayProp]) resultLi.append(' <span class="' + displayProp + '">' + result[displayProp] + '</span>');
        });
        searchOl.append(resultLi);
      });
    });
  });
}