var jsdom = require('jsdom');
var d3 = require('d3');
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;

var CELL_SIZE = 15;
var buffer = 3;

var colours = [
  '#E0E0E0', '#FFE548', '#E5F3BB', '#AFA2FF',
  '#412722', '#DF2935', '#000000'
];

var years = [2018];

//var script = document.createElement('script');
//script.src = 'http://d3js.org/d3.v3.min.js'
//var head= window.document.getElementsByTagName('head')[0];
//head.appendChild(script);

var svg = d3.select(document.body)
  .append("svg")
  .attr('width', 100).attr('height', 100);

svg.append('rect')
  .attr('x', 10).attr('y', 10)
  .attr('width', 20).attr('height', 20)
  .style('fill', 'red');

console.log(d3.select(document.body).html());

      
      
//for(var i = 0; i < years.length; i++){
//  var year = years[i];
//
//}

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
