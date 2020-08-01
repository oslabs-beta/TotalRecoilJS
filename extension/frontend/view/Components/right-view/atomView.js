import React, { useEffect, useState, useRef, Fragment } from 'react';
import * as d3 from '../../../../libraries/d3.js';
import Navbar from './Navbar'


export const AtomView2 = ({ tree }) => {
    const atomSelectors = []
    let originalColor;

    function lightup(e) {
        let atom = e.target.innerHTML
        d3.selectAll('circle').style('fill', originalColor).attr('r', 5)
        d3.select('#canvas').selectAll('.node').each(function(e){
            if (!e.data.atoms) {}
            else if (e.data.atoms.includes(atom)) {
                d3.select(this).select('circle').style('fill', '#00FFFF').attr('r', 10)
            }
        })
    }
      
        
   if (tree) {
    const atoms = tree[1].atomVal
    for (let prop in atoms){
        atomSelectors.push(
            <div className='atom-div'>
                <h3 onClick={lightup}>{prop}</h3>
                <summary className='s-margin'> <details >{JSON.stringify(atoms[prop])}</details></summary>
            </div>
        )}
    }

  return (
    <div>
      <div className='atoms'>{atomSelectors}</div>
    </div>
  )
}

export default AtomView2;