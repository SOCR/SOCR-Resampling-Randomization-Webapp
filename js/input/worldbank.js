socr.input.worldbank = function(){

	var indicators = [ 'SP.DYN.CBRT.IN?page=6' , 'SP.DYN.CDRT.IN' , 'SH.XPD.TOTL.ZS' , 'SP.DYN.LE00.IN' , 'SP.POP.TOTL' , 'SL.TLF.TOTL.IN' , 'EN.ATM.CO2E.PC' , 'NY.GDP.MKTP.CD' , 'SP.URB.TOTL' ,'FR.INR.DPST' ];

	/**
	 * Performs the xhr request(s) to worldbank over a selected datasets
	 * Loads data in the excel sheet on successful request
	 * Sample Query http://api.worldbank.org/countries/indicators/SP.DYN.CDRT.IN?format=jsonP&date=2008:2011&per_page=10&prefix=?
	 * @param indicator {string}
	 * @param itemcount {number} - if itemcount is not set, the function is recalled to load all datasets
	 */

	var request = function(req, itemcount){

		var requestdata = {
			format : 'jsonP',
			// date : '2008:2011',
			per_page  : '1'
		}
		
		requestdata["date"] = (typeof req.year1 == 'undefined') ? '2008:2011' : req.year1 + ':' + req.year2;
		requestdata["per_page"] = (typeof itemcount == 'undefined') ? 1 : itemcount ;
		

		$.ajax({
			url : 'http://api.worldbank.org/countries/indicators/'+req.indicator+'?format=jsonP&date='+requestdata["date"]+'&per_page='+requestdata["per_page"],
			dataType: 'jsonP',
		    jsonp : "prefix",
		    jsonpCallback: "jquery_"+(new Date).getTime(),
			success : function(res){
				var count = res[0].total;
				if(requestdata['per_page'] == 1){

					request(req, count);
				}
				else{
					var interval = parseInt(requestdata["date"].substr(5,9)) - parseInt(requestdata["date"].substr(0,4)) + 1;
					var grid = formatResponse(res, interval);
					socr.dataTable.worldbank.loadComplete();
					socr.dataTable.spreadSheet.loadData(grid[0]);
					socr.dataTable.spreadSheet.addColHeaders(grid[1]);
				}
			},
			error : function(xhr, status, error){
				socr.dataTable.worldbank.errorLoading();
			}
		})

		// $.ajax({
		// 	url : 'http://api.worldbank.org/countries/indicators/'+req.indicator,
		// 	dataType : 'json',	
		// 	type : 'GET',
		// 	data : requestdata,
		// 	jsonp : 'callback'

		// }).done(
		// 	function(res){
		// 		console.log(res)
		// 		var count = res[0].total;
		// 		if(requestdata['per_page'] == 1){

		// 			request(req, count);
		// 		}
		// 		else{
		// 			var grid = formatResponse(res);
		// 			socr.dataTable.worldbank.loadComplete();
		// 			socr.dataTable.spreadSheet.loadData(grid);
		// 		}
		// 	}
		// )

	}
	/*
	 * formatResponse @private
	 * @params {response} - json response from WorldBank API
	 * @returns [ table ] - To passed on to excel sheet
	 * format - [country, value1, value2, ...]
	 */

	var formatResponse = function(response, interval){

		var yearinterval = interval,
			i = 0,
			table = [],
			ceil = response[0].per_page - yearinterval,
			colHeaders = [];

		colHeaders.push("Countries");

		while( i < ceil ){

			var country = response[1][i].country.value,
				row = [];

			row.push(country);

			for(var j = 0 ; j < yearinterval;  j++){
			
				row.push(response[1][i+j].value);

			}

			table.push(row);
			
			i += yearinterval;
		}

		for(i=0; i<interval; i++){
			colHeaders.push(response[1][i].date)
		}

		return [table,colHeaders];
	}

	return {
		request : request
	}
}();