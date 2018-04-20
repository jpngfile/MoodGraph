console.log(user);
console.log(curDate);
var CELL_SIZE = 15;
var CELL_BUFFER = 3;
var YEAR_TEXT_MARGIN = 30;
var MONTH_TEXT_MARGIN = 20;

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
var today = new Date();
today.setHours(23,59,59,999);

function getUTCDate(date){
    console.log(date.getFullYear() + " " + date.getMonth() + " " + date.getDate())
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0));
}

function rectOnClick(d, i) {
    console.log(d);
    var rectDate = new Date(d.date);
    console.log(getUTCDate(rectDate).toUTCString())
    if (rectDate > today){
       return;
    } 
    curDate = new Date(d.date);
    console.log(d.date);
    console.log(curDate.toUTCString())
    updateDisplay();
}

function updateDisplay() {
    var graphRects = d3.select('.heatmap').selectAll('rect')
    graphRects.attr('stroke-width', (d) => equalDate(new Date(d.date), curDate) ? '1px' : '0px')
    document.getElementById('form-date').value=curDate
    var moodPrompt = document.getElementById('mood-prompt')
    if (equalDate(curDate, today)){
        moodPrompt.innerHTML = "How do you feel today?"
    } else {
        moodPrompt.innerHTML = "How did you feel on " + moment(curDate).format('dddd, MMM Do YYYY') + "?"
    }
}

function equalDate(date1, date2) {
    return date1.getFullYear() == date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
}

for(var i = 0; i < user.years.length; i++){
    var year = user.years[i];
    // The 11 actually means Dec, not November.
    var lastDate = new Date(year.year, 11, 31);
    var numWeeks = Number(d3.timeFormat("%U")(lastDate)) + 1;
    var graphWidth = ((CELL_SIZE + CELL_BUFFER) * numWeeks) + YEAR_TEXT_MARGIN;
    var svg = d3.select('.heatmap')
        .append("svg")
        .attr('width', graphWidth)
        .append("g")

    svg.append("text")
      .attr("transform", "translate(" + MONTH_TEXT_MARGIN + ", " + (YEAR_TEXT_MARGIN + CELL_SIZE * 3.5) + ")rotate(-90)")
      .attr("text-anchor", "middle")
      .text(year.year);

    svg.selectAll('g')
      .data(d3.range(0, 12))
      .enter().append('text')
      .attr("transform", (d) => "translate(" + (YEAR_TEXT_MARGIN + ((CELL_SIZE + CELL_BUFFER) * (moment(new Date(year.year, d, 1, 0, 0, 0)).format('W') - 1))) + ", 10)")
      .text((d) => months[d])
        
    var g = svg.append('g')
      .attr("transform", "translate(" + YEAR_TEXT_MARGIN + ", 0)")
        
    var rects = g.selectAll('rect')
        .data(year.days)
    
    rects.enter().append("rect")
        .attr('width', CELL_SIZE)
        .attr('height', CELL_SIZE)
        .attr('x', (d) => d3.utcFormat('%U')(new Date(d.date)) * (CELL_SIZE + CELL_BUFFER))
        .attr('y', (d) => new Date(d.date).getDay() * (CELL_SIZE + CELL_BUFFER) + MONTH_TEXT_MARGIN)
        .attr('stroke', 'black')
        .attr('stroke-width', '0px')
        .attr('class', 'day')
        .attr('data-date', (d) => d.date)
        .style('fill', (d) => colourMap.get(d.mood))
        .style('opacity', (d) => new Date(d.date) > today ? 0.5 : 1)
        .on('click', rectOnClick)

    rects.exit().remove()
    svg.exit().remove()
}

