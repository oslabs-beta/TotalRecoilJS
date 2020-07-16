export const atoms = {
    "atom1": {
      "state": [{"count": "1"}],
      "components": ["Son of A","Daughter of B"]
    },
    "atom2": {
      "state": [{"length": "1"}],
      "components": ["Level 2: B"]
    },"atom3": {
      "state": ["shoppingbag"],
      "components": ["Level 2: B"]
    }
  }
  
 export const flare = {
    "name": "Top Level",
    "atom": ["atom1"],
    "children": [{
        "name": "Level 2: A",
        "atom": ["atom1"],
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