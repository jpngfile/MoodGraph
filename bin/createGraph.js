var jsdom = require('jsdom');
var d3 = require('d3');
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;

var CELL_SIZE = 15;
var buffer = 3;
var height = 150;

var colours = [
  '#E0E0E0', '#FFE548', '#E5F3BB', '#AFA2FF',
  '#8EB1C7', '#DF2935'
];

var years = [2015, 2016, 2017, 2018];

var totalHeight = height*years.length;
var svg = d3.select(document.body)
  .append("svg")
  .attr('version', "1.1")
  .attr('baseProfile', 'full')
  .attr('xmlns', 'http://www.w3.org/2000/svg')
  .attr('viewBox', '0 0 900 ' + totalHeight)
  .attr('opacity', '0.5')
//  .attr('width', 1000).attr('height', 200);

for(var i = 0; i < years.length; i++){
  var year = years[i];
  var days = makeYear(year);

  var g = svg.append('g')
  var rects = g.selectAll('rect')
    .data(days)
  
  rects.enter().append("rect")
      .attr('width', CELL_SIZE)
      .attr('height', CELL_SIZE)
      .attr('x', (d) => d3.timeFormat('%U')(new Date(d)) * (CELL_SIZE + buffer))
      .attr('y', (d) => new Date(d).getDay() * (CELL_SIZE + buffer) + 20 + (height * i))
      .style('fill', (d) => getRandomColour(colours));

}
console.log(d3.select(document.body).html());

      
function makeYear(year) {
  var days = [];
  for (var i = 0; i < 365; i++){
    var date = new Date(year, 0, 1);
    date.setDate(date.getDate() + i);
    days.push(date)
  }
  return days;
} 

function getRandomColour(colours) {
  var index = Math.floor(Math.random() * colours.length);
  return colours[index];
}

// weigths is a list of numbers that add to 1
// if sum < 1, then last number gets remaining weight
// if sum > 1, then numbers beyond 1 have 0 weight
// Assume weights has positive numbers 
function weightedRandom(weights) {
  var random = Math.random();
  for(var i = 0; i < weigths.length; i++){
    random -= weigths[i];
    if (random < 0) {
      return i;
    }
  }
  return 0;
}
