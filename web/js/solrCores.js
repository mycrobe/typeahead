var rootURL = "http://data.gramene.org/43/search/";
var cores = {
  genes : {
    enabled : true,
    labelField : 'gene_id',
    params : {
      rows : 10,
      wt : 'json',
      fl : 'id,database,system_name,gene_id,genetrees',
      hl : 'true',
      'hl.fl' : '*',
      fq : [],
      facet : 'true',
      'facet.mincount' : 2,
      'facet.field' : ['taxon_id', 'interpro_xrefi', 'GO_xrefi', 'PO_xrefi']
    },
    xref : {
      taxon_id : 'taxonomy',
      interpro_xrefi : 'interpro',
      GO_xrefi : 'GO',
      PO_xrefi : 'PO'
    },
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
    },
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

function copyObject(obj) {
  return JSON.parse(JSON.stringify(obj));
}

exports.getUrlForCore = function(core) {
  return rootURL + core + '?';
}

exports.getSearchParams = function(core) {
  var params = cores[core].params;
  return copyObject(params);
  };

exports.getFacetDetailsParams = function(core) {
  var params = cores[core].params2;
  return copyObject(params);
};

exports.hasXrefs = function(core) {
  return cores[core].hasOwnProperty('xref');
}
