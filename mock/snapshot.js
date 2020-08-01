export const tree = [
  {
    children: [{
      name: 'test Recoil Root',
      children: [
        {name: 'Body'},
        {name: 'List', atoms: ['atom1', 'atom2']}
      ]  
    }], 
    name: 'test App'
  },
  {
    atomVal: {atom1: 'testing123', atom2: 'testing098'}
  },
  {
    name: 'Selector tree test',
    children: [
      {
        name: 'selector1', children: [{name: 'atom1', value: 100}]
      }, 
      {
        name: 'selector2', children: [{name: 'atom2', value: 100}]
      }
    ]
  }
]