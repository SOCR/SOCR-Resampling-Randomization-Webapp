/** 
	The SOCR visualizations module
	Current Support 
		- histogram  - 4 methods of caluclating number of classes/bins
**/
socr.vis = (function(){
	//private properties and methods
	/*
		@Improve on setter - getter
	*/

	/**
		Priv is the private objects storing settings for the given instance
	**/
	var priv = {};


	// var generateLine = function(){

	// 	config = priv;
		
	// 	if(typeof config.parent == 'undefined' && config.parent == null){
	// 		displayError('Parent Selector not specified');
	// 		return;
	// 	}
	// 	if(typeof config.data == 'undefined' && config.data == null){
	// 		displayError('Dataset not specified');
	// 		return;
	// 	}
	// 	if(typeof config.data[0] != 'number' ){
	// 		displayError('Only numeric entries accepted');

	// 		return;
	// 	}
	// 	console.log('Initial Entry' + config.data[0]);

	//     var defaults = {
	//       'range' : d3.extent(config.data)
	//       'height' : $(config.parent).height(),
	//       'width' : $(config.parent).innerWidth(), // inner width of parent div
	//       'type' : 'histogram' ,//Keeping histogram as the default rendering mode
	//       'barWidth' : 10
	//     };


	//   /**
	//   * Initalized with an empty object, so that the contents of default are not replaced
	//   **/
	  
	// 	 var settings = $.extend({}, defaults, config);
		 
	// 	 priv.settings = settings;

	//    /**
	//    * Removing any unnecessary padding from the parent
	//    **/	
	//     $(config.parent).css('padding','0px');

	//     var margin = {top: 50, right: 30, bottom: 30, left: 50};

	    

	//     var width = settings.width,
	// 		height = settings.height;


	// 	var y = d3.scale.linear().domain([0, d3.max(data)]).range([0, height - margin.top - margin.bottom]);

		

	// 	var x = d3.scale.linear().domain([0,data.length]).range([0, width - margin.left - margin.right]);

	

	// 	//console.log(x(4))
	//     xAxis = d3.svg.axis()
	// 			.scale(x)
	// 			.orient("bottom")
	// 			.tickFormat(d3.format(',.2f'));

	//     yAxis = d3.svg.axis()
	//     		.scale(y)
	//     		.orient("left")
	//     		.tickPadding(5)
	//     		.ticks(10)
	//     		.tickSize(-(width - margin.right - margin.left), 2, 8);

	//      // Select the svg element, if it exists.
	//     var svg = d3.select(settings.parent).selectAll("svg").data([data]);

	//      // Update the outer dimensions.
	//     svg .attr("width", width)
	//         .attr("height", height);


	//     // Otherwise, create the skeletal chart.
	//     //This sequence is important
	//     var gEnter = svg.enter().append("svg").append("g");
	// 	    gEnter.append("g").attr("class","y axis")
	// 	    gEnter.append("g").attr("class", "x axis");

	   
	//     // Update the inner dimensions.
	//     var g = svg.select("g")
	//         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	//     var line = d3.svg.line()
	// 			    .x(function(d,i) { return x(i); })
	// 			    .y(function(d) { return -1 * y(d); })

	// 	gEnter.append("svg:path").attr("d", line(data));
	// 	console.log(data)

	// }

	var generateHistogram = function(){

		config = priv;

		if(typeof config.parent == 'undefined' && config.parent == null){
			displayError('Parent Selector not specified');
			return;
		}
		if(typeof config.data == 'undefined' && config.data == null){
			displayError('Dataset for histogram not entered');
			return;
		}
		if(typeof config.data[0] != 'number'  || isNaN(config.data[0])){
			displayError('Only numeric entries accepted');
			return;
		}

	    var defaults = {
	      'range' : d3.extent(config.data),
	      'height' : $(config.parent).height(),
	      'width' : $(config.parent).innerWidth(),
	      'bins' : 20,
	      'binSize' : 10,
	      'type' : 'histogram', //Keeping histogram as the default rendering mode
	      'transitionDuration' : 500
	    };


	  /**
	  * Initalized with an empty object, so that the contents of default are not replaced
	  **/
	  
		 var settings = $.extend({}, defaults, config);

	   /**
	   * Removing any unnecessary padding from the parent
	   **/	
	    $(config.parent).css('padding','0px');

	    var margin = {top: 20, right: 30, bottom: 50, left: 50};

	    var width = settings.width,
			height = settings.height;



      /* This does all the good work of the construction of bins, most likely to break the execution of code */
		
      switch(settings.method){

      	case 'decimal' : 
      			var data = d3.layout.histogram().bins(d3.scale.linear().ticks(settings.bins))	
	                (settings.data);
	          break;

	      case 'discrete' : 
	      		var bins = [];
		  		  for(var ii = settings.range[0], jj = 0; ii <= settings.range[1] + 1; ii++, jj++)
			      bins[jj] = ii;         
            var data = d3.layout.histogram().bins(bins)(settings.data);
            break;

        case 'thumbRule' : 
        		var data = d3.layout.histogram().bins(Math.floor(Math.sqrt(settings.data.length)))(settings.data);
            break;

        default : 
        		//Uses Sturges Formula as a default
        		var data = d3.layout.histogram()(settings.data);

      }

			          
		var classes = data.map(function(d) { return d.x; });	


	  	var x = d3.scale.ordinal()
        	 .domain(data.map(function(d) { return d.x; }))
        	 //.domain([0, d3.max(settings.data)])
        	.rangeRoundBands([0, width - margin.left - margin.right], 0);
	   // console.log('Scale Initialization : ' + x(settings.datum) );

	    var y = d3.scale.linear()
	       	    .domain([0, d3.max(data, function(d) { return d.y; })])
	            .range([height - margin.top - margin.bottom, 0]);



	    xAxis = d3.svg.axis()
	    		.scale(x)
	    		.orient("bottom")
	    		.tickFormat(d3.format(',.2f'));

	    yAxis = d3.svg.axis()
	    		.scale(y)
	    		.orient("left")
	    		.tickPadding(5)
	    		.ticks(10)
	    		.tickSize(-(width - margin.right - margin.left), 2, 8);

	   
	    // Select the svg element, if it exists.
	    var svg = d3.select(settings.parent).selectAll("svg").data([data]);

	    // Otherwise, create the skeletal chart.
	    //This sequence is important
	    var gEnter = svg.enter().append("svg").append("g");
		    gEnter.append("g").attr("class","y axis");
		    gEnter.append("g").attr("class", "bars")
		    gEnter.append("g").attr("class", "x axis");

	    // Update the outer dimensions.
	    svg .attr("width", width)
	        .attr("height", height);

	    // Update the inner dimensions.
	    var g = svg.select("g")
	        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	    priv.settings = settings;	
		priv.margin = margin;
		priv.y = y;
		priv.x = x;
		priv.svg = svg;
		priv.classes = classes;


	    // Update the bars.
	    var bar = svg.select(".bars").selectAll(".bar").data(data);
	    bar.enter().append("rect");
	    // bar.exit().remove();
	  	
  	 	priv.legendData = [ 
	    				{
	    					text : ' Distribution',
	    					color: 'steelblue'
	    				}
	     				];

	  	
				
	    bar.attr("width", x.rangeBand() )
	        .attr("x", function(d) { return x(d.x); })
	        .attr("y", height - margin.top - margin.bottom) 
	        // .order()
         	.on('mouseover', function(d){ 
			      d3.select(this).classed('hover', true) 
			      var left = $(this).position().left,
			          top = $(this).position().top + 30;

			      var content = '<h3> X :  '+ round(d.x) +' , Y : ' + round(d.y) + '</h3>';

			      if(typeof viswrap != 'undefined')
			     	 viswrap.tooltip.show([left, top], content, 's');
			    })
		    .on('mouseout', function(){ 
		        d3.select(this).classed('hover', false);
		        if(typeof viswrap != 'undefined') 
		        	viswrap.tooltip.cleanup();
		   	})
	        .transition()
	         .delay( function(d,i){ return settings.transitionDuration * (i / classes.length); } )
	        .attr("y", function(d) { return y(d.y); })
	        .attr("height", function(d) { return y.range()[0] - y(d.y); });

	    priv.g = g;


	    // Update the x-axis.
	    g.select(".x.axis")
	        .attr("transform", "translate(0," + y.range()[0] + ")")
	        .call(xAxis);
	    //Update the y-axis
	    g.select(".y.axis")
	        .call(yAxis);

	   if(typeof settings.datum != "undefined"){

		     	addBar();

			}


	}

	var round = function(no){
		var SIG = priv.SIG ? priv.SIG : 2;
		return Math.round(no* Math.pow(10,SIG) )/ Math.pow(10,SIG);

	}

	var addPercentline = function(){

		var g = priv.g,
			svg = priv.svg,
			width = priv.settings.width,
			height = priv.settings.height - 5,
			barWidth = 10,
			x = priv.x;

		px1 = priv.meanbarX + priv.margin.left,
		px2 = px1 + 10,	//barwidth
        textl='',
        textr=''; 
        
        if(typeof priv.settings.precision !== "undefined"){
            textl = +parseFloat(priv.settings.pl).toFixed(priv.settings.precision) 
            textr = +parseFloat(priv.settings.pr).toFixed(priv.settings.precision) 
        } else {
            textl = priv.settings.pl 
            textr = priv.settings.pr 
        
        }
		
        var line1 = svg.append('line')
	    				.attr('x1', priv.margin.left)
	    				.attr('y1', height)
	    				.attr('x2', priv.margin.left)
	    				.attr('y2', height)
	    				.attr('stroke-width', 2)
	    				.attr('stroke','#121212')
	    				.transition()
	    				 .delay(priv.settings.transitionDuration + 500)
	    				.attr('x2', px1);
        
	    var label1 = svg.append('text')
	    				.attr('x', (px1 + priv.margin.left) / 2)
	    				.attr('y', height - 10)
	    				.attr("dy", ".35em")
		      			.style("text-anchor", "middle")
		      			.style('font-weight','bold')
		      			.style('font-size','15px')
		      			.text(textl+' %')

	    var line2 = svg.append('line')
	    				.attr('x1', px2)
	    				.attr('y1', height)
	    				.attr('x2', px2)
	    				.attr('y2', height)
	    				.attr('stroke-width', 2)
	    				.attr('stroke','#121212')
	    				.transition()
	    				 .delay(priv.settings.transitionDuration + 500)
	    				.attr('x2', width - priv.margin.right)

	    var label2 = svg.append('text')
	    				.attr('x', (width -priv.margin.right+ px2 + 10) / 2 )
	    				.attr('y', height - 10)
	    				.attr("dy", ".35em")
		      			.style("text-anchor", "middle")
		      			.style('font-weight','bold')
		      			.style('font-size','15px')
		      			.text(textr + '%')


	}

	var showLegend = function(){

		var g = priv.g,
			width = priv.settings.width,
			margin = priv.margin;

		 var legend = g.selectAll('.legend')
	    				.data(priv.legendData)
	    				.enter()
	    				.append('g')
	    				.attr('class','legend')
	    				.attr('transform', function(d,i){ return "translate(20, "+i*20+")"; })

	    legend.append("rect")
	      .attr("x", (width-margin.left-margin.right) - 18)
	      .attr("width", 18)
	      .attr("height", 18)
	      .style("fill", function(d){ return d.color });
         
		  legend.append("text")
		      .attr("x", width-margin.left-margin.right - 24)
		      .attr("y", 9)
		      .attr("dy", ".35em")
		      .style("text-anchor", "end")
		      .text(function(d) { return d.text; });		

	}

	var addBar = function(args){
		

		if(arguments.length > 0){

			priv = args.el;
			priv.settings.datum = args.datum;
			priv.settings.variable = args.variable;
			console.log('AddBar with Arguments');

		}
		var classes = priv.classes,
			settings = priv.settings,
			x = priv.x,
			y = priv.y,
			height = priv.settings.height,
			width = priv.settings.width,
			margin = priv.margin,
			g = priv.g,
            _datum = 0;
        
        if(typeof settings.precision !== "undefined"){
             _datum = +parseFloat(settings.datum).toFixed(settings.precision) 
        } else {
            _datum  = settings.datum
        }
		priv.legendData.push({ 
				text : settings.variable +' : ' + _datum ,
				color : '#ff7f0e'
			});

		showLegend();
		
		var meanClass = function(datum){

			if(datum > classes[classes.length -1]){

				return[classes[classes.length -1],classes[classes.length -1]];

			}

			if(datum < classes[0]){

				return[0,1];

			}

	 		for(i in classes){
	 			if(classes[i] > datum){
	 				return [classes[i-1],classes[i]];
	 				break;
	 			}

	 		}
 		}


	 	var interval = meanClass(settings.datum);

	 	if(typeof interval == 'undefined')
	 		return;

	 	if(interval[0] == 0){

	 		meanbarX = 5;
	 	} else {
		
	 	var interpolateWidth =((settings.datum - interval[0])/ (interval[1] - interval[0]))*x.rangeBand();

	 		if(settings.method == 'decimal'){
	    		meanbarX = (x.rangeBand()/2)+x(settings.datum) - (10/2);
	  
		    } else{
		    	meanbarX = x(interval[0]) + x.rangeBand()/2+ interpolateWidth - 5;
		    	
		    }

		 }
		
		if(meanbarX > width){
			meanbarX = x(classes[classes.length -1]) + x.rangeBand() -5;

		}
	    var meanbar = g.append('rect')		    
	    .attr('y',function(){ return height - margin.top - margin.bottom ;});
	    meanbar.attr('x',function(){ return meanbarX });
	    meanbar.attr('width', function(){ return 10;})	   
	    .attr('class','meanBar')
	   
	    .on('mouseover', function(d){ 
	      d3.select(this).classed('hover', true) 
	      var left = $(this).position().left,
	          top = $(this).position().top,
              _datum = 0;
          if(typeof settings.precision !== "undefined")
            _datum = +parseFloat(settings.datum).toFixed(settings.precision)
          else
            _datum = settings.datum
	      var content = '<h3> '+ settings.variable +' : ' + _datum + '</h3>';

	      if(typeof viswrap != 'undefined')
	     	 viswrap.tooltip.show([left, top], content, 's');
	    })
	    .on('mouseout', function(){ 
	        d3.select(this).classed('hover', false);
	        if(typeof viswrap != 'undefined') 
	        	viswrap.tooltip.cleanup();
	   }).transition()
         .delay( function(d,i){ return settings.transitionDuration + 100; } )
         .attr("y", function(d) { return 0; })
          .attr('height',function(){ return height - margin.top - margin.bottom ;});

        priv.meanbarX = meanbarX;
        if(settings.variable.toLowerCase() == 'p-value' ||( (settings.pr * settings.pl) > 0 ))
        addPercentline();
		/*
		if(typeof obj[0].elem.GElement=='undefined')
			return;
		var g = obj[0].elem.GElement,
			x = obj[0].elem.xScale,
			height = obj[0].elem.height,
			margin = obj[0].elem.margin;
			barWidth = obj[0].barWidth | 10;

	    var meanbar = g.append('rect')
		    .attr('x',function(){ return (x.rangeBand()/2)+x(obj[0].datum) - (barWidth/2)})
		    .attr('y',function(){ return 0;})
		    .attr('width', function(){ return barWidth;})
		    .attr('height',function(){ return height - margin.top - margin.bottom ;})
		    .attr('class','meanBar')
		    .on('mouseover', function(d){ 
		      d3.select(this).classed('hover', true) 
		      var left = $(this).position().left,
		          top = $(this).position().top;

		      var content = '<h3> '+ obj[0].variable +' : ' + obj[0].datum + '</h3>';

		      if(typeof viswrap != 'undefined')
		     	 viswrap.tooltip.show([left, top], content, 's');
		    })
		    .on('mouseout', function(){ 
		        d3.select(this).classed('hover', false);
		        if(typeof viswrap != 'undefined') 
		        	viswrap.tooltip.cleanup();
		   });
	*/
	}

	var displayError = function(m){

		var lh = $(priv.parent).height();
		var content = '<div> Error Rendering Histogram : <strong>' + m + '.</strong><p> Try resetting the Experiment </p></div>';
		$(priv.parent).html(content);			

	}



	return {
		generate : function(){

			priv = arguments[0];
			generateHistogram();			
			return priv;	

		},
		addBar : function(priv){
			addBar(priv)
			console.log('Addbar called -1')
		},
		set : function(el, prop){

		}
	}
}())
