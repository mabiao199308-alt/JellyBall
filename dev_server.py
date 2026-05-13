#!/usr/bin/env python3
import json
import re
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent
BALL_VISUAL_FILE = ROOT / "ball_visual.js"
DEFAULT_CFG_RE = re.compile(
    r"const\s+defaultBallVisualCfg\s*=\s*\{.*?\};",
    re.DOTALL,
)


def json_response(handler, status, payload):
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def write_ball_visual_defaults(cfg):
    if not isinstance(cfg, dict):
        raise ValueError("cfg must be object")

    source = BALL_VISUAL_FILE.read_text(encoding="utf-8")
    replacement = "const defaultBallVisualCfg = " + json.dumps(cfg, ensure_ascii=False, indent=2) + ";"
    updated, count = DEFAULT_CFG_RE.subn(replacement, source, count=1)
    if count != 1:
        raise RuntimeError("defaultBallVisualCfg block not found")
    BALL_VISUAL_FILE.write_text(updated + ("\n" if not updated.endswith("\n") else ""), encoding="utf-8")


class DevHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_POST(self):
        if self.path != "/api/save-ball-visual-defaults":
            json_response(self, HTTPStatus.NOT_FOUND, {"ok": False, "error": "not found"})
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            raw = self.rfile.read(length)
            payload = json.loads(raw.decode("utf-8"))
            cfg = payload.get("cfg")
            write_ball_visual_defaults(cfg)
            json_response(self, HTTPStatus.OK, {"ok": True})
        except Exception as exc:  # noqa: BLE001
            json_response(self, HTTPStatus.BAD_REQUEST, {"ok": False, "error": str(exc)})


def main():
    server = ThreadingHTTPServer(("0.0.0.0", 8123), DevHandler)
    print("Serving on http://0.0.0.0:8123")
    server.serve_forever()


if __name__ == "__main__":
    main()
