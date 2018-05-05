console.log(user);
var CELL_SIZE = 15;
var CELL_BUFFER = 3;
var YEAR_TEXT_MARGIN = 30;
var MONTH_TEXT_MARGIN = 20;

var colourMap = new Map([
    ['unassigned', '#E0E0E0']
]);
for(var i = 0; i < options.length; i++){
    var option = options[i];
    console.log(option);
    colourMap.set(option.mood, option.color)
}
var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

var today = new Date();
today = getUTCDate(today);
today.setUTCHours(23);
console.log(today.toUTCString());

function getDay(user, date) {
    var yearArr = _.find(user.years, function(year){ return year.year === date.getUTCFullYear()});
    var days = yearArr.days;
    var day = _.find(days, function(dayObj){ return equalDate(new Date(dayObj.date), date)});
    return day;
}

function rectOnClick(d, i) {
    //console.log(d);
    var rectDate = new Date(d.date);
    if (rectDate > today){
       return;
    } 
    curDate = new Date(d.date);
    updateNotes(curDate)
    updateDisplay();
}

function updateNotes(date) {
    var curDay = getDay(user, date);
    document.getElementById('note-field').value = curDay.note ? curDay.note : ''
}

function updateDisplay(note) {
    var graphRects = d3.select('.heatmap').selectAll('rect')
    graphRects.attr('stroke-width', (d) => equalDate(new Date(d.date), curDate) ? '1px' : '0px')
    document.getElementById('form-date').value=curDate
    var moodPrompt = document.getElementById('mood-prompt')
    if (equalDate(curDate, today)){
        moodPrompt.innerHTML = "How do you feel today?"
    } else {
        moodPrompt.innerHTML = "How did you feel on " + moment.utc(curDate).format('dddd, MMM Do YYYY') + "?"
    }
}

function getGraphRects(){
    return d3.select('.heatmap').selectAll('rect')
}

function createGraph(){
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
            .attr('y', (d) => new Date(d.date).getUTCDay() * (CELL_SIZE + CELL_BUFFER) + MONTH_TEXT_MARGIN)
            .attr('stroke', 'black')
            .attr('stroke-width', '0px')
            .attr('class', 'day')
            .attr('data-date', (d) => d.date)
            .on('click', rectOnClick)
    
        rects.exit().remove()
        svg.exit().remove()
    }
}

