import React, { useEffect, useState, useRef } from 'react';
import * as d3 from '../../libraries/d3.js';

/*
 instruction to swap trees
 change flare to data
 change the place it targets on the DOM
*/


export const SelectorTree = (props) => {

    useEffect(() => {
        if (props.tree) {
          

          console.log('props tree', props.tree[0])
          document.querySelector('#canvas').innerHTML = ''

          const h1 = document.querySelector('#canvas');
          const title = document.createElement('h1');
          title.innerHTML = 'short';
          h1.appendChild(title);
          
          // -------------------------------------------

            // global constant variables that will be used

  const partition = data => {
    const root = d3.hierarchy(data)

        .sum(d => d.value)
        // .sort((a, b) => b.value - a.value);
    return d3.partition()
        .size([2 * Math.PI, root.height + 1])
      (root);
  }

  // color number or stringNum input into rgb(num1, num2, num3)
  const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, props.tree[0].children.length + 1))
  // console.log('color: ', color('12'));

  // formats number or stringNum input into chunks of 3 digits, 123456 -> '123,456'
  const format = d3.format(",d");
  // console.log('format: ', format('123456'))

  const width = 932;
  const radius = width / 6;

  
  const arc = d3.arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(radius * 1.5)
    .innerRadius(d => d.y0 * radius)
    .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));

  // --------------------end of Global Constants-------------------------------



  // ---------  start here  ---------------------


  // change flare to data: there are 2 places
  const root = partition(props.tree[0]);

  // root.attr('value', d => 100);
  console.log('root: ', root);
  
  // root.each(d => d.current = d);
  root.each(d => {
    // console.log('d current: ', d.current);
    // this will log undefined
    return d.current = d;
  });
  

  //  ----- creates svg/canvas -----

  const svg = d3.select('#canvas')
    .append('svg')
    // .attr("viewBox", [0, 0, width * 10, width * 10])
    .attr("viewBox", [0, 0, width, width])
    .style("font", "10px sans-serif")

  // g tag allows us to grab a whole of inner tags/elements 
  // then allowing us to do group transformation with them
  // as a 'group'
  // const g is the handle/variable name for that group of elements
  const g = svg.append("g")
    .attr("transform", `translate(${width / 2},${width / 2})`);

  //  ----- create svg ends -----


  //  ----- create paths -----

  const path = g.append("g")
    .selectAll("path")
    .data(root.descendants().slice(1))
    .join("path")
      .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
      .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
      .attr("d", d => arc(d.current));

  // ----- filters into inner elements, allows 'zoom' -----
  path.filter(d => d.children)
      .style("cursor", "pointer")
      .on("click", clicked);

  path.append("title")
      .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

   //  ----- create paths ends -----    


   //  ----- create labels -----

  const label = g.append("g")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .style("user-select", "none")
      .selectAll("text")
      .data(root.descendants().slice(1))
      .join("text")
        .attr("dy", "0.35em")
        .attr("fill-opacity", d => +labelVisible(d.current)) 
        .attr("transform", d => labelTransform(d.current))
        .text(d => d.data.name)

        .style('font-size', '20px')

  //  ----- create labels ends -----
  
  

  //  ----- create top most level circle -----

  const parent = g.append("circle")
      .datum(root)
      .attr("r", radius)
      .attr("fill", "steelblue")
      .attr("pointer-events", "all")
      .on("click", clicked)

      // can work on getting name to center of parent circle
      .text(d => d.data.name)   

  //  ----- create top most level circle ends -----


  //  ----- 4 event handling functions -----


  function clicked(p) {
    parent.datum(p.parent || root);

    root.each(d => d.target = {
      x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
      x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
      y0: Math.max(0, d.y0 - p.depth),
      y1: Math.max(0, d.y1 - p.depth)
    });

    const t = g.transition().duration(750);

    // Transition the data on all arcs, even the ones that aren’t visible,
    // so that if this transition is interrupted, entering arcs will start
    // the next transition from the desired position.
    path.transition(t)
        .tween("data", d => {
          const i = d3.interpolate(d.current, d.target);
          return t => d.current = i(t);
        })
      .filter(function(d) {
        return +this.getAttribute("fill-opacity") || arcVisible(d.target);
      })
        .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
        .attrTween("d", d => () => arc(d.current));

    label.filter(function(d) {
        return +this.getAttribute("fill-opacity") || labelVisible(d.target);
      }).transition(t)
        .attr("fill-opacity", d => +labelVisible(d.target))
        .attrTween("transform", d => () => labelTransform(d.current));
  }

    
  function arcVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
  }

  function labelVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
  }

  function labelTransform(d) {
    const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
    const y = (d.y0 + d.y1) / 2 * radius;
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
  }
  
  //  ----- event handling functions ends -----
          
          

    // -------------------------------------------------      


    }
  })

    return (
        <div id='canvas'>
            {/* <div id='canvas'></div> */}
        </div>
    )
}

export default SelectorTree