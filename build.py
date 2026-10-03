import glob, os, re, sys
root = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(root, 'src')
head = open(os.path.join(src, '00_head.html')).read()
js = ''.join(open(f).read() + '\n' for f in sorted(glob.glob(os.path.join(src, '*.js'))))
os.makedirs(os.path.join(root, 'dist'), exist_ok=True)
open(os.path.join(root, 'dist', 'game.js'), 'w').write(js)
page = head + '\n<script>\n' + js + '\n</script>\n'
open(os.path.join(root, 'dist', 'wheel-of-samsara.html'), 'w').write(page)
skeleton = ('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
            '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}body{margin:0;font:14px system-ui;background:#fafaf7}img{max-width:100%}[hidden]{display:none!important}</style>'
            '</head><body>' + page + '</body></html>')
open(os.path.join(root, 'dist', 'test.html'), 'w').write(skeleton)
standalone = ('<!doctype html><html lang="en"><head><meta charset="utf-8">'
              '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">'
              '<meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes">'
              '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">'
              '<style>html,body{margin:0;height:100%;background:#0b0806;overflow:hidden}[hidden]{display:none!important}</style>'
              '</head><body>' + page + '</body></html>')
open(os.path.join(root, 'dist', 'index.html'), 'w').write(standalone)
print('built', len(page) // 1024, 'KB')
