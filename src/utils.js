export function num(n) {
    if (n > 1000000) return `${(n / 1000000).toFixed(1).replace('.0', '')}M`;
    if (n > 1000) return `${(n / 1000).toFixed(1).replace('.0', '')}K`;
    return n.toString();
  }