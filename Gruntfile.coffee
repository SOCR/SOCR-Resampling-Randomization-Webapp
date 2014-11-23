module.exports = (grunt) ->
  
  # Project configuration.
  grunt.initConfig
    pkg: grunt.file.readJSON("package.json")

    coffee:
      compile:
        files:
          "js/appController.js": "js/appController.coffee"
          "js/appModel.js": "js/appModel.coffee"
          "js/appView.js": "js/appView.coffee"
          "js/appData.js": "js/appData.coffee"

          "test/spec/modelSpec.js": "test/spec/modelSpec.coffee"
          "test/spec/dataSpec.js": "test/spec/dataSpec.coffee"

    concat:
      css:
        src:[
          "css/bootstrap.css"
          "css/bootstrap-responsive.css"
          "css/stylePagination.css"
          "css/jquery-ui.css"
          "css/input/table.css"
          "css/jquery.jtweetsanywhere-1.3.1.css"
          "css/common.css"
          "css/bootstrapSwitch.css"
          "css/vis.css"
          "css/default-table.css"
          "css/input/jquery.handsontable.full.css"
          "css/chardinjs/chardinjs.css"
          "css/SOCR_Tools_style.css"
        ]
        dest:"dist/app.css"


    jasmine:
      #ideally the src should concatenated files.
      src: ["js/init.js","js/lib/jquery.min.js","js/utils.js","js/lib/jquery.pubsub.js","js/tools/Fcal.js","js/tools/Zcal.js","js/exp/core.js","js/appModel.js","js/appData.js"]
      options:
        specs: "test/spec/*Spec.js"

    jshint:
      files:"js/appController.js"


  # Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks "grunt-contrib-jasmine"
  grunt.loadNpmTasks "grunt-contrib-jshint"
  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-concat"

  # Default task(s).
  grunt.registerTask "build" , ["coffee","concat"]
  grunt.registerTask "compile", ["coffee"]
  grunt.registerTask "test", ["coffee","jasmine"]

