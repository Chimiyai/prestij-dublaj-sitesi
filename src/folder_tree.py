#!/usr/bin/env python3
"""
folder_tree.py

Kullanım örnekleri:
  python folder_tree.py /path/to/folder
  python folder_tree.py . -d 3 --json output.json
  python folder_tree.py /home/emre -f text --out structure.txt

Opsiyonlar:
  path        : İncelenecek klasör (zorunlu)
  -d, --depth : Maksimum derinlik (0 = sadece kök). Varsayılan: -1 (sınırsız)
  -f, --format: Çıktı formatı: text (düz ağaç), json. Varsayılan: text
  --out       : Çıktıyı bir dosyaya yaz (yoksa stdout)
"""
import os
import argparse
import json
from pathlib import Path

def build_tree(path: Path, max_depth: int = -1, _depth: int = 0):
    """Klasör yapısını nested dict/list şeklinde oluşturur."""
    if not path.exists():
        raise FileNotFoundError(f"'{path}' bulunamadı.")
    node = {
        "name": path.name,
        "path": str(path.resolve()),
        "type": "dir" if path.is_dir() else "file",
    }
    if path.is_dir() and (max_depth < 0 or _depth < max_depth):
        children = []
        try:
            entries = sorted(path.iterdir(), key=lambda p: (p.is_file(), p.name.lower()))
        except PermissionError:
            node["error"] = "permission denied"
            node["children"] = []
            return node
        for e in entries:
            if e.is_dir():
                children.append(build_tree(e, max_depth, _depth + 1))
            else:
                children.append({
                    "name": e.name,
                    "path": str(e.resolve()),
                    "type": "file",
                    "size": e.stat().st_size
                })
        node["children"] = children
    return node

def tree_to_text(tree_node, prefix=""):
    """JSON benzeri yapıyı 'tree' komutu tarzında metne çevirir."""
    lines = []
    name = tree_node.get("name", "")
    lines.append(prefix + name + ("/" if tree_node.get("type") == "dir" else ""))
    children = tree_node.get("children", [])
    for i, c in enumerate(children):
        last = (i == len(children) - 1)
        branch = "└── " if last else "├── "
        extension = "    " if last else "│   "
        if c.get("type") == "dir":
            lines.append(prefix + branch + c["name"] + "/")
            lines.extend(tree_to_text(c, prefix + extension))
        else:
            size = c.get("size")
            lines.append(prefix + branch + c["name"] + (f" ({size} bytes)" if size is not None else ""))
    return lines

def main():
    parser = argparse.ArgumentParser(description="Klasör ağacını çıkarır (text veya json).")
    parser.add_argument("path", help="İncelenecek klasör yolu")
    parser.add_argument("-d", "--depth", type=int, default=-1,
                        help="Maksimum derinlik (0 = sadece kök). Varsayılan: sınırsız")
    parser.add_argument("-f", "--format", choices=["text", "json"], default="text",
                        help="Çıktı formatı")
    parser.add_argument("--out", help="Çıktıyı dosyaya yaz (yoksa stdout)")
    args = parser.parse_args()

    p = Path(args.path)
    try:
        tree = build_tree(p, max_depth=args.depth)
    except Exception as e:
        print("Hata:", e)
        return

    if args.format == "json":
        out = json.dumps(tree, ensure_ascii=False, indent=2)
    else:
        lines = [p.name + "/"] if p.is_dir() else [p.name]
        if p.is_dir():
            for i, c in enumerate(tree.get("children", [])):
                last = (i == len(tree.get("children", [])) - 1)
                branch = "└── " if last else "├── "
                extension = "    " if last else "│   "
                if c.get("type") == "dir":
                    lines.append(branch + c["name"] + "/")
                    lines.extend(tree_to_text(c, extension))
                else:
                    size = c.get("size")
                    lines.append(branch + c["name"] + (f" ({size} bytes)" if size is not None else ""))
        out = "\n".join(lines)

    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(out)
        print(f"Çıktı kaydedildi: {args.out}")
    else:
        print(out)

if __name__ == "__main__":
    main()
