/**
*  appModel.js is the model object for the SOCR app.
*
*@author: selvam , ashwini 
*
*SOCR - Statistical Online Computational Resource
*/

var appModel=function(){
//::::::: PRIVATE PROPERTIES :::::::::::::::
	var _stopCount = 1000;			//Number of runs to be made when 'run' button is pressed 
	var _count=0;				//keeps count of number of samples generated from start
	var _dataset=['1','2','3','4','5','6','7','8','9','10'];			// All the input datapoints from wich bootstrap sample is generated
	var _n=50;				//Number of datapoints in a bootstrap sample or Sample Size
	var bootstrapSamples=new Array();	//Contains all the bootstrap samples generated E,g., H,T,T,T,H,H,T.
	var bootstrapSampleValues=new Array(); //Contains all the bootstrap sample's value generated E,g., 1,0,0,0,1,1,0.
	//var variables;				//number of variables
	/*TODO: make the datasetKeys and datasetValues multidimensional to account for [Issue #4].
	*/
	var _datasetKeys=[];
	var _datasetValues=[];
	var _sampleMean=[];
	var _sampleCount=[];
	var _sampleStandardDev=[];
	var _samplePercentile=[];
	
/*
 IF EVENT DISPATCH MODEL IS TO BE IMPLEMENTED
	subject = new LIB_makeSubject(['generateSamples','generateSample']); //list of all the events with observer pattern
*/

/* PRIVATE METHODS   */
	/**
	*@method: [private] _getRandomInt()
	*@desc:  returns a random number in the range [min,max]
	*@return: Random number
	*/
	function _getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min )) + min;
	}

	/**
	*@method: [private] _generateMean()
	*@param:  sampleNumber - the random sample number for which the mean is to be calculated
	*@desc: 
	*@return: the calculated mean value
	*/
	function _generateMean(sampleNumber){
		var total=_generateCount(sampleNumber);
		return total/bootstrapSampleValues[sampleNumber].length;
	}
	
	/**
	*@method: [private] _generateCount()
	*@param:  sampleNumber - the random sample number for which the count is to be calculated
	*@desc: 
	*@return: the calculated total count value for the sample
	*/
	function _generateCount(sampleNumber){
		var x=bootstrapSampleValues[sampleNumber];
		var total=0;
		for(var i=0;i<x.length;i++) 
			{ total += parseInt(x[i]); }
		return total;
	}
	
	/**
	*@method: [private] _generateStandardDev()
	*@param:  sampleNumber - the random sample number for which the mean is to be calculated
	@dependencies: _generateMean()
	*@return: the calculated mean standard deviation
	*/
	function _generateStandardDev(sampleNumber){
		//formula used here is SD= ( E(x^2) - (E(x))^2 ) ^ 1/2
		var _mean=_generateMean(sampleNumber) ;			//E(x)
		var _squaredSum=null;							//stores E(x^2)
		var _sample=bootstrapSampleValues[sampleNumber];
		for(var i=0;i<_sample.length;i++)
			{
				_squaredSum+=_sample[i]*_sample[i];
			}
		_squaredSum=_squaredSum/_sample.length;
		//console.log("_squaredSum"+_squaredSum+"--- _mean:"+_mean);
		var _SD=Math.sqrt(_squaredSum-(_mean)*(_mean));
		return _SD;
	}
	
return{
	/* PUBLIC PROPERTIES   */
	bootstrapSamples:bootstrapSamples,
	bootstrapSampleValues:bootstrapSampleValues,
	
	/* PUBLIC METHODS   */
	/*
	addObserver:subject.addObserver(),
	removeObserver:subject.removeObserver()
	*/    
    
    /**
	*@method: [public] generateTrail()
	*@desc:  Generating a random number between 0 and dataSet size {@ashwini: I think this should be a private function}
	*/
	generateTrail:function(){
		randomIndex=_getRandomInt(0, _datasetValues.length);	//generating a random number between 0 and dataSet size 
		return {
			key:_datasetKeys[randomIndex],
			value:_datasetValues[randomIndex],
			index:randomIndex
			};			//returning the generated trail into a bootstrap sample array
	},
    
	/**
	*@method: [public] generateSample()
	*@desc:  rgenerating a random number between 0 and dataSet size 
	*/
	generateSample:function(){
		var j=$('#nSize').val();				
		var sample=[];
		var values=[];
		while(j--)
			{
			var temp=this.generateTrail();
			sample[j]=temp.key;	//inserting the new sample
			values[j]=temp.value;
			}
		bootstrapSamples[_count]=sample;
		bootstrapSampleValues[_count]=values;
		//console.log(_count+':'+bootstrapSamples[_count]);
		_count++;		//incrementing the total count - number of samples generated from start of simulation
	},
	
	/**
	*@method: [public] generateStep()
	*@desc:  executed when the user presses step button in the controller tile. The click binding of the step button is done in the {experiment}.js
	*@dependencies: generateTrail()
	*/
	generateStep:function(){
		var j=$('#nSize').val();
		var sample=[];
		var values=[];
		var indexes=[];
		while(j--)
			{
			//bootstrapSamples[_count][j]=this.generateTrail();
			var temp=this.generateTrail();
			sample[j]=temp.key;	//inserting the new sample
			values[j]=temp.value;
			indexes[j]=temp.index;
			}
		bootstrapSamples[_count]=sample;
		bootstrapSampleValues[_count]=values;
		//bootstrapSamples[_count]= new Array(sample);
		//console.log(_count+' random sample:'+sample);
		_count++;
		return indexes;
	},
	
	/**
	*@method: [public] getMean()
	*@desc:  executed when the user presses "infer" button in the controller tile. The click binding of the step button is done in the {experiment}.js
	*@dependencies: generateTrail()
	*/
	getMean:function(){
		if(_sampleMean.length==bootstrapSampleValues.length)
			return _sampleMean;
		else{
			for(var j=_sampleMean.length;j<_count;j++)
				{
				_sampleMean[j]=_generateMean(j);
				}
				return _sampleMean;
			}
		},
	
	/**
	*@method: [public] getMeanOf()
	*@desc:  executed when the user presses "infer" button in the controller tile. The click binding of the step button is done in the {experiment}.js
	*@dependencies: generateTrail()
	*/	
	getMeanOf:function(sampleNumber){
		return _generateMean(sampleNumber);
	},
	getMeanOfDataset:function(){
		var total=0;
		for(var i=0;i<_datasetValues.length;i++) 
			{ total += parseInt(_datasetValues[i]); }
		total=total/_datasetValues.length;
		if(isNaN(total)){return false;}else{return total;}



	},
	
	getStandardDev:function(){
		//if the _sampleStandardDev already has the values
		if(_sampleStandardDev.length==bootstrapSampleValues.length)
			return _sampleStandardDev;
		else
		{
		for(var j=_sampleStandardDev.length;j<_count;j++)
			{
			_sampleStandardDev[j]=_generateStandardDev(j);
			//console.log(_sampleStandardDev[j]);
			}
			return _sampleStandardDev;
		}	
	},
	getStandardDevOf:function(sampleNumber){
		return _generateStandardDev(sampleNumber);
	},
	
	getSdOfDataset:function(){
		var _mean=this.getMeanOfDataset();
		var _squaredSum=null;
		for(var i=0;i<_datasetValues.length;i++)
			{
				_squaredSum+=_datasetValues[i]*_datasetValues[i];
			}
		_squaredSum=_squaredSum/_datasetValues.length;
		var _SD=Math.sqrt(_squaredSum-(_mean)*(_mean));
		console.log("SD of Dataset:"+_SD);
		return _SD;
	},
	getCounts:function(){
		console.log("getCount() invoked");
		for(var j=0;j<_count;j++)
			{
			_sampleCount[j]=_generateCount(j);
			console.log(_sampleCount[j]);
			}
			return _sampleCount;
		
	},
	
	getCountOf:function(sampleNumber){
		return _generateCount(sampleNumber);
	},
	getCountOfDataset:function(){
		var total=0;
		for(var i=0;i<_datasetValues.length;i++) 
			{ total += parseInt(_datasetValues[i]); }
		//console.log("total :"+total);	
		return total;
	},

	/**
	*@method:getPercentile ()
	*@param: pvalue - what is the percentile value that is to be calculated.
	*/
	getPercentile:function(pvalue){
	console.log("getPercentile() invoked");
	//if(_samplePercentile.length==bootstrapSampleValues.length)
	//		return _samplePercentile;
	//else
	//	{
		for(var j=0;j<_count;j++)
			{
			_samplePercentile[j]=this.getPercentileOf(j,pvalue);
			//console.log(_samplePercentile[j]);
			}
			return _samplePercentile;
	//	}
		
	},
	getPercentileOf:function(sampleNumber,pvalue){
	var temp=bootstrapSampleValues[sampleNumber].sort(function(a,b){return a-b});
		var position=Math.floor(bootstrapSampleValues[sampleNumber].length*(pvalue/100));
		//console.log(pvalue);
		//console.log(bootstrapSampleValues[sampleNumber]+"---"+position);
		
		return temp[position];
	},
	getPercentileOfDataset:function(pvalue){
		var temp=_datasetValues.sort(function(a,b){return a-b});
		var position=Math.floor(_datasetValues.length*(pvalue/100));
		return temp[position];
	},
	
	
	/**
	*   NOT USED ANYWHERE ....TODO: REMOVE
	*/
	error:function(x){
		switch (x){
		case('inputMissing'):
		alert("Missing input data!");    
		break;
	
		case('inputMissing'):
		alert("Missing data!");    
		break;
		}
	},
	
	/**
	*@method: [public] getDataset()
	*@desc:  getter and setter funtion for dataSet variable. 
	*@dependencies: generateTrail()
	*/
	getDataset:function(){
		if(_datasetKeys)
			return _datasetKeys;
		else
			return false;
	},
	/**
	*@method: setDataset
	*@param: input 
	*@description: sets the data from the input sheet into the app model
	*/
	setDataset:function(input){
		//check for input values...if its empty...then throw error
		console.log('setDataSet() invoked!');
		console.log('Input Data :'+input.data);
		console.log('Input Type :'+input.type);
		console.log('Input Range :'+input.range);
		console.log('Input Values :'+input.values);
	//input.processed is true incase of a simulation -> data mode switch
		if(input.processed)
			{
				_datasetKeys=input.data;
				_datasetValues=input.values;
				console.log('Simulation data is loaded now.');
				return false;
			}
		else if(input.type=='url')
			{
			//both _datasetValues and _datasetKeys will have the same values
				_datasetValues=input.data.split(",");
				console.log('Simulation data is loaded now.');
				return false;
			}
		else if(input.type=='getData' || input.type=='getSelected')
			{
			_datasetValues=[];			//emptying the array
			_datasetKeys=[];
			//iterate through rows
			/*for(var i=input.range[0];i<=input.range[2];i++)
				{
					for(var j=input.range[1];j<=input.range[3];j++)
						{
						if (input.data[i][j] != '')
							{         
							_datasetValues.push(input.data[i][j]);
							}
						}
				}
			*/
			for (var i = 0; i < input.data.length; i++)
				{
				for(var j = 0; j < input.data[i].length; j++)
					{
						if (input.data[i][j] != '')
						{         
							_datasetValues.push(input.data[i][j]);
							
						}
					}
				}
			console.log(_datasetValues.length);
			if(_datasetValues.length==0)
				{
					_datasetValues=0;
					console.log("returning false");
					return false;
				}
			else{
					_datasetKeys=_datasetValues;
					console.log("returning true");
					console.log('Data is loaded now. Data :' + _datasetValues);
					return true;
				}

		}
	},
    /**
	*@method: [public] getSample()
	*@desc:  getter and setter funtion for dataSet variable. 
	*@dependencies: generateTrail()
	*/
	getSample:function(index){
		return bootstrapSamples[index];
	},
	
	getSamples:function(){
		return bootstrapSamples;
	},
	/**
	*@method: [public] getSampleValues()
	*@desc:  getter and setter funtion for dataSet variable. 
	*@dependencies: generateTrail()
	*/
	getSampleValue:function(index){
		return bootstrapSampleValues[index];
	},
	
	getSampleValues:function(){
		return bootstrapSampleValues;
	},
	/*  getter and setter for variable '_stopCount'  */
	setStopCount:function(y){
		//alert(y);
		_stopCount=y;
	},
	getStopCount:function(){
		return _stopCount;
	},
	
	/*  getter and setter for variable '_n'  */
	setN:function(z){
		_n=z;
	},
	getN:function(){
		return _n;
	},
	/*  getter and setter for variable '_count'  */
	setCount:function(v){
		_count=v;
	},
	getCount:function(){
		return _count;
	},
	reset:function(){
		//dataset values deleted
		_datasetKeys=[];
		_datasetValues=[];
		this.resetVariables();
		//random samples deleted
		//this.bootstrapSamples=[];
		this.bootstrapSampleValues=[];
		//setting the global random sample count to 0
		this.setCount(0);
		//Triggering view reset
		view.reset();
	},
	resetVariables:function(){
		_sampleMean=[];
		_sampleStandardDev=[];
		_samplePercentile=[];
		_sampleCount=[];
	}
	
}//return
};
