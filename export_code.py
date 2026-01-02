import os

IGNORE_DIRS = {'.git', '__pycache__', 'node_modules', '.svelte-kit', 'venv', '.env'}
IGNORE_FILES = {'package-lock.json', 'poetry.lock', 'project_context.txt', 'export_code.py', '.DS_Store'}
target_extensions = {'.py', '.js', '.ts', '.svelte', '.html', '.css', '.md', '.txt', '.json'}

output_file = "project_context.txt"

def collect_project_code():
    with open(output_file, "w", encoding="utf-8") as out_f:
        out_f.write("=== [Project Structure] ===\n")
        for root, dirs, files in os.walk("."):
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            level = root.replace(".", "").count(os.sep)
            indent = " " * 4 * (level)
            out_f.write(f"{indent}{os.path.basename(root)}/\n")
            subindent = " " * 4 * (level + 1)
            for f in files:
                if f not in IGNORE_FILES:
                    out_f.write(f"{subindent}{f}\n")
        
        out_f.write("\n\n=== [File Contents] ===\n")
        for root, dirs, files in os.walk("."):
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            for file in files:
                if file in IGNORE_FILES: continue
                _, ext = os.path.splitext(file)
                if ext in target_extensions:
                    path = os.path.join(root, file)
                    out_f.write(f"\n--- FILE START: {path} ---\n")
                    try:
                        with open(path, "r", encoding="utf-8") as f:
                            out_f.write(f.read())
                    except Exception as e:
                        out_f.write(f"[Error: {e}]")
                    out_f.write(f"\n--- FILE END: {path} ---\n")
    print(f"✅ 완료! '{output_file}' 내용을 복사해서 참참이에게 주세요.")

if __name__ == "__main__":
    collect_project_code()