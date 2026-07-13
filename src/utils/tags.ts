export function parseTags(value: string) {
  return value
    .split(/[，,]/)
    .map((tagName) => tagName.trim())
    .filter(Boolean);
}

export function joinTags(tags: string[]) {
  return tags.join("，");
}

export function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}
