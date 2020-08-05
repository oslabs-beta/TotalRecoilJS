import React from 'react';
import * as d3 from '../../../../libraries/d3.js';
import JSONPretty from 'react-json-pretty';



export const AtomView = ({ tree }) => {
    const atomSelectors = []
    let originalColor;

    let t = d3.transition()
        .duration(1000)
        .ease(d3.easeLinear);


    // traverses through D3 tree and if a node includes the h3 inner html tag, that node will light up
    function lightup(e) {
        let atom = e.target.innerHTML
        d3.selectAll('.componentTreeNode').style('fill', originalColor).attr('r', 5)
        d3.select('#canvas').selectAll('.node').each(function (e) {
            if (!e.data.atoms) { }
            else if (e.data.atoms.includes(atom)) {
                d3.select(this).select('.componentTreeNode').transition(t).style('fill', 'rgb(240, 219, 79)').attr('r', 10.5)
            }
        })
        atomValLightup(e);
    }

    function atomValLightup(e) {
        Array.from(document.querySelectorAll('.h3-display-inline')).forEach(el => {
            el.style.color = '#f4f4f4';
        })
        let atom = e.target
        console.log('firing function: ', atom)
        atom.style.color = '#F0DB4F';
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
                        <details className='s-margin'>
                            <summary>State</summary>
                            <p>{data}</p>
                        </details>
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

export default AtomView;