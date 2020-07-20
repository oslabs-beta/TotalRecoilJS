export const atoms = {
  "todoListState": {
    "State": [{
      "id": "0",
      text: "hello",
      isComplete: true
    }, {
      id: 1,
      text: "bye",
      isComplete: true
    }]
  }
}

const atom = {
  myCounter: {
    "state": [{
      count: 0
    }]
  },
  username: 'anthh',
  todos: [{name: 'eat',isCompleted: true}]
}

const atoms = {

}
discord dc?
export const flare = {
  "name": "Top Level",
  "atom": ["todoListState"],
  "children": [{
      "name": "Level 2: A",
      "atom": ["todoListState"],
    },
    {
      "name": "Level 2: B",
      "atom": "",
      "children": [{
          "name": "Son of A",
          "atom": ["atom1", "atom2"]
        },
        {
          "name": "Daughter of A",
          "atom": []
        }
      ]
    },
    {
      "name": "Level 2: B",
      "atom": "count",
      "children": [{
          "name": "Son of A",
          "atom": ["atom1", "atom2"]
        },
        {
          "name": "Daughter of A",
          "atom": []
        }
      ]
    },
    {
      "name": "Level 2: B",
      "atom": [],
      "children": [{
          "name": "Son of A",
          "atom": []
        },
        {
          "name": "Daughter of A",
          "atom": ["atom3"]
        }
      ]
    }
  ]
};