
try:
    with open('build_error.txt', 'r', encoding='utf-8', errors='ignore') as f:
        print(f.read())
except FileNotFoundError:
    print("build_error.txt not found, running build again...")
    import subprocess
    subprocess.run("npm run build", shell=True)
