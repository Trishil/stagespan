from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import re
root=Path(__file__).resolve().parent.parent
class Page(HTMLParser):
 def __init__(self):super().__init__();self.refs=[];self.ids=set();self.scripts=[];self.videos=0
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.add(a['id'])
  for key in ['src','href']:
   if a.get(key):self.refs.append(a[key])
  if a.get('srcset'):self.refs.extend(part.strip().split()[0] for part in a['srcset'].split(','))
  if tag=='script':self.scripts.append(a.get('src'))
  if tag=='video':self.videos+=1
page=Page();page.feed((root/'index.html').read_text())
for value in page.refs:
 u=urlsplit(value)
 if u.scheme or u.netloc:continue
 if u.path:assert (root/unquote(u.path)).is_file(),f'Missing local file: {value}'
 if not u.path and u.fragment:assert u.fragment in page.ids,f'Missing anchor: {value}'
for value in re.findall(r"url\(['\"]?([^)'\"]+)",(root/'styles.css').read_text()):
 if value.startswith('./'):assert (root/value).is_file(),f'Missing CSS asset: {value}'
assert page.scripts==['./site.js'],'Brochure must have only its lightweight local script'
assert page.videos==0,'Video must be opt-in, not part of initial markup'
assert (root/'site.js').stat().st_size<=15000,'Initial JavaScript exceeded 15 KB budget'
assert not (root/'package.json').exists(),'Brochure must remain independent of the ERP build'
assert 'http-equiv="Cache-Control"' not in (root/'index.html').read_text(),'Do not disable browser caching'
print(f'PASS: {len(page.refs)} local/remote references checked; anchors/fonts resolve; JavaScript budget and opt-in-video contract pass.')
