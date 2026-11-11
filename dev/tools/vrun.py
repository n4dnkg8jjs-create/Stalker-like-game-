import os as _os;_D=_os.path.dirname(_os.path.abspath(__file__));_DEV=_os.path.dirname(_D)
_WORK=_os.path.join(_DEV,'work');[_os.makedirs(_os.path.join(_WORK,x),exist_ok=True) for x in ('shots','vcmd')]
_HTML='file://'+_os.path.join(_DEV,'out','zone12.html')
import json,subprocess,sys
SP=_WORK
def run(js,shots):
    json.dump({'js':js,'shots':shots},open(SP+'/_c.json','w'))
    return subprocess.run(['python3',_os.path.join(_D,'vs.py'),SP+'/_c.json'],capture_output=True,text=True).stdout
