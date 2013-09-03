(function(){var a={}.hasOwnProperty,b=function(b,c){function d(){this.constructor=b}for(var e in c)a.call(c,e)&&(b[e]=c[e]);return d.prototype=c.prototype,b.prototype=new d,b.__super__=c.prototype,b},c=function(a,b){return function(){return a.apply(b,arguments)}},d=[].indexOf||function(a){for(var b=0,c=this.length;c>b;b++)if(b in this&&this[b]===a)return b;return-1};angular.module("angular-models",[]),angular.module("angular-models").service("AttributesMixin",function(){return{dependencies:function(){return this.attributes={}},hasAttributes:function(){return null!=this.attributes},set:function(a,b){var c,d,e,f;if(this._isMultilevelString(a))e=a.split(/\./),f=this._crawlObjects(this.attributes,e),("function"==typeof f.hasAttributes?f.hasAttributes():void 0)?f.set(e[e.length-1],b):f[e[e.length-1]]=b;else{_.isObject(a)?d=a:(d={})[a]=b;for(c in d)b=d[c],this.attributes[c]=b}return this},get:function(a){var b,c;return this._isMultilevelString(a)?(b=a.split(/\./),c=this._crawlObjects(this.attributes,b),("function"==typeof c.hasAttributes?c.hasAttributes():void 0)?c.get(b[b.length-1]):c[b[b.length-1]]):this.attributes[a]},getAll:function(a){var b;return(null!=(b=this.attributes[a])?"function"==typeof b.hasModels?b.hasModels():void 0:void 0)?this.attributes[a].models:this.get(a)},toJSON:function(){var a,b,c,d,e,f,g,h,i,j;c={},i=this.attributes;for(b in i)if(d=i[b],_.isArray(d))for(c[b]=[],e=0,g=d.length;g>e;e++)a=d[e],c[b].push(null!=a.toJSON?a.toJSON():a);else if(null!=d?"function"==typeof d.hasModels?d.hasModels():void 0:void 0)for(c[b]=[],j=d.models,f=0,h=j.length;h>f;f++)a=j[f],c[b].push("function"==typeof a.toJSON?a.toJSON():void 0);else c[b]=(null!=d?"function"==typeof d.hasAttributes?d.hasAttributes():void 0:void 0)?"function"==typeof d.toJSON?d.toJSON():void 0:d;return c},_ensureObject:function(a,b){var c;return("function"==typeof a.hasAttributes?a.hasAttributes():void 0)?(c=a.get(b[0]),c||(c=a.set(b[0],{}))):(c=a[b[0]],c||(c=a[b[0]]={})),c},_crawlObjects:function(a,b){return b.length<=1?a:this._crawlObjects(this._ensureObject(a,b),b.slice(1))},_isMultilevelString:function(a){return _.isString(a)&&a.match(/\./)}}}),angular.module("angular-models").factory("Collection",["$rootScope","Module","Model",function(a,c,d){var e;return e=function(a){function c(a){this.reset(a)}return b(c,a),c.prototype.model=d,c.prototype.add=function(a){return a&&null==this.get(a)?(("function"==typeof a.hasAttributes?a.hasAttributes():void 0)||(a=new this.model(a)),this.models.push(a),this.length++,a):void 0},c.prototype.remove=function(a){var b;return null!=a&&(b=this.models.indexOf(this.get(a)),b>=0)?(this.models.splice(b,1),this.length--):void 0},c.prototype.push=c.prototype.add,c.prototype.hasModels=function(){return null!=this.models},c.prototype.get=function(a){return _(this.models).find(function(b){var c,d,e;return d=b===a,c=null!=a.id&&null!=b.get("id")&&a.id===b.get("id"),e=("function"==typeof a.hasAttributes?a.hasAttributes():void 0)&&null!=a.get("id")&&null!=b.get("id")&&a.get("id")===b.get("id"),d||c||e})},c.prototype.reset=function(a){var b,c,d,e,f;if(this.models=[],this.length=0,null!=a){for(c=_.isArray(a)?a:[a],f=[],d=0,e=c.length;e>d;d++)b=c[d],f.push(this.add(b));return f}},c.prototype.eq=function(a){return this.models[a]},c.prototype.at=c.prototype.eq,c.prototype.first=function(){return this.models[0]},c.prototype.last=function(){return this.models[this.models.length-1]},c}(c)}]),angular.module("angular-models").service("LifecycleMixin",function(){return{dependencies:function(){return this.state=null},setLifecycle:function(a,b){return null==b&&(b=this),b.state=a},getLifecycle:function(a){return null==a&&(a=this),a.state},isLifecycle:function(a,b){return null==b&&(b=this),b.state===a},isEmpty:function(a){return null==a&&(a=this),null==a.state},isLoaded:function(a){return null==a&&(a=this),"loaded"===a.state},isDirty:function(a){return null==a&&(a=this),"dirty"===a.state},isSaving:function(a){return null==a&&(a=this),"saving"===a.state},isFetching:function(a){return null==a&&(a=this),"fetching"===a.state},isDeleted:function(a){return null==a&&(a=this),"deleted"===a.state},isError:function(a){return null==a&&(a=this),"error"===a.state},isNew:function(a){return null==a&&(a=this),"new"===a.state},isValid:function(a){return null==a&&(a=this),"valid"===a.state}}}),angular.module("angular-models").factory("Model",["$rootScope","$http","$filter","Module","NameMixin","LifecycleMixin","AttributesMixin",function(a,d,e,f,g,h,i){var j;return j=function(f){function j(a){this.destroy=c(this.destroy,this),this.save=c(this.save,this),this.fetch=c(this.fetch,this),j.__super__.constructor.call(this,a),this.errors={},null==this.urlRoot&&(this.urlRoot=""),null!=a&&(_.isString(a)?this.url=a:this.deserialize(a))}return b(j,f),j.include(g),j.include(h),j.include(i),j.prototype.fetch=function(){var b,c,e=this;return c=function(b){return e.deserialize(b),e.setLifecycle("loaded"),a.$broadcast(""+_.result(e,"name")+":fetched",e),a.$broadcast(""+_.result(e,"name")+":fetched:success",e)},b=function(b){return _.extend(e.errors,b),e.setLifecycle("error"),a.$broadcast(""+_.result(e,"name")+":fetched",e),a.$broadcast(""+_.result(e,"name")+":fetched:error",e)},this.setLifecycle("fetching"),d.get(this._getUrl()).success(c).error(b)},j.prototype.save=function(){var b,c,e,f=this;return e=function(b){return f.deserialize(b),f.setLifecycle("loaded"),a.$broadcast(""+_.result(f,"name")+":saved",f),a.$broadcast(""+_.result(f,"name")+":saved:success")},b=function(b){return _.extend(f.errors,b),f.setLifecycle("error"),a.$broadcast(""+_.result(f,"name")+":saved",f),a.$broadcast(""+_.result(f,"name")+":saved:error")},c=this.hasId()?"put":"post",this.setLifecycle("saving"),d[c](this._getUrl(),this.serialize()).success(e).error(b)},j.prototype.destroy=function(){var b,c,e=this;return c=function(b){return e.deserialize(b),e.setLifecycle("deleted"),a.$broadcast(""+_.result(e,"name")+":destroyed",e),a.$broadcast(""+_.result(e,"name")+":destroyed:success")},b=function(b){return _.extend(e.errors,b),e.setLifecycle("error"),a.$broadcast(""+_.result(e,"name")+":destroyed",e),a.$broadcast(""+_.result(e,"name")+":destroyed:error")},this.setLifecycle("saving"),d["delete"](this._getUrl()).success(c).error(b)},j.prototype.toJson=j.prototype.toJSON,j.prototype.deserialize=function(a){return this.set(a)},j.prototype.serialize=function(){return this.toJSON()},j.prototype.hasId=function(){return null!=this.get("id")},j.prototype._getUrl=function(){var a,b;return a=_.result(this,"url"),b=(null!=a?a.indexOf(this.urlRoot):void 0)>-1?a:""+this.urlRoot+a,e("linkTo")(b,this)},j}(f)}]),angular.module("angular-models").factory("Module",function(){var a,b;return b=["included","dependencies"],a=function(){function a(){var a,b,c,d;if(null!=this._dependencyFns)for(d=this._dependencyFns,b=0,c=d.length;c>b;b++)a=d[b],a.apply(this)}return a.prototype._dependencyFns=[],a.include=function(a){var c,e,f;for(c in a)e=a[c],d.call(b,c)<0&&(this.prototype[c]=e);return null!=a.dependencies&&this.prototype._dependencyFns.push(a.dependencies),null!=(f=a.included)&&f.apply(this),this},a}()}),angular.module("angular-models").service("NameMixin",function(){return{name:function(){var a,b;return(null!=(a=this.constructor)?null!=(b=a.name)?b.toLowerCase():void 0:void 0)||"model"}}})}).call(this);