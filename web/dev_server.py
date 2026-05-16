#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import socket
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent
GAME_JS = ROOT / "src" / "main.ts"


def _get_local_ips() -> set[str]:
    ips = {"127.0.0.1", "::1"}
    try:
        infos = socket.getaddrinfo(socket.gethostname(), None)
        for info in infos:
            addr = info[4][0]
            if addr:
                ips.add(addr)
    except Exception:
        pass

    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("8.8.8.8", 80))
            ips.add(s.getsockname()[0])
    except Exception:
        pass

    return ips


def _find_matching_brace(text: str, open_idx: int) -> int:
    depth = 0
    in_str = False
    str_ch = ""
    escape = False
    for i in range(open_idx, len(text)):
        ch = text[i]
        if in_str:
            if escape:
                escape = False
                continue
            if ch == "\\":
                escape = True
                continue
            if ch == str_ch:
                in_str = False
            continue

        if ch in ('"', "'", "`"):
            in_str = True
            str_ch = ch
            continue
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return i
    raise ValueError("找不到匹配的大括号")


def _extract_object_block(source: str, const_name: str) -> tuple[int, int, str]:
    marker = f"const {const_name} ="
    start = source.find(marker)
    if start < 0:
        raise ValueError(f"未找到 {const_name}")
    open_idx = source.find("{", start)
    if open_idx < 0:
        raise ValueError(f"{const_name} 不是对象字面量")
    close_idx = _find_matching_brace(source, open_idx)
    return open_idx, close_idx, source[open_idx + 1 : close_idx]


def _parse_object_entries(block: str) -> list[tuple[str, str]]:
    entries: list[tuple[str, str]] = []
    for line in block.splitlines():
        text = line.strip()
        if not text:
            continue
        m = re.match(r"^([A-Za-z_$][A-Za-z0-9_$]*)\s*:\s*(.+?)\s*,?$", text)
        if not m:
            continue
        key = m.group(1)
        value = m.group(2).strip()
        entries.append((key, value))
    return entries


def _format_js_number(v: float) -> str:
    return format(float(v), ".15g")


def _patch_const_object(source: str, const_name: str, updates: dict[str, float]) -> str:
    open_idx, close_idx, block = _extract_object_block(source, const_name)
    entries = _parse_object_entries(block)
    if not entries:
        raise ValueError(f"{const_name} 对象为空或无法解析")

    updated_entries: list[tuple[str, str]] = []
    known_keys = {k for k, _ in entries}
    for key, raw in entries:
        if key in updates:
            updated_entries.append((key, _format_js_number(updates[key])))
        else:
            updated_entries.append((key, raw))

    unknown = [k for k in updates.keys() if k not in known_keys]
    if unknown:
        raise ValueError(f"未知字段: {', '.join(unknown)}")

    rendered = "\n" + "\n".join(f"  {k}: {v}," for k, v in updated_entries) + "\n"
    return source[: open_idx + 1] + rendered + source[close_idx:]


class DevHandler(SimpleHTTPRequestHandler):
    def _send_json(self, status: int, payload: dict):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        if self.path == "/__save_code_defaults":
            self.send_response(HTTPStatus.NO_CONTENT)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Content-Length", "0")
            self.end_headers()
            return
        return super().do_OPTIONS()

    def _is_local_request(self) -> bool:
        host = self.client_address[0]
        return host in _get_local_ips()

    def do_POST(self):
        if self.path != "/__save_code_defaults":
            return self._send_json(HTTPStatus.NOT_FOUND, {"ok": False, "error": "未找到接口"})

        if not self._is_local_request():
            return self._send_json(HTTPStatus.FORBIDDEN, {"ok": False, "error": "仅允许本机请求"})

        try:
            content_len = int(self.headers.get("Content-Length", "0"))
            raw = self.rfile.read(content_len)
            payload = json.loads(raw.decode("utf-8"))
            section = payload.get("section")
            values = payload.get("values")

            if section not in ("cfg", "hazard"):
                raise ValueError("section 必须是 cfg 或 hazard")
            if not isinstance(values, dict) or not values:
                raise ValueError("values 不能为空")

            numeric_values: dict[str, float] = {}
            for k, v in values.items():
                if not isinstance(k, str):
                    raise ValueError("参数 key 非法")
                try:
                    num = float(v)
                except Exception as exc:
                    raise ValueError(f"参数 {k} 不是数字") from exc
                numeric_values[k] = num

            source = GAME_JS.read_text(encoding="utf-8")
            if section == "cfg":
                patched = _patch_const_object(source, "defaultCfg", numeric_values)
            else:
                patched = _patch_const_object(source, "defaultHazardCfg", numeric_values)

            if patched != source:
                GAME_JS.write_text(patched, encoding="utf-8")

            return self._send_json(HTTPStatus.OK, {"ok": True, "message": f"已写入 {section} 到 src/main.ts"})
        except ValueError as exc:
            return self._send_json(HTTPStatus.BAD_REQUEST, {"ok": False, "error": str(exc)})
        except Exception as exc:
            return self._send_json(HTTPStatus.INTERNAL_SERVER_ERROR, {"ok": False, "error": str(exc)})


def main():
    port = 8130
    server = ThreadingHTTPServer(("0.0.0.0", port), DevHandler)
    print(f"Dev server running at http://0.0.0.0:{port}")
    print("POST /__save_code_defaults 可写回 src/main.ts 默认值（仅 localhost 请求）")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
