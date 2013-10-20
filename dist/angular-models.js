(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  angular.module('angular-models', ['angular-linkto', 'angular-lifecycle']);

  angular.module('angular-models').service('AttributesMixin', function() {
    return {
      dependencies: function() {
        return this._attributes = {};
      },
      hasAttributes: function() {
        return this._attributes != null;
      },
      set: function(key, val) {
        var attr, attrs, keys, obj;
        if (this._isMultilevelString(key)) {
          keys = key.split(/\./);
          obj = this._crawlObjects(this._attributes, keys);
          if (typeof obj.hasAttributes === "function" ? obj.hasAttributes() : void 0) {
            obj.set(keys[keys.length - 1], val);
          } else {
            obj[keys[keys.length - 1]] = val;
          }
        } else {
          if (_.isObject(key)) {
            attrs = key;
          } else {
            (attrs = {})[key] = val;
          }
          for (attr in attrs) {
            val = attrs[attr];
            this._attributes[attr] = val;
          }
        }
        return this;
      },
      get: function(key) {
        var keys, obj;
        if (this._isMultilevelString(key)) {
          keys = key.split(/\./);
          obj = this._crawlObjects(this._attributes, keys);
          if (typeof obj.hasAttributes === "function" ? obj.hasAttributes() : void 0) {
            return obj.get(keys[keys.length - 1]);
          } else {
            return obj[keys[keys.length - 1]];
          }
        } else {
          return this._attributes[key];
        }
      },
      getModels: function(key) {
        var _ref;
        if ((_ref = this._attributes[key]) != null ? typeof _ref.hasModels === "function" ? _ref.hasModels() : void 0 : void 0) {
          return this._attributes[key].models;
        } else {
          return this.get(key);
        }
      },
      toJSON: function() {
        var arrVal, attr, json, val, _i, _j, _len, _len1, _ref, _ref1;
        json = {};
        _ref = this._attributes;
        for (attr in _ref) {
          val = _ref[attr];
          if (_.isArray(val)) {
            json[attr] = [];
            for (_i = 0, _len = val.length; _i < _len; _i++) {
              arrVal = val[_i];
              json[attr].push(arrVal.toJSON != null ? arrVal.toJSON() : arrVal);
            }
          } else if (val != null ? typeof val.hasModels === "function" ? val.hasModels() : void 0 : void 0) {
            json[attr] = [];
            _ref1 = val.models;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              arrVal = _ref1[_j];
              json[attr].push(typeof arrVal.toJSON === "function" ? arrVal.toJSON() : void 0);
            }
          } else if (val != null ? typeof val.hasAttributes === "function" ? val.hasAttributes() : void 0 : void 0) {
            json[attr] = typeof val.toJSON === "function" ? val.toJSON() : void 0;
          } else {
            json[attr] = val;
          }
        }
        return json;
      },
      _ensureObject: function(obj, keys) {
        var attr;
        if (typeof obj.hasAttributes === "function" ? obj.hasAttributes() : void 0) {
          attr = obj.get(keys[0]);
          if (!attr) {
            attr = obj.set(keys[0], {});
          }
        } else {
          attr = obj[keys[0]];
          if (!attr) {
            attr = obj[keys[0]] = {};
          }
        }
        return attr;
      },
      _crawlObjects: function(obj, keys) {
        if (keys.length <= 1) {
          return obj;
        }
        return this._crawlObjects(this._ensureObject(obj, keys), keys.slice(1));
      },
      _isMultilevelString: function(key) {
        return _.isString(key) && key.match(/\./);
      }
    };
  });

  angular.module('angular-models').factory('Collection', function($rootScope, Module, Model) {
    var Collection;
    Collection = (function(_super) {
      __extends(Collection, _super);

      function Collection(jsonModels) {
        this.reset(jsonModels);
      }

      Collection.prototype.model = Model;

      Collection.prototype.add = function(jsonOrModel) {
        if (!jsonOrModel || (this.get(jsonOrModel) != null)) {
          return;
        }
        if (!(typeof jsonOrModel.hasAttributes === "function" ? jsonOrModel.hasAttributes() : void 0)) {
          jsonOrModel = new this.model(jsonOrModel);
        }
        this.models.push(jsonOrModel);
        this.length++;
        return jsonOrModel;
      };

      Collection.prototype.remove = function(model) {
        var foundIndx;
        if (model != null) {
          foundIndx = this.models.indexOf(this.get(model));
          if (foundIndx >= 0) {
            this.models.splice(foundIndx, 1);
            return this.length--;
          }
        }
      };

      Collection.prototype.push = Collection.prototype.add;

      Collection.prototype.hasModels = function() {
        return this.models != null;
      };

      Collection.prototype.get = function(jsonOrModel) {
        return _(this.models).find(function(m) {
          var idMatches, isModel, modelIdMatches;
          isModel = m === jsonOrModel;
          idMatches = (jsonOrModel.id != null) && (m.get('id') != null) && jsonOrModel.id === m.get('id');
          modelIdMatches = (typeof jsonOrModel.hasAttributes === "function" ? jsonOrModel.hasAttributes() : void 0) && (jsonOrModel.get('id') != null) && (m.get('id') != null) && jsonOrModel.get('id') === m.get('id');
          return isModel || idMatches || modelIdMatches;
        });
      };

      Collection.prototype.find = Collection.prototype.get;

      Collection.prototype.reset = function(jsonModels) {
        var model, modelsToAdd, _i, _len, _results;
        this.models = [];
        this.length = 0;
        if (jsonModels != null) {
          modelsToAdd = _.isArray(jsonModels) ? jsonModels : [jsonModels];
          _results = [];
          for (_i = 0, _len = modelsToAdd.length; _i < _len; _i++) {
            model = modelsToAdd[_i];
            _results.push(this.add(model));
          }
          return _results;
        }
      };

      Collection.prototype.eq = function(indx) {
        return this.models[indx];
      };

      Collection.prototype.at = Collection.prototype.eq;

      Collection.prototype.first = function() {
        return this.models[0];
      };

      Collection.prototype.last = function() {
        return this.models[this.models.length - 1];
      };

      return Collection;

    })(Module);
    return Collection;
  });

  angular.module('angular-models').factory('Model', function($rootScope, $http, $filter, Module, NameMixin, Lifecycle, AttributesMixin) {
    var Model;
    Model = (function(_super) {
      __extends(Model, _super);

      Model.include(NameMixin);

      Model.include(Lifecycle);

      Model.include(AttributesMixin);

      function Model(data) {
        this.destroy = __bind(this.destroy, this);
        this.save = __bind(this.save, this);
        this.fetch = __bind(this.fetch, this);
        Model.__super__.constructor.call(this, data);
        this.errors = {};
        if (this.urlRoot == null) {
          this.urlRoot = "";
        }
        if (data != null) {
          if (_.isString(data)) {
            this.url = data;
          } else {
            this.set(data);
          }
        }
      }

      Model.prototype.fetch = function() {
        var error, method, success, _ref,
          _this = this;
        success = function(data) {
          _this.deserialize(data);
          _this.setLifecycle('loaded');
          $rootScope.$broadcast("" + (_.result(_this, 'name')) + ":fetched", _this);
          return $rootScope.$broadcast("" + (_.result(_this, 'name')) + ":fetched:success", _this);
        };
        error = function(data) {
          _.extend(_this.errors, data);
          _this.setLifecycle('error');
          $rootScope.$broadcast("" + (_.result(_this, 'name')) + ":fetched", _this);
          return $rootScope.$broadcast("" + (_.result(_this, 'name')) + ":fetched:error", _this);
        };
        method = ((_ref = this._getUrl()) != null ? _ref.indexOf('callback=JSON_CALLBACK') : void 0) > -1 ? 'jsonp' : 'get';
        this.setLifecycle('fetching');
        return $http[method](this._getUrl()).success(success).error(error);
      };

      Model.prototype.save = function() {
        var error, method, success,
          _this = this;
        success = function(data) {
          _this.deserialize(data);
          _this.setLifecycle('loaded');
          $rootScope.$broadcast("" + (_.result(_this, 'name')) + ":saved", _this);
          return $rootScope.$broadcast("" + (_.result(_this, 'name')) + ":saved:success");
        };
        error = function(data) {
          _.extend(_this.errors, data);
          _this.setLifecycle('error');
          $rootScope.$broadcast("" + (_.result(_this, 'name')) + ":saved", _this);
          return $rootScope.$broadcast("" + (_.result(_this, 'name')) + ":saved:error");
        };
        method = this.hasId() ? 'put' : 'post';
        this.setLifecycle('saving');
        return $http[method](this._getUrl(), this.serialize()).success(success).error(error);
      };

      Model.prototype.destroy = function() {
        var error, success,
          _this = this;
        success = function(data) {
          _this.deserialize(data);
          _this.setLifecycle('deleted');
          $rootScope.$broadcast("" + (_.result(_this, 'name')) + ":destroyed", _this);
          return $rootScope.$broadcast("" + (_.result(_this, 'name')) + ":destroyed:success");
        };
        error = function(data) {
          _.extend(_this.errors, data);
          _this.setLifecycle('error');
          $rootScope.$broadcast("" + (_.result(_this, 'name')) + ":destroyed", _this);
          return $rootScope.$broadcast("" + (_.result(_this, 'name')) + ":destroyed:error");
        };
        this.setLifecycle('saving');
        return $http["delete"](this._getUrl()).success(success).error(error);
      };

      Model.prototype.toJson = Model.prototype.toJSON;

      Model.prototype.deserialize = function(data) {
        return this.set(data);
      };

      Model.prototype.serialize = function() {
        return this.toJSON();
      };

      Model.prototype.hasId = function() {
        return this.get('id') != null;
      };

      Model.prototype._getUrl = function() {
        var url, urlWithRoot;
        url = _.result(this, 'url');
        urlWithRoot = (url != null ? url.indexOf(this.urlRoot) : void 0) > -1 ? url : "" + this.urlRoot + url;
        return $filter('linkTo')(urlWithRoot, this);
      };

      return Model;

    })(Module);
    return Model;
  });

  angular.module('angular-models').factory('Module', function() {
    var Module, moduleKeywords;
    moduleKeywords = ['included', 'dependencies'];
    Module = (function() {
      Module.prototype._dependencyFns = [];

      function Module(data) {
        var fn, _i, _len, _ref;
        if (this._dependencyFns != null) {
          _ref = this._dependencyFns;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            fn = _ref[_i];
            fn.apply(this);
          }
        }
      }

      Module.include = function(obj) {
        var key, value, _ref;
        for (key in obj) {
          value = obj[key];
          if (__indexOf.call(moduleKeywords, key) < 0) {
            this.prototype[key] = value;
          }
        }
        if (obj.dependencies != null) {
          this.prototype._dependencyFns.push(obj.dependencies);
        }
        if ((_ref = obj.included) != null) {
          _ref.apply(this);
        }
        return this;
      };

      return Module;

    })();
    return Module;
  });

  angular.module('angular-models').service('NameMixin', function() {
    return {
      name: function() {
        var _ref, _ref1;
        return ((_ref = this.constructor) != null ? (_ref1 = _ref.name) != null ? _ref1.toLowerCase() : void 0 : void 0) || 'model';
      }
    };
  });

}).call(this);

/*
//@ sourceMappingURL=angular-models.js.map
*/