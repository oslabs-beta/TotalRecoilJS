import React, { useEffect, useState, useRef } from 'react';
import * as d3 from '../../../../libraries/d3.js';
import { scaleBand } from 'd3';



export const TreeView = (props) => {
    d3.select('#canvas')
  
    // on each state change, a tree will be rendered with all its nodes and links
    useEffect(() => {
        if (props.tree) {
            
            document.querySelector('#canvas').innerHTML = ''

            const root = d3.hierarchy(props.tree[0])
            const panelWidth = Math.floor(window.innerWidth * 0.5);

            // Find out the height of the tree and size the svg accordingly 
            const dataHeight = root.height;
            const treeHeight = dataHeight * 200;
            const svgHeight = Math.max(treeHeight, window.innerHeight)
        
 
          
    
            const svg = d3.select('#canvas')
          
            .append('svg')
            .attr('width', panelWidth)
            .attr('height', svgHeight + 80)
           
           
            .call(d3.zoom()
            .scaleExtent([.25,8])
          
           
            .on('zoom', function () {
                svg.attr('transform', d3.event.transform)
            }))
            .attr('class','component-svg')
            .append('g')
            .attr('transform', 'translate(187, -49)scale(.6,.6)')
     
            
               
            let tree = d3.tree().size([panelWidth - 80, treeHeight]);
            tree(root)

            const nodes = root.descendants()

            const node = svg.selectAll('.node')
                .data(nodes)
                .enter()
                .append('g')
                .attr('class', 'node')
                .attr('transform', (d) => 'translate(' + d.y + ',' + d.x + ')')
            // swap places of dx and dy, to change orientation of tree

            node.append('circle')
                .attr('r', 6)
                .attr('fill', 'steelblue')

            node.append('text')
                .attr("dy", "0.31em")
                .attr("x", d => d._children ? -6 : 6)
                .attr("text-anchor", d => d._children ? "end" : "start")
                .text(function (d) {
                    return d.data.name
                })
          
            const links = root.links()
            const link = svg.selectAll('.link')
                .data(links)
                .join('path')
                .attr('class', 'link')
                .attr('d', d3.linkVertical()
                    // swap places of dx and dy, to change orientation of tree
                    .x(d => d.y)
                    .y(d => d.x))
                .attr("fill", "none")
                .attr("stroke", "green")
                .attr("stroke-opacity", 0.4)
                .attr("stroke-width", 1.5)
        }
    })

    return (
        <div id='canvas'>
        </div>
    )
}

export default TreeView;