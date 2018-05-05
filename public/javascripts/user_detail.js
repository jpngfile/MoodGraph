var today = new Date();
today = getUTCDate(today);
today.setUTCHours(23);
console.log(today.toUTCString());
var curDate = new Date()
curDate = getUTCDate(curDate)
console.log(curDate.toUTCString())

function rectOnClick(d, i) {
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

var graphRects = getGraphRects();
graphRects.style('opacity', (d) => new Date(d.date).getTime() > today.getTime() ? 0.5 : 1)
graphRects.on('click', rectOnClick)
updateNotes(curDate)
document.getElementById('form-date').value=curDate
