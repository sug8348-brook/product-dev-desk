const factoryColorPalette = [
  { background: "#fff2bf", color: "#7a5600" },
  { background: "#dbeafe", color: "#245aa5" },
  { background: "#dff0e8", color: "#226150" },
  { background: "#f8ded9", color: "#9d3b2f" },
  { background: "#ede7fb", color: "#6044a6" },
  { background: "#dff3f6", color: "#23616b" },
];

export function getFactoryTagStyle(factoryName: string) {
  if (!factoryName) {
    return { background: "#f1ede5", color: "#686155" };
  }

  const colorIndex =
    Array.from(factoryName).reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    factoryColorPalette.length;
  return factoryColorPalette[colorIndex];
}
