import json
import os

path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '.env'))
print(path)
with open(path, 'r', encoding='utf8') as f:
    env_vars = {}
    for line in f:
        key, value = line.strip().split('=', maxsplit=1)
        env_vars[key] = value

env_vars_list = [{"name": key, "value": value.replace("'", ''), "slotSetting": False} for key, value in env_vars.items()]

data_string = json.dumps(env_vars_list)

print(data_string)