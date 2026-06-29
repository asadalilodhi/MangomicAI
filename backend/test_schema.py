import json
from schemas import StoryExtraction

schema = StoryExtraction.model_json_schema()
if 'panels' in schema['properties']:
    del schema['properties']['panels']

print(json.dumps(schema, indent=2))
