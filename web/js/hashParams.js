var $ = require('jquery');
$.deparam = require('jquery-deparam');

function getHashParams() {
  var hash = window.location.hash;
  if(hash.length < 3) {
    return {};
  }
  if(hash.indexOf('#') == 0) {
    hash = hash.substr(1);
  }
  return $.deparam(hash);
}

function setHashParams(params) {
  if(Object.keys(params).length) {
    var newHash = '#' + $.param(params);
    console.debug('New URL hash is ' + newHash);
    window.location.hash = newHash;
  }
  else {
    window.location.hash = '';
  }
}

function modifyHashParams(modifier) {
  var params = getHashParams();
  modifier(params);
  setHashParams(params);
}

exports.get = function(key) {
  var params = getHashParams();
  return params[key];
}

exports.set = function(key, value) {
  modifyHashParams(function(params) {
    if(value) {
      params[key] = value;
    }
    else {
      console.trace('deleting ' + key);
      delete params[key];
    }
  });
}

exports.delete = function(key) {
  modifyHashParams(function(params) {
    delete params[key];
  })
}