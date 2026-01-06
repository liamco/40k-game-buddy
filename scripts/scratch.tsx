{
  "id": "",
  "name": "Unyielding in the Face of the Foe",
  "legend": "",
  "factionId": "",
  "description": "While this unit is within range of an objective marker you control, each time an attack with a Damage characteristic of 1 is allocated to a model in this unit, add 1 to any armour saving throw made against that attack.",
  "type": "Datasheet",
  "parameter": "",
  "effects": [
    {
      "type": "save",
      "effect": "rollBonus",
      "value": 1,
      "conditions": [
        {
          "property": "withinRangeOf",
          "subject": "friendlyObjective",
          "value": true
        },
        {
          "property": "damage",
          "subject": "attack",
          "value": 1
        }
      ]
    }
  ]
}