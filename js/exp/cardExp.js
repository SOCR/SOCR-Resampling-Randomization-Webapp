	Playing Card Experiment
 	Revised from Distributome Card Experiment into a separate module

 	Notes:
 		1. Avoid using this in private/public methods.There is only a single instance and its methods can be accessed using the name,ie, cardExp
 		2. No need to immediately invoke it
 		
 	@dependencies:
 		1. Uses methods of core.js,appController.js,appModel.js,appView.js
 		2. Uses intrinsic names of Element Ids mentioned in index.html
 		*/
socr.exp.cardExp = function(){
//::::::: PRIVATE PROPERTIES :::::::::::::::
var _stepID;
var _nParam;		//User defined Parameters..bound to the buttons on the controller tile
var  _n = 12;
var _deck, _hand, _suit, _value;
var _d, _count;
var _K=null;
var clickFlag = false;

var _width='79';
var _height='123';
//::::::PRIVATE METHODS:::::::::::::

function _dealCard(){
	if (_tempK < _K){
		var _datum=_d[_tempK][_tempN];
		_hand[_count].setValue(_datum);
		_datasetValues[_tempK][_tempN]=_datasetKeys[_tempK][_tempN]=_datum;
		_count++;
		_tempN++;
		if (_tempN==_n) {
			_tempK++;_tempN=0;
			if(_tempK!=_K){
				_datasetKeys[_tempK]=[];
				_datasetValues[_tempK]=[];
			}
		}
	}
	else{
		console.log("Card Generated Dataset : "+_datasetValues + "-- socr.exp.cardExp.js");
		console.log(_datasetKeys); 
		console.log(_datasetValues);
        socr.view.updateCtrlMessage("dataset generated successfully.","success");
        PubSub.publish("Initial dataset generated");
		$("#grsbutton").removeClass("disabled");
		$("#sdbutton").removeClass("disabled"); 
		clickFlag = false;
		socr.exp.cardExp.reset();
	}
}



return{
	name:'cardExp',
	type:'card',
	description:'The card experiment consists of dealing n cards at random (and without replacement) from a standard deck of 52 cards. The cards (X1,X2,…,Xn) are recorded on each run. The parameter n can be varied from 1 to 12 with the input control.',
	initialize: function(){
		//socr.exp.cardExp=socr.exp.cardExp;
		_nParam = new Parameter(document.getElementById("nInput"), document.getElementById("nLabel"));
		_nParam.setProperties(1, 10, 1, _n, "<var>n</var>");
		
		socr.exp.cardExp.reset();

		$("#sdbutton").on('click',function(){
			if( clickFlag === false){
				clickFlag = true;
			}
			else {
				console.log(clickFlag);
				return false;
			}	
			$("#grsbutton").addClass("disabled");
			$("#sdbutton").addClass("disabled");	
			socr.exp.cardExp.generate();		
			$("#accordion").accordion( "activate" , 1);
		});

		$('#nInput').on('change',function(){
			socr.exp.current.setVariable();
		});

		$('#grsbutton').on('click',function(){
			if(_datasetValues.length!=0)
				{
					socr.controller.loadController({to:'dataDriven',from:'Experiment',expName:'binomialCoin'});	//Loads the data into the appModel .
					socr.view.updateSimulationInfo();		//updates experiment info into third tile in the accordion
				}
			else
				$('.controller-warning').html('<div class="alert alert-error"><a class="close" data-dismiss="alert" href="#">x</a><h4 class="alert-heading">Dataset NOT generated!</h4>Please click the adjacent "Generate Dataset!" button first.</div>');
			});
		PubSub.unsubscribe(socr.exp.current.initialize);
	},
	
	generate: function(){
		socr.view.updateSimulationInfo();		//updates experiment info into third tile in the accordion
		socr.exp.cardExp.setVariable();
		socr.exp.cardExp.createDataPlot(_n);			//create the canvas fro the dataset
		$(".device-container").width(_width);
		$(".device-container").height(_height);
		
		// variable initialization
		_count = 0; _arrCount=0;_datasetValues=[];_datasetKeys=[],_d=[],_tempK=0,_tempN=0,_datasetValues[0]=[],_datasetKeys[0]=[];

		// initializing the deck	
		_deck = new Array(52);
		for (var i = 0; i < 52; i++){
			_deck[i] = i + 1;
		}
		//initializing the hand for all the K datasets of size _n each
		_hand = new Array(_n*_K);
		
		//creating the canvas for all the devices(cards)
		for(var i=0;i<_K;i++){
			for (var j=0;j< _n;j++){
				_hand[_arrCount] = new Card(document.getElementById("device" + i+j));
				_arrCount++;	
				}	
			//creating the sample 
			_d[i] = sample(_deck, _n, 0);		
			}
		
		_stepID = setInterval(_dealCard, 70);
	},

	reset:function(){
		clearInterval(_stepID);
		socr.exp.cardExp.setVariable();
	},

	createControllerView:function(){
		console.log("createControllerView for socr.exp.cardExp executed!");
		config={};
		$.get("partials/exp/cardExp.tmpl",function(data){
			var config = {};
            var html = Mustache.render(data,config);
			$('#controller-content').delay(1000).html(html);
			$('.popups').popover();
			try{
				$('.tooltips').tooltip('destroy');	// destroy first and bind tooltips again. UI bug: the "back to generateDataset" (back button) tooltip doesnt vanish after mouse click.
			}
			catch(err){
				console.log(err.message);
			}
			$('.tooltips').tooltip();
			$( "#kValue-slider" ).slider({
				value: 1,
				min: 1,
				max: 10,
				step: 1,
				slide: function( event, ui ) {
				$( "#kValue" ).html( ui.value );
				}
			});
			PubSub.publish("controller view for cardExp created");
		});
	},

	createDataPlot:function(size){
		var temp=[];
		for(var i=0;i<_K;i++){
			temp.push('<div class="dataset-container ');
			if(i%2===0){
				temp.push(' highlight');
			}
			temp.push('" id="dataset-');
			temp.push(i);
			temp.push('">');
			for(var j=0;j<size;j++){
				temp.push('<div class="device-container ');
				temp.push('" id="device');
				temp.push(i);temp.push(j);
				temp.push('-container">');
				temp.push('<canvas id="device');
				temp.push(i);temp.push(j);
				temp.push('" class="device panel front');
				temp.push(i);temp.push(j);
				temp.push('" width="');
				temp.push(_width);
				temp.push('" height="');
				temp.push(_height);
				temp.push('" title="sample');
				temp.push(i);temp.push(j);
				temp.push('">Card');
				temp.push(i);temp.push(j);
				temp.push('</canvas>');
				temp.push('</div>');
			}//for loop
			temp.push("</div>");
		}//for loop	
		$('#dataset').html(temp.join(''));
	},
	setVariable:function(){
	_n = _nParam.getValue();
	try{
			_K=parseInt($("#kValue").html());
			console.log("k value"+_K);
		}
		catch(err){
			console.log(err.message);
			_K=null;
		}
	},
	getDataset:function(){
		return {"keys":_datasetKeys,"values":_datasetValues,"processed":true};
	},
	getDatasetKeys:function(){
		return _datasetKeys;
	},
	getDatasetValues:function(){
		return _datasetValues;
	},
	getDatasetSize:function(){
	return _n;
	},
	getSampleHW:function(){
	return {"height":_height,"width":_width};
	}
  }//return	
}();
