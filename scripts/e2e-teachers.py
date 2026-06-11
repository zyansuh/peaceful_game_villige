#!/usr/bin/env python3
"""Teacher CRUD smoke test against local backend."""

from __future__ import annotations

import json
import sys
import time
import urllib.error
import urllib.request

BASE = "http://127.0.0.1:8000"
API = f"{BASE}/api/v1/entities/teachers"
NICK = f"e2e-test-{int(time.time())}"


def request(method: str, url: str, body: dict | None = None) -> tuple[int, dict | str]:
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers={"Content-Type": "application/json; charset=utf-8"},
    )
    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read().decode("utf-8")
            return resp.status, json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8")
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            payload = raw
        return exc.code, payload


def main() -> int:
    print("==> Health check")
    status, body = request("GET", f"{BASE}/database/health")
    if status != 200 or body.get("status") != "healthy":
        print(f"FAIL health: {status} {body}", file=sys.stderr)
        return 1

    print(f"==> CREATE teacher: {NICK}")
    payload = {
        "game_category": "pubg",
        "class_name": "수달반",
        "nickname": NICK,
        "intro": "E2E test",
        "detail_intro": "성별: 남 | 출생년도: 99년생 | MBTI: ENFP | 게임유형: 경쟁",
        "tier": "99티어",
        "active_time": "저녁",
        "personality": "ENFP",
        "teaching_style": "경쟁",
        "position": "선생님",
        "message": "E2E",
        "profile_image": "",
        "max_students": 5,
        "current_students": 0,
        "status": "recruiting",
    }
    status, created = request("POST", API, payload)
    if status != 201:
        print(f"FAIL create: {status} {created}", file=sys.stderr)
        return 1
    teacher_id = created["id"]
    print(f"    id={teacher_id}")

    print("==> UPDATE status -> closed")
    status, _ = request("PUT", f"{API}/{teacher_id}", {"status": "closed"})
    if status != 200:
        print(f"FAIL update: {status}", file=sys.stderr)
        return 1

    print("==> VERIFY persisted after update")
    status, fetched = request("GET", f"{API}/{teacher_id}")
    if status != 200 or fetched.get("status") != "closed":
        print(f"FAIL verify: {status} {fetched}", file=sys.stderr)
        return 1

    print("==> DELETE teacher")
    status, _ = request("DELETE", f"{API}/{teacher_id}")
    if status not in (200, 204):
        print(f"FAIL delete: {status}", file=sys.stderr)
        return 1

    print("==> VERIFY deleted (expect 404)")
    status, _ = request("GET", f"{API}/{teacher_id}")
    if status != 404:
        print(f"FAIL expected 404, got {status}", file=sys.stderr)
        return 1

    print("OK - teacher CRUD E2E passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
