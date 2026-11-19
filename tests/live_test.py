import urllib.request
import urllib.error
import json

BASE = "http://127.0.0.1:8000"

def check_endpoint(name, method, url, data=None):
    print(f"\n========================================")
    print(f"TEST: {name} -> {method} {url}")
    try:
        req = urllib.request.Request(url, method=method)
        req.add_header("Content-Type", "application/json")
        encoded_data = json.dumps(data).encode("utf-8") if data is not None else None

        with urllib.request.urlopen(req, data=encoded_data, timeout=5) as response:
            status_code = response.getcode()
            body = response.read().decode("utf-8")
            print(f"Status Code: {status_code} OK")
            try:
                res_json = json.loads(body)
                if isinstance(res_json, list):
                    print(f"Items returned: {len(res_json)}")
                    if len(res_json) > 0:
                        print("Sample item:", json.dumps(res_json[0], indent=2))
                else:
                    if "predicted_demand" in res_json and isinstance(res_json["predicted_demand"], list):
                        pts = res_json["predicted_demand"]
                        summary = dict(res_json)
                        summary["predicted_demand"] = f"{len(pts)} daily forecast points (from {pts[0]['date']} to {pts[-1]['date']})"
                        print(json.dumps(summary, indent=2))
                    else:
                        print(json.dumps(res_json, indent=2))
            except Exception:
                print("Response text:", body[:200])
            return status_code

    except urllib.error.HTTPError as he:
        print(f"Status Code: {he.code} (Expected Error)")
        err_body = he.read().decode("utf-8")
        print("Error detail:", err_body)
        return he.code
    except Exception as e:
        print("ERROR:", e)
        return 0

if __name__ == "__main__":
    print("DEMANDWISE LIVE END-TO-END TEST SUITE")
    print("Testing running backend at:", BASE)

    # 1. Root & Health
    check_endpoint("Root Endpoint", "GET", f"{BASE}/")
    check_endpoint("Health Check", "GET", f"{BASE}/health")

    # 2. Products & Horizons
    check_endpoint("Available Products", "GET", f"{BASE}/api/products")
    check_endpoint("Supported Horizons", "GET", f"{BASE}/api/horizons")

    # 3. 7-Day Forecast (85123A)
    check_endpoint(
        "7-Day Forecast (85123A)",
        "POST",
        f"{BASE}/predict",
        data={"product_id": "85123A", "horizon": 7, "current_stock": 100}
    )

    # 4. 14-Day Forecast (21212)
    check_endpoint(
        "14-Day Forecast (21212)",
        "POST",
        f"{BASE}/predict",
        data={"product_id": "21212", "horizon": 14, "current_stock": 250}
    )

    # 5. 30-Day Forecast (85099B)
    check_endpoint(
        "30-Day Forecast (85099B)",
        "POST",
        f"{BASE}/predict",
        data={"product_id": "85099B", "horizon": 30, "current_stock": 500}
    )

    # 6. Product History
    check_endpoint("Product History (85123A)", "GET", f"{BASE}/api/products/85123A/history")

    # 7. Inventory & Alerts
    check_endpoint("Inventory Status (85123A, stock=100)", "GET", f"{BASE}/api/inventory/85123A?stock=100")
    check_endpoint("System Alerts", "GET", f"{BASE}/api/alerts")

    # 8. Error validations
    check_endpoint("Error Handling: Invalid Horizon (45d)", "POST", f"{BASE}/predict", data={"product_id": "85123A", "horizon": 45})
    check_endpoint("Error Handling: Missing Product ID", "POST", f"{BASE}/predict", data={"horizon": 7})

    print("\n========================================")
    print("ALL LIVE TESTS COMPLETE!")
