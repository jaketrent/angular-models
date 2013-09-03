# consider: http://stackoverflow.com/questions/332422/how-do-i-get-the-name-of-an-objects-type-in-javascript
angular.module('angular-models').service 'NameMixin', ->

  name: ->
    @constructor?.name?.toLowerCase() || 'model'
