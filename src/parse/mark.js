var dl = require('datalib'),
    parseProperties = require('./properties');

function parseMark(model, mark) {
  var props = mark.properties,
      group = mark.marks;

  // parse mark property definitions
  dl.keys(props).forEach(function(k) {
    props[k] = parseProperties(model, mark.type, props[k]);
  });

  // parse delay function
  if (mark.delay) {
    mark.delay = parseProperties(model, mark.type, {delay: mark.delay});
  }

  // recurse if group type
  if (group) {
    mark.marks = group.map(function(g) { return parseMark(model, g); });
  }
    
  return mark;
};

module.exports = parseMark;
parseMark.schemaRefs = {
  "mark": {
    "type": "object",

    "properties": {
      "name": {"type": "string"},
      "key": {"type": "string"},
      "type": {"enum": ["rect", "symbol", "path", "arc", 
        "area", "line", "rule", "image", "text", "group"]},

      "from": {
        "type": "object",
        "properties": {
          "data": {"type": "string"},
          "mark": {"type": "string"},
          "transform": {"$ref": "#/refs/transform"}
        },
        "oneOf":[{"required": ["data"]}, {"required": ["mark"]}]
      },

      "delay": {"$ref": "#/refs/value"},
      "ease": {
        "enum": ["linear", "quad", "cubic", "sin", 
          "exp", "circle", "bounce"].reduce(function(acc, e) {
            ["in", "out", "in-out", "out-in"].forEach(function(m) {
              acc.push(e+"-"+m);
            });
            return acc;
        }, [])
      },

      "properties": {
        "type": "object",
        "properties": {
          "enter":  parseProperties.schema,
          "update": parseProperties.schema,
          "exit":   parseProperties.schema
        },
        "additionalProperties": parseProperties.schema,
        "anyOf": [{"required": ["enter"]}, {"required": ["update"]}]
      }
    },

    "required": ["type"]
  }
}