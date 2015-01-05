var $ = require('jquery');
$.deparam = require('jquery-deparam');

function getHashParams() {
  var hash = window.location.hash;
  if (hash.length < 3) {
    return {};
  }
  if (hash.indexOf('#') == 0) {
    hash = hash.substr(1);
  }
  return $.deparam(hash);
}

function setHashParams(params) {
  if (Object.keys(params).length) {
    var newHash = '#' + $.param(params);
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
  return params;
}

exports.asObject = function () {
  return getHashParams();
};

exports.get = function (key, defaultValue) {
  var params = getHashParams()
    , value = params[key];

  if(!value) value = params[key] = defaultValue;

  return value;
}

exports.push = function (key, value) {
  modifyHashParams(function (params) {
    if (value) {
      var current = params[key];
      if (!current) {
        params[key] = [value];
      }
      else if (!(current instanceof Array)) {
        params[key] = [current, value]
      }
      else {
        current.push(value);
      }
    }
  });
}

exports.set = function (key, value) {
  modifyHashParams(function (params) {
    if (value) {
      params[key] = value;
    }
    else {
      console.trace('deleting ' + key);
      delete params[key];
    }
  });
}

exports.retain = function (keys) {
  modifyHashParams(function (params) {
    for (var key in params) {
      var willDeleteThisKey = ($.inArray(key, keys)) === -1;
      if (willDeleteThisKey) {
        delete params[key];
      }
    }
  });
}

exports.delete = function (key) {
  modifyHashParams(function (params) {
    delete params[key];
  })
}