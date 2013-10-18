angular.module('angular-models').factory 'Model', ($rootScope, $http, $filter, Module, NameMixin, Lifecycle, AttributesMixin) ->

  class Model extends Module
    @include NameMixin
    @include Lifecycle
    @include AttributesMixin

    constructor: (data) ->
      super data
      @errors = {}
      @urlRoot ?= "" # temp fix for follow while the api doesn't include proxy prefixes (eg, /api/v2)

      if data?
        if _.isString data
          @url = data
        else
          @set data

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
