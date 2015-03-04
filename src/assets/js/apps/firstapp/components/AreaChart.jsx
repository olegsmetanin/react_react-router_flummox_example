/*jshint -W018, -W040, -W064, -W083, -W086 */

import React from 'react';
import d3 from 'd3';

let AreaChart =  React.createClass({
  componentDidMount: function() {
    this.redraw();
    if (window) {
      window.addEventListener('resize', this.onResize);
    }
  },

  redraw () {

    var data = this.props.data; 


    var el = this.getDOMNode();
    var child = el.childNodes[0];
    if (child) {
      el.removeChild(child);   
    }

    if (data.length !== 0) {

      var w = el.clientWidth;
      var h= el.clientHeight;

      var svg = d3.select(el)
      .append("svg")
      .attr("width", w)
      .attr("height", h)
      .append("g")
      .attr("transform", "translate(50,50)");

      var x = d3.time.scale()
      .range([0, w-100]);

      var y = d3.scale.linear()
      .range([h-100, 0]);

      var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .tickFormat(d3.time.format('%b'));

      var xAxis2 = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(d3.time.years, 1)
      .tickFormat(d3.time.format('%Y'));

      var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

      var line = d3.svg.line()
      .interpolate("basis")
      .x(function(d) { return x(d[0]); })
      .y(function(d) { return y(d[1]); });

      x.domain([data[0][0], data[data.length - 1][0]]);
      y.domain(d3.extent(data, function(d) { return d[1]; }));

      svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (h-100) + ")")
      .call(xAxis);
      svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (h-180) + ")")
      .call(xAxis2);

      svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")

      svg.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line);

      this._svg = svg;            
    }
  },

  componentWillUnmount: function() {
    if (window) {
      window.removeEventListener('resize', this.onResize);
    }
  },

  onResize(e) {
    this.redraw();
  },

  render: function() {
    return (
      <div className="chartwrap"></div>
    );
  }
});

export default AreaChart;