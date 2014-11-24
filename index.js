/**
 * Created by mulvaney on 10/2/14.
 */
var express = require('express');
var timer = require('response-time'); // adds X-Response-Time header
var logger = require('express-logger');
var Q = require('q');
var http = require('q-io/http');
var app = express();

var host = 'http://data.gramene.org/43/search/';
host = 'http://localhost:8983/solr/';
var searchEndpoints = [
  {
    name: 'genes',
    url: host + 'genes/select?wt=json&q=',
    displayProps:['name','database','system_name','gene_id'],
    resultPath:['response', 'docs'],
    timePath:['responseHeader', 'QTime'],
    countPath:['response', 'numFound']
  },
  {
    name: 'GO',
    url: host + 'GO/select?wt=json&q=',
    displayProps:['name_s','id'],
    resultPath:['response', 'docs'],
    timePath:['responseHeader', 'QTime'],
    countPath:['response', 'numFound']
  },
  {
    name: 'PO',
    url: host + 'PO/select?wt=json&q=',
    displayProps:['name_s','id'],
    resultPath:['response', 'docs'],
    timePath:['responseHeader', 'QTime'],
    countPath:['response', 'numFound']
  },
  {
    name: 'taxonomy',
    url: host + 'taxonomy/select?wt=json&q=',
    displayProps:['name_s','id'],
    resultPath:['response', 'docs'],
    timePath:['responseHeader', 'QTime'],
    countPath:['response', 'numFound']
  },
  {
    name: 'interpro',
    url: host + 'interpro/select?wt=json&q=',
    displayProps:['name_s','id'],
    resultPath:['response', 'docs'],
    timePath:['responseHeader', 'QTime'],
    countPath:['response', 'numFound']
  }
];

app.use(express.static(__dirname + '/web'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use(logger({path: 'logs/server.log'}));
app.use(timer());

app.get('/search', function (rq, rs) {
  var promisedSearchResponseBodies = searchEndpoints.map(function(searchEndpoint) {
    // append the query parameter to the end of the url, then ask for response bodies, please. We are returning a
    // promise because http is from q-io
    return http.read(searchEndpoint.url + rq.query.q + '*');
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

app.listen('3210');
