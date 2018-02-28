console.log(user);
var CELL_SIZE = 50;
var width = 100
    heigth = 100
    cellSize = 15

d3.select('.heatmap')
    .append("svg")
    .append("rect")
    .attr('width', CELL_SIZE)
    .attr('height', CELL_SIZE)
    .attr('x', 0)
    .attr('y', 0)
    .style('fill', 'blue')
    
d3.select("body")
  .style('background-color', 'red')
  .append('p')
  .text("sample text")
