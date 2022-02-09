console.log("We Runnin...");

Promise.all([
	d3.csv('data/AQIData.csv'),
	d3.csv('data/DaysinYear.csv'),
	]).then(function(files) {

		var newData = getCountyAQI("Ohio", "Hamilton", files[0])
		var pollutantData = getPercentage(newData);
		var daysData = getReverseNumberofDays(newData, files[1])
		console.log(newData)

		let minYear = d3.min( newData, d => d.Year);
  		let maxYear = d3.max( newData, d=> d.Year );

  		let lineChart = new LineChart({
  			'parentElement': '#LineChart',
  			'containerHeight': 550,
  			'containerWidth': 1000
  		}, newData, ["Median AQI", "90th Percentile AQI", "Max AQI"], "AQI For Hamilton County", "Year", "Days")

  		let lineChart2 = new LineChart({
  			'parentElement': '#LineChart2',
  			'containerHeight': 550,
  			'containerWidth': 1000
  		}, pollutantData, ["Days CO", "Days NO2", "Days Ozone", "Days SO2", "Days PM2.5", "Days PM10"], "Percentage of Contributing Pollutant Per Year", "Year", "Percent")

  		let lineChart3 = new LineChart({
  			'parentElement': '#LineChart3',
  			'containerHeight': 550,
  			'containerWidth': 1000
  		}, daysData, ["Days with AQI"], "Days Without AQI", "Year", "Days")
  		
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

function getPercentage(_data){
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

