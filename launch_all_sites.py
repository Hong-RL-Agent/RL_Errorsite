import subprocess
import os
import sys
import time

# List of sites to run
sites = [
    {"id": "site049", "port": 9158},
    {"id": "site050", "port": 9159},
    {"id": "site051", "port": 9160},
    {"id": "site052", "port": 9161},
    {"id": "site053", "port": 9162},
    {"id": "site054", "port": 9163},
    {"id": "site055", "port": 9164},
    {"id": "site056", "port": 9165},
    {"id": "site057", "port": 9166},
    {"id": "site058", "port": 9167},
    {"id": "site059", "port": 9168},
    {"id": "site060", "port": 9169},
]

processes = []

print("🚀 Starting PPO Training Testbeds (site049 - site060)...")
print("Press Ctrl+C to stop all servers.\n")

workspace_root = os.getcwd()

try:
    for site in sites:
        site_id = site["id"]
        port = site["port"]
        server_path = os.path.join(workspace_root, site_id, "server.py")
        
        if os.path.exists(server_path):
            print(f"[{site_id}] Starting on http://localhost:{port}...")
            # Use sys.executable to ensure we use the same python interpreter
            p = subprocess.Popen([sys.executable, server_path], 
                                 cwd=os.path.join(workspace_root, site_id))
            processes.append(p)
        else:
            print(f"⚠️  Warning: {server_path} not found. Skipping...")

    print("\n✅ All servers are booting up. You can now access the local dashboard.")
    
    # Keep the script running
    while True:
        time.sleep(1)

except KeyboardInterrupt:
    print("\n🛑 Stopping all servers...")
    for p in processes:
        p.terminate()
    print("Done.")
