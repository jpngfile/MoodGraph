console.log(user);
var CELL_SIZE = 15;
var buffer = 3;

var colourMap = new Map([
    ['unassigned', '#E0E0E0'],
    ['happy', '#FFE548'],
    ['sad', '#8EB1C7'],
    ['neutral', '#E5F3BB'],
    ['excited', '#AFA2FF'],
    ['frustrated', '#DF2935'],
    ['productive', '#000000'],
]);
var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function rectOnClick(obj) {
    console.log("Clickk");
    console.log(this);
    console.log(obj);
    var objDate = d3.select(this).attr('fill', 'black');
    console.log(objDate);
}

var today = new Date();
today.setHours(23,59,59,999);
for(var i = 0; i < user.years.length; i++){
    var year = user.years[i];
    var svg = d3.select('.heatmap')
        .append("svg")
        .attr('width', 1000)
        .append("g")

    svg.append("text")
      .attr("transform", "translate(20," + (30 + CELL_SIZE * 3.5) + ")rotate(-90)")
      .attr("text-anchor", "middle")
      .text(year.year);

    svg.selectAll('g')
      .data(d3.range(0, 12))
      .enter().append('text')
      .attr("transform", (d) => "translate(" + (30 + ((CELL_SIZE + buffer) * (moment(new Date(year.year, d, 1, 0, 0, 0)).format('W') - 1))) + ", 10)")
      .text((d) => months[d])
        
    var g = svg.append('g')
      .attr("transform", "translate(30, 0)")
        
    var rects = g.selectAll('rect')
        .data(year.days)
    
    //rects.exit().remove()
    
    rects.enter().append("rect")
        .attr('width', CELL_SIZE)
        .attr('height', CELL_SIZE)
        .attr('x', (d) => d3.timeFormat('%U')(new Date(d.date)) * (CELL_SIZE + buffer))
        .attr('y', (d) => new Date(d.date).getDay() * (CELL_SIZE + buffer) + 20)
        .attr('class', 'day')
        .attr('data-date', (d) => d.date)
        .text(function (d) {
            var date = new Date(d.date)
            return d3.timeFormat('%U')(date)    
        })
        .style('fill', (d) => colourMap.get(d.mood))
        .style('opacity', (d) => new Date(d.date) > today ? 0.5 : 1)
        .on('click', function(d, i) {
            console.log(d.date);
        })
}


//var rects = document.getElementsByClassName('day');
//for (var i = 0; i < rects.length; i++){
//    rects[i].onclick = function() {
//        console.log("Clicked rect");
//    };
//}
