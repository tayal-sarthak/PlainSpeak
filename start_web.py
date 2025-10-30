# launcher script

import os
import sys
import subprocess
import time
import webbrowser
from pathlib import Path

def print_banner():
    print("\n" + "="*60)
    print("plainspeak web launcher")
    print("="*60 + "\n")

def check_node_installed():
    try:
        result = subprocess.run(
            ['node', '--version'], 
            capture_output=True, 
            text=True
        )
        print("[ok] nodejs " + result.stdout.strip())
        return True
    except FileNotFoundError:
        print("[error] nodejs missing")
        print("get it: https://nodejs.org/")
        return False

def check_npm_installed():
    try:
        result = subprocess.run(
            ['npm', '--version'], 
            capture_output=True, 
            text=True
        )
        print("[ok] npm " + result.stdout.strip())
        return True
    except FileNotFoundError:
        print("[error] npm missing")
        return False

def install_npm_dependencies(web_dir):
    node_modules = web_dir / "node_modules"
    
    if not node_modules.exists():
        print("\ninstalling deps (first run takes a bit)\n")
        
        try:
            subprocess.run(
                ['npm', 'install'], 
                cwd=web_dir, 
                check=True
            )
            print("\n[ok] deps installed")
        except subprocess.CalledProcessError:
            print("\n[error] npm install failed")
            return False
    else:
        print("[ok] deps already there")
    
    return True

def start_backend():
    print("\nstarting backend -> localhost:5003")
    
    backend_dir = Path(__file__).parent / "backend"
    app_file = backend_dir / "app.py"
    
    if not app_file.exists():
        print("[error] cant find backend/app.py at " + str(app_file))
        return None
    
    try:
        proc = subprocess.Popen(
            ['/usr/local/bin/python3', str(app_file)],
            cwd=backend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        time.sleep(2)
        
        if proc.poll() is None:
            print("[ok] backend up")
            return proc
        else:
            stdout, stderr = proc.communicate()
            print("[error] backend crashed")
            if stderr:
                print("stderr: " + stderr)
            return None
            
    except Exception as e:
        print("[error] backend start failed: " + str(e))
        return None

def start_frontend(web_dir):
    print("\nstarting frontend -> localhost:3000")
    
    try:
        proc = subprocess.Popen(
            ['npm', 'run', 'dev'],
            cwd=web_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        time.sleep(3)
        
        if proc.poll() is None:
            print("[ok] frontend up")
            return proc
        else:
            print("[error] frontend crashed")
            return None
            
    except Exception as e:
        print("[error] frontend start failed: " + str(e))
        return None

def open_browser():
    time.sleep(2)
    print("\nopening browser -> localhost:3000\n")
    try:
        webbrowser.open('http://localhost:3000')
    except:
        pass

def main():
    print_banner()
    
    script_dir = Path(__file__).parent
    web_dir = script_dir / "web"
    
    if not web_dir.exists():
        print("[error] web dir missing at " + str(web_dir))
        print("run this from plainspeak dir")
        sys.exit(1)
    
    print("checking prereqs\n")
    
    if not check_node_installed():
        sys.exit(1)
    
    if not check_npm_installed():
        sys.exit(1)
    
    if not install_npm_dependencies(web_dir):
        sys.exit(1)
    
    print("\n" + "="*60)
    print("launching servers")
    print("="*60)
    
    backend_proc = start_backend()
    if not backend_proc:
        print("\n[error] backend startup failed, bailing")
        sys.exit(1)
    
    frontend_proc = start_frontend(web_dir)
    if not frontend_proc:
        print("\n[error] frontend startup failed, killing backend")
        backend_proc.terminate()
        sys.exit(1)
    
    open_browser()
    
    print("="*60)
    print("plainspeak running")
    print("="*60)
    print("\nlocations:")
    print("  frontend -> localhost:3000")
    print("  backend  -> localhost:5003")
    print("\nctrl+c stops everything\n")
    print("="*60 + "\n")
    
    try:
        while True:
            time.sleep(1)
            
            if backend_proc.poll() is not None:
                print("\nbackend died")
                frontend_proc.terminate()
                break
            
            if frontend_proc.poll() is not None:
                print("\nfrontend died")
                backend_proc.terminate()
                break
                
    except KeyboardInterrupt:
        print("\n\nshutting down")
        print("  killing backend")
        backend_proc.terminate()
        print("  killing frontend")
        frontend_proc.terminate()
        
        backend_proc.wait(timeout=5)
        frontend_proc.wait(timeout=5)
        
        print("\nall stopped\n")

if __name__ == "__main__":
    main()
