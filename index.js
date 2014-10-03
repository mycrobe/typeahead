/**
 * Created by mulvaney on 10/2/14.
 */
var express = require('express');
var timer = require('response-time'); // adds X-Response-Time header
var logger = require('express-logger');
var Q = require('q');
var http = require('q-io/http');
var app = express();

var searchEndpoints = [
  {name: 'Solr', url: 'http://gorgonzola.cshl.edu:8983/solr/grm-search/select?wt=json&indent=true&q=', displayProps:['title'], resultPath:['response', 'docs'], timePath:['responseHeader', 'QTime']},
  {name: 'Mongo-Gene', url: 'http://data.gramene.org/search/genes/select?q=', displayProps:['name', 'gene_id', 'species'], resultPath:['response'], timePath:['time']},
  {name: 'Mongo-Reactome', url: 'http://data.gramene.org/search/reactome/select?q=', displayProps:['pathway', 'name', 'system_name'], resultPath:['response'], timePath:['time']},
  {name: 'Mongo-Cyc', url: 'http://data.gramene.org/search/cyc/select?q=', displayProps:['pathway_name', 'enzyme_name', 'gene_name', 'species'], resultPath:['response'], timePath:['time']}
];

app.use(express.static(__dirname + '/web'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use(logger({path: 'logs/server.log'}));
app.use(timer());

app.get('/search', function (rq, rs) {
  var promisedSearchResponseBodies = searchEndpoints.map(function(searchEndpoint) {
    // append the query parameter to the end of the url, then ask for response bodies, please. We are returning a
    // promise because http is from q-io
    return http.read(searchEndpoint.url + rq.query.q);
  });

  // wait until all queries succeed and then merge them into a JSON response document
  // and return to client
  Q.all(promisedSearchResponseBodies).then(function (responseBodies) {
    var result = {query: rq.query, searches:searchEndpoints, results:{}};
    for(var i = 0; i < responseBodies.length; i++) {
      var search = searchEndpoints[i],
          responseBody = '' + responseBodies[i]; // we wouldn't be wanting a byte array, now, would we?
      result.results[search.name] = JSON.parse(responseBody);
    }
    rs.send(result);
  });
});

app.listen('3000');