*******************************************************************************
/*                                 index.js                                    *
*******************************************************************************/
'use strict';

// import * as d3 from 'd3';
// import './styles/index.scss';

let movieSales;

const WIDTH = 1200,
  HEIGHT = 615,
  LEGEND_HEIGHT = 100;

const svg = d3.select('#treemap')
  .attr('preserveAspectRatio', 'xMinYMin meet')
  .attr('viewBox', `${0} ${0} ${WIDTH} ${HEIGHT}`)
  .append('g');

if (
  localStorage.getItem('movieSalesCache')
) {
  movieSales = JSON.parse(localStorage.getItem('movieSalesCache'));
  drawMap();
} else {
  const data = [
    'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json',
  ];
  Promise.all(data.map(url => d3.json(url))).then(vals => {
    movieSales = vals[0];
    localStorage.setItem('movieSalesCache', JSON.stringify(vals[0]));
    drawMap();
  }).catch(() => {
    alert('Sorry, but needed data can\'t be fetched: ');
  });
}


function drawMap() {

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const treemap = d3.treemap()
    .size([WIDTH, HEIGHT - LEGEND_HEIGHT])
    .paddingInner(1);

  const root = d3.hierarchy(movieSales)
    .eachBefore(d => {
      d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name;
    })
    .sum(d => d.value)
    .sort((a, b) => b.height - a.height || b.value - a.value);

  treemap(root);

  const cell = svg.selectAll('g')
    .data(root.leaves())
    .enter().append('g')
    .attr('transform', d => 'translate(' + d.x0 + ',' + d.y0 + ')');

  cell.append('rect')
    .attr('id', d => d.data.id)
    .attr('class', 'tile')
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => d.y1 - d.y0)
    .attr('data-name', d => d.data.name)
    .attr('data-category', d => d.data.category)
    .attr('data-value', d => d.data.value)
    .attr('fill', d => color(d.data.category))
    .on('mouseover', handleMouseOver)
    .on('mouseout', handleMouseOut);

  cell.append('text')
    .on('mouseover', handleMouseOver)
    .on('mouseout', handleMouseOut)
    .attr('class', 'tile-text')
    .selectAll('tspan')
    .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
    .enter().append('tspan')
    .attr('font-size', '10px')
    .attr('fill', 'white')
    .attr('x', 2)
    .attr('y', (d, i) => 10 * (i + 1))
    .text(d => d);

  const x = svg.append('g')
    .attr('id', 'legend');

  const legendPadding = {
    left: 300,
    top: 40
  };

  x.append('rect')
    .attr('y', HEIGHT - LEGEND_HEIGHT)
    .attr('width', WIDTH)
    .attr('height', LEGEND_HEIGHT)
    .attr('fill', '#fff');

  x.append('g').selectAll('rect')
    .attr('id', 'legend')
    .data(movieSales.children)
    .enter().append('rect')
    .attr('class', 'legend-item')
    .attr('y', HEIGHT - LEGEND_HEIGHT + legendPadding.top)
    .attr('x', (d, i) => legendPadding.left + 6 * i * 15)
    .attr('width', 15)
    .attr('height', 15)
    .attr('fill', d => color(d.name));

  x.append('g').selectAll('text')
    .data(movieSales.children)
    .enter().append('text')
    .attr('font-size', '12px')
    .attr('fill', '#555')
    .attr('y', HEIGHT - LEGEND_HEIGHT + legendPadding.top + 11)
    .attr('x', (d, i) => legendPadding.left + 20 + 6 * i * 15)
    .text(d => d.name);
}

function handleMouseOver(d) {
  d3.select('#tooltip')
    .attr('data-value', d.data.value)
    .style('top', `${d3.event.pageY + 10}px`)
    .style('left', `${d3.event.pageX + 10}px`)
    .html(`<p>Name: ${d.data.name}</p>` + `<p>Category: ${d.data.category}</p>` + `<p>Value: ${d.data.value}</p>`)
    .style('opacity', 0.8) // just to pass ffc tests
    .style('visibility', 'visible');
}

function handleMouseOut() {
  d3.select('#tooltip')
    .style('opacity', 0) // just to pass ffc tests
    .style('visibility', 'hidden');
}
