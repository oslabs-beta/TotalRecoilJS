import * as d3 from '../../libraries/d3.js';

// prints the right-hand panel to screen
function printAtomsToScreen(atoms) {
  // make a masterDiv containing all atoms and reset this div on every call
  const masterContainer = document.querySelector('.information');
  masterContainer.innerHTML = '';

  // iterate over atoms object
  for (let prop in atoms) {
    let atomContainer = document.createElement('div');
    atomContainer.classList.add('atom-div');

    // Set atomname text to prop which will be the name of the atom
    const atomName = document.createElement('h3');
    atomName.classList.add('h3');
    atomName.textContent = prop;

    let originalColor;

    // on click of each atomname(h3), will search through the component tree with any component containing the atomname and will light up that node
    atomName.addEventListener('click', (e) => {
      let atom = e.target.innerHTML;
      d3.selectAll('circle').style('fill', originalColor);

      let svg = d3
        .select('#tree')
        .selectAll('.node')
        .each(function (e) {
          console.log(e.data, 'second');
          if (!e.data.atoms) {
          } else if (e.data.atoms.includes(atom)) {
            d3.select(this).select('circle').style('fill', '#eee');
          }
        });
    });

    // create div for atom information
    let containerInfoDiv = document.createElement('div');
    containerInfoDiv.classList.add('atom-information');

    let atomState = document.createElement('h3');
    atomState.classList.add('s-margin');

    let text = JSON.stringify(atoms[prop]);
    atomState.textContent = `State : ${text}`;

    // append text to containerInfo Div
    containerInfoDiv.appendChild(atomState);

    // append the atom name and the containerInfodiv to atom container
    atomContainer.appendChild(atomName);
    atomContainer.appendChild(containerInfoDiv);

    // append the atom container to the mastercontainer
    masterContainer.appendChild(atomContainer);
  }
}

// creates the component tree
function createTree(flare) {
  document.querySelector('#tree').innerHTML = '';

  // creates a hierarchy data from the data received from the backend
  const root = d3.hierarchy(flare);

  // creates the canvas
  const panelWidth = Math.floor(screen.width * 0.66);

  // Find out the height of the tree and size the svg accordingly (each level havin 95px)
  const dataHeight = root.height;
  const treeHeight = dataHeight * 95;
  const svgHeight = Math.max(window.innerHeight, treeHeight);

  const svg = d3
    .select('#tree')
    .append('svg')
    .attr('width', panelWidth)
    .attr('height', svgHeight)
    .append('g')
    .attr('transform', 'translate(-30, 50)');

  // gives coordinates to the nodes
  let tree = d3.tree().size([panelWidth - 80, treeHeight]);

  tree(root);

  // show all individual nodes of the tree
  const nodes = root.descendants();

  // selects all nodes and gives them x/y coordinates, circle attribute to each node
  const node = svg
    .selectAll('.node')
    .data(nodes)
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', (d) => 'translate(' + d.x + ',' + d.y + ')');

  node.append('circle').attr('r', 5).attr('fill', 'steelblue');

  // on each node when we mouse over will display information on the screen
  node.on('mouseover', (e) => {
    let atom = e.data.atoms;
    let componentName = e.data.name;

    let container = document.querySelector('#currentComponent');
    container.innerHTML = '';
    let currentAtom = document.createElement('h4');
    let currentComponent = document.createElement('h4');

    // if atom property doesn't exist
    if (!atom) {
      currentAtom.textContent = `No Atom Here!`;
      currentComponent.textContent = `Component: ${componentName}`;
      container.appendChild(currentAtom);
      container.appendChild(currentComponent);
      return;
    }

    if (atom.length > 0) {
      currentAtom.textContent = `Atom: ${atom}`;
    } else {
      currentAtom.textContent = 'No Atom Here!';
    }
    currentComponent.textContent = `Component: ${componentName}`;
    container.appendChild(currentAtom);
    container.appendChild(currentComponent);
  });

  node
    .append('text')
    .attr('x', 10)
    .attr('y', 5)
    .text(function (d) {
      return d.data.name;
    });

  // generate links that connect node to node
  const links = root.links();
  // console.log('links',links)

  const link = svg
    .selectAll('.link')
    .data(links)
    .join('path')
    .attr('class', 'link')
    .attr(
      'd',
      d3
        .linkVertical()
        .x((d) => d.x)
        .y((d) => d.y)
    )
    .attr('fill', 'none')
    // .attr("stroke", "#e8e888")
    // stroke dictates the color of the curve
    .attr('stroke', 'green')
    .attr('stroke-opacity', 0.4)
    .attr('stroke-width', 1.5);
}

const port = chrome.runtime.connect({ name: 'test' });
port.postMessage({
  name: 'connect',
  tabID: chrome.devtools.inspectedWindow.tabId,
});

// every time state changes, backend sends information to front end
port.onMessage.addListener((message) => {
  if (message.length === 2) {
    console.log('message received by panel', message);
    const atoms = message[1].atomVal;
    const tree = message[0];

    createTree(tree);
    printAtomsToScreen(atoms);
  }
});

//SEEMS LIKE THE BOTTOM CODE IS NOT NEEDED

// chrome.runtime.sendMessage({
//   name: 'inject-script',
//   tabID: chrome.devtools.inspectedWindow.tabId,
// });
