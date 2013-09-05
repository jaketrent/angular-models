describe 'angular-models.Collection', ->
  collection = null
  Collection = null
  Model = null
  $rootScope = null

  modelsJson = [
    { id: 1, name: 'One' }
    { id: 2, name: 'Two' }
    { id: 3, name: 'Three' }
  ]

  beforeEach module 'angular-models'

  beforeEach inject (_Collection_, _$rootScope_, _Model_) ->
    Collection = _Collection_
    Model = _Model_
    $rootScope = _$rootScope_

  it 'is injectable', ->
    expect(Collection).to.not.be.undefined

  describe '#constructor', ->

    it 'takes data to initialize the collection with', ->
      collection = new Collection modelsJson
      collection.models.length.should.eql modelsJson.length

    it 'starts with length of 0', ->
      collection = new Collection
      collection.length.should.eql 0

  describe '#add', ->

    beforeEach ->
      collection = new Collection

    it 'handles a null', ->
      collection.add()
      collection.models.length.should.eql 0

    it 'creates a model with the given json', ->
      modelJson =
        name: 'Scottly'
      collection.add modelJson
      collection.models[0].name().should.eql 'model'

    it 'adds the model to the internal models array', ->
      collection.add {}
      _.isArray(collection.models).should.be.true
      collection.models.length.should.eql 1

    it 'has a push alias', ->
      collection.should.have.property 'push'

    it 'increases the length by one', ->
      collection.add { stuff: 'here' }
      collection.length.should.eql 1
      collection.add { something: 'else' }
      collection.length.should.eql 2

    it 'doesnt allow duplicate entry based on equality', ->
      collection.add modelsJson[0]
      collection.length.should.eql 1
      collection.add modelsJson[0]
      collection.length.should.eql 1

    it 'adds already-instantiated models straight to models array', ->
      model = new Model { id: 1 }
      collection.add model
      collection.models[0].toJSON().constructor.name.should.not.equal 'Model'
      collection.models[0].toJSON().constructor.name.should.equal 'Object'


  describe '#remove', ->

    Model = null

    beforeEach inject (_Model_) ->
      Model = _Model_
      collection = new Collection modelsJson

    it 'handles null', ->
      collection.remove()
      collection.models.length.should.eql 3

    it 'removes model based on equality', ->
      collection.remove collection.models[0]
      collection.models.length.should.eql 2
      for model, i in collection.models
        model.toJSON().should.eql modelsJson[i + 1]

    it 'removes model based on json id', ->
      collection.remove { id: modelsJson[0].id }
      collection.models.length.should.eql 2
      for model, i in collection.models
        model.toJSON().should.eql modelsJson[i + 1]

    it 'removes model based on model id', ->
      collection.remove new Model modelsJson[0]
      collection.models.length.should.eql 2
      for model, i in collection.models
        model.toJSON().should.eql modelsJson[i + 1]

    it 'decreases length by one', ->
      collection.length.should.eql modelsJson.length
      collection.remove modelsJson[0]
      collection.length.should.eql modelsJson.length - 1

  describe '#reset', ->

    it 'blanks out models if no data given', ->
      collection = new Collection modelsJson
      collection.models.length.should.eql modelsJson.length
      collection.reset()
      collection.models.length.should.eql 0

    it 'sets length to zero', ->
      collection = new Collection modelsJson
      collection.length.should.eql modelsJson.length
      collection.reset()
      collection.length.should.eql 0

    it 'sets data', ->
      collection = new Collection
      collection.length = 0
      collection.reset modelsJson
      collection.models.length.should.eql modelsJson.length
      for model, i in collection.models
        model.toJSON().should.eql modelsJson[i]

  describe '#hasModels', ->

    beforeEach ->
      collection = new Collection

    it 'has a method to test that it is a collection', ->
      collection.should.have.property 'hasModels'

  describe '#eq', ->

    it 'will return model at given index', ->
      collection = new Collection
      model1 = new Model
      model2 = new Model
      collection.add model1
      collection.add model2
      collection.eq(0).should.eql model1
      collection.eq(1).should.eql model2

  describe '#first', ->

    it 'will always return the first model', ->
      collection = new Collection
      model1 = new Model
      model2 = new Model
      collection.add model1
      collection.first().should.eql model1
      collection.add model2
      collection.first().should.eql model1

  describe '#last', ->

    it 'will always return the last model', ->
      collection = new Collection
      model1 = new Model
      model2 = new Model
      collection.add model1
      collection.last().should.eql model1
      collection.add model2
      collection.last().should.eql model2

