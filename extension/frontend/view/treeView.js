import React, { useEffect, useState, useRef } from 'react';
import * as d3 from '../../libraries/d3.js';



export const Tree = (props) => {
    useEffect(() => {
        if (props.tree) {
            console.log('props tree', props.tree[0])

            document.querySelector('#canvas').innerHTML = ''

            const root = d3.hierarchy(props.tree[0])

            const panelWidth = Math.floor(window.innerWidth * 0.5);


            // Find out the height of the tree and size the svg accordingly (each level havin 95px)
            const dataHeight = root.height;
            const treeHeight = dataHeight * 95;
            // console.log('windowHeight:',window.innerHeight,'treeHeight:', treeHeight,'dataHeight',dataHeight)
            const svgHeight = Math.max(window.innerHeight, treeHeight)

            const svg = d3.select('#canvas')
                .append('svg')
                .attr('width', panelWidth)
                .attr('height', svgHeight)
                .append('g')
                .attr('transform', 'translate(-30, 30)');

            let tree = d3.tree().size([panelWidth - 80, treeHeight]);
            tree(root)

            const nodes = root.descendants()

            const node = svg.selectAll('.node')
                .data(nodes)
                .enter()
                .append('g')
                .attr('class', 'node')
                .attr('transform', (d) => 'translate(' + d.x + ',' + d.y + ')')

            node.append('circle')
                .attr('r', 5)
                .attr('fill', 'steelblue')

            node.append('text')
                .attr('x', 10)
                .attr('y', 5)
                .text(function (d) {
                    return d.data.name
                })

            const links = root.links()
            const link = svg.selectAll('.link')
                .data(links)
                .join('path')
                .attr('class', 'link')
                .attr('d', d3.linkVertical()
                    .x(d => d.x)
                    .y(d => d.y))
                .attr("fill", "none")
                .attr("stroke", "green")
                .attr("stroke-opacity", 0.4)
                .attr("stroke-width", 1.5)
        }
    })

    return (
        <div id='canvas'>
            {/* <div id='canvas'></div> */}
        </div>
    )
}

export default Tree