/*
type ahead function, given a query string q, and an optional set of parameters
fire off queries to multiple solr cores (default all, else limited by params)
solr cores are either main or secondary
secondary cores are used to refine a search on the main core(s)
all main cores include ancestor fields that are the hooks for filters from the secondary cores
there are also direct annotation fields that link the main cores to the secondary cores
these relationships need to be spelled out so the filters may be applied
and the associated info can be retrieved

here is an example query on the genes core for "pad*" which returns the necessary fields for constructing
a link to the ensembl gene page. It also sends highlighted fragments of the query string and returns facet counts
for taxon_id, biotype, and interpro_xrefi
 http://localhost:8983/solr/genes/select?rows=10&q=pad*&fl=id,database,system_name,gene_id&wt=json&indent=true&hl=true&hl.fl=*&facet=true&facet.field=taxon_id&facet.field=biotype&facet.mincount=1&facet.field=interpro_xrefi

N.B. that facet field results are string keys
to obtain a set of documents by ID query like this space sparated list of ids in parentheses
http://localhost:8983/solr/interpro/select?q=id:(1 13806 18056 21965)


list of main cores: genes, pathways, etc
list of secondary cores: taxonomy, interpro, GO, PO, etc

*/
var cores = {
  genes : {
    enabled : true,
    params : {
      rows : 10,
      wt : 'json',
      fl : 'id,database,system_name,gene_id',
      hl : 'true',
      'hl.fl' : '*',
      fq : [],
      facet : 'true',
      'facet.mincount' : 1,
      'facet.field' : ['taxon_id', 'interpro_xrefi', 'GO_xrefi', 'PO_xrefi']
    },
    xref : {
      taxon_id : 'taxonomy',
      interpro_xrefi : 'interpro',
      GO_xrefi : 'GO',
      PO_xrefi : 'PO'
    }
  },
  taxonomy : {
    enabled : true,
    params : {
      rows : 10,
      wt : 'json',
      fl : 'id,name_s,rank_s',
      hl : 'true',
      'hl.fl' : '*',
      fq : []
    },
    params2 : {
      wt : 'json',
      fl : 'id,name_s,rank_s',
      rows : 10
    }
  },
  interpro : {
    enabled : true,
    params : {
      rows : 10,
      wt : 'json',
      fl : 'id,name_s,type_s',
      hl : 'true',
      'hl.fl' : '*',
      fq : []
    },
    params2 : {
      wt : 'json',
      fl : 'id,name_s,type_s',
      rows : 10
    }
  },
  GO : {
    enabled : true,
    params : {
      rows : 10,
      wt : 'json',
      fl : 'id,name_s',
      hl : 'true',
      'hl.fl' : '*',
      fq : ['!is_obsolete_s:1']
    },
    params2 : {
      wt : 'json',
      fl : 'id,name_s',
      rows : 10
    }
  },
  PO : {
    enabled : true,
    params : {
      rows : 10,
      wt : 'json',
      fl : 'id,name_s',
      hl : 'true',
      'hl.fl' : '*',
      fq : ['!is_obsolete_s:1']
    },
    params2 : {
      wt : 'json',
      fl : 'id,name_s',
      rows : 10
    }
  }
};


function initialize(p) {
  cores.genes.enabled=true;
}
var searchURL = "http://data.gramene.org/43/search/";
function searchSecondary(secondaryCore,fc) {
  var ids = [];
  var counts = {};
  for (var i=0;i<fc.length;i+=2) {
    ids.push(fc[i]);
    counts[fc[i]] = fc[i+1];
  }
  cores[secondaryCore].params2.q = 'id:('+ids.join(' ')+')';
  cores[secondaryCore].params2.rows = ids.length;
  $.getJSON(searchURL + secondaryCore,cores[secondaryCore].params2, function (data, status, xhr) {
    var docs = data.response.docs;
    var label = [];
    for(var i=0;i<docs.length;i++) {
      var doc = docs[i];
      label[doc.id] = doc.name_s;
    }
    for (var i=0;i<ids.length;i++) {
      console.log(secondaryCore,label[ids[i]],counts[ids[i]]);
    }
  });
}

function searchCore(core,q) {
  var url = searchURL + core + '?';
  cores[core].params.q = q + '*';
  $.getJSON(url,cores[core].params, function(data, status, xhr) {
    var searchLi = $(document.createElement('li')).addClass('search').addClass('col-md-4'),
        searchOl = $(document.createElement('ol')).addClass('resultList');

    var count = data.response.numFound;
    var time = data.responseHeader.QTime;
    if (count) {
      $('#results').append(searchLi);
      searchLi.html('<h3>' + core + ' <small>found ' + count + ' in ' + time + 'ms</small></h3>');
      searchLi.append(searchOl);

      var docs = data.response.docs;
      for(var i=0;i<docs.length;i++) {
        var doc = docs[i];
        var highlights = data.highlighting[doc.id];
        var resultLi = $(document.createElement('li'));
        var longest='';
        for (var field in highlights) {
          if (highlights[field].length > longest.length) {
            longest = highlights[field];
          }
        }
        resultLi.append('<span><small>' + JSON.stringify(doc) + '</small>' + longest + '</span>');
        searchOl.append(resultLi);
      }
      // do something with the facets
      if (data.hasOwnProperty('facet_counts')) {
        for (var field in data.facet_counts.facet_fields) {
          var fc = data.facet_counts.facet_fields[field];
          if (fc.length > 2) {
            // create a query for the integer ids
            searchSecondary(cores[core].xref[field],fc);
          }
        }
      }
    }
  });
}
var on = false;
var prev_q='';
function tah_on() {
  on=true;
}
function tah_off() {
  on=false;
}
function tah_search(q) {
  if (!on) return;
  if (q === prev_q) return;
  prev_q = q;
  // implement a delay
  $('#results').empty();
  for (var core in cores) {
    if (cores[core].enabled) {
      searchCore(core,q);
    }
  }
}
