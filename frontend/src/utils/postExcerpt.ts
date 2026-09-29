const EXCERPT_LENGTH = 180;

export const getPostExcerpt = (markdown: string): string => {
  const text = markdown
    .replace(/```[^\n]*\n([\s\S]*?)```/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s*\[[^\]]+\]:\s+\S+.*$/gm, '')
    .replace(/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/gm, '')
    .replace(/<[^>]*>/g, '')
    .replace(/^\s{0,3}(?:#{1,6}\s+|>\s?|[-+*]\s+|\d+[.)]\s+)/gm, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!?\[([^\]]+)\]/g, '$1')
    .replace(/(^|[^\\])[\*_~]{1,3}([^\*_~]+)[\*_~]{1,3}/g, '$1$2')
    .replace(/\\([\\`*_{}\[\]()#+.!|>-])/g, '$1')
    .replace(/[|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= EXCERPT_LENGTH) return text;
  const excerpt = text.slice(0, EXCERPT_LENGTH);
  const lastSpace = excerpt.lastIndexOf(' ');
  return `${excerpt.slice(0, lastSpace > 0 ? lastSpace : EXCERPT_LENGTH).trimEnd()}...`;
};