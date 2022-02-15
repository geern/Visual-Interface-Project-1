console.log("We Runnin...");

var data;
var leapYears;
var lineChart1, lineChart2, lineChart3, pieChart1, pieChart2, 
	LeftLineChart1, LeftLineChart2, LeftLineChart3, LeftPieChart1, LeftPieChart2,
	RightLineChart1, RightLineChart2, RightLineChart3, RightPieChart1, RightPieChart2

var leftBuilt, rightBuilt = false
var slider = document.getElementById("YearSlider")

var groupedData = []
var states = []

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
	loadCounties();
}
document.getElementById("LeftSelectFilter").onchange = function(){
	filter("Left")
}
document.getElementById("LeftSelectCounty").onchange = function(){
	build12Counties("Left", leftBuilt)
	leftBuilt = true
}
document.getElementById("RightSelectFilter").onchange = function(){
	filter("Right")
}
document.getElementById("RightSelectCounty").onchange = function(){
	build12Counties("Right", rightBuilt)
	rightBuilt = true
}

document.getElementById("YearSlider").oninput = function(){
	var e = document.getElementById("YearSlider")
	var label = document.getElementById("SliderLabel")
	label.innerHTML = "Current Selected Year: " + e.value


	var select = document.getElementById("LeftSelectCounty");
	var value = select.options[select.selectedIndex].value
	var arr = value.split(", ")
	if(select.selectedIndex) {
		LeftLineChart1.renderYearHighlight(e.value)
		LeftLineChart2.renderYearHighlight(e.value)
		LeftLineChart3.renderYearHighlight(e.value)
		updatePies(arr[0], arr[1], e.value, "LeftPieChart1", "LeftPieChart2")
	}

	var select = document.getElementById("RightSelectCounty");
	var value = select.options[select.selectedIndex].value
	var arr = value.split(", ")
	if(select.selectedIndex) {
		RightLineChart1.renderYearHighlight(e.value)
		RightLineChart2.renderYearHighlight(e.value)
		RightLineChart3.renderYearHighlight(e.value)
		updatePies(arr[0], arr[1], e.value, "RightPieChart1", "RightPieChart2")
	}
}



function loadCounties(){
	groupDataBy(JSON.parse(JSON.stringify(data)), ["State", "County"], "groupedData")
	groupDataBy(JSON.parse(JSON.stringify(data)), ["State"], "states")
	console.log(groupedData)
	console.log(states)

	groupedData.sort((a,b) => (a.State == b.State) ? ((a.County > b.County) ? 1 : ((b.County > a.County) ? -1 : 0)) : ((a.State > b.State) ? 1 : ((b.State > a.State) ? -1 : 0)))
	states.sort((a,b) => (a.State == b.State) ? ((a.County > b.County) ? 1 : ((b.County > a.County) ? -1 : 0)) : ((a.State > b.State) ? 1 : ((b.State > a.State) ? -1 : 0)))

	groupedData.forEach(function (item, index){
		loadDropDown("LeftSelectCounty", [item.State, item.County])
		loadDropDown("RightSelectCounty", [item.State, item.County])
	})

	states.forEach(function (item, index){
		loadDropDown("LeftSelectFilter", [item.State])
		loadDropDown("RightSelectFilter", [item.State])
	})

}

function loadHamilton(){
	createBasicDisplay("Ohio", "Hamilton", "LineChart1", "LineChart2", "LineChart3", "PieChart1", "PieChart2", "2021", "")
}

function build12Counties(_name, _built){
	var e = document.getElementById(_name + "SelectCounty");
	var value = e.options[e.selectedIndex].value
	var arr = value.split(", ")

	

	if(!_built){
		createBasicDisplay(arr[0], arr[1], _name + "LineChart1", _name + "LineChart2", _name + "LineChart3", _name + "PieChart1", _name + "PieChart2", slider.value, _name)
	} else {
		updateDisplay(arr[0], arr[1], _name + "LineChart1", _name + "LineChart2", _name + "LineChart3", _name + "PieChart1", _name + "PieChart2", slider.value, _name)
	}
}

function createBasicDisplay(_state, _county, _lineChart1, _lineChart2, _lineChart3, _pieChart1, _pieChart2, _year, _side){
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
	if(typeof recentHealthYearData === "undefined") recentHealthYearData = healthData[healthData.length-1]
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
	if(typeof recentPollutantYearData === "undefined") recentPollutantYearData = pollutantData[pollutantData.length-1]
	var daysData = getReverseNumberofDays(newData, leapYears)

	var width = document.getElementById(_lineChart1).parentElement.offsetWidth - 50
	var height = document.getElementById(_lineChart1).parentElement.offsetHeight / 3

	this[_lineChart1] = createNewLineChart(height*2, width, '#' + _lineChart1, 
		newData, ["Median AQI", "90th Percentile AQI", "Max AQI"], 
		"AQI For " + _county + " County", "Year", "AQI", _side)
	this[_lineChart1].renderVis()
	this[_lineChart1].renderYearHighlight(slider.value)

	this[_lineChart2] = createNewLineChart(height*2, width, '#' + _lineChart2, 
		pollutantData, ["Days CO", "Days NO2", "Days Ozone", "Days SO2", "Days PM2.5", "Days PM10"], 
		"Percentage of Contributing Pollutant Per Year", "Year", "Percent", _side)
	this[_lineChart2].renderVis()
	this[_lineChart2].renderYearHighlight(slider.value)

	width = document.getElementById(_lineChart3).parentElement.offsetWidth - 50
	height = document.getElementById(_lineChart3).parentElement.offsetHeight / 3

	this[_lineChart3] = createNewLineChart(height*2, width, '#' + _lineChart3, 
		daysData, ["Days without AQI"], 
		"Days Without AQI", "Year", "Days", _side)
	this[_lineChart3].renderVis()
	this[_lineChart3].renderYearHighlight(slider.value)

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
	this[_pieChart1].updateVis(recentHealthYearData, "Air Quality of " + recentHealthYearData.Year)

	this[_pieChart2] = createNewPieChart(height, width, '#' + _pieChart2, 
		recentPollutantYearData, 
		["Days CO", 
		"Days NO2", 
		"Days Ozone",
		"Days SO2",
		"Days PM2.5",
		"Days PM10"], 
		"Major Pollutants in " + _year)
	this[_pieChart2].updateVis(recentPollutantYearData, "Major Pollutants in " + recentPollutantYearData.Year)
}

function updateDisplay (_state, _county, _lineChart1, _lineChart2, _lineChart3, _pieChart1, _pieChart2, _year, _side){
	var newData = JSON.parse(JSON.stringify(getCountyAQI(_state, _county, data)))

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

	this[_lineChart1].updateVis(newData, "AQI For " + _county + " County", _side)
	this[_lineChart2].updateVis(newData, "Percentage of Contributing Pollutant Per Year", _side)
	this[_lineChart3].updateVis(newData, "Days Without AQI", _side)
	this[_pieChart1].updateVis(recentHealthYearData, "Air Quality of " + _year)
	this[_pieChart2].updateVis(recentPollutantYearData, "Major Pollutants in " + _year)
}

function updatePies(_state, _county, _year, _pieChart1, _pieChart2){
	var newData = JSON.parse(JSON.stringify(getCountyAQI(_state, _county, data)))

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

		
		this[_pieChart1].updateVis(recentHealthYearData, "Air Quality of " + _year)
		this[_pieChart2].updateVis(recentHealthYearData, "Major Pollutants in " + _year)
}

function update12Counties(_name){
	var e = document.getElementById(_name + "SelectCounty");
	var value = e.options[e.selectedIndex].value
	var arr = value.split(", ")

	var slider = document.getElementById("YearSlider")

	updateDisplay(arr[0], arr[1], _name + "LineChart1", _name + "LineChart2", _name + "LineChart3", _name + "PieChart1", _name + "PieChart2", slider.value)
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

function loadDropDown(_name, _values){
	var select = document.getElementById(_name);
	var opt = document.createElement('option')
	var value = ""
	var innerHTML = ""
	_values.forEach(function(item, index){
		if(index == _values.length-1) {
			value += item
			innerHTML += item
		}
		else {
			value += item + ", "
			innerHTML += item + " - "
		}
	})
	
	opt.value = value
	opt.innerHTML = innerHTML
	select.appendChild(opt)
}

function filter(_side){
	var keyWord = document.getElementById(_side + "SelectFilter").value;
	var select = document.getElementById(_side + "SelectCounty");

	for(var i = 0; i < select.length; i++){
		var txt = select.options[i].text.split(" - ")[0];
		if(!txt.match(keyWord) && keyWord != "All"){
			select.options[i].disabled = true
			select.options[i].style.display = "none"
		} else {
			select.options[i].disabled = false
			select.options[i].style.display = "block"
		}
	} 
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

function createNewLineChart(_height, _width, _lineChart, _data, _columns, _title, _xAxis, _yAxis, _side){
	return new LineChart({
  			'parentElement': _lineChart,
  			'containerHeight': _height,
  			'containerWidth': _width
	}, _data, _columns, _title, _xAxis, _yAxis, _side)
}

function createNewPieChart(_height, _width, _pieChart, _data, _columns, _title, _xAxis, _yAxis){
	return new PieChart({
  			'parentElement': _pieChart,
  			'containerHeight': _height,
  			'containerWidth': _width
	}, _data, _columns, _title, _xAxis, _yAxis)
}

function groupDataBy(_data, _groupBy, _varName){
	var helper = {};
	var result = _data.reduce(function(r, o) {
		var key = ""
		_groupBy.forEach(function (item, index){
			if(index == _groupBy.length-1) key += o[item]
			else key += o[item] + '-'
		})
		//var key = o.State + '-' + o.County;

		if(!helper[key]) {
		helper[key] = Object.assign({}, o); // create a copy of o
		r.push(helper[key]);
		this[_varName].push(helper[key])
		}
		return r;
	}, []);
}