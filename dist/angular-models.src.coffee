angular.module 'angular-models', []

angular.module('angular-models').service 'AttributesMixin',  ->

  # TODO: rename _dependencies
  dependencies: ->
    @attributes = {}

  hasAttributes: ->
    @attributes?

  set: (key, val) ->
    if @_isMultilevelString key
      keys = key.split /\./
      obj = @_crawlObjects @attributes, keys
      if obj.hasAttributes?()
        obj.set keys[keys.length - 1], val
      else
        obj[keys[keys.length - 1]] = val

    else
      if _.isObject(key)
        attrs = key
      else
        (attrs = {})[key] = val

      @attributes[attr] = val for attr, val of attrs

    @

  get: (key) ->
    if @_isMultilevelString key
      keys = key.split /\./
      obj = @_crawlObjects @attributes, keys
      if obj.hasAttributes?()
        obj.get keys[keys.length - 1]
      else
        obj[keys[keys.length - 1]]
    else
      @attributes[key]

  # TODO: rename getModels or something?
  getAll: (key) ->
    if @attributes[key]?.hasModels?()
      @attributes[key].models
    else
      @get key

  toJSON: ->
    json = {}
    for attr, val of @attributes
      if _.isArray val
        json[attr] = []
        for arrVal in val
          json[attr].push if arrVal.toJSON? then arrVal.toJSON() else arrVal
      else if val?.hasModels?()
        json[attr] = []
        json[attr].push(arrVal.toJSON?()) for arrVal in val.models
      else if val?.hasAttributes?()
        json[attr] = val.toJSON?()
      else
        json[attr] = val
    json

  # build obj in chain if doesn't exist
  _ensureObject: (obj, keys) ->
    if obj.hasAttributes?()
      attr = obj.get(keys[0])
      if not attr
        attr = obj.set keys[0], {}
    else
      attr = obj[keys[0]]
      if not attr
        attr = obj[keys[0]] = {}
    attr

  _crawlObjects: (obj, keys) ->
    if keys.length <= 1 # leave last key for val assignment
      return obj
    @_crawlObjects @_ensureObject(obj, keys), keys[1..]

  _isMultilevelString: (key) ->
    _.isString(key) and key.match /\./



angular.module('angular-models').factory 'Collection', ($rootScope, Module, Model) ->

  class Collection extends Module

    constructor: (jsonModels) ->
      @reset jsonModels

    model: Model

    add: (jsonOrModel) ->
      return if !jsonOrModel or @get(jsonOrModel)?

      if not jsonOrModel.hasAttributes?()
        jsonOrModel = new @model jsonOrModel

      @models.push jsonOrModel
      @length++
      jsonOrModel

    remove: (model) ->
      if model?
        foundIndx = @models.indexOf @get model

        if foundIndx >= 0
          @models.splice foundIndx, 1
          @length--

    push: @::add #alias

    hasModels: ->
      @models?

    # TODO: alias find()?
    # call with Model or json containing id
    get: (jsonOrModel) ->
      # TODO: consider caching model ids internally similar to Backbone.Collection._byId[]
      _(@models).find (m) ->
        isModel = m is jsonOrModel
        idMatches = jsonOrModel.id? and m.get('id')? and jsonOrModel.id is m.get('id')
        modelIdMatches = jsonOrModel.hasAttributes?() and jsonOrModel.get('id')? and m.get('id')? and jsonOrModel.get('id') is m.get('id')

        isModel or idMatches or modelIdMatches

    reset: (jsonModels) ->
      @models = []
      @length = 0 #convenience attribute

      if jsonModels?
        modelsToAdd = if _.isArray(jsonModels) then jsonModels else [ jsonModels ]
        @add(model) for model in modelsToAdd

    # TODO: test
    eq: (indx) ->
      @models[indx]

    at: @::eq # alias

    first: ->
      @models[0]

    last: ->
      @models[@models.length - 1]

  Collection
# follows http://emberjs.com/guides/models/model-lifecycle/
# Note: Do not bind to this with =>, because will be mixing in to a new object
angular.module('angular-models').service 'LifecycleMixin',  ->

  # TODO: rename to @_state
  dependencies: ->
    @state = null

  setLifecycle: (state, model = @) ->
    model.state = state

  getLifecycle: (model = @) ->
    model.state

  isLifecycle: (state, model = @)->
    model.state is state

  # TODO: refactor this out or give a specialized name
  isEmpty: (model = @) ->
    not model.state?

  isLoaded: (model = @) ->
    model.state is 'loaded'

  isDirty: (model = @) ->
    model.state is 'dirty'

  isSaving: (model = @) ->
    model.state is 'saving'

  isFetching: (model = @) ->
    model.state is 'fetching'

  isDeleted: (model = @) ->
    model.state is 'deleted'

  isError: (model = @) ->
    model.state is 'error'

  isNew: (model = @) ->
    model.state is 'new'

  isValid: (model = @) ->
    model.state is 'valid'

angular.module('angular-models').factory 'Model', ($rootScope, $http, $filter, Module, NameMixin, LifecycleMixin, AttributesMixin) ->

  class Model extends Module
    @include NameMixin
    @include LifecycleMixin
    @include AttributesMixin

    constructor: (data) ->
      super data
      @errors = {}
      @urlRoot ?= "" # temp fix for follow while the api doesn't include proxy prefixes (eg, /api/v2)

      if data?
        if _.isString data
          @url = data
        else
          @deserialize data

    fetch: =>
      success = (data) =>
        @deserialize data
        @setLifecycle 'loaded'
        $rootScope.$broadcast "#{_.result @, 'name'}:fetched", @
        $rootScope.$broadcast "#{_.result @, 'name'}:fetched:success", @

      error = (data) =>
        _.extend @errors, data
        @setLifecycle 'error'
        $rootScope.$broadcast "#{_.result @, 'name'}:fetched", @
        $rootScope.$broadcast "#{_.result @, 'name'}:fetched:error", @

      @setLifecycle 'fetching'
      $http.get(@_getUrl()).success(success).error(error)

    save: =>
      success = (data) =>
        @deserialize data
        @setLifecycle 'loaded'
        $rootScope.$broadcast "#{_.result @, 'name'}:saved", @
        $rootScope.$broadcast "#{_.result @, 'name'}:saved:success"

      error = (data) =>
        _.extend @errors, data
        @setLifecycle 'error'
        $rootScope.$broadcast "#{_.result @, 'name'}:saved", @
        $rootScope.$broadcast "#{_.result @, 'name'}:saved:error"

      method = if @hasId() then 'put' else 'post'
      @setLifecycle 'saving'
      $http[method](@_getUrl(), @serialize()).success(success).error(error)

    destroy: =>
      success = (data) =>
        @deserialize data
        @setLifecycle 'deleted'
        $rootScope.$broadcast "#{_.result @, 'name'}:destroyed", @
        $rootScope.$broadcast "#{_.result @, 'name'}:destroyed:success"

      error = (data) =>
        _.extend @errors, data
        @setLifecycle 'error'
        $rootScope.$broadcast "#{_.result @, 'name'}:destroyed", @
        $rootScope.$broadcast "#{_.result @, 'name'}:destroyed:error"

      @setLifecycle 'saving'
      $http.delete(@_getUrl()).success(success).error(error)

    toJson: @::toJSON #alias

    deserialize: (data) ->
      @set data

    serialize: ->
      @toJSON()

    hasId: ->
      @get('id')?

    _getUrl: ->
      url = _.result @, 'url'
      urlWithRoot = if url?.indexOf(@urlRoot) > -1
        url
      else
        "#{@urlRoot}#{url}"
      $filter('linkTo')(urlWithRoot, @)

  Model
# based on http:#arcturo.github.io/library/coffeescript/03_classes.html
angular.module('angular-models').factory 'Module', ->

  moduleKeywords = ['included', 'dependencies']

  class Module

    _dependencyFns: []

    constructor: (data) ->
      fn.apply @ for fn in @_dependencyFns if @_dependencyFns?

    @include: (obj) ->
      for key, value of obj when key not in moduleKeywords
        @::[key] = value

      @::_dependencyFns.push(obj.dependencies) if obj.dependencies?

      obj.included?.apply(@)
      @

  Module
# consider: http://stackoverflow.com/questions/332422/how-do-i-get-the-name-of-an-objects-type-in-javascript
angular.module('angular-models').service 'NameMixin', ->

  name: ->
    @constructor?.name?.toLowerCase() || 'model'
