console.log(user);
var CELL_SIZE = 15;
var buffer = 3;

var colourMap = new Map([
    ['unassigned', 'blue'],
    ['happy', 'yellow'],
    ['sad', 'red'],
    ['neutral', 'black']
]);

for(var i = 0; i < user.years.length; i++){
    var year = user.years[i];
    var svg = d3.select('.heatmap')
        .append("svg")
        .attr('width', 1000)
        
    var g = svg.append('g')
        
    var rects = g.selectAll('rect')
        .data(year.days)
    
    //rects.exit().remove()
    
    rects.enter().append("rect")
        .attr('width', CELL_SIZE)
        .attr('height', CELL_SIZE)
        .attr('x', (d) => d3.timeFormat('%U')(new Date(d.date)) * (CELL_SIZE + buffer))
        .attr('y', (d) => new Date(d.date).getDay() * (CELL_SIZE + buffer))
        .text(function (d) {
            var date = new Date(d.date)
            return d3.timeFormat('%U')(date)    
        })
        .style('fill', (d) => colourMap.get(d.mood))
}
//    .style('stroke-width', 3)
//    .style('stroke', 'black')
    
//d3.select("body")
//  .style('background-color', 'red')
//  .append('p')
//  .text("sample text")
