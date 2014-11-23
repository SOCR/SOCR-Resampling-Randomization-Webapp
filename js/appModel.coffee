###
appModel.js is the model object for the SOCR app.

@author selvam , ashwini
@constructor
@return {object}
SOCR - Statistical Online Computational Resource
###
socr.model = ->
  
  #::::::: PRIVATE PROPERTIES :::::::::::::::
  #Number of runs to be made when 'run' button is pressed 
  #keeps count of number of samples generated from start
  #Number of datapoints in a bootstrap sample or Sample Size
  #contains the number of datasets
  #
  # Why there are keys and values? Its because in some form of data input (like coin toss), the "key" contains the symbolic meaningful reference whereas the "value" contains the mathematical equivalent value.
  # 
  
  #::::::: PRIVATE METHODS :::::::::::::::
  ###
  @method : _getRandomInt()
  @desc   : returns a random number in the range [min,max]
  @param  : min , max
  @return : {number}
  ###
  _getRandomInt = (min, max) ->
    Math.floor(Math.random() * (max - min)) + min
  
  ###
  @method : _generateMean
  @param  : {number|string} sampleNumber - the random sample number for which the mean is to be calculated
  @param  : {number} groupNumber
  @desc   : the calculated mean value
  @return : {number}
  ###
  _generateMean = (sampleNumber, groupNumber) ->
    groupNumber = groupNumber or 0
    total = 0
    if sampleNumber is "dataset"
      _val = socr.dataStore.dataset[groupNumber].values.getData()
      i = 0

      while i < _val.length
        total += parseFloat(_val[i])
        i++
      total = total / _val.length
      if isNaN(total)
        false
      else
        total
    else
      total = _generateCount(sampleNumber, groupNumber)
      total / socr.dataStore.bootstrapGroup[sampleNumber].values.getData(groupNumber).length
  
  ###
  @method : _generateCount
  @param  : sampleNumber - the random sample number for which the count is to be calculated
  @param  : groupNumber
  @desc   : the calculated total count value for the sample
  @return : {number}
  ###
  _generateCount = (sampleNumber, groupNumber) ->
    x = socr.dataStore.bootstrapGroup[sampleNumber].values.getData(groupNumber)
    total = 0
    i = 0

    while i < x.length
      total += parseFloat(x[i])
      i++
    total
  
  ###
  @method : _generateStandardDev
  @param  : sampleNumber , groupNumber
  @desc   : the calculated mean standard deviation.
  @return : {number} standard deviation for the input sample and group numbers
  ###
  _generateStandardDev = (sampleNumber, groupNumber) ->
    
    #formula used here is SD= ( E(x^2) - (E(x))^2 ) ^ 1/2
    _mean = _generateMean(sampleNumber, groupNumber) #E(x)
    _squaredSum = null #stores E(x^2)
    _sample = socr.dataStore.bootstrapGroup[sampleNumber].values.getData(groupNumber)
    i = 0

    while i < _sample.length
      _squaredSum += _sample[i] * _sample[i]
      i++
    _squaredSum = _squaredSum / _sample.length
    
    #console.log("_squaredSum"+_squaredSum+"--- _mean:"+_mean);
    _SD = Math.sqrt(_squaredSum - (_mean) * (_mean))
    _SD
  
  ###
  @method  : _generateF
  @desc   : Generates the F value using the one way ANOVA method
  @param  :sampleNumber
  @return :{object}
  ###
  _generateF = (sampleNumber) ->
    if sampleNumber is `undefined`
      null
    else
      _ymean = []
      _total = 0
      _N = 0
      _sst = 0
      _ssw = 0
      _ssb = 0
      _data = []
      if sampleNumber is "dataset"
        
        #Get the complete dataset from the dataStore.
        i = 0

        while i < _K
          _data[i] = socr.dataStore.dataset[i].values.getData()
          i++
      else
        
        #Get the random sample with index @sampleNumber from each group. 
        _data = socr.dataStore.bootstrapGroup[sampleNumber].values.getData()
      i = 0
      while i < _K
        _ymean[i] = $.mean(_data[i])
        _N += _data[i].length #calculate N = total number of observations
        _total += _ymean[i]
        i++
      _y = _total / _K # grand mean
      
      #Degree of freedom between = _dofe = K - 1
      _dofe = _K - 1
      
      #Degree of freedom within = _dofw = N - K
      _dofw = _N - _K
      
      #Sum of Squares Total (= Sum of squares between + Sum of squares within)
      
      #Creating the samplespace of all values.
      _sspace = []
      i = _K - 1

      while i >= 0
        _sspace = _sspace.concat(_data[i])
        i--
      
      #Mean
      _m = $.mean(_sspace)
      i = _sspace.length - 1

      while i >= 0
        _sst = _sst + Math.pow((_m - _sspace[i]), 2)
        i--
      
      #console.log("_sst:"+_sst);
      
      #SSW - Sum of squares within
      i = 0
      _temp = 0

      while i < _K
        j = 0

        while j < _data[i].length
          _temp = (_data[i][j] - _ymean[i])
          _ssw += _temp * _temp
          j++
        i++
      
      #console.log("_ssw:"+_ssw);
      
      #SSB - Sum of squares between
      # for (var i = _K; i >= 1; i--) {
      #   if ((d = _data[i].length) !== undefined){
      #     _ssb=ssb + d*Math.pow((_y - _ymean[i]),2)
      #   }
      # };
      #console.log("_ssb:"+_ssb);
      _ssb = _sst - _ssw
      
      #MST - Mean sum of squares
      _mst = _ssb / _dofe
      
      #MSE - Mean sum of between
      _msw = _ssw / _dofw
      fValue: _mst / _msw
      ndf: _dofe
      ddf: _dofw
  
  ###
  @method : _generateP
  @desc   :Generates p value for the "k" data groups using one way ANOVA method.
  @param  :sampleNumber
  @param  :_ndf
  @param  :_ddf
  @return :{number}
  ###
  _generateP = (sampleNumber, _ndf, _ddf) ->
    x = _generateF(sampleNumber)
    _ndf = _ndf or x.ndf
    _ddf = _ddf or x.ddf
    socr.tools.fCal.computeP x.fValue, _ndf, _ddf
  
  ###
  @method  : _generateZ
  @desc   :Generates p value for the "k" data groups using difference of proportion test.
  @param  :sampleNumber
  @return : {number}
  ###
  _generateZ = (sampleNumber) ->
    if sampleNumber is "dataset"
      _data1 = socr.dataStore.dataset[1].values.getData()
      _data2 = socr.dataStore.dataset[2].values.getData()
    else
      _data1 = socr.dataStore.bootstrapGroup[sampleNumber].values.getData()
      _data2 = _data1[2]
      _data1 = _data1[1]
    
    #
    #      p1 - Proportion of dataset 1
    #      p2 - Proportion of dataset 2
    #
    #      Z = (p1 - p1)/(p*(1-p))*((1/n1) + (1/n2)))^1/2
    #      Reference : 
    #       - http://wiki.stat.ucla.edu/socr/index.php/AP_Statistics_Curriculum_2007_Infer_2Proportions#Hypothesis_Testing_the_Difference_of_Two_Proportions
    #       - http://stattrek.com/hypothesis-test/difference-in-proportions.aspx
    #    
    n1 = _data1.length
    p1 = $.sum(_data1) / n1
    n2 = _data2.length
    p2 = $.sum(_data2) / n2
    
    #Generate pooled sample proportions
    p = (p1 * n1 + p2 * n2) / (n1 + n2)
    
    #Generate Standard Error
    SE = Math.sqrt(p * (1 - p) * ((1 / n1) + (1 / n2)))
    zValue: (p1 - p2) / SE
  
  ###
  @desc Generates p value for the "k" data groups using difference of proportion.
  @param sampleNumber
  @param mu
  @param sigma
  @returns {number}
  @private
  ###
  _generateDOP = (sampleNumber, mu, sigma) ->
    try
      x = _generateZ(sampleNumber)
      mu = mu or 0
      sigma = sigma or 1
    catch e
      console.log e.message
    socr.tools.zCal.computeP x.zValue, mu, sigma
  _stopCount = 1000
  _count = 0
  _n = []
  _K = null
  _this = this
  n: _n
  
  ###
  @method: [public] generateTrail()
  @param datasetIndex
  @desc:  Generating a random number between 0 and dataSet size {@ashwini: I think this should be a private function}
  @returns {object}
  ###
  generateTrail: (datasetIndex) ->
    _temp = socr.dataStore.sampleSpace
    if _temp is `undefined` or _K is false
      null
    else
      randomIndex = _getRandomInt(0, _temp.values.getData().length) #generating a random number between 0 and dataSet size
      key: _temp.keys.getData(randomIndex)
      value: _temp.values.getData(randomIndex)

  #returning the generated trail into a bootstrap sample array  
  
  ###
  @method [public] generateSample()
  @desc  generating a random number between 0 and dataSet size
  @return {boolean}
  ###
  generateSample: ->
    k = socr.model.getK()
    keyEl = []
    valEl = []
    i = 0
    while i < k
      
      #EDIT THIS TO MAKE N DYNAMIC
      
      #var j = _n[k];
      j = socr.model.getN()[i]
      sample = []
      values = []
      while j--
        temp = @generateTrail(k)
        sample[j] = temp.key #inserting the new sample
        values[j] = temp.value
      keyEl.push sample
      valEl.push values
      i++
    socr.dataStore.createObject "bootstrapGroup." + _count + ".keys", keyEl
    socr.dataStore.createObject "bootstrapGroup." + _count + ".values", valEl
    
    #Object.defineProperty(_bootstrapGroupKeys,_count,{value:keyEl,writable:true,configurable : true});
    #Object.defineProperty(_bootstrapGroupValues,_count,{value:valEl,writable:true,configurable : true});
    _count++ #incrementing the total count - number of samples generated from start of simulation
    true

  
  ###
  @method getMean()
  @desc  executed when the user presses "infer" button in the controller tile. The click binding of the step button is done in the {experiment}.js
  @param groupNumber
  @return {Array}
  ###
  getMean: (groupNumber) ->
    groupNumber = groupNumber or 0 # 1 is default value - meaning the first dataset
    obj = socr.dataStore.createObject(groupNumber + ".mean", [])[groupNumber].mean
    if obj.getData().length is _count
      console.log "already saved!"
      obj.getData()
    else
      _mean = []
      j = obj.getData().length

      while j < _count
        _mean[j] = _generateMean(j, groupNumber)
        j++
      obj.setData _mean
      obj.getData()

  
  ###
  @method getMeanOf()
  @desc  executed when the user presses "infer" button in the controller tile.
  The click binding of the step button is done in the {experiment}.js
  @param sampleNumber
  @param groupNumber
  @returns {number}
  ###
  getMeanOf: (sampleNumber, groupNumber) ->
    _generateMean sampleNumber, groupNumber

  
  ###
  STANDARD DEVIATION METHODS STARTS *
  ###
  
  ###
  @method getStandardDev
  @param groupNumber
  @returns {*}
  ###
  getStandardDev: (groupNumber) ->
    groupNumber = groupNumber or 0 # 1 is default value - meaning the first dataset
    #if the _sampleStandardDev already has the values
    _sample.StandardDev[groupNumber] = []  if _sample.StandardDev[groupNumber] is `undefined`
    _temp = _sample.StandardDev[groupNumber]
    if _temp.length is _bootstrapGroupValues.length
      _temp
    else
      j = _temp.length

      while j < _count
        _temp[j] = _generateStandardDev(j, groupNumber)
        j++
      
      #console.log(_sampleStandardDev[j]);
      _sample.StandardDev[groupNumber] = _temp
      _sample.StandardDev[groupNumber]

  
  ###
  @method getStandardDevOf
  @param sampleNumber
  @param groupNumber
  @returns {number}
  ###
  getStandardDevOf: (sampleNumber, groupNumber) ->
    _generateStandardDev sampleNumber, groupNumber

  
  ###
  @param K
  @returns {number}
  ###
  getStandardDevOfDataset: (K) ->
    K = K or 1
    _ds = socr.dataStore.dataset
    _val = _ds[K].values.getData()
    _mean = @getMeanOf("dataset", K)
    _squaredSum = null
    i = 0

    while i < _val.length
      _squaredSum += _val[i] * _val[i]
      i++
    _squaredSum = _squaredSum / _val.length
    _SD = Math.sqrt(_squaredSum - (_mean) * (_mean))
    console.log "SD of Dataset:" + _SD
    _SD

  
  ###
  STANDARD DEVIATION METHODS ENDS *
  ###
  
  ###
  COUNT METHODS STARTS *
  ###
  
  ###
  @method getCount
  @param groupNumber
  @returns {Array}
  ###
  getCount: (groupNumber) ->
    groupNumber = groupNumber or 0 # 1 is default value - meaning the first dataset
    obj = socr.dataStore.createObject(groupNumber + ".count", [])[groupNumber].count
    if obj.getData().length is _count
      console.log "already saved!"
      obj.getData()
    else
      _c = []
      j = obj.getData().length

      while j < _count
        _c[j] = _generateCount(j, groupNumber)
        j++
      obj.setData _c
      obj.getData()

  
  ###
  @method getCountOf
  @param {number | string}sampleNumber
  @param {number} groupNumber
  @returns {number}
  ###
  getCountOf: (sampleNumber, groupNumber) ->
    K = groupNumber or 0
    _ds = socr.dataStore.dataset
    if sampleNumber is "dataset"
      _val = _ds[K].values.getData()
      total = 0
      i = 0

      while i < _val.length
        total += parseFloat(_val[i])
        i++
      total
    else
      _generateCount sampleNumber, K

  
  ###
  COUNT METHODS ENDS *
  ###
  
  ###
  PERCENTILE METHODS STARTS *
  ###
  
  ###
  @method getPercentile ()
  @param  pvalue - what is the percentile value that is to be calculated.
  @return {Array}
  ###
  getPercentile: (pvalue) ->
    console.log "getPercentile() invoked"
    
    #if(_samplePercentile.length==bootstrapSampleValues.length)
    #   return _samplePercentile;
    #else
    # {
    j = 0

    while j < _count
      _sample.Percentile[j] = @getPercentileOf(j, pvalue)
      j++
    
    #console.log(_samplePercentile[j]);
    _sample.Percentile

  
  # }
  
  ###
  @method getPercentileOf
  @param sampleNumber
  @param pvalue
  @returns {*}
  ###
  getPercentileOf: (sampleNumber, pvalue) ->
    temp = bootstrapSampleValues[sampleNumber].sort((a, b) ->
      a - b
    )
    position = Math.floor(bootstrapSampleValues[sampleNumber].length * (pvalue / 100))
    
    #console.log(pvalue);
    #console.log(bootstrapSampleValues[sampleNumber]+"---"+position);
    temp[position]

  
  ###
  @param pvalue
  @returns {*}
  ###
  getPercentileOfDataset: (pvalue) ->
    temp = _datasetValues.sort((a, b) ->
      a - b
    )
    position = Math.floor(_datasetValues.length * (pvalue / 100))
    temp[position]

  
  ###
  PERCENTILE METHODS ENDS *
  ###
  
  ###
  @method getF
  @desc returns the F value computed from the supplied group
  @return {Object}
  ###
  getF: (groupNumber) ->
    groupNumber = groupNumber or 0 # 1 is default value - meaning the first dataset
    _this = this
    obj = socr.dataStore.createObject("F-Value", [])["F-Value"]
    if obj.getData().length is _count
      console.log "already saved!"
      obj.getData()
    else
      _f = []
      j = obj.getData().length

      while j < _count
        _f[j] = _generateF(j).fValue
        j++
      obj.setData _f
      obj.getData()

  
  ###
  @method  getFof
  @desc returns the F value computed from the supplied group
  @param sampleNumber - Random sample Number at which the F value is to be calculated
  @returns {Object}
  ###
  getFof: (sampleNumber) ->
    
    #check if K > 1 and there are random samples to compute F.
    return false  if socr.model.getK() <= 1 or socr.dataStore.bootstrapGroup is `undefined`
    _this = this
    _generateF sampleNumber

  
  ###
  @method getP
  @return {Object}
  ###
  getP: (groupNumber) ->
    groupNumber = groupNumber or 0 # 1 is default value - meaning the first dataset
    _this = this
    obj = socr.dataStore.createObject("P-Value", [])["P-Value"]
    if obj.getData().length is _count
      console.log "already saved!"
      obj.getData()
    else
      _p = []
      j = obj.getData().length

      while j < _count
        _p[j] = _generateP(j)
        j++
      obj.setData _p
      obj.getData()

  
  ###
  @method getPof
  @param sampleNumber
  @returns {number}
  ###
  getPof: (sampleNumber) ->
    
    #check if K > 1 and there are random samples to compute P.
    return false  if socr.model.getK() <= 1 and socr.dataStore.bootstrapGroup is `undefined`
    _this = this
    _generateP sampleNumber

  
  ###
  @method getDOP
  @return {Object}
  ###
  getDOP: ->
    _this = this
    obj = socr.dataStore.createObject("DOPValue", [])["DOPValue"]
    if obj.getData().length is _count
      console.log "already saved!"
      obj.getData()
    else
      _p = []
      j = obj.getData().length

      while j < _count
        _p[j] = _generateDOP(j)
        j++
      obj.setData _p
      obj.getData()

  
  ###
  @method getDOPof
  @param sampleNumber
  @returns {number}
  ###
  getDOPof: (sampleNumber) ->
    _this = this
    _generateDOP sampleNumber

  
  ###
  @method getDataset
  @desc  getter function for dataSet variable.
  @param K  dataset number , field - what value to return i.e values or keys or name
  @param field
  @returns {*}
  ###
  getDataset: (K, field) ->
    K = 1  if K is `undefined`
    field = "keys"  if field is `undefined`
    try
      return socr.dataStore.dataset[K][field].getData()
    catch e
      console.log e.message
      return false
    return

  
  ###
  @method setDataset
  @desc sets the data from the input sheet into the app model
  @param input
  @return {boolean}
  ###
  setDataset: (input) ->
    
    #check for input values...if its empty...then throw error
    return false if typeof input isnt "object"
    
    #input.processed is true in case of a simulation -> data mode switch
    if input.processed
      ma1 = []
      ma2 = []
      i = 0

      while i < input.keys.length
        socr.dataStore.createObject("dataset." + (i) + ".values", input.values[i]).createObject "dataset." + (i) + ".keys", input.keys[i]
        ma1 = ma1.concat(input.values[i])
        ma2 = ma2.concat(input.keys[i])
        i++
      socr.dataStore.createObject("sampleSpace.values", ma1).createObject "sampleSpace.keys", ma2
      console.log "Simulation data is loaded now."
      return true
    else if input.type is "url"
      #console.log "Simulation data is loaded now."
      return false
    else if input.type is "spreadsheet"
      ma1 = []
      ma2 = []
      
      #clear previous data.
      socr.dataStore.removeObject "dataset"
      #console.log input.values.length
      i = 0

      while i < input.values.length
        _cells = input.values[i].cells
        _id = input.values[i].id
        _temp = []
        j = 0

        while j < _cells.length
          if _cells[j]?
            if (t = _cells[j][0]) isnt null and t isnt undefined and t isnt ""
              _temp.push t
          j++
        socr.dataStore.createObject("dataset." + _id + ".values", _temp).createObject "dataset." + _id + ".keys", _temp
        ma1 = ma1.concat(_temp)
        ma2 = ma2.concat(_temp)
        i++
      socr.dataStore.createObject("sampleSpace.values", ma1).createObject "sampleSpace.keys", ma2
      unless socr.dataStore.dataset
        false
      else
        true

  
  ###
  @method : getSample
  @param  : index  random sample index
  @param  : K group index
  @param  : type values or keys
  @desc   : getter and setter function for random samples.
  ###
  getSample: (index, type, K) ->
    P = 0
    K = K or 0 #default set to 0
    type = type or "values" #default set to "values"
    return false  if @getRSampleCount() is 0
    _bg = socr.dataStore.bootstrapGroup[index]
    if type is "values"
      _bg.values.getData K
    else
      _bg.keys.getData K

  
  ###
  @method - getSamples
  @param type
  @param K
  @returns {Array}
  ###
  getSamples: (type, K) ->
    type = type or "values"
    K = K or 1

    _temp = []
    _bg = socr.dataStore.bootstrapGroup
    if type is "values"
      i = 0

      while i < _count
        _temp[i] = _bg[i].values.getData(K)
        i++
    else
      i = 0

      while i < _count
        _temp[i] = _bg[i].keys.getData(K)
        i++
    _temp

  
  ###
  getter and setter for variable '_stopCount'
  ###
  setStopCount: (y) ->
    
    #alert(y);
    _stopCount = y
    return

  getStopCount: ->
    _stopCount

  
  ###
  getter and setter for variable '_n'
  ###
  setN: (z) ->
    
    #NEED TO MAKE N DYNAMIC
    
    #if z length != to dataset length, then default the values to the dataset lengths
    
    #purge _n array
    _n.length = 0
    socr.model.setK()
    _ds = socr.dataStore.dataset
    if typeof z is "undefined" or z is null
      
      #computing default values
      if typeof _ds isnt "undefined"
        i = 0

        while i < _K
          try
            _n.push _ds[i]["values"].getData().length
          catch e
            console.log e.message
            PubSub.publish "Error in model"
          i++
    else if $.isArray(z)
      if (z.length - 1 is _K) or (z.length is _K)
        z.forEach ((el, index, arr) ->
          z[i] = _ds[i]["values"].getData().length  if typeof el is "undefined" or el is null
          return
        ), z
        _n = _n.concat(z)
      else
    
    #some values are missing
    #this case will come almost never
    else if typeof z is "number" or typeof z is "string"
      console.log typeof z + " is the type of Z"
      z = parseInt(z)
      i = _K

      while i > 0
        _n.push z
        i--
    console.log "random sample sizes:" + _n
    return

  getN: ->
    _n

  
  ###
  getter and setter for variable '_count'
  ###
  setRSampleCount: (v) ->
    _count = v
    true

  getRSampleCount: ->
    _count

  ###
  # App goes back to pristine state.
  ###
  reset: (option) ->
    if option isnt "undefined" and option is "samples"
      socr.dataStore.removeObject "bootstrapGroup"
      
    else
      
      #all values deleted
      socr.dataStore.removeObject "all"
      #reset K
      socr.model.setK()
      
    #setting the global random sample count to 0
    socr.model.setRSampleCount 0
    return true

  
  ###
  @method :setK
  @return : none
  ###
  setK: ->
    _c = 0
    if (_ds = socr.dataStore.dataset) is `undefined`
      _K = null
      return false
    for name of _ds
      _c++  if _ds.hasOwnProperty(name)
    _K = _c
    return

  
  ###
  @method :getK
  @return : {number}
  ###
  getK: ->
    _K
#return
