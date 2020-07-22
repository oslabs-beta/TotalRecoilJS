import React, { useEffect, useState,useRef } from 'react';
import * as d3 from '../../libraries/d3.js';


export const Atoms = (props) => {
    useEffect(() => {
        if (props.tree){
            const masterContainer = document.querySelector('#atoms')
            masterContainer.innerHTML = ''

            const atoms = props.tree[1].atomVal
            for (let prop in atoms){
                let atomContainer = document.createElement('div')
                atomContainer.classList.add('atom-div')
                
                // Set atomname text to prop which will be the name of the atom
                const atomName = document.createElement('h3')
                atomName.textContent = prop
              
                let originalColor;

                atomName.addEventListener('click',(e) => {
                    // console.log('is it working d3 blink')
                    let atom = e.target.innerHTML
                      d3.selectAll('circle').style('fill', originalColor).attr('r',5)
                    
                    let svg = d3.select('#canvas').selectAll('.node').each(function(e){
                      if (!e.data.atoms){}
                      else if(e.data.atoms.includes(atom)){
                        d3.select(this).select('circle').style('fill','#FF3A37').attr('r',10)
                      }
                      
                    })
                  })

                let atomState = document.createElement('h3')
                atomState.classList.add('s-margin')

                let text = JSON.stringify(atoms[prop])
                atomState.textContent = `State : ${text}`

                atomContainer.appendChild(atomName)
                atomContainer.appendChild(atomState)
                masterContainer.appendChild(atomContainer)
            }
          
        }
    })

    return (
        <div>
            <div id='atoms'></div>
            <h1>ATOMS TEST</h1>
        </div>
    )
}

export default Atoms