class StackedAreaChart {

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

    var stack = d3.stack()
      .keys(vis.names)
      (vis.data)

    var stackedData = []
    stack.forEach((layer, index)) => {
      var currentStack = [];
      layer.forEach((d, i) => {
        currentStack.push({
          values: d,
          year: d
        })
      })
      stackedData.push(currentStack)
    }
    console.log(stackedData)
  }

  updateVis() {
    
    vis.renderVis();
  }

  renderVis() {
    
  }
}