class ChoroplethMap {

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
    vis.width = vis.config.containerWidth
    vis.height = vis.config.containerHeight

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement).append('svg')
        .attr('class', 'center-container')
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    vis.svg.append('rect')
            .attr('class', 'background center-container')
            .attr('height', vis.config.containerWidth )
            .attr('width', vis.config.containerHeight)
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

    vis.updateVis(vis.data, vis.column)
  }

  updateVis(_data, _column){
    let vis = this

    vis.svg.selectAll('*').remove()

    vis.column = _column
    vis.colorPallete.forEach(d => {
      if(d.type == _column)  vis.color = d.colour
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
                .attr("class", d => {
                      if(d.properties.selected) return 'county-boundary-selected'
                      return 'county-boundary'
                    })
                .attr('fill', d => {
                      if (d.properties.pop) {
                        return vis.colorScale(d.properties.pop);
                      } else {
                        return 'url(#lightstripe)';
                      }
                    })
                

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
          document.getElementById("mapInfo").innerHTML = "Click on map select county for right side"
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
          document.getElementById("mapInfo").innerHTML = "Click on map select county for left side"
        }
      }
    })

    vis.g.append("path")
                .datum(topojson.mesh(vis.us, vis.us.objects.states, function(a, b) { return a !== b; }))
                .attr("id", "state-borders")
                .attr("d", vis.path);

    vis.linearGradient = vis.svg.append('defs').append('linearGradient')
        .attr("id", "legend-gradient")
        /*.attr('x1', '0%')
        .attr('x2', '0%')
        .attr('y1', '0%')
        .attr('y2', '100%')*/

    vis.legend = vis.svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${vis.width/2  - 125},${20})`);
    
    vis.legendRect = vis.legend.append('rect')
        .attr('width', 250)
        .attr('height', 25);

    vis.legendTitle = vis.legend.append('text')
        .attr('class', 'legend-title')
        .attr('dy', '.35em')
        .attr('y',-10)
        .text(vis.column)

    vis.legendStops = [
      { color: vis.color[0], value: d3.extent(vis.data.objects.counties.geometries, d => d.properties.pop)[0], offset: 0},
      { color: vis.color[1], value: d3.extent(vis.data.objects.counties.geometries, d => d.properties.pop)[1], offset: 100},
    ];

    vis.legend.selectAll('.legend-label')
        .data(vis.legendStops)
      .join('text')
        .attr('class', 'legend-label')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .attr('y', 40)
        .attr('x', (d,index) => {
          return index == 0 ? 0 : 250;
        })
        .text(d => Math.round(d.value * 10 ) / 10);

    vis.linearGradient.selectAll('stop')
        .data(vis.legendStops)
      .join('stop')
        .attr('offset', d => d.offset)
        .attr('stop-color', d => d.color);

    vis.legendRect.attr('fill', 'url(#legend-gradient)');
  }

  
}