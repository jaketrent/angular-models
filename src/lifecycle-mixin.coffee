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
