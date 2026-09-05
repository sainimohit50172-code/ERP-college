import os
import re
from collections import defaultdict

ROOT = r"D:\Users\pop\Desktop\new pr"
EXCLUDES = {".git", "node_modules", ".venv", "dist", "build", "coverage", ".next"}
ALLOWED = (".js", ".jsx", ".ts", ".tsx", ".html")


def slugify(value):
    value = (value or "field").strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"^-+|-+$", "", value)
    return value or "field"


def extract_attr(s, key):
    pattern = re.compile(
        rf"(?<![A-Za-z0-9_\-]){re.escape(key)}\s*=\s*(?:\"([^\"]*)\"|'([^']*)'|\{{\s*([^}}]+?)\s*\}})",
        re.I,
    )
    match = pattern.search(s)
    if not match:
        return None
    for group in match.groups():
        if group is not None:
            return group.strip()
    return None


def infer_autocomplete(name, field_type="text"):
    name = (name or field_type or "text").lower()
    if "email" in name:
        return "email"
    if "phone" in name or "mobile" in name or "tel" in name or field_type == "tel":
        return "tel"
    if "name" in name or "full" in name or "first" in name or "last" in name:
        return "name"
    if "password" in name or field_type == "password":
        return "current-password"
    if "user" in name or "username" in name:
        return "username"
    if "search" in name or field_type == "search":
        return "on"
    if (
        "address" in name
        or "street" in name
        or "city" in name
        or "zip" in name
        or "postal" in name
        or "state" in name
    ):
        return "street-address"
    if "date" in name or field_type == "date":
        return "bday"
    if "country" in name:
        return "country"
    return "off"


def make_unique(base, used):
    count = used.get(base, 0) + 1
    used[base] = count
    return base if count == 1 else f"{base}-{count}"


def find_hint(attrs, tag_name):
    for key in ("name", "id", "placeholder", "aria-label", "title", "aria-labelledby"):
        value = extract_attr(attrs, key)
        if value:
            return value

    m = re.search(r"register\s*\(\s*['\"]([^'\"]+)['\"]", attrs)
    if m:
        return m.group(1)

    m = re.search(r"value\s*=\s*\{\s*([^}]+?)\s*\}", attrs)
    if m:
        expr = m.group(1).strip()
        m2 = re.search(r"(?:\.|\[\s*['\"]?)([A-Za-z_][A-Za-z0-9_]*)\s*\]?(?:\])?", expr)
        if m2:
            return m2.group(1)

    return f"{tag_name}-field"


def ensure_field_attrs(tag_text, used):
    tag_name_match = re.search(r"<\s*(?P<tag>input|select|textarea)\b", tag_text, re.I)
    if not tag_name_match:
        return tag_text

    tag_name = tag_name_match.group("tag").lower()
    attrs = tag_text[tag_name_match.end():]
    closing_index = attrs.rfind(">")
    if closing_index != -1:
        attrs_part = attrs[:closing_index]
        closing = attrs[closing_index:]
    else:
        attrs_part = attrs
        closing = ""

    has_id = "id=" in attrs_part.lower()
    has_name = "name=" in attrs_part.lower()
    has_autocomplete = "autocomplete=" in attrs_part.lower() or "autoComplete=" in attrs_part.lower()

    field_type = extract_attr(attrs_part, "type") or tag_name
    base = slugify(extract_attr(attrs_part, "name") or extract_attr(attrs_part, "id") or find_hint(attrs_part, tag_name))

    if not has_id:
        generated = make_unique(base, used)
        attrs_part += f' id="{generated}"'
        has_id = True
    if not has_name:
        name_value = extract_attr(attrs_part, "id") or slugify(base)
        attrs_part += f' name="{name_value}"'
        has_name = True
    if not has_autocomplete:
        autocomplete_value = infer_autocomplete(extract_attr(attrs_part, "name") or extract_attr(attrs_part, "id") or base, field_type)
        attrs_part += f' autoComplete="{autocomplete_value}"'

    return f"<{tag_name}{attrs_part}{closing}"


def fix_labels(text):
    def replace_label(match):
        label_start = match.group(0)
        attrs = match.group("attrs")
        content = match.group("content")
        if "htmlFor" in attrs or "for=" in attrs.lower():
            return label_start

        field_match = re.search(r"<\s*(input|select|textarea)\b(?P<attrs>[^>]*?)(/?>)", content, re.I | re.S)
        if not field_match:
            return label_start

        field_id = extract_attr(field_match.group(0), "id")
        if not field_id:
            return label_start

        attrs = attrs.rstrip()
        if attrs and not attrs.endswith(" "):
            attrs += " "
        return f"<label{attrs} htmlFor=\"{field_id}\">{content}</label>"

    return re.sub(r"<label\b(?P<attrs>[^>]*)>(?P<content>.*?)</label>", replace_label, text, flags=re.I | re.S)


def audit_and_fix_file(path):
    try:
        with open(path, "r", encoding="utf-8") as handle:
            text = handle.read()
    except Exception:
        return False

    used = defaultdict(int)
    def replace_tag(match):
        raw = match.group(0)
        tag = match.group("tag").lower()
        if tag not in {"input", "select", "textarea"}:
            return raw
        if "id=" not in raw.lower() or "name=" not in raw.lower():
            return ensure_field_attrs(raw, used)
        return raw

    updated = re.sub(r"<(?P<tag>input|select|textarea)\b[^>]*>", replace_tag, text, flags=re.I | re.S)
    updated = fix_labels(updated)

    with open(path, "w", encoding="utf-8") as handle:
        handle.write(updated)

    return True


def list_affected_files():
    affected = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDES]
        for filename in filenames:
            if not filename.lower().endswith(ALLOWED):
                continue
            full_path = os.path.join(dirpath, filename)
            try:
                with open(full_path, "r", encoding="utf-8") as handle:
                    text = handle.read()
            except Exception:
                continue
            if re.search(r"<\s*(input|select|textarea)\b(?![^>]*\b(?:id|name)\s*=)", text, re.I):
                affected.append(os.path.relpath(full_path, ROOT))
    return sorted(affected)


def main():
    affected = list_affected_files()
    print(f"AFFECTED_FILES={len(affected)}")
    for item in affected:
        print(item)

    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDES]
        for filename in filenames:
            if not filename.lower().endswith(ALLOWED):
                continue
            full_path = os.path.join(dirpath, filename)
            audit_and_fix_file(full_path)

    print("FORM_ATTRIBUTE_FIXES_APPLIED")


if __name__ == "__main__":
    main()
