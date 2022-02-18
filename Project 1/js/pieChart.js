class PieChart {

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
    
    let vis = this;
    if(typeof vis.data === "undefined"){
      vis.svg = d3.select(vis.config.parentElement)
          .attr('width', vis.config.containerWidth)
          .attr('height', vis.config.containerHeight)
          .attr('radius', radius);
      vis.svg.append("text")
          .text("No Data Exists for this Year")
          .style("font-size", "15px")
          .attr('transform', `translate(${vis.config.containerWidth/2 -50},${vis.config.containerHeight/2})`)
    } else {

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

      vis.radius = Math.min(vis.width, vis.height)/3

      vis.svg = d3.select(vis.config.parentElement)
          .attr('width', vis.config.containerWidth)
          .attr('height', vis.config.containerHeight)
          .attr('radius', vis.radius);

      vis.chart = vis.svg.append('g')
              .attr('transform', `translate(${vis.width /2+100},${vis.height /2})`);

      vis.pie = d3.pie()

      vis.arc = d3.arc()
        .innerRadius(0)
        .outerRadius(vis.radius)

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

      var y = 30
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
        .attr("y", 20)
        .text(vis.title);

      vis.trackingArea = vis.chart.append('circle')
                .attr("r", vis.radius)
                .attr('fill', 'none')
                .attr('pointer-events', 'all')
    }

  }


  //leave this empty for now
  updateVis(_data, _title) { 
  let vis = this
    if(typeof _data === "undefined"){
      vis.svg.select("g")
        .attr("display", "none")
      vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight)
        .attr('radius', vis.radius);
      vis.svg.append("text")
        .text("No Data Exists for this Year")
        .attr("class", "error")
        .style("font-size", "15px")
        .attr('transform', `translate(${vis.config.containerWidth/2 -50},${vis.config.containerHeight/2+50})`)
      vis.svg.select(".title")
        .text(_title)
    } else {
      vis.svg.selectAll(".error").attr("display", "none")
      vis.svg.select("g")
        .attr("display", "block")

      vis.newNumbers = []
      vis.names.forEach(function (item, index){
        for (const [id, value] of Object.entries(_data)){
          if (id == item){
          vis.newNumbers.push(value)
          }
        }
      })

      var newData = vis.pie(vis.newNumbers)

      var u = vis.svg.selectAll("path")
      .data(newData)

      u.enter()
        .append('path')
        .merge(u)
        .transition()
        .duration(1000)
        .attr('d', d3.arc()
          .innerRadius(0)
          .outerRadius(vis.radius)
        )
        .attr("fill", function(d, i){
          return vis.colors[i];
        })
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 1)

      vis.svg.select(".title")
        .text(_title)
      u.exit()
        .remove()
    }
    vis.numbers = vis.newNumbers
    vis.renderVis();
 }


 //leave this empty for now...
  renderVis() { 
    let vis = this;
    vis.trackingArea
        .on('mouseenter', () => {
          d3.select("#ToolTip").style('display', 'block');
        })
        .on('mouseleave', () => {
          d3.select("#ToolTip").style('display', 'none');
        })
        .on('mousemove', function(event) {
            console.log("MOVING PIE")
          var html = () => {
            var stringReturn = ``
            stringReturn += `<div class="tooltip-title" ">${vis.title}</div>`
            stringReturn += `<ul>`
            vis.names.forEach(function (item, index){
                stringReturn += `<li>Percent ${item}: ${vis.numbers[index].toFixed(2)}%</li>`
            })
            stringReturn += `</ul>`
            return stringReturn
          }
            var width = document.getElementById('ToolTip').offsetWidth
            d3.select('#ToolTip')
                .style('display', 'block')
                .style('position','absolute')
                .style('left', ()=>{
                    if(event.pageX + width >= 1900){
                        return (event.pageX - 10 - width) + 'px'
                    }
                    return (event.pageX + 10) + 'px'
                })   
                .style('top', (event.pageY + 10) + 'px')
                .html(html);

        });
  }
}