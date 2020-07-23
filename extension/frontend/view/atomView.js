import React, { useEffect, useState, useRef } from 'react';
import * as d3 from '../../libraries/d3.js';
import Navbar from './Components/Navbar'


export const Atoms = (props) => {
  useEffect(() => {
    if (props.tree) {
      const masterContainer = document.querySelector('#atoms')
      masterContainer.innerHTML = ''

      const atoms = props.tree[1].atomVal
      for (let prop in atoms) {
        let atomContainer = document.createElement('div')
        atomContainer.classList.add('atom-div')

        // Set atomname text to prop which will be the name of the atom
        const atomName = document.createElement('h3')
        atomName.textContent = prop

        let originalColor;

        atomName.addEventListener('click', (e) => {
          console.log('is it working d3 blink')
          let atom = e.target.innerHTML
          d3.selectAll('circle').style('fill', originalColor).attr('r', 5)

          d3.select('#canvas').selectAll('.node').each(function (e) {
            console.log('data atoms', e.data);
            // atom key w/ new data
            let atomKey = e.data.state[e.data.state.length - 1][1][0].key;
            if (!e.data.atoms) { }
            else if (e.data.atoms.includes(atom)) {
              d3.select(this).select('circle').style('fill', '#FF3A37').attr('r', 10)
            }
            // TODO: NEW DATA
            // if (e.data.state.length) {
            //   if (e.data.state[e.data.state.length - 1][1][0].key) {
            //     d3.select(this).select('circle').style('fill', '#FF3A37').attr('r', 10)
            //   }
            // }

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