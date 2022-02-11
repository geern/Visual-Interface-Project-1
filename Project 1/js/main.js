console.log("We Runnin...");
document.getElementById("Hamilton").onclick = function () {
	document.getElementById("viewHamilton").style.display = "block"
}
document.getElementById("12County").onclick = function () {
	document.getElementById("viewHamilton").style.display = "none"
}
Promise.all([
	d3.csv('data/AQIData.csv'),
	d3.csv('data/DaysinYear.csv'),
	]).then(function(files) {

		var newData = getCountyAQI("Ohio", "Hamilton", files[0])
		console.log(JSON.parse(JSON.stringify(newData)))
		var healthData = getPercentage(newData, 
			["Good Days",
			"Moderate Days",
			"Unhealthy for Sensitive Groups Days",
			"Unhealthy Days",
			"Very Unhealthy Days",
			"Hazardous Days"])
		var recentHealthYearData = healthData.slice(-1)[0]
		//var healthData = getPercentageHealth(newData);
		var pollutantData = getPercentage(newData, 
			["Days CO", 
			"Days NO2", 
			"Days Ozone",
			"Days SO2",
			"Days PM2.5",
			"Days PM10"])
		var recentPollutantYearData = pollutantData.slice(-1)[0]
		//var pollutantData = getPercentagePollutant(newData);
		var daysData = getReverseNumberofDays(newData, files[1])

		let minYear = d3.min( newData, d => d.Year);
  		let maxYear = d3.max( newData, d=> d.Year );

  		/*let lineChart = new LineChart({
  			'parentElement': '#LineChart',
  			'containerHeight': 550,
  			'containerWidth': 1000
  		}, newData, ["Median AQI", "90th Percentile AQI", "Max AQI"], "AQI For Hamilton County", "Year", "Days")

  		let lineChart2 = new LineChart({
  			'parentElement': '#LineChart2',
  			'containerHeight': 550,
  			'containerWidth': 1000
  		}, pollutantData, ["Days CO", "Days NO2", "Days Ozone", "Days SO2", "Days PM2.5", "Days PM10"], "Percentage of Contributing Pollutant Per Year", "Year", "Percent")*/

  		/*let lineChart3 = new LineChart({
  			'parentElement': '#LineChart3',
  			'containerHeight': 550,
  			'containerWidth': 1000
  		}, daysData, ["Days with AQI"], "Days Without AQI", "Year", "Days")*/
  		var width = document.getElementById("LineChart1").parentElement.offsetWidth - 50
  		var height = document.getElementById("LineChart1").parentElement.offsetHeight / 3

  		let lineChart1 = createNewLineChart(height*2, width, '#LineChart1', 
  			newData, ["Median AQI", "90th Percentile AQI", "Max AQI"], 
  			"AQI For Hamilton County", "Year", "Days")

  		let lineChart2 = createNewLineChart(height*2, width, '#LineChart2', 
  			pollutantData, ["Days CO", "Days NO2", "Days Ozone", "Days SO2", "Days PM2.5", "Days PM10"], 
  			"Percentage of Contributing Pollutant Per Year", "Year", "Percent")

  		width = document.getElementById("LineChart3").parentElement.offsetWidth - 50
  		height = document.getElementById("LineChart3").parentElement.offsetHeight / 3

  		let lineChart3 = createNewLineChart(height*2, width, '#LineChart3', 
  			daysData, ["Days with AQI"], 
  			"Days Without AQI", "Year", "Days")

  		width = document.getElementById("PieChart1").parentElement.offsetWidth
  		height = document.getElementById("PieChart1").parentElement.offsetHeight

  		let pieChart1 = createNewPieChart(height, width, '#PieChart1', 
  			recentHealthYearData, 
  			["Good Days",
			"Moderate Days",
			"Unhealthy for Sensitive Groups Days",
			"Unhealthy Days",
			"Very Unhealthy Days",
			"Hazardous Days"], 
  			"Air Quality of 2021")

  		let pieChart2 = createNewPieChart(height, width, '#PieChart2', 
  			recentPollutantYearData, 
  			["Days CO", 
			"Days NO2", 
			"Days Ozone",
			"Days SO2",
			"Days PM2.5",
			"Days PM10"], 
  			"Major Pollutants in 2021")
  		
})

function getCountyAQI(defState, defCounty, _data){
	var returnData = []
	for (const [id, county] of Object.entries(_data)) {
		if (county.State == defState && county.County == defCounty) {
			returnData.push(county)
		}
	}
	return returnData
}

/*function getPercentagePollutant(_data){
	var returnData = []
	for (const [id, county] of Object.entries(_data)) {
		var totalDays = county["Days with AQI"];
		county["Days CO"] = county["Days CO"]/totalDays * 100
		county["Days NO2"] = county["Days NO2"]/totalDays * 100
		county["Days Ozone"] = county["Days Ozone"]/totalDays * 100
		county["Days SO2"] = county["Days SO2"]/totalDays * 100
		county["Days PM2.5"] = county["Days PM2.5"]/totalDays * 100
		county["Days PM10"] = county["Days PM10"]/totalDays * 100
		returnData.push(county)
	}
	return returnData
}

function getPercentageHealth(_data){
	var returnData = []
	for (const [id, county] of Object.entries(_data)) {
		var totalDays = county["Days with AQI"];
		county["Good Days"] = county["Good Days"]/totalDays * 100
		county["Moderate Days"] = county["Moderate Days"]/totalDays * 100
		county["Unhealthy for Sensitive Groups Days"] = county["Unhealthy for Sensitive Groups Days"]/totalDays * 100
		county["Unhealthy Days"] = county["Unhealthy Days"]/totalDays * 100
		county["Very Unhealthy Days"] = county["Very Unhealthy Days"]/totalDays * 100
		county["Hazardous Days"] = county["Hazardous Days"]/totalDays * 100
		returnData.push(county)
	}
	return returnData
}*/

function getPercentage(_data, _columns){
	var returnData = []
	for (const [id, county] of Object.entries(_data)){
		var totalDays = county["Days with AQI"]
		_columns.forEach(function (item, index){
			county[item] = county[item]/totalDays * 100
		})
		returnData.push(county)
	}
	return returnData
}

function getReverseNumberofDays(_data, _years){
	var returnData = []
	for(const[id, date] of Object.entries(_years)){
		for (const [id, county] of Object.entries(_data)) {
			if (county.Year == date.Year) {
				county["Days with AQI"] = date.Days-county["Days with AQI"]
				returnData.push(county)
				break;
			}
		}
	}
	return returnData
}

function createNewLineChart(_height, _width, _lineChart, _data, _columns, _title, _xAxis, _yAxis){
	return new LineChart({
  			'parentElement': _lineChart,
  			'containerHeight': _height,
  			'containerWidth': _width
	}, _data, _columns, _title, _xAxis, _yAxis)
}

function createNewPieChart(_height, _width, _pieChart, _data, _columns, _title, _xAxis, _yAxis){
	return new PieChart({
  			'parentElement': _pieChart,
  			'containerHeight': _height,
  			'containerWidth': _width
	}, _data, _columns, _title, _xAxis, _yAxis)
}

