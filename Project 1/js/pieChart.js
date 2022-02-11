class PieChart {

  constructor(_config, _data, _names, _title, _xLabel, _yLabel) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 140,
      margin: { top: 10, bottom: 30, right: 50, left: 50 }
    }
    console.log(_config.containerWidth)
    console.log(_config.containerHeight)
    this.data = _data;
    this.names = _names;
    this.title = _title;
    this.xLabel = _xLabel;
    this.yLabel = _yLabel
    // Call a class function
    this.initVis();
  }

  initVis() {
    
    let vis = this;

    vis.colorPalette = d3.scaleOrdinal()
      .domain(Object.keys(vis.data))
      .range(d3.schemeTableau10);

    vis.numbers = []
    vis.colors = []

    vis.names.forEach(function (item, index){
      for (const [id, value] of Object.entries(vis.data)){
        if (id == item){
          vis.numbers.push(value)
          vis.colors.push(vis.colorPalette(id))
        }
      }
    })

    vis.width = vis.config.containerWidth;
    vis.height = vis.config.containerHeight;
    console.log(vis.width)
    console.log(vis.height)
    var radius = Math.min(vis.width, vis.height)/3
    console.log(radius)

    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight)
        .attr('radius', radius);

    vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.width /2+50},${vis.height /2+50})`);

    vis.pie = d3.pie()

    vis.arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius)

    vis.arcs = vis.chart.selectAll("arc")
      .data(vis.pie(vis.numbers))
      .enter()
      .append("g")
      .attr("class", "arc")

    vis.arcs.append("path")
      .attr("fill", function(d, i){
        return vis.colors[i];
      })
      .attr("d", vis.arc)

    var y = 110
    vis.names.forEach(function (item, index){
      vis.svg.append("circle")
        .attr("cx", 10)
        .attr("cy", y-2)
        .attr("r", 6)
        .style("fill", d=> vis.colors[index])
      vis.svg.append("text")
        .attr("x", 30)
        .attr("y", y)
        .text(item)
        .style("font-size", "15px")
        .attr("alignment-baseline","middle")
      y += 30
    })

    vis.svg.append("text")
      .attr("class", "title")
      .attr("text-anchor", "middle")
      .attr("x", vis.width/2)
      .attr("y", 50)
      .text(vis.title);

  }


  //leave this empty for now
  updateVis() { 
   

 }


 //leave this empty for now...
  renderVis() { 

  }
}