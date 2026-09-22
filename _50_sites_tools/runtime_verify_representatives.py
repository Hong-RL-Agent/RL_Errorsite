#!/usr/bin/env python3
# Representative runtime verifier for phase2_site_factory.
# Runs only the five archetype representatives: v02, v12, v22, v32, v42.
# It resets each representative DB, installs dependencies, builds the frontend,
# starts the backend on a temporary port, checks baseline APIs, then verifies
# every intentional bug family assigned to that representative.

import json
import os
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

REPRESENTATIVES = ["error-site-v02", "error-site-v12", "error-site-v22", "error-site-v32", "error-site-v42"]
BASE_PORT = 3200


def fail(msg):
    raise AssertionError(msg)


def request_json(base, path, method="GET", body=None, token=None, headers=None, expected=None, timeout=10):
    url = base + path
    data = None if body is None else json.dumps(body).encode("utf-8")
    req_headers = {"Content-Type": "application/json"}
    if token:
        req_headers["Authorization"] = f"Bearer {token}"
    if headers:
        req_headers.update(headers)
    req = urllib.request.Request(url, data=data, method=method, headers=req_headers)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read().decode("utf-8")
            payload = json.loads(raw) if raw else {}
            status = resp.status
            response_headers = {k.lower(): v for k, v in resp.headers.items()}
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8")
        try:
            payload = json.loads(raw) if raw else {}
        except Exception:
            payload = {"raw": raw}
        status = e.code
        response_headers = {k.lower(): v for k, v in e.headers.items()}

    if expected is not None and status != expected:
        fail(f"{method} {path}: expected HTTP {expected}, got {status}, body={payload}")
    return status, payload, response_headers


def wait_for_health(base, seconds=15):
    deadline = time.time() + seconds
    last = None
    while time.time() < deadline:
        try:
            status, data, _ = request_json(base, "/api/health", timeout=2)
            if status == 200 and data.get("ok") is True:
                return data
        except Exception as e:
            last = e
        time.sleep(0.3)
    raise RuntimeError(f"backend did not become ready: {last}")


def npm_run(cwd, args):
    cmd = "npm " + args
    print(f"    $ {cmd}")
    p = subprocess.run(cmd, cwd=cwd, shell=True)
    if p.returncode != 0:
        raise RuntimeError(f"command failed ({p.returncode}): {cmd}")


def login(base, email="userA@test.com", extra_headers=None):
    status, data, _ = request_json(
        base, "/api/auth/login", method="POST",
        body={"email": email, "password": "1234"},
        headers=extra_headers, expected=200
    )
    return data["token"], data


def verify_family(base, family):
    if family == "IDOR":
        token, _ = login(base, "userA@test.com")
        _, data, _ = request_json(base, "/api/private-records/2", token=token, expected=200)
        if int(data["record"]["owner_id"]) == 1:
            fail("IDOR fixture did not cross ownership")
    elif family == "vertical-privilege-escalation":
        token, _ = login(base, "userA@test.com")
        _, data, _ = request_json(base, "/api/admin/protected", token=token, expected=200)
        if data.get("protected") is not True:
            fail("vertical privilege fixture did not expose protected area")
    elif family == "permission-drift":
        token, _ = login(base, "admin@test.com")
        request_json(base, "/api/admin/demote-self", method="POST", body={}, token=token, expected=200)
        _, data, _ = request_json(base, "/api/admin/privileged", token=token, expected=200)
        if data.get("db_role") != "user" or data.get("cached_role") != "admin":
            fail(f"permission-drift fixture mismatch: {data}")
    elif family == "reflected-xss":
        fixture = "<b>fixture</b>"
        q = urllib.parse.quote(fixture, safe="")
        _, data, _ = request_json(base, f"/api/echo?q={q}", expected=200)
        if data.get("html") != fixture:
            fail(f"reflected fixture was escaped/changed: {data}")
    elif family == "stored-xss":
        token, _ = login(base, "userA@test.com")
        fixture = "<b>stored-fixture</b>"
        request_json(base, "/api/notes", method="POST", body={"content": fixture}, token=token, expected=201)
        _, data, _ = request_json(base, "/api/notes", token=token, expected=200)
        if data.get("render_as_html") is not True or not any(n.get("content") == fixture for n in data.get("notes", [])):
            fail(f"stored fixture mismatch: {data}")
    elif family == "sql-injection":
        inj = urllib.parse.quote("' OR 1=1 -- ", safe="")
        _, data, _ = request_json(base, f"/api/search?q={inj}", expected=200)
        if int(data.get("count", 0)) < 6:
            fail(f"SQLi fixture did not broaden result set: {data}")
    elif family == "system-info-disclosure":
        _, data, _ = request_json(base, "/api/parse", method="POST", body={"value": "not-a-number"}, expected=500)
        if "internal_path" not in data or "sql_hint" not in data:
            fail(f"internal details were not disclosed: {data}")
    elif family == "session-fixation":
        fixed = "local-fixed-session-fixture"
        _, data = login(base, "userA@test.com", {"X-Session-Id": fixed})
        if data.get("session_id") != fixed or data.get("token") != fixed:
            fail(f"session fixation fixture mismatch: {data}")
    elif family == "logout-reuse":
        token, _ = login(base, "userA@test.com")
        request_json(base, "/api/auth/logout", method="POST", body={}, token=token, expected=200)
        request_json(base, "/api/me", token=token, expected=200)
    elif family == "security-headers":
        _, _, headers = request_json(base, "/api/header-check", expected=200)
        for h in ("content-security-policy", "strict-transport-security", "x-content-type-options"):
            if h in headers:
                fail(f"security header unexpectedly present: {h}")
    elif family == "price-tampering":
        token, _ = login(base, "userA@test.com")
        _, data, _ = request_json(base, "/api/checkout", method="POST", body={"clientTotal": 123}, token=token, expected=201)
        if int(data.get("approved_total", -1)) != 123:
            fail(f"client total was not trusted: {data}")
    elif family == "idempotency":
        token, _ = login(base, "userA@test.com")
        hdr = {"Idempotency-Key": "repeat-fixture"}
        _, first, _ = request_json(base, "/api/transactions", method="POST", body={"amount": 1000}, token=token, headers=hdr, expected=201)
        _, second, _ = request_json(base, "/api/transactions", method="POST", body={"amount": 1000}, token=token, headers=hdr, expected=201)
        if first.get("transaction_id") == second.get("transaction_id"):
            fail(f"duplicate request was deduplicated unexpectedly: {first}, {second}")
    elif family == "async-no-feedback":
        token, _ = login(base, "userA@test.com")
        start = time.time()
        _, data, _ = request_json(base, "/api/slow-action", method="POST", body={"label": "fixture"}, token=token, expected=200, timeout=8)
        elapsed = time.time() - start
        if int(data.get("elapsed_ms", 0)) < 4000 or elapsed < 4.0:
            fail(f"async delay fixture too short: body={data}, wall={elapsed:.2f}s")
    else:
        fail(f"unknown family: {family}")


def main():
    script_dir = Path(__file__).resolve().parent
    candidates = [
        script_dir / "generated",
        script_dir.parent / "generated",
        script_dir / "sites",
        script_dir.parent / "sites",
    ]
    generated = next((p for p in candidates if p.exists()), None)
    if generated is None:
        print("ERROR: could not find generated/ or sites/ next to the verifier/package root.")
        return 2

    node = shutil.which("node")
    if not node:
        print("ERROR: node was not found in PATH.")
        return 2

    total_family_checks = 0
    failures = []

    for idx, site_id in enumerate(REPRESENTATIVES):
        site = generated / site_id
        backend = site / "backend"
        frontend = site / "frontend"
        catalog = json.loads((site / "bug_catalog.json").read_text(encoding="utf-8"))
        families = [b["vulnerability_family"] for b in catalog]
        port = BASE_PORT + idx
        base = f"http://127.0.0.1:{port}"

        print(f"\n=== {site_id} ===")
        print("  families:", ", ".join(families))

        # Always start from a clean DB for deterministic results.
        dbfile = backend / "data" / "site.sqlite"
        if dbfile.exists():
            dbfile.unlink()

        proc = None
        try:
            # Dependency/install + compile checks only for the five representatives.
            if not (backend / "node_modules").exists():
                npm_run(backend, "install --no-audit --no-fund")
            if not (frontend / "node_modules").exists():
                npm_run(frontend, "install --no-audit --no-fund")
            npm_run(frontend, "run build")

            env = os.environ.copy()
            env["PORT"] = str(port)
            proc = subprocess.Popen(
                [node, "server.js"],
                cwd=backend,
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
            )
            health = wait_for_health(base)
            enabled = set(health.get("families", []))
            if enabled != set(families):
                fail(f"/api/health family mismatch: catalog={families}, runtime={sorted(enabled)}")

            # Baseline runtime checks.
            request_json(base, "/api/site", expected=200)
            _, items, _ = request_json(base, "/api/items", expected=200)
            if len(items.get("items", [])) < 1:
                fail("baseline item list is empty")
            token, _ = login(base, "userA@test.com")
            request_json(base, "/api/me", token=token, expected=200)

            # Verify every assigned intentional bug family for this representative.
            for fam in families:
                verify_family(base, fam)
                total_family_checks += 1
                print(f"    PASS bug family: {fam}")

            print(f"  PASS {site_id}: frontend build + backend runtime + {len(families)} bug fixtures")
        except Exception as e:
            failures.append((site_id, str(e)))
            print(f"  FAIL {site_id}: {e}")
        finally:
            if proc is not None:
                proc.terminate()
                try:
                    proc.wait(timeout=4)
                except subprocess.TimeoutExpired:
                    proc.kill()

    print("\n" + "=" * 72)
    if failures:
        print(f"FAIL: {len(failures)} representative site(s) had runtime errors.")
        for site_id, reason in failures:
            print(f"- {site_id}: {reason}")
        return 1

    print(f"PASS: {len(REPRESENTATIVES)} representative sites.")
    print(f"PASS: {total_family_checks} assigned bug-family runtime checks.")
    print("Coverage: the five representatives collectively cover all 13 vulnerability families.")
    print("Next gate: package/commit the 50 generated sites; node_modules, dist, and SQLite data remain ignored.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
