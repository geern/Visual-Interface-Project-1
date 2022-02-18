class LineChart {

  constructor(_config, _data, _names, _title, _xLabel, _yLabel, _side) {
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
    this.side = _side
    // Call a class function
    this.initVis();
  }

  initVis() {
      

    let vis = this;

    vis.colorPalette = d3.scaleOrdinal()
            .domain(Object.keys(vis.data[0]))
            .range(d3.schemeTableau10);

    vis.data = vis.checkData(JSON.parse(JSON.stringify(vis.data)))

    vis.chart = []
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

        

        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth + 50)
            .attr('height', vis.config.containerHeight + 100);

        // Append group element that will contain our actual chart (see margin convention)
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`)

        // Initialize axes
        vis.xAxis = d3.axisBottom(vis.xScale).tickFormat(d3.format("d"));
        vis.yAxis = d3.axisLeft(vis.yScale);

        vis.line = d3.line()
            //.curve(d3.curveStep)
            .x(d => vis.xScale(vis.xValue(d)) + 50)
            .y(d => vis.yScale(vis.yValue(d)) + 50)

        if(index == 0){
            vis.back = vis.chart.append('rect')
                .attr('width', vis.config.containerWidth - 95)
                .attr('height', vis.config.containerHeight - 40)
                .attr('fill', 'white')
                .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top + 40})`);
            // Append x-axis group and move it to the bottom of the chart
            vis.xAxisG = vis.chart.append('g')
                .attr('class', 'axis x-axis')
                .attr('transform', `translate(50,${vis.height + 50})`)
                .call(vis.xAxis);
            
            // Append y-axis group
            vis.yAxisG = vis.chart.append('g')
                .attr('class', 'axis y-axis ' + vis.side + item.replace(/\s/g, '').replace(/\./g,'')  + "axis")
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
                .attr("class", "title" + vis.side + item.replace(/\s/g, '').replace(/\./g,''))
                .attr("text-anchor", "end")
                .attr("x", vis.width/2 + 100)
                .attr("y", 10)
                .text(vis.title);
        }

        vis.chart.append('path')
            .data([vis.data])
            .attr('stroke', (d) => vis.colorPalette(item))
            .attr('fill', 'none')
            .attr('stroke-width', 4)
            .attr('d', vis.line)
            .attr('class', vis.side + item.replace(/\s/g, '').replace(/\./g,''))

        vis.bisectDate = d3.bisector(vis.xValue).left;

        if(index == vis.names.length-1){
            vis.shadowHighlightYear = vis.chart.append('rect')
                .attr('width', 2)
                .attr('height', vis.config.containerHeight - 40)
                .attr('fill', 'grey')
                .attr('id', 'ShadowHighlightYear')
                .attr('display', 'block')
                .attr('opacity', 0.5)

            vis.shadowHighlight = vis.chart.append('rect')
                .attr('width', 2)
                .attr('height', vis.config.containerHeight - 40)
                .attr('fill', 'grey')
                .attr('id', 'ShadowHighlight')
                .attr('display', 'none')
                .attr('opacity', 0.5)

            vis.trackingArea = vis.chart.append('rect')
                .attr('width', vis.config.containerWidth - 95)
                .attr('height', vis.config.containerHeight - 40)
                .attr('fill', 'none')
                .attr('pointer-events', 'all')
                .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top + 40})`);
        }        
    });
    vis.renderVis()
  }

    updateVis(_data, _title, _side) { 
        let vis = this
        _data = vis.checkData(JSON.parse(JSON.stringify(_data)))

        vis.names.forEach(function (item, index){
            if(index == 0) {
                var extents = vis.names.map(function(dimensionName) {
                    return d3.extent(_data, function(d) { return parseInt(d[dimensionName]) });
                });

                var extent = [d3.min(extents, function(d) { return d[0] }),
                    d3.max(extents, function(d) { return d[1] })];

                vis.yScale.domain(extent)
                
                d3.select("." + _side + item.replace(/\s/g, '').replace(/\./g,'') + "axis")
                    .transition()
                    .duration(1000)
                    .call(vis.yAxis)

                d3.select('.title' + _side + item.replace(/\s/g, '').replace(/\./g,''))
                    .text(_title);
            }

            vis.yValue = d => parseInt(d[item]);

            var u = d3.select("." + _side + item.replace(/\s/g, '').replace(/\./g,''))
                .data([_data])

            u.enter()
                .append('path')
                .merge(u)
                .transition()
                .duration(1000)
                .attr('d', vis.line)

            u.exit().remove()
        })

        vis.data = _data
    }

    renderVis() { 
        let vis = this;
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
            var width = document.getElementById('ToolTip').offsetWidth
            d3.select('#ToolTip')
                .style('display', 'block')
                .style('position','absolute')
                .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                .style('left', ()=>{
                    if(event.pageX + width >= 1900){                        
                        return (event.pageX - width) + 'px'
                    }
                    return (event.pageX + vis.config.tooltipPadding) + 'px'
                })
                .html(html);
            d3.selectAll('#ShadowHighlight')
                .attr('transform', `translate(${xPos + 50},${vis.config.margin.top + 40})`)
        });

        // Update the axes
        vis.xAxisG.call(vis.xAxis);
        vis.yAxisG.call(vis.yAxis);
    }

    renderYearHighlight(_year){
        let vis = this
        vis.svg.select('#ShadowHighlightYear')
                .attr('transform', `translate(${vis.xScale(_year) + 50},${vis.config.margin.top + 40})`)
    }

    checkData(_data){
        let vis = this

        for(var i = 1980; i <= 2021; i++){
            if(_data.find(d => d.Year == i)) continue
            else {
                _data.push({
                    Year: i,
                })
                vis.names.forEach(function(item, index){
                    if(item == "Days without AQI") {
                        if(new Date(i, 1, 29).getDate() === 29) _data.find(d => d.Year == i)[item] = 366
                        else _data.find(d => d.Year == i)[item] = 365
                    }
                    else _data.find(d => d.Year == i)[item] = 0
                })
            }
        }

        _data.sort((a,b) => ((a.Year > b.Year) ? 1 : ((b.Year > a.Year) ? -1 : 0)))
        return _data
    }
}