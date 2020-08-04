import React, { useEffect, useState, useRef } from 'react';
import * as d3 from '../../../../libraries/d3.js';
import { scaleBand } from 'd3';



export const TreeView = (props) => {
    const [atomhover, setatomhover] = useState([])

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
                    .scaleExtent([.25, 8])


                    .on('zoom', function () {
                        svg.attr('transform', d3.event.transform)
                    }))
                .attr('class', 'component-svg')
                .append('g')
                .attr('transform', 'translate(20,40)scale(.5,.5)')
                // 187,-49



            let tree = d3.tree().size([panelWidth - 80, treeHeight]);
            tree(root)

            const nodes = root.descendants()

            const node = svg.selectAll('.node')
                .data(nodes)
                .enter()
                .append('g')
                .attr('class', 'node')
                .attr('transform', (d) => 'translate(' + d.y + ',' + d.x + ')')
                .attr('cursor','pointer')
            // swap places of dx and dy, to change orientation of tree

            node.append('circle')
                .attr('r', 10)
                .attr('fill', 'steelblue')

            node.append('text')
                .attr("dy", "0.31em")
                .attr("x", d => d._children ? -6 : 6)
                .attr('fill', '#F0DB4F')
                .style('font-size', '22px')
                .attr("text-anchor", d => d._children ? "end" : "start")
                .text(function (d) {
                    return d.data.name
                })
            node.on('mouseover', (e) => {
                const atoms = e.data.atoms
                const name = e.data.name
                setatomhover([atoms, name])
            })
            node.on('mouseout',(e) => {
                setatomhover([])
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
                .attr("stroke", "white")
                .attr("stroke-opacity", 0.4)
                .attr("stroke-width", 1.5)
        }
    }, [props.tree])

    // let array = [];
    // console.log(props.atomhover[0])
    // props.atomhover[0].forEach((el) => {
    //     array.push(<h1>{el}</h1>)
    // })

    return (
        <div>
            <div id='atom-hover'>
                {atomhover[0] ? <h1> Atoms: {JSON.stringify(atomhover[0])}</h1> : <h1>No Atoms!</h1>}
                {atomhover[1] ? <h1> Name: {atomhover[1]}</h1> : <h1></h1>}
            </div>
            <div id='canvas'></div>

        </div>

    )
}

export default TreeView;