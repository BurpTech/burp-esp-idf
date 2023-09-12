function color_text(color: string, text: string): string {
  return `\x1b[${color}m${text}\x1b[0m`;
}

export function yellow(text: string): string {
  return color_text('33', text);
}

export function green(text: string): string {
  return color_text('32', text);
}

export function red(text: string): string {
  return color_text('31', text);
}

