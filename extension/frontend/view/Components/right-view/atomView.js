import React, { useEffect, useState, useRef, Fragment } from 'react';
import * as d3 from '../../../../libraries/d3.js';
import JSONPretty from 'react-json-pretty';



export const AtomView2 = ({ tree }) => {
    const atomSelectors = []
    let originalColor;

    let t = d3.transition()
        .duration(1000)
        .ease(d3.easeLinear);


    // traverses through D3 tree and if a node includes the h3 inner html tag, that node will light up
    function lightup(e) {
        let atom = e.target.innerHTML
        d3.selectAll('circle').style('fill', originalColor).attr('r', 5)
        d3.select('#canvas').selectAll('.node').each(function (e) {
            if (!e.data.atoms) { }
            else if (e.data.atoms.includes(atom)) {
                d3.select(this).select('circle').transition(t).style('fill', '#00FFFF').attr('r', 10)
            }
        })
    }

    // will iterate through atoms object and render it on screen 
    // each prop render should have its unique key
    if (tree) {
        const atoms = tree[1].atomVal
        for (let prop in atoms) {
            const data = <JSONPretty style={{ fontSize: "3px" }} data={atoms[prop]}></JSONPretty>
            atomSelectors.push(
                <div className='atom-container' >
                    <h3 className='h3-display-inline' onClick={lightup}>{prop}</h3>
                    <div className='atom-div'>
                        <summary className='s-margin'> <details>{data}</details></summary>
                    </div>

                </div>
            )
        }
    }

    return (
        <div className="atom-values-tab">
            <div className='atoms'>{atomSelectors}</div>
        </div>
    )
}

export default AtomView2;