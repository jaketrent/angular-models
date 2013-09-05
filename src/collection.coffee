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

    # call with Model or json containing id
    get: (jsonOrModel) ->
      # TODO: consider caching model ids internally similar to Backbone.Collection._byId[]
      _(@models).find (m) ->
        isModel = m is jsonOrModel
        idMatches = jsonOrModel.id? and m.get('id')? and jsonOrModel.id is m.get('id')
        modelIdMatches = jsonOrModel.hasAttributes?() and jsonOrModel.get('id')? and m.get('id')? and jsonOrModel.get('id') is m.get('id')

        isModel or idMatches or modelIdMatches

    find: @::get #alias

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