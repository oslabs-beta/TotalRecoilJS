
import { atoms, flare } from './flare.js';
import * as d3 from '../../libraries/d3.js';

// const rightPanel = document.querySelector('#state-info')

// root of our tre
const root = d3.hierarchy(flare);
// console.log(root)


// creates the canvas
const panelWidth = Math.floor(screen.width * 0.66);

  // Find out the height of the tree and size the svg accordingly (each level havin 95px)
const dataHeight = root.height;
const treeHeight = dataHeight * 95;
const svgHeight = Math.max(window.innerHeight, treeHeight)

// console.log(panelWidth)

// const atomRoot = d3.hierarchy(atoms)
// // console.log(atomRoot)
// const atomInfo = atomRoot.descendants();
// console.log(atomInfo)

function printAtomsToScreen(atoms){
  const masterContainer = document.querySelector('.information')


  for (let prop in atoms){
    let containerDiv = document.createElement('div')
    containerDiv.classList.add('atom-div')
    // console.log(prop)
    
    const atomName = document.createElement('h3')
    atomName.classList.add('s-margin')
    atomName.textContent = prop
  
    let originalColor;
    atomName.addEventListener('click',(e) => {
      let atom = e.target.innerHTML
     
        // d3.select('circle').interrupt()
        d3.selectAll('circle').style('fill', originalColor)
      
      let svg = d3.select('#tree').selectAll('.node').each(function(e){
       
        if(e.data.atom.includes(atom)){
          d3.select(this).select('circle').style('fill','#eee')
        }
      })
    })

    containerDiv.appendChild(atomName)

    let containerInfoDiv = document.createElement('div')
    containerInfoDiv.classList.add('atom-information')
    // console.log(atoms)
    // console.log(prop)

    for (let el in atoms[prop]){
    
  
      let elprop = document.createElement('h3')

      let text = JSON.stringify(atoms[prop][el])
      elprop.textContent = `${el} : ${text}`
 
      containerInfoDiv.appendChild(elprop)
      // containerDiv.appendChild(infoDiv)
    }
    
    containerDiv.appendChild(containerInfoDiv)
    masterContainer.appendChild(containerDiv)
    // masterContainer.appendChild(containerInfoDiv)
  }
}


// console.log(atoms)
printAtomsToScreen(atoms)

const svg = d3.select('#tree')
    .append('svg')
    .attr('width', panelWidth)
    .attr('height', svgHeight)
    .append('g')
    .attr('transform', 'translate(-30, 50)');



    let tree = d3.tree()
      .size([panelWidth-80, treeHeight]);

    tree(root)

    // show all individual nodes of the tree
    const nodes = root.descendants();
    // console.log(nodes)

    const node = svg.selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class','node')
      .attr('transform', (d) => 'translate(' + d.x + ',' + d.y + ')')
      

    node.append('circle')
      .attr('r',5)
      .attr('fill','steelblue')


    let selected;
    let originalColor;

    // Adds text and highlights color of node
    // node.on("click", function(e){
    //   console.log(e)
    //   rightPanel.innerHTML = ''
    //   const name = e.data.name 
    //   const text =  document.createElement('h1')
    //   text.textContent = name
    //   rightPanel.appendChild(text)

    //   if (selected) {
    //     selected.interrupt()
    //     selected.style('fill', originalColor)
    //   }
    //   selected = d3.select(this).select('circle');
    //   console.log(this)
    //   originalColor = selected.attr('fill')
    //   selected.style("fill", '#eee')

    // })

    node.on('mouseover',(e) => {
      let atom = e.data.atom
      let componentName = e.data.name

      console.log(e.data)

      let container = document.querySelector('#currentComponent')
      container.innerHTML = ''
      let currentAtom = document.createElement('h4')
      let currentComponent = document.createElement('h4')
      if (atom.length > 0){
        currentAtom.textContent = `Atom: ${atom}`
      } else {
        currentAtom.textContent = 'No Atom Here!'
      }
      currentComponent.textContent = `Component: ${componentName}`
      container.appendChild(currentAtom)
      container.appendChild(currentComponent)
    })

  

    node.append('text')
    .attr('x', 10)
		.attr('y', 5)
    .text(function(d) {
       return d.data.name
    })

// generate links that connect node to node
    const links = root.links()
    // console.log('links',links)

    const link = svg.selectAll('.link')
      .data(links)
      .join('path')
      .attr('class','link')
      .attr('d', d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y))
        .attr("fill", "none") 
        // .attr("stroke", "#e8e888")
        // stroke dictates the color of the curve
        .attr("stroke", "green")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5)
   