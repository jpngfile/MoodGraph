console.log(user);
var CELL_SIZE = 15;

var year = user.years[0]
var date = year.days[0]
var newDate = new Date(date.date);
console.log(newDate)

var svg = d3.select('.heatmap')
    .append("svg")
    .attr('width', 900)
    
svg.append('g').selectAll('rect')
    .data(year.days)
    .enter().append("rect")
    .attr('width', CELL_SIZE)
    .attr('height', CELL_SIZE)
    .attr('x', (d) => d3.timeFormat('%U')(new Date(d.date)) * CELL_SIZE)
    .attr('y', (d) => new Date(d.date).getDay() * CELL_SIZE)
    .text(function (d) {
        var date = new Date(d.date)
        return d3.timeFormat('%U')(date)    
    })
    .style('fill', 'blue')
    .style('stroke-width', 3)
    .style('stroke', 'black')
    
//d3.select("body")
//  .style('background-color', 'red')
//  .append('p')
//  .text("sample text")
