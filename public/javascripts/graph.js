console.log(user);
var CELL_SIZE = 50;
var width = 100
    heigth = 100
    cellSize = 15

var year = user.years[0]
var date = year.days[0]
var newDate = new Date(date.date);
console.log(newDate)

d3.select('.heatmap')
    .append("svg")
    .attr('width', 600)
    .data(year.days)
    .append("rect")
    .attr('width', CELL_SIZE)
    .attr('height', CELL_SIZE)
    .attr('x', (d) => d3.timeFormat('%U')(newDate) * CELL_SIZE)
    .attr('y', 0)
    .style('fill', 'blue')
    
d3.select("body")
  .style('background-color', 'red')
  .append('p')
  .text("sample text")
