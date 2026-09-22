from __future__ import annotations
import argparse, json, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
MANIFEST = json.loads((ROOT/'sites_manifest_v1.json').read_text(encoding='utf-8'))
SITE_MAP = {s['site_id']: s for s in MANIFEST['sites']}
REQUIRED = [
    'README.md','BUGS.md','bug_catalog.json','.gitignore','site_meta.json',
    'backend/package.json','backend/package-lock.json','backend/server.js',
    'frontend/package.json','frontend/package-lock.json','frontend/vite.config.js',
    'frontend/eslint.config.js','frontend/index.html','frontend/src/main.jsx',
    'frontend/src/App.jsx','frontend/src/App.css','frontend/src/index.css'
]
REQ_README = ['실행 방법','테스트 계정','데이터 초기화','API 전용 / UI 재현 범위 구분']
REQ_BUG_KEYS = {
    'bug_id','source_id','category','vulnerability_family','source_error_name',
    'reproduction_scope','trigger','expected_normal_behavior','intentional_buggy_behavior',
    'evidence_required','oracle_required','safe_fixture','source_target_action','source_reference'
}
VALID_SCOPES = {'UI','API_ONLY','UI_TRIGGER_API_UI_VERIFY'}

def check_site(sid: str):
    errors=[]; warnings=[]
    site_dir=ROOT/'generated'/sid
    if not site_dir.exists():
        return [f'{sid}: generated directory missing'], warnings
    for rel in REQUIRED:
        if not (site_dir/rel).exists(): errors.append(f'{sid}: missing {rel}')
    if errors: return errors,warnings

    try: bugs=json.loads((site_dir/'bug_catalog.json').read_text(encoding='utf-8'))
    except Exception as e:
        return [f'{sid}: invalid bug_catalog.json: {e}'], warnings

    expected=SITE_MAP[sid]
    if len(bugs)!=expected['bug_count']:
        errors.append(f'{sid}: bug count {len(bugs)} != manifest {expected["bug_count"]}')
    source_ids=[b.get('source_id') for b in bugs]
    expected_ids=[b['source_id'] for b in expected['bugs']]
    if source_ids!=expected_ids:
        errors.append(f'{sid}: source_id order/content differs from manifest')
    if len(set(source_ids))!=len(source_ids):
        errors.append(f'{sid}: duplicate source_id')
    bug_ids=[b.get('bug_id') for b in bugs]
    if len(set(bug_ids))!=len(bug_ids): errors.append(f'{sid}: duplicate bug_id')

    for i,b in enumerate(bugs,1):
        missing=REQ_BUG_KEYS-set(b)
        if missing: errors.append(f'{sid}: bug {i} missing keys {sorted(missing)}')
        if b.get('reproduction_scope') not in VALID_SCOPES:
            errors.append(f'{sid}: bug {i} invalid reproduction_scope {b.get("reproduction_scope")}')
        if not b.get('safe_fixture'): errors.append(f'{sid}: bug {i} safe_fixture empty')
        if not b.get('evidence_required'): errors.append(f'{sid}: bug {i} evidence_required empty')
        if not b.get('oracle_required'): errors.append(f'{sid}: bug {i} oracle_required empty')

    readme=(site_dir/'README.md').read_text(encoding='utf-8')
    for phrase in REQ_README:
        if phrase not in readme: errors.append(f'{sid}: README missing phrase: {phrase}')
    if 'RAWD' not in readme: errors.append(f'{sid}: README missing RAWD reward handling note')
    if 'userA@test.com' not in readme or 'userB@test.com' not in readme or 'admin@test.com' not in readme:
        errors.append(f'{sid}: README test accounts incomplete')

    bugs_md=(site_dir/'BUGS.md').read_text(encoding='utf-8')
    for src in expected_ids:
        if src not in bugs_md: errors.append(f'{sid}: BUGS.md missing {src}')

    server=(site_dir/'backend/server.js').read_text(encoding='utf-8')
    for b in bugs:
        fam=b['vulnerability_family']
        if fam not in server:
            warnings.append(f'{sid}: family string not found in server.js: {fam}')
    # JS syntax check only; dependency resolution is not needed for --check.
    p=subprocess.run(['node','--check',str(site_dir/'backend/server.js')],capture_output=True,text=True)
    if p.returncode!=0: errors.append(f'{sid}: backend JS syntax error: {p.stderr.strip()}')

    app=(site_dir/'frontend/src/App.jsx').read_text(encoding='utf-8')
    if 'dangerouslySetInnerHTML' not in app and any(b['vulnerability_family'] in {'reflected-xss','stored-xss'} for b in bugs):
        errors.append(f'{sid}: XSS family assigned but UI sink absent')
    if sid not in (site_dir/'site_meta.json').read_text(encoding='utf-8'):
        errors.append(f'{sid}: site_meta missing site id')
    return errors,warnings


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--site',action='append')
    parser.add_argument('--all-generated',action='store_true')
    args=parser.parse_args()
    if args.site: selected=args.site
    else: selected=sorted([p.name for p in (ROOT/'generated').iterdir() if p.is_dir()])

    all_errors=[]; all_warnings=[]
    for sid in selected:
        if sid not in SITE_MAP:
            all_errors.append(f'unknown site id: {sid}'); continue
        e,w=check_site(sid); all_errors.extend(e); all_warnings.extend(w)
        print(f'{sid}: {"PASS" if not e else "FAIL"} ({SITE_MAP[sid]["bug_count"]} bugs)')
    if all_warnings:
        print('\nWarnings:')
        for w in all_warnings: print(' -',w)
    if all_errors:
        print('\nErrors:')
        for e in all_errors: print(' -',e)
        raise SystemExit(1)
    print(f'\nPASS: {len(selected)} site(s), no structural/documentation errors found.')

if __name__=='__main__': main()
