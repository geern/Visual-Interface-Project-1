class LineChart {

  constructor(_config, _data, _names, _title, _xLabel, _yLabel) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 140,
      margin: { top: 10, bottom: 30, right: 50, left: 50 }
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
            .domain(d3.extent(vis.data, vis.xValue)) //d3.min(vis.data, d => d.year), d3.max(vis.data, d => d.year) );
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
        vis.xAxis = d3.axisBottom(vis.xScale);
        vis.yAxis = d3.axisLeft(vis.yScale);

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

        /*vis.area = d3.area()
            .x(d => vis.xScale(vis.xValue(d)))
            .y1(d => vis.yScale(vis.yValue(d)))
            .y0(vis.height);*/

        /*vis.chart.append('path')
            .data([vis.data])
            .attr('fill','#e9eff5')
            .attr('d',vis.area);*/

        vis.line = d3.line()
            .x(d => vis.xScale(vis.xValue(d)) + 50)
            .y(d => vis.yScale(vis.yValue(d)) + 50);

        vis.chart.append('path')
            .data([vis.data])
            .attr('stroke', (d) => vis.colorPalette(item))
            .attr('fill', 'none')
            .attr('stroke-width', 2)
            .attr('d', vis.line);

        vis.chart.append("text")
            .attr("class", "x label")
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
    });
  }


  //leave this empty for now
 updateVis() { 
   

 }


 //leave this empty for now...
 renderVis() { 

  }



}