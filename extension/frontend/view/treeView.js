import React, { useEffect, useState, useRef } from 'react';
import * as d3 from '../../libraries/d3.js';



export const Tree = (props) => {
    useEffect(() => {
        if (props.tree) {

          console.log('props tree', props.tree[0])
          document.querySelector('#canvas').innerHTML = ''
          const panelWidth = Math.floor(window.innerWidth * 0.5);
          // const width = window.innerWidth;
          const dx = 10;
          const dy = panelWidth / 6;


        
          // diagonal is a f(), may/may not need anything passed in
          const diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x);
          // x = dy and y = dx makes it horizontal
        
          // the layout function f(i)
          // const tree = d3.tree().nodeSize([dx, dy]);
          const tree = d3.tree().size([panelWidth - 80, treeHeight]);
        
          const margin = ({top: 10, right: 120, bottom: 10, left: 40});
        
          // --------------------end of Global Constants-------------------------------
        
        
          // ---------  start here  ---------------------
          // replace data with flare
          const root = d3.hierarchy(props.tree[0]);
          console.log(root);
        
          root.x0 = dy / 2;
          root.y0 = 0;
          root.descendants().forEach((d, i) => {
            d.id = i;
            d._children = d.children;
            if (d.depth && d.data.name.length !== 7) d.children = null;
          });
        
          // original stuff
          // const svg = d3.create("svg")
          //     .attr("viewBox", [-margin.left, -margin.top, width, dx])
          //     .style("font", "10px sans-serif")
          //     .style("user-select", "none");
        
          // version
          const svg = d3.select('#canvas')
              .append("svg")
              .attr("viewBox", [-margin.left, -margin.top, width, dx])
              .style("font", "10px sans-serif")
              .style("user-select", "none");
        
        
          const gLink = svg.append("g")
              .attr("fill", "none")
              .attr("stroke", "#555")
              .attr("stroke-opacity", 0.4)
              .attr("stroke-width", 1.5);
        
          const gNode = svg.append("g")
              .attr("cursor", "pointer")
              .attr("pointer-events", "all");
        
          function update(source) {
            const duration = d3.event && d3.event.altKey ? 2500 : 250;
            const nodes = root.descendants().reverse();
            const links = root.links();
        
            // Compute the new tree layout.
            tree(root);
        
            let left = root;
            let right = root;
            root.eachBefore(node => {
              if (node.x < left.x) left = node;
              if (node.x > right.x) right = node;
            });
        
            const height = right.x - left.x + margin.top + margin.bottom;
            const dataHeight = root.height;
            const treeHeight = dataHeight * 95;
            // console.log('windowHeight:',window.innerHeight,'treeHeight:', treeHeight,'dataHeight',dataHeight)
            const svgHeight = Math.max(window.innerHeight, treeHeight)


        
            const transition = svg.transition()
                .duration(duration)
                .attr("viewBox", [-margin.left, left.x - margin.top, width, height])
                .tween("resize", window.ResizeObserver ? null : () => () => svg.dispatch("toggle"));
        
            // Update the nodes…
            const node = gNode.selectAll("g")
              .data(nodes, d => d.id);
        
            // Enter any new nodes at the parent's previous position.
            const nodeEnter = node.enter().append("g")
                .attr("transform", d => `translate(${source.y0},${source.x0})`)
                .attr("fill-opacity", 0)
                .attr("stroke-opacity", 0)
                .on("click", d => {
                  d.children = d.children ? null : d._children;
                  update(d);
                });
        
            nodeEnter.append("circle")
                .attr("r", 2.5)
                .attr("fill", d => d._children ? "#555" : "#999")
                .attr("stroke-width", 10);
        
            nodeEnter.append("text")
                .attr("dy", "0.31em")
                .attr("x", d => d._children ? -6 : 6)
                .attr("text-anchor", d => d._children ? "end" : "start")
                .text(d => d.data.name)
              .clone(true).lower()
                .attr("stroke-linejoin", "round")
                .attr("stroke-width", 3)
                .attr("stroke", "white");
        
            // Transition nodes to their new position.
            const nodeUpdate = node.merge(nodeEnter).transition(transition)
                .attr("transform", d => `translate(${d.y},${d.x})`)
                .attr("fill-opacity", 1)
                .attr("stroke-opacity", 1);
        
            // Transition exiting nodes to the parent's new position.
            const nodeExit = node.exit().transition(transition).remove()
                .attr("transform", d => `translate(${source.y},${source.x})`)
                .attr("fill-opacity", 0)
                .attr("stroke-opacity", 0);
        
            // Update the links…
            const link = gLink.selectAll("path")
              .data(links, d => d.target.id);
        
            // Enter any new links at the parent's previous position.
            const linkEnter = link.enter().append("path")
                .attr("d", d => {
                  const o = {x: source.x0, y: source.y0};
                  return diagonal({source: o, target: o});
                });
        
            // Transition links to their new position.
            link.merge(linkEnter).transition(transition)
                .attr("d", diagonal);
        
            // Transition exiting nodes to the parent's new position.
            link.exit().transition(transition).remove()
                .attr("d", d => {
                  const o = {x: source.x, y: source.y};
                  return diagonal({source: o, target: o});
                });
        
            // Stash the old positions for transition.
            root.eachBefore(d => {
              d.x0 = d.x;
              d.y0 = d.y;
            });
          }
        
          update(root);




            // console.log('props tree', props.tree[0])

            // document.querySelector('#canvas').innerHTML = ''

            // const root = d3.hierarchy(props.tree[0])

            // const panelWidth = Math.floor(window.innerWidth * 0.5);


            // // Find out the height of the tree and size the svg accordingly (each level havin 95px)
            // const dataHeight = root.height;
            // const treeHeight = dataHeight * 95;
            // // console.log('windowHeight:',window.innerHeight,'treeHeight:', treeHeight,'dataHeight',dataHeight)
            // const svgHeight = Math.max(window.innerHeight, treeHeight)

            // const svg = d3.select('#canvas')
            //     .append('svg')
            //     .attr('width', panelWidth)
            //     .attr('height', svgHeight)
            //     .append('g')
            //     .attr('transform', 'translate(-30, 30)');

            // let tree = d3.tree().size([panelWidth - 80, treeHeight]);
            // tree(root)

            // const nodes = root.descendants()

            // const node = svg.selectAll('.node')
            //     .data(nodes)
            //     .enter()
            //     .append('g')
            //     .attr('class', 'node')
            //     .attr('transform', (d) => 'translate(' + d.x + ',' + d.y + ')')

            // node.append('circle')
            //     .attr('r', 5)
            //     .attr('fill', 'steelblue')

            // node.append('text')
            //     .attr('x', 10)
            //     .attr('y', 5)
            //     .text(function (d) {
            //         return d.data.name
            //     })

            // const links = root.links()
            // const link = svg.selectAll('.link')
            //     .data(links)
            //     .join('path')
            //     .attr('class', 'link')
            //     .attr('d', d3.linkVertical()
            //         .x(d => d.x)
            //         .y(d => d.y))
            //     .attr("fill", "none")
            //     .attr("stroke", "green")
            //     .attr("stroke-opacity", 0.4)
            //     .attr("stroke-width", 1.5)
        }
    })

    return (
        <div id='canvas'>
            {/* <div id='canvas'></div> */}
        </div>
    )
}

export default Tree