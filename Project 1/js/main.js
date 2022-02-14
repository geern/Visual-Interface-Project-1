console.log("We Runnin...");

var data;
var leapYears;
var lineChart1, lineChart2, lineChart3, pieChart1, pieChart2, 
	LeftLineChart1, LeftLineChart2, LeftLineChart3, LeftPieChart1, LeftPieChart2,
	RightLineChart1, RightLineChart2, RightLineChart3, RightPieChart1, RightPieChart2

Promise.all([
	d3.csv('data/AQIData.csv'),
	d3.csv('data/DaysinYear.csv'),
		]).then(function(files) {
			data = files[0]
			leapYears = files[1]
			loadHamilton();
})

document.getElementById("Hamilton").onclick = function () {
	document.getElementById("viewHamilton").style.display = "block"
	document.getElementById("viewCounties").style.display = "none"
}
document.getElementById("12County").onclick = function () {
	document.getElementById("viewHamilton").style.display = "none"
	document.getElementById("viewCounties").style.display = "block"
	load12Counties();
}
document.getElementById("LeftSelectCounty").onchange = function(){
	build12Counties("Left")
}

document.getElementById("RightSelectCounty").onchange = function(){
	build12Counties("Right")
}

document.getElementById("YearSlider").onchange = function(){
	var e = document.getElementById("YearSlider")
	var label = document.getElementById("SliderLabel")
	label.innerHTML = "Current Selected Year: " + e.value


	var select = document.getElementById("LeftSelectCounty");
	var value = select.options[select.selectedIndex].value
	var arr = value.split(", ")

	var newData = JSON.parse(JSON.stringify(getCountyAQI(arr[0], arr[1], data)))

	var healthData = getPercentage(newData, 
		["Good Days",
		"Moderate Days",
		"Unhealthy for Sensitive Groups Days",
		"Unhealthy Days",
		"Very Unhealthy Days",
		"Hazardous Days"])
	var recentHealthYearData = healthData.filter(obj => {
		return obj.Year == e.value
	})
	recentHealthYearData = recentHealthYearData[0]
	

	var pollutantData = getPercentage(newData, 
		["Days CO", 
		"Days NO2", 
		"Days Ozone",
		"Days SO2",
		"Days PM2.5",
		"Days PM10"])
	var recentPollutantYearData = pollutantData.filter(obj => {
		return obj.Year == e.value
	})
	recentPollutantYearData = recentPollutantYearData[0]

	LeftPieChart1.updateVis(recentHealthYearData, "Air Quality of " + e.value)
	LeftPieChart2.updateVis(recentHealthYearData, "Major Pollutants in " + e.value)

	var select = document.getElementById("RightSelectCounty");
	var value = select.options[select.selectedIndex].value
	var arr = value.split(", ")

	var newData = JSON.parse(JSON.stringify(getCountyAQI(arr[0], arr[1], data)))

	var healthData = getPercentage(newData, 
		["Good Days",
		"Moderate Days",
		"Unhealthy for Sensitive Groups Days",
		"Unhealthy Days",
		"Very Unhealthy Days",
		"Hazardous Days"])
	var recentHealthYearData = healthData.filter(obj => {
		return obj.Year == e.value
	})
	recentHealthYearData = recentHealthYearData[0]
	

	var pollutantData = getPercentage(newData, 
		["Days CO", 
		"Days NO2", 
		"Days Ozone",
		"Days SO2",
		"Days PM2.5",
		"Days PM10"])
	var recentPollutantYearData = pollutantData.filter(obj => {
		return obj.Year == e.value
	})
	recentPollutantYearData = recentPollutantYearData[0]

	
	RightPieChart1.updateVis(recentHealthYearData, "Air Quality of " + e.value)
	RightPieChart2.updateVis(recentHealthYearData, "Major Pollutants in " + e.value)
}

function load12Counties(){
	var counties = [
	{State: "Ohio", County: "Hamilton"},
	{State: "Alabama", County: "Russell"},
	{State: "California", County: "Monterey"},
	{State: "Florida", County: "Palm Beach"},
	{State: "Kentucky", County: "Jefferson"},
	{State: "Michigan", County: "Kent"},
	{State: "New York", County: "Kings"},
	{State: "Ohio", County: "Cuyahoga"},
	{State: "Pennsylvania", County: "York"},
	{State: "Nevada", County: "Carson City"},
	{State: "New York", County: "New York"},
	{State: "North Carolina", County: "Alamance"}]
	counties.sort((a,b) => (a.State == b.State) ? ((a.County > b.County) ? 1 : ((b.County > a.County) ? -1 : 0)) : ((a.State > b.State) ? 1 : ((b.State > a.State) ? -1 : 0)))

	counties.forEach(function (item, index){
		loadDropDown("LeftSelectCounty", item.County, item.State)
		loadDropDown("RightSelectCounty", item.County, item.State)
	})

}

function loadHamilton(){
	//createBasicDisplay("Ohio", "Hamilton", "LineChart1", "LineChart2", "LineChart3", "PieChart1", "PieChart2", "2021")
}

function createBasicDisplay(_state, _county, _lineChart1, _lineChart2, _lineChart3, _pieChart1, _pieChart2, _year){
	var newData = JSON.parse(JSON.stringify(getCountyAQI(_state, _county, data)))
	var index = parseInt(_year) - 1980;

	var healthData = getPercentage(newData, 
		["Good Days",
		"Moderate Days",
		"Unhealthy for Sensitive Groups Days",
		"Unhealthy Days",
		"Very Unhealthy Days",
		"Hazardous Days"])
	var recentHealthYearData = healthData.filter(obj => {
		return obj.Year == _year
	})
	recentHealthYearData = recentHealthYearData[0]
	var pollutantData = getPercentage(newData, 
		["Days CO", 
		"Days NO2", 
		"Days Ozone",
		"Days SO2",
		"Days PM2.5",
		"Days PM10"])
	var recentPollutantYearData = pollutantData.filter(obj => {
		return obj.Year == _year
	})
	recentPollutantYearData = recentPollutantYearData[0]
	var daysData = getReverseNumberofDays(newData, leapYears)

	/*let minYear = d3.min( newData, d => d.Year);
	let maxYear = d3.max( newData, d=> d.Year );
*/
	var width = document.getElementById(_lineChart1).parentElement.offsetWidth - 50
	var height = document.getElementById(_lineChart1).parentElement.offsetHeight / 3

	this[_lineChart1] = createNewLineChart(height*2, width, '#' + _lineChart1, 
		newData, ["Median AQI", "90th Percentile AQI", "Max AQI"], 
		"AQI For " + _county + " County", "Year", "Days")
	this[_lineChart1].updateVis()

	this[_lineChart2] = createNewLineChart(height*2, width, '#' + _lineChart2, 
		pollutantData, ["Days CO", "Days NO2", "Days Ozone", "Days SO2", "Days PM2.5", "Days PM10"], 
		"Percentage of Contributing Pollutant Per Year", "Year", "Percent")
	this[_lineChart2].updateVis()
	width = document.getElementById(_lineChart3).parentElement.offsetWidth - 50
	height = document.getElementById(_lineChart3).parentElement.offsetHeight / 3

	this[_lineChart3] = createNewLineChart(height*2, width, '#' + _lineChart3, 
		daysData, ["Days without AQI"], 
		"Days Without AQI", "Year", "Days")
	this[_lineChart3].updateVis()

	width = document.getElementById(_pieChart1).parentElement.offsetWidth
	height = document.getElementById(_pieChart1).parentElement.offsetHeight

	this[_pieChart1] = createNewPieChart(height, width, '#' + _pieChart1, 
		recentHealthYearData, 
		["Good Days",
		"Moderate Days",
		"Unhealthy for Sensitive Groups Days",
		"Unhealthy Days",
		"Very Unhealthy Days",
		"Hazardous Days"], 
		"Air Quality of " + _year)
	this[_pieChart1].updateVis(recentHealthYearData, "Air Quality of " + _year)

	this[_pieChart2] = createNewPieChart(height, width, '#' + _pieChart2, 
		recentPollutantYearData, 
		["Days CO", 
		"Days NO2", 
		"Days Ozone",
		"Days SO2",
		"Days PM2.5",
		"Days PM10"], 
		"Major Pollutants in " + _year)
	this[_pieChart2].updateVis(recentPollutantYearData, "Major Pollutants in " + _year)
}

function build12Counties(_name){
	clearDisplay(["#" + _name + "LineChart1", "#" + _name + "LineChart2", "#" + _name + "LineChart3", "#" + _name + "PieChart1", "#" + _name + "PieChart2"])
	var e = document.getElementById(_name + "SelectCounty");
	var value = e.options[e.selectedIndex].value
	var arr = value.split(", ")

	var slider = document.getElementById("YearSlider")

	createBasicDisplay(arr[0], arr[1], _name + "LineChart1", _name + "LineChart2", _name + "LineChart3", _name + "PieChart1", _name + "PieChart2", slider.value)
}

function clearDisplay(_name){
	_name.forEach(function (item, index){
		d3.select(item)
		.selectAll('*').remove()
	})
}

function getCountyAQI(defState, defCounty, _data){
	var returnData = []
	for (const [id, county] of Object.entries(_data)) {
		if (county.State == defState && county.County == defCounty) {
			returnData.push(county)
		}
	}
	return returnData
}

function loadDropDown(_name, _county, _state){

	var select = document.getElementById(_name);
	var opt = document.createElement('option')
	opt.value = _state + ", " + _county
	opt.innerHTML = _state + " - " + _county
	select.appendChild(opt)
}

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
				county["Days without AQI"] = date.Days-county["Days with AQI"]
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

