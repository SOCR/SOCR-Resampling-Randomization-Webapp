###
appView.js is the view object for the SOCR app.

@author: selvam , ashwini
@return: {object}
SOCR - Statistical Online Computational Resource
###
socr.view = (model) ->

  # private properties
  # [OBJECT] Reference to the App's model object.
  # [ARRAY] Reference to current inference varaible [mean , SD , count , percentile]
  # [ARRAY] Reference to current inference variable's value of each random sample.

  ###
  @method: [private] _create
  @param :  start: the first sample number to be displayed
  @param :  size: how many samples to be displayed
  @return : {boolean}
  @desc:   populates the sampleList div with random samples
  ###
  _create = (start, size) ->
    _datapoints = $("#nSize").val()
    end = parseInt(start) + size
    j = 0
    k = model.getK()
    return false  if size is `undefined` or start is `undefined`
    console.log "_create(" + start + "," + size + ") function started"
    $("#sampleList").html "" #first empty the sample list

    #generate the json object for mustache
    config = entries: []
    obj = {}
    i = start

    while i < end
      obj.sampleNo = i
      obj.datapoints = _datapoints
      obj.sample = []
      j = 0
      while j <= k - 1
        temp = obj.sample[j] = {}
        if j is 0
          temp.class = "active"
        else
          temp.class = ""
        temp.kIndex = j
        temp.id = i * (Math.pow(10, (Math.ceil(Math.log(i) / Math.log(10))))) + (j)
        temp.values = model.getSample(i, "values", j)
        temp.keys = model.getSample(i, "keys", j)
        j++
      config.entries.push obj
      obj = {} #destroying the object
      i++
    $.get "dist/partials/sampleList.tmpl", (data) ->
      temp = Mustache.render(data, config)
      $("#sampleList").html temp

      #console.log(temp);
      $(".tooltips").tooltip()
      $(".nav-tabs li").click (e) ->
        e.preventDefault()
        kIndex = $(this).find("a").html()

        #setting the k-index attribute of toggle-sample icon
        $(this).parent().parent().find(".toggle-sample").attr "k-index", kIndex
        $(this).find("a").tab "show"
        return


      #plot icon present on each child of the sampleList Div .
      #            It basically opens a popup and plots a bar chart of that particular sample.
      $(".plot").on "click", (e) ->
        e.preventDefault()
        $(".chart").html ""
        id = $(this).attr("sample-number")
        kIndex = $(this).parent().parent().find(".toggle-sample").attr("k-index")

        #var sampleID=e.target.id;
        values = model.getSample(id, "values", kIndex)
        i = 0

        while i < values.length
          values[i] = parseFloat(values[i])
          i++

        #console.log("values for plot click:"+values);
        #var temp=values.sort(function(a,b){return a-b});
        #var start=Math.floor(temp[0]);
        #var stop=Math.ceil(temp[values.length-1])+1;
        $("#plot").find("h3").text " Sample : " + id
        socr.vis.generate
          parent: ".chart"
          data: values
          height: 380
          width: 500
          method: "discrete"
          variable: "Frequency"

        return


      #range:[start,stop]
      #click binding for .plot

      # toggle-sample icon is present on each child of the sampleList Div .
      #             * It basically toggles the data if the sample and sampleValue are different.
      #             * TODO : disable this button if the app is data driven mode (as the sample and sampleValues are same.)
      #
      $(".toggle-sample").on "click", (e) ->
        e.preventDefault()
        id = $(this).attr("sample-number")
        kIndex = $(this).parent().parent().find(".toggle-sample").attr("k-index")
        console.log()
        if $(this).attr("data-type") is "value"
          $(this).parent().parent().find("div.active pre").text model.getSample(id, "keys", kIndex)
          $(this).attr "data-type", "keys"
        else
          $(this).parent().parent().find("div.active pre").text model.getSample(id, "values", kIndex)
          $(this).attr "data-type", "value"
        return

      return

    #click binding for .toggle-sample
    #get call end
    $(".contribution").on "click", (e) ->

      #
      #      Renders the dotplot,
      #        @ToDo : show individual contributions on a box chart
      #
      createDotplot = (setting) ->
        if setting.variable is "mean"
          values = model.getMean()
          datum = model.getMeanOf("dataset", 1)
          console.log "Mean Values:" + values
        else if setting.variable is "standardDev"
          values = model.getStandardDev()
          datum = model.getStandardDevOfDataset(1)
          console.log "SD Values:" + values
        else
          values = model.getPercentile()

        #var datum=model.getStandardDevOfDataset();
        datum = Math.floor(datum * 100) / 100
        histogram = socr.vis.generate(
          parent: "#dotplot"
          data: values
          height: 390

          #range: [0,10],
          datum: datum
          sample: setting.sample
        )
        return
      e.preventDefault()
      console.log "Mean of this sample:" + model.getMeanOf($(this).attr("id"))
      $("#accordion").accordion "activate", 2
      console.log "dataset mean:" + model.getMeanOf("dataset", 1)
      console.log "standard deviation:" + model.getStandardDevOf($(this).attr("id"))
      $("#dotplot").html ""
      createDotplot
        variable: "mean"
        sample:
          mean: model.getMeanOf($(this).attr("id"))
          meanDataset: model.getMeanOf("dataset", 1)
          standardDev: model.getStandardDevOf($(this).attr("id"))

      html = "<div> Mean of Sample :" + model.getMeanOf($(this).attr("id")) + " Mean of DataSet : " + model.getMeanOf("dataset", 1) + " Standard Deviation :" + model.getStandardDevOf($(this).attr("id")) + "</div>"
      table = ["<table class=\"table table-striped>\""]
      table.push "<tr><td>Mean Of Sample</td><td></td></tr>"
      $("#contribution-details").html html
      return

    return

  ###
  @method: [private] _createPagination
  @param :  x: the first sample number to be displayed
  @param :  y: how many samples to be displayed
  @desc:  creates interactive pagination depending upon the number of samples being shown
  ###
  _createPagination = (x, y) ->
    console.log "_createPagination() invoked"
    count = Math.ceil((y - x) / 500) #count=number of pages. 500 samples per page.
    $(".pagination").paginate
      count: count
      start: 1
      display: 8
      border: true
      border_color: "#fff"
      text_color: "#fff"
      background_color: "black"
      border_hover_color: "#ccc"
      text_hover_color: "#000"
      background_hover_color: "#fff"
      images: false
      mouse: "press"
      onChange: (page) ->
        $("._current", "#paginationdemo").removeClass("_current").hide()
        $("#p" + page).addClass("_current").show()
        return

    $(".pagination li").on "click", ->
      start = $(this).text() * 500 - 500
      #console.log start
      _create start, 500
      return

    return
  model = model
  _currentVariable = undefined
  _currentValues = undefined
  _currentExperiment = null

  ###
  @method - toggleControllerHandle
  @description - Method to toggle the controller slider
  ###
  initialize: ->

    PubSub.subscribe "appReset",->
      socr.view.reset()

    PubSub.subscribe "randomSampleGenerationStopped", (msg,data) ->
      socr.view.enableButtons() #enable buttons
      socr.view.updateSlider()
      # socr.view.updateCtrlMessage "Generation stopped.", "error", 1000
      # socr.view.updateStatus "interrupted"
      # socr.view.updateSimulationInfo()

    PubSub.subscribe "randomSampleGenerationInterrupted", (msg,data) ->
      socr.view.enableButtons() #enable buttons
      socr.view.updateSlider(true)
      socr.view.updateStatus "interrupted"
      socr.view.updateCtrlMessage "Generation interrupted.", "error", 1000

    PubSub.subscribe "randomSampleGenerationStarted", (msg,data) ->
      socr.view.disableButtons() #disabling buttons
      socr.view.showSampleListLoader()
      socr.view.updateStatus "started"

    PubSub.subscribe "randomSampleGenerationComplete", (msg,data)->
      #updating controller view slider
      socr.view.updateCtrlMessage "samples generated sucessfully.", "success", 2000
      socr.view.updateStatus "finished"
      socr.view.updateSimulationInfo()
      #updating samplelist view
      socr.view.updateSlider(true, Math.floor(data['sampleCount']* 0.5), data['sampleCount'])

    PubSub.subscribe "toggleLoadingSpinner" ,(msg,data)->
      socr.view.toggleLoadingSpinner(data)

    PubSub.subscribe "setInferenceSettingComplete", (msg, data)=>
      socr.view.createDotplot data
      socr.view.updateSimulationInfo()
    return true
  toggleControllerHandle: (action) ->
    console.log action
    $target = $("#slide-out-controller")
    show = ->
      $target.addClass("active").show().css(left: -425).animate
        left: 0
      , 200
      $(".controller-handle").css(left: -30).animate
        left: 394
      , 200
      socr.exp.controllerSliderState = "show"
      return

    hide = ->

      # if($target.hasClass('active')){
      $target.removeClass("active").animate
        left: -425
      , 500
      $(".controller-handle").css(left: 400).animate
        left: -30
      , 500
      socr.exp.controllerSliderState = "hide"
      return

    if typeof action is "object"
      if socr.exp.controllerSliderState is "hide"
        show()
      else
        hide()
    else if action is "show" and socr.exp.controllerSliderState is "hide"
      show()
      true
    else if action is "hide" and socr.exp.controllerSliderState is "show"
      hide()
      true
    else
      false
    return


  ###
  @method - disableButtons()
  @description: Disables step,run and show buttons
  @dependencies : none
  ###
  disableButtons: ->
    console.log "disableButtons invoked"
    $("#stepButton").attr "disabled", "true"
    $("#runButton").attr "disabled", "true"
    $("#showButton").attr "disabled", "true"
    return


  ###
  @method - enableButtons()
  @description: Enables step,run and show buttons
  @dependencies : none
  ###
  enableButtons: ->
    console.log "enableButtons invoked"
    $("#stepButton").removeAttr "disabled"
    $("#runButton").removeAttr "disabled"
    $("#showButton").removeAttr "disabled"
    return


  ###
  @method - reset()
  @description: Clears all canvas and div. Resetting the view of the whole App
  @parameter scope - Array
  ###
  reset: (scope=["app"]) ->
    _resetSampleScope = ->
      $("#sampleList").html "" #clear the sample List dive
      $("#showCount").html ""
      socr.view.updateSlider()
      $(".pagination").html ""

    _resetDataScope = ->
      $("#dataPlot").html "" #clear dataPlot div
      $("#dotplot").empty() #clear dotPlot div
    _resetAccordion = ->
      $("#accordion").accordion "activate", 0
      $("#details").html ""
    
    scope.forEach (s)->
      switch
        when s is "sampleslistview" 
          $("#sampleList").html ""
        when s is "randomsamples"
          _resetSampleScope()
          _resetDataScope()
          _resetAccordion()
        when s is "app"
          _resetSampleScope()
          _resetDataScope()
          _resetAccordion()
          _currentValues = []
          $("#controller-content").html "<div class=\"alert alert-error\">From the \"Input\" tab, select an experiment  or enter sample data!</div>"
        else
          echo "."
      #$('#displayCount').html('0');  //resetting the count to 0
      # $("#input").inputtable('clear');      
    return


  ###
  Dont know where its called?
  ###
  createDatasetPlot: ->
    values = [
      0.1
      0.5
    ]
    histogram = socr.vis.generate(
      parent: "#dataPlot"
      data: values
      range: [
        0
        1
      ]
    )
    return


  ###
  @method : createList(range)
  @param :start- start sample number
  @param : end -  stop sample number
  @description: It generates all the samples in the List
  @dependencies : _create(start,stop)
  ###
  createList: (start, end) ->
    console.log "createList(" + start + "," + end + ") invoked "

    #if(Object.getOwnPropertyNames(model.bootstrapGroupKeys).length === 0){
    if socr.model.getRSampleCount() is 0

      # if no random samples have been generated, display a alert message!
      $("#sampleList").html "<div class=\"alert alert-error\"><a class=\"close\" data-dismiss=\"alert\" href=\"#\">x</a><h4 class=\"alert-heading\">No Random samples to show!</h4>Please generate a dataset using the list of experiments or manually enter the data. Then generate some random samples from the controller tile before click \"show\"</div>"
    else
      if (end - start) < 500
        _create start, end - start
      else
        _createPagination start, end
        _create start, 500
      PubSub.publish "Sample List generated"
    return


  ###
  @method : updateSlider()
  @description:update the slider value
  @dependencies : none
  ###
  updateSlider:(forceUpdate=false,start,end) ->

    #get the count and set it as the maximum value
    $("#displayCount").text model.getRSampleCount()
    $("#range").slider "option", "max", model.getRSampleCount()
    $("#range").slider "option", "min", 0
    if start? and end?
      $("#showCount").html start + " - " + end
      $(".show-list-start").val start
      $(".show-list-end").val end
    if forceUpdate is true
      $("#showButton").trigger "click"
    return


  #$( "#showCount" ).html($( "#range" ).slider( "values",0 )+" - " + $( "#range" ).slider( "values", 1 ) );

  ###
  @method : createShowSlider()
  @description:Create the slider for show option
  @dependencies : none
  ###
  createShowSlider: ->
    $("#range").slider
      range: true
      min: 0
      max: 500
      values: [
        75
        300
      ]
      slide: (event, ui) ->
        $("#showCount").html ui.values[0] + " - " + ui.values[1]
        $(".show-list-start").val ui.values[0]
        $(".show-list-end").val ui.values[1]
        return

    $("#showCount").html $("#range").slider("values", 0) + " - " + $("#range").slider("values", 1)
    return


  ###
  @method: createControllerView
  @description: called for replacing the controller div with data driven controls.
  @return : none
  ###
  createControllerView: ->

    #get the random sample length
    #slice(0) does a shallow copy
    _RSampleLength = socr.model.getN().slice(0)

    #splice the first element
    _RSampleLength.splice 0, 1
    _k = socr.model.getK()
    _analysis = []
    _showIndex = undefined
    _indexes = []
    for prop of socr.analysis
      if _k >= socr.analysis[prop]["start"] and _k <= socr.analysis[prop]["end"]
        _analysis.unshift prop
        _variables = socr.analysis[prop]["variables"]
    if _k > 1
      _showIndex = true
      _indexes = []

      i = 0
      while _k--
        _indexes[i] = i + 1
        i++
    else
      _showIndex = false
    showBack = (if (socr.controller.getCurrentMode() is "Experiment") then true else false)
    config =
      animationSpeed: false
      analysis: _analysis
      variables: _variables
      RSampleLength: _RSampleLength
      showIndex: _showIndex
      index: _indexes
      showBack: showBack

    $.get "dist/partials/controller.tmpl", (data) ->
      _output = Mustache.render(data, config)
      $("#controller-content").html _output
      socr.controller.initController()
      return

    return


  ###
  @method: animate
  @param: setting
  @description: animates the resample generation process....input is the resample datapoints array indexes
  @return : none
  ###
  animate: (setting) ->

    # Add the class ui-state-disabled to the headers that you want disabled

    # Now the hack to implement the disabling functionnality

    #disable the back button in the controller tile
    # data is in the form of an array!
    # data is in the form of an array!
    # Number of datapoints in a generated random sample
    # keys=array indexs of the datapoints in the dataset which are present in the current random sample
    #first call
    animation = ->
      speed = $("#speed-value").html() #calculate the speed currently set from the browser itself
      sampleNumber = keys[i]
      count = i
      self = $("#device" + sampleNumber) #reference to the device (i.e. coin , card, dice) canvas
      content = self.clone() # make a copy of the sample canvas
      self.addClass "removable"
      currentX = $("#device" + sampleNumber + "-container").position().left #get the X position of current sample canvas
      console.log "currentX:" + currentX
      currentY = $("#device" + sampleNumber + "-container").position().top #get the Y position of current sample canvas
      console.log "currentY:" + currentY
      samplesInRow = $("#generatedSamples").width() / _dimensions["width"] - 1 #number of samples in a row

      #Block to adjust the generatedSamples div height
      divHeight = (stopCount / samplesInRow) * _dimensions["height"]
      $("#generatedSamples").height divHeight

      #alert(divHeight);
      #
      if count < samplesInRow
        destinationX = count * _dimensions["width"] + $("#generatedSamples").position().left
      else
        destinationX = (count % samplesInRow) * _dimensions["width"] + $("#generatedSamples").position().left
      console.log "destinationX:" + destinationX
      destinationY = Math.floor(count / samplesInRow) * _dimensions["height"] + $("#generatedSamples").position().top #calculate the destination Y
      console.log "destinationY:" + destinationY

      #self.css('-webkit-transition','all 0.5s');
      self.transition
        perspective: "100px"
        rotateY: "360deg"
        duration: speed / 4 + "ms"

      self.transition
        x: (destinationX - currentX)
        y: (destinationY - currentY)
        duration: speed / 4 + "ms"
      , ->
        content.appendTo "#device" + sampleNumber + "-container"
        self.removeAttr "id" #remove the id on the moved coin
        if socr.exp.current.type is "coin"
          k = new Coin(document.getElementById("device" + sampleNumber))
          k.setValue data[sampleNumber]
        else if socr.exp.current.type is "card"
          k = new Card(document.getElementById("device" + sampleNumber))
          k.setValue data[sampleNumber]

        #alert(data[sampleNumber]);
        else
          k = new Ball(document.getElementById("device" + sampleNumber))
          k.setValue datakeys[sampleNumber], data[sampleNumber]
        return

      #self.transition
      i = i + 1
      if i < stopCount
        setTimeout animation, speed
      else
        $(".ui-accordion-header").removeClass "ui-state-disabled"
        socr.view.enableButtons()
        console.log "enableButtons() invoked"
      return
    @disableButtons()
    $(".ui-accordion-header").addClass "ui-state-disabled"
    accordion = $("#accordion").data("accordion")
    accordion._std_clickHandler = accordion._clickHandler
    accordion._clickHandler = (event, target) ->
      clicked = $(event.currentTarget or target)
      @_std_clickHandler event, target  unless clicked.hasClass("ui-state-disabled")
      return

    data = socr.exp.current.getDataset(1, "values")
    datakeys = socr.exp.current.getDataset(1, "keys")
    stopCount = setting.stopCount
    keys = setting.indexes
    i = 0
    _dimensions = socr.exp.current.getSampleHW()
    setTimeout animation
    return


  ###
  @method: createDotPlot
  @description: Dot plot tab in the accordion is populated by this call.
   "infer" button pressed in the controller tile -> appController -> appModel -> publishes "setInferenceSettingComplete".
  @return : {boolean}
  ###
  createDotplot: (setting) ->
    __dotPlotDOMSelector__ = "#dotplot"
    __accordionDOMSelector__ = "#accordion"

    $(__dotPlotDOMSelector__).html ""
    throw new Error("invalid arguments: settings")  unless setting.variable?
    _currentVariable = setting.variable
    $(__accordionDOMSelector__).accordion "activate", 2

    # Function to get the Max value in Array
    Array.max = (array) ->
      Math.max.apply Math, array

    # Function to get the Min value in Array
    Array.min = (array) ->
      Math.min.apply Math, array

    setting.index--;

    switch setting.variable
      when "Mean"
        values = model.getMean(setting.index) #Mean values of all the generated random samples
        datum = model.getMeanOf("dataset", setting.index) #datum is the dataset mean value
      #console.log("Mean Values:"+ values );
      #console.log("datum value:"+ datum) ;
      when "standardDev"
        values = model.getStandardDev(setting.index) #Standard deviation values of all the generated random samples
        datum = model.getStandardDevOfDataset(setting.index) #datum is the dataset SD value
      #console.log("SD Values:"+ values );
      when "percentile"
        try
          pvalue = parseInt($("#percentile-value").html())

        #console.log(pvalue);
        catch err
          console.log "unable to read the percentile value from DOM. setting default value to 50%"
          pvalue = 50
        values = model.getPercentile(pvalue)
        datum = model.getPercentileOfDataset(pvalue)

        #var datum=model.getStandardDevOfDataset();
        console.log "Percentile Values:" + values
      when "Count"
        values = model.getCount(setting.index) #Standard deviation values of all the generated random samples
        datum = model.getCountOf("dataset", setting.index) #datum is the dataset SD value
      #console.log("Count Values:"+ values );
      when "F-Value"
        values = model.getF()
        datum = model.getFof("dataset").fValue

      #console.log("F-values"+values);
      when "P-Value"
        values = model.getP()
        datum = model.getPof("dataset")

      #                console.log("P values"+values);
      when "Difference-Of-Proportions"
        values = model.getDOP()
        datum = model.getDOPof("dataset")

      #console.log("DOP values"+values);
      else
        values = model.getMean(setting.index)
        datum = model.getMeanOf("dataset", setting.index)

    #console.log(values);

    #
    #   Cleaning the NaN values generated.
    #   Temporary fix. Need to avoid NaN generation.
    #
    $.grep values, (a) ->
      not isNaN(a)


    # Sorting the array to find start and stop values
    temp = values.sort((a, b) ->
      a - b
    )
    start = Math.floor(temp[0])
    stop = Math.ceil(temp[values.length - 1])
    console.log "start: " + start + " stop: " + stop

    # Percentage on the right and left side of the intial dataset contribution point.
    if setting.variable is "P-Value" or setting.variable is "Difference-Of-Proportions"
      total = temp.length
      lSide = undefined
      rSide = undefined
      start = 0
      end = temp.length - 1
      index = undefined
      flag = 0
      if datum < temp[0]
        lSide = 0
        rSide = 100
      else if datum > temp[temp.length - 1]
        lSide = 100
        rSide = 0
      else
        until end is (start + 1)
          index = Math.ceil((start + end) / 2)
          if datum is temp[index]
            break
          else if datum < temp[index]
            end = index
          else
            start = index
        #while
        lSide = (index / total) * 100
        rSide = 100 - lSide
      console.log "total: " + total
      console.log "index: " + index
      console.log "R Side : " + rSide + ".... L Side : " + lSide
    binNo = (if $("input[name=\"binno\"]").val() isnt "" then $("input[name=\"binno\"]").val() else 10)

    #datum = Math.floor(datum*100) / 100;
    _currentValues = values

    # fixing the precision
    datum = Math.round( datum * Math.pow(10, setting.precision) ) / Math.pow(10, setting.precision)
    lSide = Math.round( lSide * Math.pow(10, setting.precision) ) / Math.pow(10, setting.precision)
    rSide = Math.round( rSide * Math.pow(10, setting.precision) ) / Math.pow(10, setting.precision)

    try
      dotplot = socr.vis.generate(
        parent: __dotPlotDOMSelector__
        data: values
        height: 390
        range: [
          start
          stop
        ]
        datum: datum
        bins: binNo
        variable: setting.variable
        pl: lSide
        pr: rSide
      )

    # nature: 'continuous'
    catch e
      console.log e
      dotplot = socr.vis.generate(
        parent: "#dotplot"
        data: values
        height: 390
        range: [
          start
          stop
        ]
        bins: binNo
        variable: setting.variable
      )

    # nature: 'continuous'

    #        try{
    #   socr.vis.addBar({
    #       elem: dotplot,
    #       variable: setting.variable,
    #       datum: datum
    #   });
    #        }
    #        catch(e){
    #            console.log(e);
    #        }
    #        finally{
    #            socr.vis.addBar({
    #                elem: dotplot,
    #                variable: setting.variable,
    #                datum: datum
    #            });
    #        }
    @updateCtrlMessage "Infer plot created.", "success"
    true
    PubSub.publish "toggleLoadingSpinner" ,{action:'hide'}

  ###
  @method updateSimulationInfo
  @desc Called when the 'step button' or 'run button' is pressed in the controller tile.
  Call is made in appController.js
  @return none
  ###
  updateSimulationInfo: (name) ->
    console.log "updateSimulationInfo() invoked"
    if name isnt "Data Driven Experiment"
      try
        name = socr.exp.current.name
      catch e
        name = "Data Driven Experiment"
    config =
      variable: socr.model.getInferenceSettings()['variable']
      analysis: socr.model.getInferenceSettings()['analysis']
      name: name
      k: socr.model.getK()
      groups: []
      results: []
      rCount: model.getRSampleCount()

    #adding results
    if config.k > 1
      if socr.model.getPof("dataset") isnt false
        config.results.push
          param: "P-Value"
          value: socr.model.getPof("dataset")

      if socr.model.getFof("dataset") isnt false
        config.results.push
          param: "F-Value"
          value: socr.model.getFof("dataset").fValue

    i = 0

    while i < config.k
      obj = {}
      obj.mean = socr.model.getMeanOf("dataset", i)
      obj.size = socr.model.getDataset(i).length
      obj.number = i
      config.groups.push obj
      i++

    #console.log(config);
    $.get "dist/partials/info.tmpl", ((data) ->
      htmlContent = Mustache.render(data, config)
      $("#details").html htmlContent
      return
    ),"html"

    return


  ###
  @method: CoverPage
  @description: Called from the index.html page. Called whenever the window is resized!
  @return : none
  ###
  CoverPage: ->

    #console.log('CoverPage() invoked!');
    height = $(document).height()
    width = $(window).width()
    $("#welcome").css "height", height
    return


  # $('.welcome-container').css('padding-top',height/3).css('padding-left', height/3);
  # $('#main').show();

  ###
  @method: loadInputSheet
  @description: Called from the {experiment}.js at the {Experiment}.generate() function.
  @return : none
  ###
  loadInputSheet: (data) ->
    console.log "loadInputSheet() has been called....data is : " + data
    return


  #
  #     Temporarily disabling it, I think we should leave the input matrix for data driven purposes only, perhaps the right place would be in the simulation info
  #

  #$('#input').inputtable('loadData',data);
  handleResponse: (content, type, id) ->
    console.log "handleResponse"
    console.log $("#" + id + "-message")
    if $("#" + id + "-message").length is 0
      console.log $("#" + id)
      $("#" + id).append "<div id='" + id + "-message'></div>"
      $response = $("#" + id + "-message")

    #$response=$("#"+id+"-message") || $("#"+id).append("<div id='"+id+"-message'></div>");
    console.log $response
    $response.html("").slideUp 300
    $response.append($("<div></div>").addClass("alert").html(content)).slideDown 300
    $alertbox = $response.children("div")
    switch type
      when "success"
        $alertbox.addClass "alert-success"
        $alertbox.append " <i class=\"icon-ok\"></i> "
      when "error"
        $alertbox.addClass "alert-error"

  updateCtrlMessage: (msg, type, duration) ->
    console.log "updateCtrlMessage called()"
    duration = duration or 2000
    type = type or "info"
    if msg is `undefined`
      false
    else
      try
        el = $("#ctrlMessage")
        el.html("").removeClass().addClass("span8").css "display", ""
        el.html(msg).addClass("alert").addClass "alert" + "-" + type
        el.delay(duration).fadeOut "slow"
      catch err
        console.log err.message
    return

  updateStatus: (action, percent) ->
    console.log "updateStatus"
    return false  if action is `undefined`
    switch action

      when "started"
        console.log "started"
        html = "<div class=\"progress progress-info progress-striped active\"><div class=\"bar\" style=\"width:0%\"></div></div>"
        el = $("#progressBar")
        el.html("").removeClass().addClass("span8").css("display", "").html html

      when "update"
        return false  if percent is `undefined`
        el = $("div#progressBar > div > div")
        current = el.css("width")
        console.log "percent= " + percent
        if percent % 10 is 0
          console.log "change"
          el.css "width", percent + "%"
          el.style

      when "finished"
        $("#progressBar").html("").css("display", "none")

      when "interrupted"
        $("#progressBar").html("").css("display", "none")

    return

  showSampleListLoader : ()->
    $("#sampleList").html '<div class="spinner" style="width:40px">
        <div class="double-bounce1 black-bg"></div>
        <div class="double-bounce2 black-bg"></div>
      </div>'
  
  toggleLoadingSpinner : (data)->
    console.log('toggleLoadingSpinner action : ',data);
    if data.action is "show"
      $('.loading-spinner').show()
    else
      $('.loading-spinner').hide()

#
# setPercentile:function(x){
#   var N=_currentValues.length;
#   console.log("N"+N);
#   _currentValues=_currentValues.sort(function(a,b){return a-b});
#   //console.log("_currentValues"+_currentValues);
#   var index=((x)/100)*N;
#   console.log("index: "+index);
#   console.log("value: "+_currentValues[Math.floor(index)]);
#   return _currentValues[Math.floor(index)];
# }
#
#return
