"""Check Analytics' original CSV against a candidate, without executing analytics."""

import argparse
import csv
import hashlib
import io
import json
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import parse_qs, urlsplit
from urllib.request import HTTPRedirectHandler, build_opener


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--base", default="http://localhost:3000")
parser.add_argument("--matrix", type=Path, default=Path(__file__).resolve().parents[2] / "analytics/2026-11-05-optometric-premigration/url-migration-matrix.csv")
parser.add_argument("--output", type=Path, default=Path("docs/analytics-matrix-verification.json"))
args = parser.parse_args()
source = args.matrix.read_bytes()
rows = list(csv.DictReader(io.StringIO(source.decode("utf-8-sig"))))
opener = build_opener(NoRedirect())


def get(path):
    try:
        return opener.open(args.base.rstrip("/") + path, timeout=30)
    except HTTPError as error:
        return error


results = []
pending = []
for row in rows:
    original = urlsplit(row["old_url"])
    target = urlsplit(row["recommended_target"])
    if original.scheme != "https" or original.hostname != "optometriccafe.com":
        pending.append({"url": row["old_url"], "reason": "Production HTTP/www host normalization cannot be accepted on a preview hostname."})
        continue
    path = original.path + ("?" + original.query if original.query else "")
    redirect = original.path != target.path or original.query != target.query
    with get(path) as response:
        status = response.code
        destination = urlsplit(response.headers.get("Location", ""))
    passed = status in (301, 308) if redirect else status == 200
    if redirect:
        passed = passed and destination.path == target.path
        for key, values in parse_qs(original.query).items():
            if key.lower() not in ("amp", "noamp"):
                passed = passed and parse_qs(destination.query).get(key) == values
        with get(target.path) as final:
            passed = passed and final.code == 200
    results.append({"source": row["old_url"], "decision": row["decision"], "expectedDestination": row["recommended_target"], "status": status, "passed": bool(passed)})

report = {
    "checkedAt": datetime.now(timezone.utc).isoformat(),
    "base": args.base, "matrixFile": str(args.matrix),
    "matrixSha256": hashlib.sha256(source).hexdigest(),
    "matrixRows": len(rows), "checkedRows": len(results),
    "passed": all(result["passed"] for result in results),
    "productionHostChecksPending": pending, "results": results,
}
args.output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
failures = [result for result in results if not result["passed"]]
print(json.dumps({"checkedRows": len(results), "failures": failures, "productionHostChecksPending": len(pending)}, indent=2))
raise SystemExit(1 if failures else 0)
