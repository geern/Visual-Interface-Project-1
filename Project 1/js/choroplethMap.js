class ChoroplethMap {

  /**
   * Class constructor with basic configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, _column) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1000,
      containerHeight: _config.containerHeight || 500,
      margin: _config.margin || {top: 10, right: 10, bottom: 10, left: 10},
      tooltipPadding: 10,
      legendBottom: 50,
      legendLeft: 50,
      legendRectHeight: 12, 
      legendRectWidth: 150
    }
    this.data = _data;
    // this.config = _config;
    this.column = _column
    this.us = _data;

    this.active = d3.select(null);

    this.initVis();
  }
  
  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    let vis = this;
    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement).append('svg')
        .attr('class', 'center-container')
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    vis.svg.append('rect')
            .attr('class', 'background center-container')
            .attr('height', vis.config.containerWidth ) //height + margin.top + margin.bottom)
            .attr('width', vis.config.containerHeight) //width + margin.left + margin.right)
            .on('click', vis.clicked);

  
    vis.projection = d3.geoAlbersUsa()
            .translate([vis.width /2 , vis.height / 2])
            .scale(vis.width);

    vis.colorPallete = [{'type': "Max AQI", 'colour': ['#fee8c8','#e34a33']}, 
    {'type': "Median AQI", 'colour': ['#ece7f2','#2b8cbe']}, 
    {'type': "90th Percentile AQI", 'colour': ['#e0ecf4','#8856a7']}, 
    {'type': "Days CO", 'colour': ['#e5f5f9','#2ca25f']},
    {'type': "Days NO2", 'colour': ['#edf8b1','#2c7fb8']},
    {'type': "Days Ozone", 'colour': ['#fff7bc','#d95f0e']},
    {'type': "Days SO2", 'colour': ['#efedf5','#756bb1']},
    {'type': "Days PM2.5", 'colour': ['#fee6ce','#e6550d']},
    {'type': "Days PM10", 'colour': ['#ece2f0','#1c9099']}]

    vis.colorPallete.forEach(d => {
      if(d.type == vis.column)  vis.color = d.colour
    })

    vis.colorScale = d3.scaleLinear()
      .domain(d3.extent(vis.data.objects.counties.geometries, d => d.properties.pop))
        .range(vis.color)
        .interpolate(d3.interpolateHcl);

    vis.path = d3.geoPath()
            .projection(vis.projection);

    vis.g = vis.svg.append("g")
            .attr('class', 'center-container center-items us-state')
            .attr('transform', 'translate('+vis.config.margin.left+','+vis.config.margin.top+')')
            .attr('width', vis.width + vis.config.margin.left + vis.config.margin.right)
            .attr('height', vis.height + vis.config.margin.top + vis.config.margin.bottom)


    vis.counties = vis.g.append("g")
                .attr("id", "counties")
                .selectAll("path")
                .data(topojson.feature(vis.us, vis.us.objects.counties).features)
                .enter().append("path")
                .attr("d", vis.path)
                // .attr("class", "county-boundary")
                .attr('fill', d => {
                      if (d.properties.pop) {
                        return vis.colorScale(d.properties.pop);
                      } else {
                        return 'url(#lightstripe)';
                      }
                    });

      vis.counties
                .on('mousemove', (d,event) => {
                    const popDensity = event.properties.pop ? `<strong>${event.properties.pop}</strong> ${vis.column}` : 'No data available'; 
                    d3.select('#ToolTip')
                      .style('display', 'block')
                      .style('position','absolute')
                      .style('left', (d.pageX + vis.config.tooltipPadding) + 'px')   
                      .style('top', (d.pageY + vis.config.tooltipPadding) + 'px')
                      .html(`
                        <div class="tooltip-title">${event.properties.name}</div>
                        <div>${popDensity}</div>
                      `);
                  })
                  .on('mouseleave', () => {
                    d3.select('#ToolTip').style('display', 'none');
                  });
    vis.counties.on('click', (d, event) => {
      if(!rotate){
        clickFips = event.id
        var e = document.getElementById("LeftSelectCounty")
        var tmp = event.properties.state + ", " + event.properties.county;
        e.value = tmp
        if(e.value == "") alert("No AQI data exists")
        else{
          e.onchange()
          rotate = true
        }
      } else {
        clickFips = event.id
        var e = document.getElementById("RightSelectCounty")
        var tmp = event.properties.state + ", " + event.properties.county;
        e.value = tmp
        if(e.value == "") alert("No AQI data exists")
        else{
          e.onchange()
          rotate = false
        }
      }
      })



    vis.g.append("path")
                .datum(topojson.mesh(vis.us, vis.us.objects.states, function(a, b) { return a !== b; }))
                .attr("id", "state-borders")
                .attr("d", vis.path);

  }

  updateVis(_data, _column){
    let vis = this

    vis.svg.select('#counties').remove()

    vis.colorPallete.forEach(d => {
      if(d.type == _column)  vis.color = d.colour
    })

    vis.colorScale
        .domain(d3.extent(_data.objects.counties.geometries, d => d.properties.pop))
        .range(vis.color)

    vis.path = d3.geoPath()
            .projection(vis.projection);

    vis.g = vis.svg.append("g")
            .attr('class', 'center-container center-items us-state')
            .attr('transform', 'translate('+vis.config.margin.left+','+vis.config.margin.top+')')
            .attr('width', vis.width + vis.config.margin.left + vis.config.margin.right)
            .attr('height', vis.height + vis.config.margin.top + vis.config.margin.bottom)


    vis.counties = vis.g.append("g")
                .attr("id", "counties")
                .selectAll("path")
                .data(topojson.feature(vis.us, vis.us.objects.counties).features)
                .enter().append("path")
                .attr("d", vis.path)
                // .attr("class", "county-boundary")
                .attr('fill', d => {
                      if(d.properties.selected){
                        return "#AAFF00"
                      } else if (d.properties.pop) {
                        return vis.colorScale(d.properties.pop);
                      } else {
                        return 'url(#lightstripe)';
                      }
                    });

    vis.counties
                .on('mousemove', (d,event) => {
                    const popDensity = event.properties.pop ? `<strong>${event.properties.pop}</strong> ${vis.column}` : 'No data available'; 
                    d3.select('#ToolTip')
                      .style('display', 'block')
                      .style('position','absolute')
                      .style('left', (d.pageX + vis.config.tooltipPadding) + 'px')   
                      .style('top', (d.pageY + vis.config.tooltipPadding) + 'px')
                      .html(`
                        <div class="tooltip-title">${event.properties.name}</div>
                        <div>${popDensity}</div>
                      `);
                  })
                  .on('mouseleave', () => {
                    d3.select('#ToolTip').style('display', 'none');
                  });
    vis.counties.on('click', (d, event) => {
      if(!rotate){
        clickFips = event.id
        var e = document.getElementById("LeftSelectCounty")
        var tmp = event.properties.state + ", " + event.properties.county;
        e.value = tmp
        if(e.value == "") alert("No AQI data exists")
        else{
          e.onchange()
          rotate = true
        }
      } else {
        clickFips = event.id
        var e = document.getElementById("RightSelectCounty")
        var tmp = event.properties.state + ", " + event.properties.county;
        e.value = tmp
        if(e.value == "") alert("No AQI data exists")
        else{
          e.onchange()
          rotate = false
        }
      }
    })

    vis.g.append("path")
                .datum(topojson.mesh(vis.us, vis.us.objects.states, function(a, b) { return a !== b; }))
                .attr("id", "state-borders")
                .attr("d", vis.path);
  }

  
}