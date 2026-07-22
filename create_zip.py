import os, zipfile

root = r"d:\Users\pop\Desktop\new pr"
parent = os.path.dirname(root)
dest = os.path.join(parent, "ERP-college.zip")
excludes = {'.venv','node_modules','__pycache__'}

with zipfile.ZipFile(dest, 'w', zipfile.ZIP_DEFLATED) as z:
    for dirpath, dirnames, filenames in os.walk(root):
        # Skip excluded directories by mutating dirnames in-place
        dirnames[:] = [d for d in dirnames if d not in excludes]
        for fname in filenames:
            fp = os.path.join(dirpath, fname)
            try:
                arc = os.path.relpath(fp, parent)
                z.write(fp, arc)
            except Exception as e:
                # Non-fatal: report and continue
                print('SKIP', fp, e)

print('ZIP_CREATED', dest)
