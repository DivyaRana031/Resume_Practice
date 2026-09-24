def remove_duplicate_lines(text: str) -> str:
    seen = set()
    unique_lines = []

    for line in text.splitlines():
        line = line.strip()

        if not line:
            continue

        normalized = line.lower()

        if normalized not in seen:
            seen.add(normalized)
            unique_lines.append(line)

    return "\n".join(unique_lines)

