import os
import re

ROOT = r"D:\Users\pop\Desktop\new pr"
EXCLUDES = {".git", "node_modules", ".venv", "dist", "build", "coverage", ".next"}
ALLOWED = (".js", ".jsx", ".ts", ".tsx", ".html")


def extract_attr(attribute_text, key):
    pattern = re.compile(
        rf"(?<![A-Za-z0-9_\-]){re.escape(key)}\s*=\s*(?:\"([^\"]*)\"|'([^']*)'|\{{\s*([^}}]+?)\s*\}})",
        re.I,
    )
    m = pattern.search(attribute_text)
    if not m:
        return None
    for value in m.groups():
        if value is not None:
            return value.strip()
    return None


def slugify(value):
    value = (value or "field").strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"^-+|-+$", "", value)
    return value or "field"


def infer_autocomplete(name, field_type):
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
    if "address" in name or "street" in name or "city" in name or "zip" in name or "postal" in name or "state" in name:
        return "street-address"
    if "date" in name or field_type == "date":
        return "bday"
    if "country" in name:
        return "country"
    return "off"


def get_tag_end(text, start):
    i = start + 1
    brace_depth = 0
    quote = None
    while i < len(text):
        ch = text[i]
        if quote:
            if ch == quote and text[i - 1] != "\\":
                quote = None
        else:
            if ch in ('"', "'"):
                quote = ch
            elif ch == "{":
                brace_depth += 1
            elif ch == "}":
                brace_depth = max(0, brace_depth - 1)
            elif ch == ">" and brace_depth == 0:
                return i
        i += 1
    return -1


def clean_tag(tag_text):
    tag_text = re.sub(r"(?<![A-Za-z0-9_\-])(?:id|name|autoComplete|autocomplete)\s*=\s*(?:\"[^\"]*\"|'[^']*'|\{[^}]*\})", "", tag_text, flags=re.I)
    return tag_text


def make_id(base, used):
    key = slugify(base)
    used[key] = used.get(key, 0) + 1
    if used[key] == 1:
        return key
    return f"{key}-{used[key]}"


def fix_one_tag(tag_text, used):
    tag_text = clean_tag(tag_text)
    m = re.match(r"<\s*(?P<tag>input|select|textarea)\b(?P<attrs>.*?)(?P<close>/?>)", tag_text, flags=re.I | re.S)
    if not m:
        return tag_text

    tag_name = m.group("tag").lower()
    attrs = m.group("attrs")
    closing = m.group("close")

    existing_id = extract_attr(attrs, "id")
    existing_name = extract_attr(attrs, "name")
    existing_autocomplete = extract_attr(attrs, "autocomplete") or extract_attr(attrs, "autoComplete")

    type_attr = extract_attr(attrs, "type") or tag_name
    base_hint = existing_name or existing_id or extract_attr(attrs, "placeholder") or extract_attr(attrs, "aria-label") or extract_attr(attrs, "title") or f"{tag_name}-field"
    field_id = existing_id or make_id(base_hint, used)
    field_name = existing_name or field_id
    field_autocomplete = existing_autocomplete or infer_autocomplete(field_name, type_attr)

    # remove any existing id/name/autocomplete from attrs to prevent duplicates
    attrs = re.sub(r"\s+(?:id|name|autoComplete|autocomplete)\s*=\s*(?:\"[^\"]*\"|'[^']*'|\{[^}]*\})", "", attrs, flags=re.I)

    return f'<{tag_name}{attrs} id="{field_id}" name="{field_name}" autoComplete="{field_autocomplete}"{closing}'


def fix_label_for_match(label_text):
    m = re.match(r"<\s*label\b(?P<attrs>[^>]*)>(?P<body>.*?)(?:</label\s*>)", label_text, flags=re.I | re.S)
    if not m:
        return label_text

    attrs = m.group("attrs")
    if re.search(r"\b(?:htmlFor|for)\s*=", attrs, flags=re.I):
        return label_text

    body = m.group("body")
    field_match = re.search(r"<\s*(input|select|textarea)\b(?P<attrs>[^>]*?)>", body, flags=re.I | re.S)
    if not field_match:
        return label_text

    field_attrs = field_match.group("attrs")
    field_id = extract_attr(field_attrs, "id")
    if not field_id:
        return label_text
    attrs = attrs.rstrip()
    if attrs and not attrs.endswith(" "):
        attrs += " "
    return f'<label{attrs}htmlFor="{field_id}">{body}</label>'


def fix_file(path):
    try:
        with open(path, "r", encoding="utf-8") as handle:
            text = handle.read()
    except Exception:
        return

    used = {}
    out = []
    i = 0
    while i < len(text):
        if text[i] == '<':
            tag_name_match = re.match(r"<\s*(input|select|textarea)\b", text[i:], flags=re.I)
            if tag_name_match:
                end = get_tag_end(text, i)
                if end != -1:
                    tag_text = text[i:end + 1]
                    out.append(fix_one_tag(tag_text, used))
                    i = end + 1
                    continue
        out.append(text[i])
        i += 1

    fixed = "".join(out)
    # fix label/htmlFor associations in a second pass
    fixed = re.sub(r"<label\b(?P<attrs>[^>]*)>(?P<body>.*?</label\s*>)", lambda m: fix_label_for_match(m.group(0)), fixed, flags=re.I | re.S)

    with open(path, "w", encoding="utf-8") as handle:
        handle.write(fixed)


def main():
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDES]
        for filename in filenames:
            if not filename.lower().endswith(ALLOWED):
                continue
            full_path = os.path.join(dirpath, filename)
            fix_file(full_path)
    print("Form field identifiers and autocomplete attributes normalized across the project.")


if __name__ == "__main__":
    main()
