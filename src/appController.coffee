###
  socr.controller is the controller object for the SOCR app.

  @author: selvam , ashwini
  @return: {object}
  SOCR - Statistical Online Computational Resource
###
socr.controller = (model, view) ->

  # PRIVATE PROPERTIES  
  __accordionDOMSelector__ = "#accordion"
  __controllerBackBtnDOMSelector__ = ".controller-back"
  __runBtnDOMSelector__ = "#runButton"
  __stepBtnDOMSelector__ = "#stepButton"
  __stopBtnDOMSelector__ = "#stopButton"
  __resetBtnDOMSelector__ = "#resetButton"
  __inferBtnDOMSelector__ = "#infer"

  __inferenceDatasetIndexDOMSelector__ = "#index"
  __inferenceVariableDOMSelector__ = "#variable"
  __inferenceAnalysisDOMSelector__ = "#analysis"
  __inferencePrecisionDOMSelector__ = '#result-precision'

  _id = 0 # Stores the id for setInterval in run mode
  _runsElapsed = 0 # Keeps count of number of resamples generated
  _runCount = 0
  _this = this
  _noOfSteps = 0
  _currentMode = "Experiment" #App starts with dataDriven mode [default value]
  
  MIN_SAMPLE_GENERATION_STEP_COUNT = 100
  MIN_SAMPLE_GENERATION_STEP_TIME = 10 # (in ms)

  # PRIVATE METHODS

  ###
  @method: [private] _generate()
  @description:   This function generates 1000 resamples by calling the generateSample() of model.
  @dependencies: generateSample()
  ###
  _generate = (count)->
    # _temp = (model.get "stopCount")/ MIN_SAMPLE_GENERATION_STEP_COUNT
    # _noOfSteps = Math.ceil(_temp)
    console.log _runCount
    if _runCount < model.get "stopCount"
      _leftCount = model.get("stopCount") - _runCount
      if _leftCount > MIN_SAMPLE_GENERATION_STEP_COUNT
        i = MIN_SAMPLE_GENERATION_STEP_COUNT
      else
        i = _leftCount
      _runCount += i
      model.generateSample()  while i--
      # percent = Math.ceil((_runsElapsed / _noOfSteps) * 100)
      view.updateSlider()
      # _runsElapsed++
      console.log "runCount:" + _runCount
      percent = Math.ceil(100 * _runCount / (model.get "stopCount") )
      view.updateStatus "update", percent
    else
      PubSub.publish "randomSampleGenerationComplete", {'sampleCount':model.getRSampleCount()}
      _this.stop()
    return

  # PUBLIC METHODS

  currentMode: _currentMode

  ###
  @method: [private] initialize()
  @description:Initializes the app..binds all the buttons...create the show slider
  ###
  initialize: ->
    _this = this
    console.log "initialize() invoked "

    #ADDING EVENT LISTENERS STARTS
    #--------------------------------
    $(".controller-handle").on "click", view.toggleControllerHandle

    $(".help").on "change click", (e) ->
      e.preventDefault()
      socr.tutorial.toggleStatus()
      (if (socr.tutorial.getStatus() is "on") then $(".help").css("background-color", "green").html("<a href='#'>Help : ON</a>") else $(".help").css("background-color", "").html("<a href='#'>Help : OFF</a>"))
      return

    $("#showButton").on "click", ->
      #a check to see if the sample count is 0 or not
      view.createList $(".show-list-start").val(), $(".show-list-end").val()
      return


    $("#share-instance-button").on "click", ->
      $(".generate-response").html ""
      html = "<p>Dataset:<strong>" + model.getDataset() + "</strong></p>"
      html += "<p>Count Size:<strong>" + $("#countSize").val() + "</strong></p>"
      html += "<p>datapoints:<strong>" + $("#nSize").val() + "</strong></p>"
      $("#settings").html html
      return

    $("#generate-url-button").on "click", ->
      unless model.getDataset() is ""
        $("#url").val baseUrl + "index.html?" + "type=url&dataset=" + model.getDataset() + "&countSize=" + $("#countSize").val() + "&nSize=" + $("#nSize").val()
      else
        console.log "Dataset not initialised"
        alertblock = "<div class=\"alert alert-block\">Dataset not initialised</div>"
        $(".generate-response").html alertblock
      return

    $("#reset-button").on "click", ->
      _this.reset()
      return

    $(".input-controls").delegate "td", "mousedown", ->
      table.startEdit $(this)
      return


    #console.log('Logging function called')
    $(".input-controls").delegate "input#generateMatrix", "click", ->
      console.log "Table Generated"
      console.log table.getMatrix()
      return


    #console.log(table.getMatrix)
    $(".input-controls").delegate "input#submatrix", "click", ->
      start = $(".input-controls").find("input[name=\"start\"]").val()
      end = $(".input-controls").find("input[name=\"end\"]").val()
      table.generateSub start, end
      return


    #ADDING EVENT LISTENERS ENDS

    # Twitter Feed
    # $('#tweetFeed').jTweetsAnywhere({
    #     searchParams: 'q=%23socrWebapp',
    #     count: 10,
    #     showTweetFeed: {
    #       autorefresh: {
    #         mode: 'trigger-insert',
    #         interval: 60
    #       },
    #       paging: {
    #       mode: 'more'
    #       },
    #       showTimestamp: {
    #       refreshInterval: 30
    #       }
    #     }
    #   });
    $("#accordion").accordion()
    $(".dropdown-toggle").dropdown()
    $(".popups").popover
      html: true
      trigger: "click"
      animation: true

    $(".tooltips").tooltip()
    view.createShowSlider()
    return

  initController: ->

    # set the K - value in model.
    model.setK()
    $(".tooltips").tooltip()

    $(__controllerBackBtnDOMSelector__).on "click", (e) ->
      e.preventDefault()
      try
        model.reset()
        view.reset()
        console.log "exp_" + socr.exp.current.name
        socr.dataTable.simulationDriven.init "exp_" + socr.exp.current.name
        socr.exp.current.initialize()
      catch err
        console.log err.message
      return

    $(__runBtnDOMSelector__).on "click", (e) ->
      e.preventDefault()
      console.log "Run Started"      
      setTimeout socr.controller.run, 500
      return

    $(__stepBtnDOMSelector__).on "click", (e) ->
      e.preventDefault()
      console.log "Step pressed "
      socr.controller.step()
      return

    $(__stopBtnDOMSelector__).on "click", (e) ->
      e.preventDefault()
      console.log "Stop Pressed "
      socr.controller.stop()
      PubSub.publish "randomSampleGenerationInterrupted", {}
      return

    $(__resetBtnDOMSelector__).on "click", (e) ->
      e.preventDefault()
      console.log "Reset pressed"
      socr.controller.reset()
      return

    $(__inferBtnDOMSelector__).on "click", (e) ->
      e.preventDefault()

      if model.getSample(1) is false
        view.handleResponse "<h4 class=\"alert-heading\">No Random samples to infer From!</h4>Please generate some random samples in Step 2. ", "error", "controller-content"
      else
        view.toggleControllerHandle "hide"
        PubSub.publish "toggleLoadingSpinner" ,{action:'show'}
        setTimeout socr.controller.setDotplot, 500
                
      return

    $(__inferenceVariableDOMSelector__).on "change", ->
      if $(this).val() is "Mean" or $(this).val() is "Count"
        $(__inferenceDatasetIndexDOMSelector__).attr "disabled", false
      else
        $(__inferenceDatasetIndexDOMSelector__).attr "disabled", true
      return

    $(__inferenceAnalysisDOMSelector__).on "change", ->
      if socr.analysis[$(this).val()] isnt "undefined"
        el = ""
        $.each socr.analysis[$(this).val()]["variables"], (key, value) ->
          el += "<option value=\"" + value + "\">" + value.replace("-", " ") + "</option>"
          return

        $(__inferenceVariableDOMSelector__).html el
      return

    $(".update").on "click", ->
      val = []
      $.each $(".nValues"), (k, v) ->
        val.push $(v).val()
        return

      socr.model.setN val
      return

    try
      $(".controller-popups").popover html: true
    catch e
      console.log e.message
    return


  ###
  @method: step()
  @description: It generates 1 random sample with animation effect showing the generation.
  @dependencies: view.animate()
  ###
  step: ->
    $(__accordionDOMSelector__).accordion "activate", 1

    #socr.view.toggleControllerHandle("hide");
    view.disableButtons() #disabling buttons
    try
      model.generateSample() #generate one sample
      $(".removable").remove() #remove the previously generated canvas during animation
      PubSub.publish "randomSampleGenerationComplete", {'sampleCount':model.getRSampleCount()}
    catch e
      console.log e
    view.enableButtons()
    return


  #view.animate({
  #     stopCount:$('#nSize').val(),
  #     speed:$('#speed').val(),
  #     indexes:keys.indexes,
  #     datasetIndexes:keys.datasetIndexes
  #   });
  #show sample generation animation

  ###
  @method: run()
  @description:It generates X random sample with animation effect showing the generation.
  ###
  run: ->
    #this should go through model event.
    model.set "stopCount" , $("#countSize").val() #save the stopcount provided by user
    compute = ->
        PubSub.publish "randomSampleGenerationStarted"        
        # d = Date()
        #console.log "start" + _runsElapsed + d
        console.log "stop count: " + model.get "stopCount"
        _generate()
        _id = setInterval(_generate, MIN_SAMPLE_GENERATION_STEP_TIME)
        return
    #throw warning if datapoints cross threshold.
    if model.aboveThreshold() 
      $("<div></div>").appendTo("body").html("<div><h6>Caution: Your dataset and sample count selection may consume too much memory causing the tab to become unresponsive. Do you wish to continue?</h6></div>").dialog
        modal: true
        title: "Warning!"
        zIndex: 10000
        autoOpen: true
        width: "auto"
        resizable: false
        buttons:
          Yes: ->
            compute()
            $(this).dialog "close" #close the confirmation window
            return

          No: ->
            $(this).dialog "close"
            return

        close: (event, ui) ->
          $(this).remove()
          return

    else
      compute()
        

  ###
  @method: stop()
  @description:It resets the setInterval for _generate() ans halts the random sample generation immediately.
  ###
  stop: ->
    d = Date()
    console.log "end" + _runsElapsed + d

    PubSub.publish "randomSampleGenerationStopped", {}

    clearInterval _id #stop the setinterval function
    _runCount = 0
    _runsElapsed = 0 #reset the runelapsed count
    return


  ###
  @method: reset()
  @description:It resets the application by clearing the appModel and appView.
  ###
  reset: ->
    $("<div></div>").appendTo("body").html("<div><h6>Are you sure you want to reset everything? Data will be lost!</h6></div>").dialog
      modal: true
      title: "Reset Data?"
      zIndex: 10000
      autoOpen: true
      width: "auto"
      resizable: false
      buttons:
        Yes: ->
          _this.stop()
          model.reset()
          socr.exp.current = {} #deleting the current experiment instance
          view.toggleControllerHandle "hide"
          socr.dataTable.simulationDriven.resetScreen()
          $(this).dialog "close" #close the confirmation window
          return

        No: ->
          $(this).dialog "close"
          return

      close: (event, ui) ->
        $(this).remove()
        return

    return

  ###
  @description : When user clicks "infer" button, setDotplot is triggered.
  ###
  setDotplot: (precision)->    
    inferenceDatasetIndex = parseInt($(__inferenceDatasetIndexDOMSelector__).val())
    inferencePrecision = $(__inferencePrecisionDOMSelector__).val() || 4
    
    console.log "setdotplot started", "variable:" + $(__inferenceVariableDOMSelector__).val()
    
    model.setInferenceSettings
      analysis: $(__inferenceAnalysisDOMSelector__).val()
      variable: $(__inferenceVariableDOMSelector__).val()
      precision: inferencePrecision
      index: inferenceDatasetIndex
    return

  ###
	@method: loadController()
	@description: Single point of contact to load the controller tab and set the dataset
	###

  loadController: (setting) ->
    result = undefined
    return false  if typeof setting isnt "object"
    if setting.to is "dataDriven"
      socr.controller.setCurrentMode setting.from  if setting.from isnt "undefined"
      PubSub.publish "Datadriven controller loaded"

      #If experiment , then check for data
      _name = ""
      if setting.from is "Experiment" and not $.isEmptyObject(socr.exp.current) and socr.exp.current.getDataset() isnt ""
        console.log "simulation drive has some data"
        result = model.setDataset(
          keys: socr.exp.current.getDatasetKeys()
          values: socr.exp.current.getDatasetValues()
          processed: true
        )
      else if setting.from is "spreadSheet"
        _name = "Data Driven Experiment"
        result = model.setDataset(setting.data)
      else
        return
      if result is true
        view.updateSimulationInfo _name
        view.toggleControllerHandle "show"
        model.setN()
        view.createControllerView()
      return


  setCurrentMode: (mode) ->
    _currentMode = mode  unless mode is `undefined`
    true

  getCurrentMode: ->
    _currentMode
#return
