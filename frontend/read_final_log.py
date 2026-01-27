
try:
    with open('build_log_final.txt', 'r', encoding='utf-8', errors='ignore') as f:
        print(f.read())
except Exception as e:
    print(e)
