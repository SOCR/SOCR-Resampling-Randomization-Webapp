/*

	Binomial Coin Experiment
 	Revised from Distributome BinomialCoin Experiment by Selvam into a separate module

 	Notes:
 		1. Avoid using this in private/public methods.There is only a single instance and its methods can be accessed using the name,ie, binomialCoin
 		2. No need to immediately invoke it
 		
 	@dependencies:
 		1. Uses methods of core.js,appController.js,appModel.js,appView.js
 		2. Uses intrinsic names of Element Ids mentioned in index.html
 		*/
socr.exp.binomialCoin=function(){


//::::::: PRIVATE PROPERTIES :::::::::::::::
var _stepID;
var _pParam, _nParam; // binomialCoin is the distribution object
var _p = 0.5;	  		//Probability of heads (default value = 0.5)
var _N = 100;			//Maximum number of trials 
var _count;				//keeps count of number of coins tossed
var _n = 10; 			//Number of coin tossed for each step 
var _K=null;
var _keys=[];
var _values=[];
var _tempKeys=[];
var _tempValues=[];
var _datasetValues=[];
var _datasetKeys=[];
/*
*TODO : make the height and width dynamic according to the size of dataset generated.
*/
var _width='30';
var _height='30';

var _coin = [];
var _arrCount=0;

//::::::PRIVATE METHODS:::::::::::::

function _tossCoin(){
	if(_count<_n*_K)
			{   
				_values[_count]=_coin[_count].toss();
				if(_values[_count]=='1')
					_keys[_count]='H';
				else
					_keys[_count]='T';
				_tempValues[_count]=_values[_count];
				_tempKeys[_count]=_keys[_count];
				_count++;

			}
	else{
		//view.loadInputSheet(_values);
		for(var i=0;i<_K;i++)
			{
				var _start=i*_n;
				var _stop=_start+_n;
				_datasetValues.push(_tempValues.slice(_start,_stop));
				_datasetKeys.push(_tempKeys.slice(_start,_stop));	
			}
		//console.log(_datasetKeys); 
		//console.log(_datasetValues);
		$("#grsbutton").removeClass("disabled"); 
		socr.exp.binomialCoin.reset();
	}
}

//:::::::::::: PUBLIC METHODS :::::::::::::
return{
	name:"Binomial Coin Toss",
	type:"coin",
	description:"The random experiment consists of tossing n coins, each with probability of heads p. Random variable Y gives the number of heads, and random variable M gives the proportion of heads. These are recorded on each update in the data table. Either Y or M can be selected with the list box. The probability density function and moments of the selected variable are shown in blue in the distribution graph blue and are recorded in the distribution table. On each update, the empirical density function and moments of the selected variable are shown in red in the distribution graph and are recorded in the distribution table. The parameters n and p can be varied with scroll bars.",
    
    initialize: function(){
		_nParam = new Parameter(document.getElementById("nInput"), document.getElementById("nLabel"));
		_nParam.setProperties(1, _N, 1, _n, "<var>n</var>");
		_pParam = new Parameter(document.getElementById("pInput"), document.getElementById("pLabel"));
		_pParam.setProperties(0, 1, 0.01, _p, "<var>p</var>");
		socr.exp.binomialCoin.reset();
		// BINDING BUTTONS OF THE CONTROLLER
		$("#sdbutton").on('click',function(){
			//***clicking this button only generates the dataset...doesnt load it into the appModel. Clicking the grsbutton does that.
			$("#grsbutton").addClass("disabled");	
			socr.exp.binomialCoin.generate();		
			$("#accordion").accordion( "activate" , 1);
			view.updateCtrlMessage("dataset generated successfully.","success");
			
		});

		$('#nInput,#pInput').on('change',function(){
			socr.exp.binomialCoin.setVariable();
			});

		$('#grsbutton').on('click',function(){
			if(_values.length!=0)
				{
					$.update({to:'dataDriven'});	//Loads the data into the appModel .
					view.updateSimulationInfo();		//updates experiment info into third tile in the accordion
				}
			else
				$('.controller-warning').html('<div class="alert alert-error"><a class="close" data-dismiss="alert" href="#">x</a><h4 class="alert-heading">Dataset NOT generated!</h4>Please click the adjacent "Generate Dataset!" button first.</div>');
			});
	},

	generate: function(){
		
		socr.exp.binomialCoin.setVariable();
        socr.exp.binomialCoin.createDataPlot(_n);			//create the canvas fro the dataset
		//assign a coin object to each
		_count = 0; _arrCount=0;_values=[];_keys=[];_tempValues=[];_tempKeys=[];_datasetValues=[];_datasetKeys=[];		
		for(var i=0;i<_K;i++){
			for (var j=0;j< _n;j++){
				_coin[_arrCount] = new Coin(document.getElementById("device"+i+j));		
				_coin[_arrCount].prob = _p;
				_coin[_arrCount].setValue(-1);
				//console.log(i+"---"+j+_coin[_arrCount]);	
				_arrCount++;	
			}	
		}
		//run the Coin toss
		_stepID = setInterval(_tossCoin, 20);
	},
	reset: function(){
		clearInterval(_stepID);
		socr.exp.binomialCoin.setVariable();
 	},
	createControllerView:function(){
	console.log("createControllerView for binomialCoin executed!");
		var html='<p class="toolbar"><p class="tool"><span id="nLabel" class="badge badge-warning" for="nInput">N = </span><span id="nvalue"></span><input id="nInput" type="range" tabindex="7" class="parameter"/><i class="icon-question-sign popups" rel="popover" data-content=" n = number of coins to be tossed!" data-original-title="n"></i></p><p class="tool"><span id="pLabel" class="badge badge-warning" for="pInput">P = </span><span id="pvalue"></span><input id="pInput" type="range" tabindex="8" class="parameter"/><i class="icon-question-sign popups" rel="popover" data-content=" p = probability of getting a Head!" data-original-title="p"></i></p><select id="rvSelect" tabindex="9" title="Random variable" ><option value="0" selected="true">Y: Number of heads</option><option value="1">M: Proportion of heads</option></select><div><span class="badge badge-warning"> K=<span id="kValue">1</span></span><div id="kValue-slider" style="display:inline-block;width:50%;margin-left:5%"></div></div></p><button class="btn popups" id="sdbutton"  rel="popover" data-content="To generate random samples, first you need a dataset to start with. Once you generate it, go ahead and generate random samples!" data-original-title="Dataset">Generate DataSet!</button>&nbsp;<button class="btn btn-danger" id="grsbutton" >Generate Random Samples!</button><div class="controller-warning"></div>';
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
			value:1,
			min: 1,
			max: 10,
			step: 1,
			slide: function( event, ui ) {
			$( "#kValue" ).html( ui.value );
			}
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
				temp.push('">Coin');
				temp.push(i);temp.push(j);
				temp.push('</canvas>');
				temp.push('</div>');
			}
			temp.push("</div>");	
		}
		
		$('#dataset').html(temp.join(''));
		
	},
	
	setVariable:function(){
		_p = _pParam.getValue();
		_n = _nParam.getValue();
		try
			{
				_K=parseInt($("#kValue").html());
			}
			catch(err)
			{
				console.log(err.message);
				_K=null;
			}
	},
	
	getDataset:function(){
		//console.log("getDataset called:"+ _datasetKeys);
		return {"keys":_datasetKeys,"values":_datasetValues,"processed":true};
	},
	getDatasetKeys:function(){
		//console.log("getDatasetKeyscalled:"+ _datasetKeys);
		return _datasetKeys;
	},
	getDatasetValues:function(){
		//console.log("getDatasetValues called:"+ _datasetValues);
		return _datasetValues;
	},
	
	getDatasetSize:function(){
		return _n;
	},
	
	getSampleHW:function(){
	return {"height":_height,"width":_width};
	},
	getK:function(){
		if(_K === null)
			return false;
		else
			return _K;
	}
}//return
}();
