class LineChart {

  constructor(_config, _data, _names, _title, _xLabel, _yLabel) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 140,
      margin: { top: 10, bottom: 30, right: 50, left: 50 },
      tooltipPadding: _config.tooltipPadding || 15
    }

    this.data = _data;
    this.names = _names;
    this.title = _title;
    this.xLabel = _xLabel;
    this.yLabel = _yLabel
    // Call a class function
    this.initVis();
  }

  initVis() {
      

    let vis = this; //this is a keyword that can go out of scope, especially in callback functions, 
                    //so it is good to create a variable that is a reference to 'this' class instance
    //console.log(Object.keys(vis.data[0]))

    vis.names.forEach(function (item, index){
        //set up the width and height of the area where visualizations will go- factoring in margins               
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        //reusable functions for x and y 
        
        vis.xValue = d => d.Year; 
        vis.yValue = d => parseInt(d[item]);

        var extents = vis.names.map(function(dimensionName) {
            return d3.extent(vis.data, function(d) { return parseInt(d[dimensionName]) });
        });

        var extent = [d3.min(extents, function(d) { return d[0] }),
                      d3.max(extents, function(d) { return d[1] })];

        //setup scales
        vis.xScale = d3.scaleLinear()
            .domain([1980, 2021]) //d3.min(vis.data, d => d.year), d3.max(vis.data, d => d.year) );
            .range([0, vis.width]);

        vis.yScale = d3.scaleLinear()
            .domain(extent)
            .range([vis.height, 0])
            .nice(); //this just makes the y axes behave nicely by rounding up

        vis.colorPalette = d3.scaleOrdinal()
            .domain(Object.keys(vis.data[0]))
            .range(d3.schemeTableau10);
        //console.log(item + vis.colorPalette(item))

        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth + 50)
            .attr('height', vis.config.containerHeight + 100);

        // Append group element that will contain our actual chart (see margin convention)
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);


        // Initialize axes
        vis.xAxis = d3.axisBottom(vis.xScale).tickFormat(d3.format("d"));
        vis.yAxis = d3.axisLeft(vis.yScale);

        vis.line = d3.line()
            .x(d => vis.xScale(vis.xValue(d)) + 50)
            .y(d => vis.yScale(vis.yValue(d)) + 50);

        vis.chart.append('path')
            .data([vis.data])
            .attr('stroke', (d) => vis.colorPalette(item))
            .attr('fill', 'none')
            .attr('stroke-width', 2)
            .attr('d', vis.line);

        if(index == 0){
            // Append x-axis group and move it to the bottom of the chart
            vis.xAxisG = vis.chart.append('g')
                .attr('class', 'axis x-axis')
                .attr('transform', `translate(50,${vis.height + 50})`)
                .call(vis.xAxis);
            
            // Append y-axis group
            vis.yAxisG = vis.chart.append('g')
                .attr('class', 'axis y-axis')
                .attr('transform', `translate(50,50)`)
                .call(vis.yAxis);

            vis.chart.append("text")
                .attr("class", "y label")
                .attr("text-anchor", "end")
                .attr("x", 0)
                .attr("y", vis.height/2 + 50)
                .text(vis.yLabel);

            vis.chart.append("text")
                .attr("class", "x label")
                .attr("text-anchor", "end")
                .attr("x", vis.width/2 + 50)
                .attr("y", vis.height + 90)
                .text(vis.xLabel);

            vis.chart.append("text")
                .attr("class", "title")
                .attr("text-anchor", "end")
                .attr("x", vis.width/2 + 100)
                .attr("y", 10)
                .text(vis.title);
        }

        if(index == vis.names.length-1){
            vis.trackingArea = vis.chart.append('rect')
                .attr('width', vis.config.containerWidth - 95)
                .attr('height', vis.config.containerHeight - 40)
                .attr('fill', 'none')
                .attr('pointer-events', 'all')
                .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top + 40})`);
            vis.shadowHighlight = vis.chart.append('rect')
                .attr('width', 2)
                .attr('height', vis.config.containerHeight - 40)
                .attr('fill', 'grey')
                .attr('id', 'ShadowHighlight')
                .attr('display', 'none')
                .attr('opacity', 0.5)
        }
        
        
    });
  }

 updateVis() { 
    let vis = this;
   vis.names.forEach(function (item, index){
    if(index == vis.names.length-1){
    
    vis.xValue = d => d.Year;
    vis.yValue = d => parseInt(d[vis.names[0]]);

    vis.line = d3.line()
        .x(d => vis.xScale(vis.xValue(d)) + 50)
        .y(d => vis.yScale(vis.yValue(d)) + 50);

    var extents = vis.names.map(function(dimensionName) {
            return d3.extent(vis.data, function(d) { return parseInt(d[dimensionName]) });
        });

    var extent = [d3.min(extents, function(d) { return d[0] }),
                  d3.max(extents, function(d) { return d[1] })];

    vis.bisectDate = d3.bisector(vis.xValue).left;

    vis.renderVis();
}
})
 }


 renderVis() { 
    let vis = this;
    vis.names.forEach(function (item, index){
    if(index == vis.names.length-1){
    
    // Add line path
    vis.trackingArea
        .on('mouseenter', () => {
          d3.select("#ToolTip").style('display', 'block');
          d3.selectAll('#ShadowHighlight').style('display','block')
        })
        .on('mouseleave', () => {
          d3.select("#ToolTip").style('display', 'none');
          d3.selectAll('#ShadowHighlight').style('display','none')
        })
        .on('mousemove', function(event) {
            console.log("MOVING")
          // Get date that corresponds to current mouse x-coordinate
          const xPos = d3.pointer(event, this)[0]; // First array element is x, second is y
          const date = vis.xScale.invert(xPos);

          // Find nearest data point
          const index = vis.bisectDate(vis.data, date, 1);
          const a = vis.data[index - 1];
          const b = vis.data[index];
          const d = b && (date - a.date > b.date - date) ? b : a;

          var html = () => {
            var stringReturn = ``
            stringReturn += `<div class="tooltip-title" ">${vis.title}</div>`
            stringReturn += `<ul>`
            stringReturn += `<li>Year: ${d.Year}</li>`
            vis.names.forEach(function (item, index){
                stringReturn += `<li>${item}: ${d[item]}</li>`
            })
            stringReturn += `</ul>`
            return stringReturn
          }
          
            d3.select('#ToolTip')
                .style('display', 'block')
                .style('position','absolute')
                .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
                .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                .html(html);
            d3.selectAll('#ShadowHighlight')
                .attr('transform', `translate(${xPos +48},${vis.config.margin.top + 40})`)

        });
    
    // Update the axes
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);
    }
})
  
}


}