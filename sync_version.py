import json

with open('package.json', 'r', encoding='utf-8') as fh:
    pkg_json = json.loads(fh.read())
    long_description = pkg_json.get('description')
    version = pkg_json.get('version')

with open('setup.cfg', 'rt', encoding='utf-8') as fh:
    content = fh.read()
    content = content.replace('<long_description>', long_description)
    content = content.replace('<version>', version)

with open('setup.cfg', 'wt', encoding='utf-8') as fh:
    fh.write(content)
