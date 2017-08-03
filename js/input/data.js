socr.dataTable = function () {

    $dataTable = $('#input');
    var $controls = $('section.controls');
    $parent = $('div.spreadsheet');
    var $response = $('#status');

    // Drag and Drop site
    $drop = $('#drop');
    $boxsection = $('#fetchURL');
    $urlbox = $boxsection.find('input[name="urlbox"]');
    $urlsubmit = $boxsection.find('input[name="submit"]');
    // Default Method of entering data
    method = 'sync';

    var splashScreen = $('section#datadriven-splash');
    var excelScreen = $('section#datadriven-import');
    var importScreen = $('section#fetchURL');
    var backSplash = $('a.splash-datadriven');
    var worldbankContainer = $('section#worldbank');
    var simulationDetails = $('section#simulationdriven-details');
    var datastage = $('section#datadriven-stage');
    var resetStage = $('.reset-stage');
    var stageList = $('table.stage-list tbody');
    var lastColselected = false;

    splashScreen.find('ul li a').on('click', function () {

        switch ($(this).attr('data-rel')) {

        case 'spreadsheet':
            view.toggleScreens({
                visible: excelScreen
            });
            break;
        case 'fetch':
            view.toggleScreens({
                visible: [excelScreen, importScreen]
            });
            $urlbox.focus();
            break;
        case 'worldbank':
            view.toggleScreens({
                visible: worldbankContainer
            });
            break;
        default:
            simulationDriven.init($(this).attr('data-rel'));
        }
    });

    var simulationDriven = {
        init: function (arg) {
            var expId = arg.substr(4);
        /* 
          ToDO : Verify .js extension addition in all browsers
        */
            // if($.inArray( expId, simulationDriven.expLoaded))
            //   simulationDriven.loadData(expId);
            // else
            simulationDriven.loadScript(expId);
        },
        expLoaded: [],
        loadScript: function (id) {
            $.getScript('js/exp/' + id + '.js', function () {
                simulationDriven.loadData(id)
            });
        },
        loadData: function (id) {
            $.getJSON('js/exp/experiments.json', function (res) {
                console.log(res.experiments);
                for (var i in res.experiments) {

                    if (id == res.experiments[i].id) {
                        simulationDriven.displayText({
                            title: res.experiments[i].name,
                            description: res.experiments[i].description
                        });
                        break;
                    }
                }
                simulationDriven.adjustModel(id);
            });
        },
        adjustModel: function (id) {
            socr.exp.current = socr.exp[id];
            PubSub.subscribe("controller view for " + id + " created", socr.exp.current.initialize);
            //socr.controller.setCurrentMode("simulationDriven");
            socr.exp.current.createControllerView();
            socr.view.toggleControllerHandle("show");
            simulationDriven.expLoaded.push(id);
            setTimeout(function () {
                PubSub.publish("Experiment loaded")
            }, 500);
        },
        displayText: function (details) {
            splashScreen.hide();
            excelScreen.hide();
            importScreen.hide();
            worldbankContainer.hide();
            simulationDetails.show().find('h3').text(details.title).parent().parent().find('.exp-dscp').html(details.description);
            // simulationDriven.
        },
        resetScreen: function () {
            view.toggleScreens({
                visible: splashScreen
            });
            socr.view.toggleControllerHandle("hide");
        }

    };
    //Settings
    var dragdrop = {
        init: function () {

            // $drop.on('dragover', dragdrop.cancel);
            $drop.on('dragenter', dragdrop.enter);
            $drop.on('drop', dragdrop.drop);
            $urlsubmit.on('click', dragdrop.urlboxsubmit);
            $boxsection.submit(dragdrop.urlboxsubmit);
            tableparse.switchMode();
        },
        enter: function (e) {
            $(drop).addClass('active');
        },
        drop: function (e) {
            console.log(e);
            if (e.preventDefault) e.preventDefault(); // stops the browser from redirecting off to the text.  
            drop.innerHTML = e.dataTransfer.getData('Text');
            var a = e.dataTransfer.getData('Text');
            tableparse.init(a);
        },
        cancel: function (e) {
            if (e.preventDefault) e.preventDefault(); // required by FF + Safari
            e.dataTransfer.dropEffect = 'copy'; // tells the browser what drop effect is allowed here
            return false; // required by IE
        },
        urlboxsubmit: function (e) {
            e.preventDefault();
            tableparse.init($urlbox.val());
        }
    };

    var tableparse = {
        init: function (url) {
            if (url.substr(0, 7) !== 'http://') {
                url = 'http://' + url;
            }
            //if (tableparse.checkRefer(url) === true) {
              if(true){
                url = "http://"+window.location.host+window.location.pathname+"/handler.php?url="+url;
                tableparse.notify();
                tableparse.request(url);
                return true;
            }
            return false;
        },
        notify: function () {
            view.displayResponse('Dataset request initialized, give us few seconds...', 'success');
        },
        checkRefer: function (url) {
            var requestHost = document.createElement("a");
            requestHost.href = url;

            if (window.location.hostname !== requestHost.hostname && url.indexOf('wiki.stat.ucla.edu') < 0) {
                view.displayResponse('Datasets should be on the same server with the same URL hostname', 'error');
                return false;
            } else {
                console.log('Dataset Server test passed')
                return true;
            }
        },
        request: function (uri) {
           console.log(uri); 
            $.get(uri, function (d) {
                d = JSON.parse(d);
                if(typeof d.status !== 'undefined' && d.status == 'failed'){
                  view.displayResponse('There was no valid table in the input URL.', 'error');
                  return false;
                }
                view.displayResponse('Done!', 'success');
                setTimeout(function () {
                  $response.slideToggle().html('');
                }, 2000);
                d = d.data;
                var tableCount = $(d).is('table') ? $(d).length : $(d).find('table').length,
                    tables = $(d).is('table') ? $(d) : $(d).find('table'),
                    table = tableparse.filterBySize(tables),
                    titles = tableparse.parseHeadings(table);
               
                matrix = tableparse.htmlToArray(table);
               
                $dataTable.handsontable({
                    startCols: 8,
                    minSpareCols: 0
                });

                // var inputMethod = tableparse.mode() === 'sync' ? 'loadDataSwift' : 'loadData';
                $dataTable.handsontable('loadData', matrix);

            }).fail(function () {
                view.displayResponse('There was an error loadin the dataset', 'error')
            });

        },

        filterBySize: function (arrayOfTables) {
            var sizes = [];
            $(arrayOfTables).each(function (i) {
                sizes.push([$(this).find('tr:last').index(), i])
            });
            var maxIndex = 0;
            for (k = 0; k < sizes.length - 2; k++) {
                if (sizes[k][0] < sizes[k + 1][0])
                    maxIndex = sizes[k + 1][1];
            }
            return arrayOfTables[maxIndex];
        },

        parseHeadings: function (html) {
            var title = [];
            $stats = $(html);
            var firstrow = $stats.find('tr').filter(':first');

            var element = firstrow.find('th').length > 0 ? 'th' : 'td';

            firstrow.find(element).each(function () {
                title.push($(this).text());
            });
            spreadSheet.addColHeaders(title);
            console.log(title + ' ' + element);
            return title;
        },

        htmlToArray: function (html) {
            var matrix = [];
            $stats = $(html);
            $stats.find('tr').each(function () {
                var row = [];
                $(this).find('td').each(function () {
                    row.push($(this).text());
                });
                matrix.push(row);
            });

            /*
            Check if the table has th elements instead
            @Todo
            */
            if (matrix[0][0] === '') {
                var row = [];
                $stats.find('tr').filter(':eq(0)').find('th').each(function (i, v) {
                    matrix[0][i - 1] = $(this).text();
                });
            }
            //Removed the first row by default
            matrix.splice(0, 1);
            return matrix;
        },
        /*
            Setter-Getter for mode toggling
         */
        mode: function (option) {
            if (arguments.length) {
                method = option;
            }
            return method;
        },

        switchMode: function () {
            $('#fetchinstant').click(function () {
                tableparse.mode('sync');
            });
            $('#fetchasync').click(function () {
                tableparse.mode('async');
            });
        }


    };
    /*
    Ideally should serve as one-stop object for all visual element changes involving datasets
    */
    var view = {
        displayResponse: function (content, type) {
            $response.html('').slideUp(300);
            $response.append(
                $('<div></div>')
                .addClass('alert')
                .html(content)
            ).slideDown(300);

            var $alertbox = $response.children('div');
            switch (type) {

            case "success":
                $alertbox.addClass('alert-success')
                    .prepend(' <i class="icon-ok"></i> ');
                break;

            case "error":
                $alertbox.addClass('alert-error')
                    .prepend(' <i class="icon-warning-sign"></i> ');
                break;
            }
        },
        editTitles: function () {

            var colHeader = $dataTable.handsontable('getColHeader');
            var content = '<form class="form form-horizontal" id="input-titles"><fieldset><legend>Add titles to Spreadsheet</legend>';

            if (colHeader[0] !== '') {
                for (var i = 0; i < colHeader.length; i++) {
                    // var label = (colHeader[i] !== '') ?  : '';
                    content += '<div class="control-group"><label class="control-label">Column ' + i + ' :</label><div class="controls"><input type="text" placeholder="Input field" value="' + colHeader[i] + '"></div></div>';
                }
            } else {
                var k = 0;
                while (k < colHeader.length) {
                    content += '<div class="control-group"><label class="control-label">Title ' + k + '</label><div class="controls"><input type="text" placeholder="Input field"></div></div>';
                    k++;
                }
            }

            content += '<div class="pagination-centered"><input type="submit" class="btn btn-large btn-block"></div></form>';
            $('#input-modal .modal-body').html(content);
        },
        parseTitles: function (e) {
            e.preventDefault();
            console.log('Call for parse Titles');
            var titles = [];
            $('#input-titles').find('input[type="text"]').each(function () {
                titles.push($(this).val());
            });
            spreadSheet.addColHeaders(titles);
            $('#input-modal').modal('toggle');
            view.displayResponse('Titles altered successfully', 'success');
        },
        handleRemoveCol : function(e){
            e.preventDefault();
            var index = parseInt($('#remove-col').find('input[type="text"]').val());
            spreadSheet.removeCol(index);
            $('#input-modal').modal('toggle');
            view.displayResponse('Column '+ index +' removed', 'success');
        },
        removeCol : function(){
            var content = '<form class="form form-horizontal" id="remove-col"><fieldset><legend>Remove Column By Index</legend>';
           
            content += '<div class="control-group"><label class="control-label">Column Index </label><div class="controls"><input type="text" placeholder="Column Index (0/1/2/3..)" ></div></div>';

            content += '<div class="pagination-centered"><input type="submit" class="btn btn-large btn-block"></div></form>';
            $('#input-modal .modal-body').html(content);
        },
        toggleScreens: function (options) {

            var splashScreen = $('section#datadriven-splash'),
                excelScreen = $('section#datadriven-import'),
                importScreen = $('section#fetchURL'),
                datastage = $('section#datadriven-stage'),
                simulationDetails = $('section#simulationdriven-details'),
                worldbankContainer = $('section#worldbank'); 

            var dataScreens = [splashScreen, excelScreen, importScreen, worldbankContainer, simulationDetails, datastage];

            $.each(dataScreens, function (k, v) {
                v.hide();
            });

            $.each(options.visible, function (k, v) {
                $(v).show();
            });

        }

    };
    /*
    Hookups for spreadsheet opterations
    */
    var spreadSheet = {

        init: function () {
            /*
      Spreadsheet generation code, pretty much self explanatory
      */
            $dataTable.handsontable({
                minCols: 8,
                minRows: 8,
                minSpareCols: 1,
                minSpareRows: 1,
                fillHandle: true,
                colHeaders: true,
                rowHeaders: true,
                manualColumnResize : true,
                width: 700,
                height: 320,
                outsideClickDeselects : false,
                contextMenu:true
            });

            //Temporary solution to remove multiple table headers
            // $dataTable.find('tr.htColHeader')[1].remove()

            //    $dataTable.handsontable({colHeaders : true})
        },

        validate: function (dataset) {
            if (dataset.length > 0) {

                if (dataset[0][0] === '' && dataset[1][0] === '' && dataset[2][0] === '') {

                    view.displayResponse('Dataset appears to be empty', 'error');
                    return false;

                }

                return true;

            } else {

                view.displayResponse('Empty Dataset, Please fill in from the first column ', 'error');
                return;
            }


        },

        addColHeaders: function (arr) {
            $dataTable.handsontable({
                colHeaders: arr
            });
        },

        removeCol : function(index){
             $dataTable.handsontable('alter', 'remove_col', index);
             spreadSheet.refresh();
        },

        addTitles: function () {

            $('<div></div>').appendTo('body')
                .addClass('modal hide fade')
                .html('<div class="modal-header"><div>')


        },

        firstRowTitles: function () {
            var firstrow = $dataTable.handsontable('getDataAtRow', 0);
            spreadSheet.addColHeaders(firstrow);
            $dataTable.handsontable('alter', 'remove_row', 0);
            view.displayResponse(' Title successfully adjusted ', 'success');

        },
        parseAll: function () {
            var dataset = $dataTable.handsontable('getNonEmptyData');
            socr.model.reset();

            $("#accordion").accordion("activate", 0);


            if (spreadSheet.validate(dataset)) {
                // model.setDataset({
                //   data: dataset,
                //   range: 1,
                //   type: 'getData',
                //   processed: false,
                // });

                console.log('Dataset is valid')
                view.displayResponse(' Entire dataset is selected ', 'success');

                socr.view.toggleControllerHandle("show");
                //select.selectAll();
            } else {
                console.log("Dataset isn't valid")
                // view.displayResponse(' There is some error in the dataset ', 'error');  
            }
        },
        refresh : function(){
             $dataTable.handsontable({});
             $dataTable.find('tr.htColHeader')[1].remove()
        },

        parseSelected: function () {

            if (select.isSelected()) {
                var selectedCoords = select.isSelected();
                
           //  Selected Cells:
           // [ startrow , startCol, endRow, endCol ]
          
            }
                
            console.log(selectedCoords);
              if (selectedCoords) {

                console.log(' Select Data request with  ' + selectedCoords)
                var dataset = $dataTable.handsontable('getData', selectedCoords[0], selectedCoords[1], selectedCoords[2], selectedCoords[3]);
                $("#accordion").accordion("activate", 0);

                //LoadController called once when 'proceed' is clicked.
                /*try {
                    socr.controller.loadController({
                        to: 'dataDriven',
                        from: "spreadSheet"
                    });
                } catch (e) {
                    console.log(e.message)
                }*/
                socr.view.toggleControllerHandle("hide");
                if (spreadSheet.validate(dataset)) {
                    //  model.setDataset({

                    //   data: dataset ,
                    //  ra nge:selected,
                    //   type: 'getSelected',
                    //   processed: false

                    //   });

                    var title = '';
                    if ($dataTable.find('th')) {
                        title = $dataTable.find('th.active').text();
                    }
                    stage.addRow(dataset, title)
                    console.log(title)
                    view.displayResponse('Data added to staging, continue adding more data or select <strong>Proceed</strong>', 'success');
                    // if(controllerSliderState!=0)
                    // $(".controller-handle").trigger("click");
                    select.selectCells(selectedCoords);
                }

            } else {

                view.displayResponse(' No cells are selected ', 'error');
            }

        },

        loadData : function(grid){

            $dataTable.handsontable('loadData',grid);
            view.displayResponse('Data loaded','success');
            
        },

       sort : function(){
            var d = $dataTable.handsontable('getData');
              /***
                Matrix Form
                row 1 
                row 2
               ***/
            var sorted = d.sort(spreadSheet.compare);
            $dataTable.handsontable('loadData', sorted);

            //Empty The Spreadsheet

            // setTimeout(function(){
            //     $dataTable.handsontable('clear');
            // }, 50);
          
            //Sort Data on basis of comparator

            //Reload the Spreadsheet
          
        },

        compare : function(a,b) {
          if (b[lastColselected] == '')
            return 1;
          if (a[lastColselected] == '')
            return -1;
          if (a[lastColselected]< b[lastColselected])
             return -1;
          if (a[lastColselected]> b[lastColselected])
            return 1;
          return 0;
        },

        reset: function () {
            $('<div></div>').appendTo('body')
                .html('<div><h6>Are you sure you want to reset the data?</h6></div>')
                .dialog({
                    modal: true,
                    title: 'Reset Data?',
                    zIndex: 10000,
                    autoOpen: true,
                    width: 'auto',
                    resizable: false,
                    buttons: {
                        Yes: function () {
                            //clear the input sheet 
                            $dataTable.handsontable('clear');
                            $dataTable.handsontable({
                                colHeaders: []
                            });
                            $response.html('<div class="alert"><a class="close" data-dismiss="alert" href="#">x</a>Clear! Enter some value to get started!</div>'); //display the message in the status div below the done and reset buttons
                            $(this).dialog("close"); //close the confirmation window
                            // $dataTable.handsontable({'colHeaders' : false});

                        },
                        No: function () {
                            $(this).dialog("close");
                        }
                    },
                    close: function (event, ui) {
                        $(this).remove();
                    }
                });
        }
    };

    /*
    All member functions that involve selecting / highlighting
  */
    var select = {

        selectCells: function (coords) {
            $dataTable.handsontable('selectCell', coords[0], coords[1], coords[2], coords[3]);
        },
        isSelected: function () {
            var coords = $dataTable.handsontable('getSelected');
            if (coords) {
                /*
          Simple check for deselected members as the getSelected method returns the coordinates of last cell worked on
        */
                if (coords[0] === coords[2] && coords[1] === coords[3]) {
                    return false;
                } else {
                    return coords;
                }
            }
            return false;
        },
        checkSelected: function () {
            if (select.isSelected()) {
                $('#submatrix_spreadsheet').removeAttr('disabled');
            }
        },
        selectAll: function () {
            console.log('SelectAll member function');
            $dataTable.handsontable('selectEntiregrid');
        }

    };

    var stage = {
        content: [],
        index: 1,
        init: function () {
            view.toggleScreens({
                visible: datastage
            });
            stage.showContent();
        },
        showExcel: function () {
            view.toggleScreens({
                visible: excelScreen
            });
        },
        showContent: function () {
            if (stage.content.length > 0) {
                stageList.html('');
                for (i in stage.content) {

                    var elem = stage.content[i].cells.length;
                    var name = stage.content[i].name;
                    var index = stage.content[i].id;
                    var content = '<tr><td>' + name + '</td><td> ' + elem + '</td><td>' + index + '</td></tr>';
                    stageList.append(content);

                }
            } else {
                stageList.html('');
                stageList.append('<tr:q:q><td>No Content Selected Yet</td><td></td><td></td></tr>')
            }
        },
        addRow: function (content, name) {
            var obj = {};
            obj.name = (name != '') ? name : content[0][0];
            obj.cells = content;
            obj.id = parseInt(stage.index);
            stage.content.push(obj);
            stage.index++;
            console.log(stage.content);
        },
        export: function () {
            console.log('Export the following datasets');
            console.log(stage.content);
            result = socr.controller.loadController({
              to: 'dataDriven',
                   from: "spreadSheet",
                   data:{
                    type: "spreadsheet",
                    values: stage.content,
                    range: stage.content.length,
                    processed: false
                   }
			});
        	return result;
		},
        reset: function () {
            stage.index = 1;
            stage.content = [];
            stage.showContent();
        }
    };
    //General Pattern
    // stage.content = {

    // id
    //   name : '',
    //   cells : []
    // }
    // stage.content.cell[0] = []

    resetStage.on('click', function (e) {
        e.preventDefault();
        stage.reset();
    });

    var worldbank = {
        
        init : function (){

            var req = {
                indicator : $('#indicator').val(),
                year1 : $('#year1').val(),
                year2 : $('#year2').val()
            }

            $('#worldbank-form').find('input[type="submit"]').attr('disabled', true);
            $('.worldbank-response').html('<div class="alert alert success">Loading...</div>');

            socr.input.worldbank.request(req);

            return false;

        },
        loadComplete : function() {

            $('#worldbank-form').find('input[type="submit"]').attr('disabled', false);
            $('.worldbank-response').html('');
             view.toggleScreens({
                visible: excelScreen
            });

        },
        errorLoading : function(){
            $('#worldbank-form').find('input[type="submit"]').attr('disabled', false);
            $('.worldbank-response').addClass('alert-error').html('There was an error requesting data');
        }
    };

    $controls.find('input[value="Use Entire Dataset"]').on('click', spreadSheet.parseAll);
    $controls.find('.reset-spreadsheet').on('click', spreadSheet.reset);
    $controls.find('input[value="Proceed"]').on('click', stage.init);
    datastage.find('input[value="Spreadsheet"]').on('click', stage.showExcel);
    datastage.find('input[value="Done"]').on('click', stage.export);
    $controls.find('#submatrix_spreadsheet').on('click', spreadSheet.parseSelected);
    backSplash.on('click', simulationDriven.resetScreen);

    $dataTable.parent().on('mouseup', select.checkSelected);
    $('a.dragdrop').on('click', function () {
        $('#fetchURL').slideToggle();
    });

    $controls.find('.edittitles').on('click', view.editTitles);
    $controls.find('.firstrowtitles').on('click', spreadSheet.firstRowTitles);
    $controls.find('.removecol').on('click', view.removeCol);
    $controls.find('#spreadsheet_sort').on('click', spreadSheet.sort);
    $('#worldbank-form').on('submit', worldbank.init);
    $('#input-modal').on('submit', '#input-titles', view.parseTitles);
    $('#input-modal').on('submit', '#remove-col', view.handleRemoveCol);

    $('.handsontable').on('mousedown', 'th:has(.colHeader)', function () {
        var colIndex = $('.handsontable').handsontable('getInstance').view.wt.wtTable.getCoords(this)[1];
        lastColselected = colIndex;
        $dataTable.handsontable('selectColumn', colIndex);

    });

    spreadSheet.init();
    dragdrop.init();

    return {
        simulationDriven: simulationDriven,
        spreadSheet: spreadSheet,
        view: view,
        worldbank : worldbank,
    };
}();
