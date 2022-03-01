console.log("We Runnin...");

//setting global variables
var data;
var dataFips;
var leapYears;
var lineChart1, lineChart2, lineChart3, pieChart1, pieChart2, 
	LeftLineChart1, LeftLineChart2, LeftLineChart3, LeftPieChart1, LeftPieChart2,
	RightLineChart1, RightLineChart2, RightLineChart3, RightPieChart1, RightPieChart2,
	choroplethMap

var leftBuilt, rightBuilt = false
var slider = document.getElementById("YearSlider")

var groupedData = []
var states = []
var geoData = []
var fips = []

//fetching data from csv
Promise.all([
	d3.csv('data/AQIData.csv'),
	d3.csv('data/DaysinYear.csv'),
	d3.json('data/counties-10m.json'),
	d3.csv('data/fips.csv')
		]).then(function(files) {
			data = files[0]
			leapYears = files[1]
			geoData = files[2]
			fips = files[3]
			dataFips = appendFips(JSON.parse(JSON.stringify(data)))

			geoData.objects.counties.geometries.forEach(d => {
				for (let i = 0; i < fips.length; i++) {
					if (parseInt(d.id) == parseInt(fips[i].cnty_fips)) {
						d.properties.state = fips[i].state
						d.properties.county = fips[i].county
						break;
					}
				}
			});
			loadCounties();
			updateMap();
})

function appendFips(_data){
	var returnData = []
	for (const [id, county] of Object.entries(_data)) {
		for (let i = 0; i < fips.length; i++) {
			if (county.County == fips[i].county && county.State == fips[i].state) {
				county.fips = fips[i].cnty_fips
				returnData.push(county)
			}
		}
	}
	return returnData;
}

document.getElementById("LeftSelectFilter").onchange = function(){
	filter("Left")
}
document.getElementById("LeftSelectCounty").onchange = function(){
	buildCounties("Left", leftBuilt)
	updateMap()
	rotate = true
	leftBuilt = true
	document.getElementById("mapInfo").innerHTML = "Click on map select county for right side"
}
document.getElementById("RightSelectFilter").onchange = function(){
	filter("Right")
}
document.getElementById("RightSelectCounty").onchange = function(){
	buildCounties("Right", rightBuilt)
	updateMap()
	rotate = false
	rightBuilt = true
	document.getElementById("mapInfo").innerHTML = "Click on map select county for left side"
}
document.getElementById("btnCollapse").onclick = function(){
	var e = document.getElementById("header")
	e.style.height = "0px"
	e.style.transition = "all linear 0.5s";
	e.style.overflow = "hidden"
	e = document.getElementById("headerPadding")
	e.style.height = "0px"
	e.style.transition = "all linear 0.5s";
	e = document.getElementById("btnExpand")
	e.style.marginTop = "0px"
	e.style.transition = "all linear 0.5s";
}
document.getElementById("btnExpand").onclick = function(){
	var e = document.getElementById("header")
	e.style.height = "79px"
	e.style.transition = "all linear 0.5s";
	e = document.getElementById("headerPadding")
	e.style.height = "76px"
	e.style.transition = "all linear 0.5s";
	e = document.getElementById("btnExpand")
	e.style.marginTop = "79px"
	e.style.transition = "all linear 0.5s";
}
document.getElementById("MapSelect").onchange = function(){
	updateMap()
}
document.getElementById("RUNITDOWN").onclick = async function(){
	for(var i = 1980; i <= 2021; i++){
		await new Promise(r => setTimeout(r, 1000));
		var e = document.getElementById("YearSlider")
		e.value = i;
		e.onchange();
	}
}

document.getElementById("YearSlider").oninput = function(){
	var e = document.getElementById("YearSlider")
	var label = document.getElementById("SliderLabel")
	label.innerHTML = "Current Selected Year: " + e.value
}

//on slider change, updates all charts
document.getElementById("YearSlider").onchange = function(){
	updateMap()
	//gets year from slider and changes label to match the change
	var e = document.getElementById("YearSlider")
	var label = document.getElementById("SliderLabel")
	label.innerHTML = "Current Selected Year: " + e.value

	//grabs the selected county on the left hand side
	var select = document.getElementById("LeftSelectCounty");
	var value = select.options[select.selectedIndex].value
	var arr = value.split(", ")

	//checks if a county is selected
	if(select.selectedIndex) {
		LeftLineChart1.renderYearHighlight(e.value)
		LeftLineChart2.renderYearHighlight(e.value)
		LeftLineChart3.renderYearHighlight(e.value)
		updatePies(arr[0], arr[1], e.value, "LeftPieChart1", "LeftPieChart2")
	}

	//grabs the selected county on the right hand side
	select = document.getElementById("RightSelectCounty");
	value = select.options[select.selectedIndex].value
	arr = value.split(", ")

	if(select.selectedIndex) {
		RightLineChart1.renderYearHighlight(e.value)
		RightLineChart2.renderYearHighlight(e.value)
		RightLineChart3.renderYearHighlight(e.value)
		updatePies(arr[0], arr[1], e.value, "RightPieChart1", "RightPieChart2")
	}
}

//loads the main div of the counties
function loadCounties(){
	groupDataBy(JSON.parse(JSON.stringify(data)), ["State", "County"], "groupedData")	//used to get unique state and county combination
	groupDataBy(JSON.parse(JSON.stringify(data)), ["State"], "states")					//used to get unique states

	//sorts data alphabetically
	groupedData.sort((a,b) => (a.State == b.State) ? ((a.County > b.County) ? 1 : ((b.County > a.County) ? -1 : 0)) : ((a.State > b.State) ? 1 : ((b.State > a.State) ? -1 : 0)))
	states.sort((a,b) => (a.State == b.State) ? ((a.County > b.County) ? 1 : ((b.County > a.County) ? -1 : 0)) : ((a.State > b.State) ? 1 : ((b.State > a.State) ? -1 : 0)))

	//loads the counties into dropdown
	groupedData.forEach(function (item, index){
		loadDropDown("LeftSelectCounty", [item.State, item.County])
		loadDropDown("RightSelectCounty", [item.State, item.County])
	})

	//loads the states into the filter dropdown
	states.forEach(function (item, index){
		loadDropDown("LeftSelectFilter", [item.State])
		loadDropDown("RightSelectFilter", [item.State])
	})

	//loads filters for map
	var mapSelect = ["Median AQI", "90th Percentile AQI", "Days CO", 
		"Days NO2", 
		"Days Ozone",
		"Days SO2",
		"Days PM2.5",
		"Days PM10"]
	mapSelect.forEach(function (item, index){
		loadDropDown("MapSelect", [item])
	})
}

//used to load hamilton county for demo
function loadHamilton(){
	createBasicDisplay("Ohio", "Hamilton", "LineChart1", "LineChart2", "LineChart3", "PieChart1", "PieChart2", "2021", "")
}

//used to decide to build new display or update
function buildCounties(_name, _built){
	//calls the appropriate dropdown by using name as a input for left or right
	var e = document.getElementById(_name + "SelectCounty");
	var value = e.options[e.selectedIndex].value
	var arr = value.split(", ")

	//checks if the left or right is built to decide whether to create a new display or update display
	if(!_built){
		createBasicDisplay(arr[0], arr[1], _name + "LineChart1", _name + "LineChart2", _name + "LineChart3", _name + "PieChart1", _name + "PieChart2", slider.value, _name)
	} else {
		updateDisplay(arr[0], arr[1], _name + "LineChart1", _name + "LineChart2", _name + "LineChart3", _name + "PieChart1", _name + "PieChart2", slider.value, _name)
	}
}

//used to create the displays
function createBasicDisplay(_state, _county, _lineChart1, _lineChart2, _lineChart3, _pieChart1, _pieChart2, _year, _side){

	//gets data based on state and county
	var newData = JSON.parse(JSON.stringify(getCountyAQI(_state, _county, data, "")))

	//gets data for how healthy the days were
	var healthData = getPercentage(newData, 
		["Good Days",
		"Moderate Days",
		"Unhealthy for Sensitive Groups Days",
		"Unhealthy Days",
		"Very Unhealthy Days",
		"Hazardous Days"])

	//gets the health of the days according to the current year selected
	var recentHealthYearData = healthData.filter(obj => {
		return obj.Year == _year
	})
	recentHealthYearData = recentHealthYearData[0]
	if(typeof recentHealthYearData === "undefined") recentHealthYearData = healthData[healthData.length-1]				//if selected year health data doesn't exist, it takes the most recent data
	
	//gets the pollutant of the current year selected
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
	if(typeof recentPollutantYearData === "undefined") recentPollutantYearData = pollutantData[pollutantData.length-1]	//if selected year pollutant data doesn't exist, it takes the most recent data
	var daysData = getReverseNumberofDays(newData, leapYears)

	//sets the width and height for line chart display
	var width = document.getElementById(_lineChart1).parentElement.offsetWidth - 50
	var height = document.getElementById(_lineChart1).parentElement.offsetHeight / 3

	//creates display for line charts
	this[_lineChart1] = createNewLineChart(height*2, width, '#' + _lineChart1, 
		newData, ["Median AQI", "90th Percentile AQI", "Max AQI"], 
		"AQI For " + _county + " County", "Year", "AQI", _side)
	this[_lineChart1].renderYearHighlight(slider.value)

	this[_lineChart2] = createNewLineChart(height*2, width, '#' + _lineChart2, 
		pollutantData, ["Days CO", "Days NO2", "Days Ozone", "Days SO2", "Days PM2.5", "Days PM10"], 
		"Percentage of Contributing Pollutant Per Year", "Year", "Percent", _side)
	this[_lineChart2].renderYearHighlight(slider.value)

	width = document.getElementById(_lineChart3).parentElement.offsetWidth - 50
	height = document.getElementById(_lineChart3).parentElement.offsetHeight / 3

	this[_lineChart3] = createNewLineChart(height*2, width, '#' + _lineChart3, 
		daysData, ["Days without AQI"], 
		"Days Without AQI", "Year", "Days", _side)
	this[_lineChart3].renderYearHighlight(slider.value)

	//sets the width and height for pie chart display
	width = document.getElementById(_pieChart1).parentElement.offsetWidth
	height = document.getElementById(_pieChart1).parentElement.offsetHeight

	//creates display for pie charts
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

//used to update displays, mainly for county changes
function updateDisplay (_state, _county, _lineChart1, _lineChart2, _lineChart3, _pieChart1, _pieChart2, _year, _side){

	//gets data based on state and county
	var newData = JSON.parse(JSON.stringify(getCountyAQI(_state, _county, data, "")))

	//gets data for how healthy the days were
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

	//gets the pollutant of the current year selected
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
	
	//updates charts
	this[_lineChart1].updateVis(newData, "AQI For " + _county + " County", _side)
	this[_lineChart2].updateVis(newData, "Percentage of Contributing Pollutant Per Year", _side)
	this[_lineChart3].updateVis(newData, "Days Without AQI", _side)
	this[_pieChart1].updateVis(recentHealthYearData, "Air Quality of " + _year)
	this[_pieChart2].updateVis(recentPollutantYearData, "Major Pollutants in " + _year)
}

//used to update pie charts, mainly from year slider change
function updatePies(_state, _county, _year, _pieChart1, _pieChart2){
	//gets data from state and county
	var newData = JSON.parse(JSON.stringify(getCountyAQI(_state, _county, data, "")))

		//gets data for how healthy the days were
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
		
		//gets the pollutant of the current year selected
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

		//updates pie charts
		this[_pieChart1].updateVis(recentHealthYearData, "Air Quality of " + _year)
		this[_pieChart2].updateVis(recentHealthYearData, "Major Pollutants in " + _year)
}

function updateMap(){

	var leftSelect = document.getElementById("LeftSelectCounty");
	var value = leftSelect.options[leftSelect.selectedIndex].value
	var leftArr = value.split(", ")

	var rightSelect = document.getElementById("RightSelectCounty");
	value = rightSelect.options[rightSelect.selectedIndex].value
	var rightArr = value.split(", ")

	var e = document.getElementById("YearSlider")
	var select = document.getElementById("MapSelect")
	var newData = JSON.parse(JSON.stringify(getCountyAQI(null, null, dataFips, e.value)))

	geoData.objects.counties.geometries.forEach(d => {
		d.properties.selected = false
		for (let i = 0; i < newData.length; i++) {
			if (parseInt(d.id) == parseInt(newData[i].fips)) {
				d.properties.pop = parseInt(newData[i][select.value]);
				break;
			}
		}
	});

	if(leftSelect.selectedIndex) {
		var leftCounty = dataFips.filter(obj => {
				return obj.State == leftArr[0]
		}).filter(obj => {
			return obj.County == leftArr[1]
		})
	
		geoData.objects.counties.geometries.forEach(d => {
			if (parseInt(d.id) == parseInt(leftCounty[0].fips)) {
				d.properties.selected = true
			}
		});
	}

	if(rightSelect.selectedIndex) {
		var rightCounty = dataFips.filter(obj => {
				return obj.State == rightArr[0]
		}).filter(obj => {
			return obj.County == rightArr[1]
		})
		geoData.objects.counties.geometries.forEach(d => {
			if (parseInt(d.id) == parseInt(rightCounty[0].fips)) {
				d.properties.selected = true
			}
		});
		
	}
	var width = document.getElementById("map").parentElement.offsetWidth
	var height = document.getElementById("map").parentElement.offsetHeight
	if(typeof choroplethMap === "undefined"){
		choroplethMap = new ChoroplethMap({ 
			parentElement: '#map',
			'containerHeight': height,
  			'containerWidth': width   
			}, geoData, select.value);
	} else {
		choroplethMap.updateVis(geoData, select.value)
	}
}

//takes raw data and returns data array based on state and county
function getCountyAQI(_state, _county, _data, _year){
	var returnData = []

	if(_year == ""){
	//goes through each data and checks if the row state and county match the input
		for (const [id, county] of Object.entries(_data)) {
			if (county.State == _state && county.County == _county) {
				returnData.push(county)
			}
		}
	} else {
		for (const [id, county] of Object.entries(_data)) {
			if (county.Year == _year) {
				returnData.push(county)
			}
		}
	}
	return returnData
}

//loads the dropdown menus
function loadDropDown(_name, _values){

	//grabs the dropdown
	var select = document.getElementById(_name);
	var opt = document.createElement('option')
	var value = ""
	var innerHTML = ""

	//goes through each item in _values array to create the name and value of the option
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
	
	//appends the option to the dropdown
	opt.value = value
	opt.innerHTML = innerHTML
	select.appendChild(opt)
}

//used for showing counties based on the filtered state
function filter(_side){

	//gets the filter according the the side it is on
	var keyWord = document.getElementById(_side + "SelectFilter").value;
	var select = document.getElementById(_side + "SelectCounty");

	//iterates through each option in the dropdown to determine if it will be displayed
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

//used for calculating percentage
function getPercentage(_data, _columns){
	var returnData = []

	//for loop for each data row 
	for (const [id, county] of Object.entries(_data)){
		var totalDays = county["Days with AQI"]

		//for loop to go through the column names defined in _columns and divides it by the "Days with AQI" * 100 to get percentage of days with that pollutant in that year
		_columns.forEach(function (item, index){
			county[item] = county[item]/totalDays * 100
		})
		returnData.push(county)
	}
	return returnData
}

//used to calculate the amount of days without AQI
function getReverseNumberofDays(_data, _years){
	var returnData = []

	//_years is from a csv containing years and how many days are in it 
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

//function used to create new line chart
function createNewLineChart(_height, _width, _lineChart, _data, _columns, _title, _xAxis, _yAxis, _side){
	return new LineChart({
  			'parentElement': _lineChart,
  			'containerHeight': _height,
  			'containerWidth': _width
	}, _data, _columns, _title, _xAxis, _yAxis, _side)
}

//function used to create new pie chart
function createNewPieChart(_height, _width, _pieChart, _data, _columns, _title, _xAxis, _yAxis){
	return new PieChart({
  			'parentElement': _pieChart,
  			'containerHeight': _height,
  			'containerWidth': _width
	}, _data, _columns, _title, _xAxis, _yAxis)
}

//function used to group data, used for finding unique states and counties
function groupDataBy(_data, _groupBy, _varName){
	var helper = {};
	var result = _data.reduce(function(r, o) {
		var key = ""
		_groupBy.forEach(function (item, index){
			if(index == _groupBy.length-1) key += o[item]
			else key += o[item] + '-'
		})

		if(!helper[key]) {
		helper[key] = Object.assign({}, o); // create a copy of o
		r.push(helper[key]);
		this[_varName].push(helper[key])
		}
		return r;
	}, []);
}

