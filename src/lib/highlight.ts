// A tiny build-time syntax highlighter for the few code samples on the marketing pages.
// It emits <span class="t-…"> (styled in global.css), never inline styles, so the strict
// Content-Security-Policy (style-src 'self') holds. Supported: json, shell, yaml, http.

export type CodeLang = 'json' | 'shell' | 'yaml' | 'http';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const span = (cls: string, s: string) => `<span class="t-${cls}">${esc(s)}</span>`;

/** Run a list of [regex, class] rules over a line; unmatched text stays plain. */
function tokenize(line: string, rules: [RegExp, string | ((m: RegExpExecArray) => string)][]): string {
  let out = '';
  let rest = line;
  outer: while (rest) {
    for (const [re, cls] of rules) {
      const m = re.exec(rest);
      if (m && m.index === 0 && m[0]) {
        out += typeof cls === 'string' ? span(cls, m[0]) : cls(m);
        rest = rest.slice(m[0].length);
        continue outer;
      }
    }
    out += esc(rest[0]);
    rest = rest.slice(1);
  }
  return out;
}

const jsonRules: [RegExp, string | ((m: RegExpExecArray) => string)][] = [
  [/^"(?:[^"\\]|\\.)*"(?=\s*:)/, 'key'],
  [/^"(?:[^"\\]|\\.)*"/, 'str'],
  [/^-?\d+(?:\.\d+)?/, 'num'],
  [/^(?:true|false|null)\b/, 'kw'],
  [/^[{}[\],:]/, 'punc'],
];

const shellRules: [RegExp, string | ((m: RegExpExecArray) => string)][] = [
  [/^#.*$/, 'com'],
  [/^\$ /, 'prompt'],
  [/^"(?:[^"\\]|\\.)*"|^'[^']*'/, 'str'],
  [/^\$\{?[A-Za-z_]+\}?/, 'var'],
  [/^--?[a-z][\w-]*/, 'flag'],
  [/^(?:✓|→)/, 'ok'],
];

const yamlRules: [RegExp, string | ((m: RegExpExecArray) => string)][] = [
  [/^#.*$/, 'com'],
  [/^\$\{\{[^}]*\}\}/, 'var'],
  [/^"(?:[^"\\]|\\.)*"/, 'str'],
  [/^[\w-]+(?=:(\s|$))/, 'key'],
  [/^(?:true|false)\b/, 'kw'],
];

const httpRules: [RegExp, string | ((m: RegExpExecArray) => string)][] = [
  [/^(?:GET|POST|PUT|PATCH|DELETE)\b/, 'kw'],
  [/^[A-Z][\w-]+(?=:)/, 'key'],
  [/^HTTP\/[\d.]+ \d+ ?\w*/, 'ok'],
];

export function highlight(code: string, lang: CodeLang): string {
  const rules = { json: jsonRules, shell: shellRules, yaml: yamlRules, http: httpRules }[lang];
  return code
    .split('\n')
    .map((line) => {
      // A shell command line: highlight the program name after an optional prompt.
      if (lang === 'shell' && /^\$ \w/.test(line)) {
        const m = /^\$ ([\w.-]+)(.*)$/.exec(line)!;
        return span('prompt', '$ ') + span('cmd', m[1]) + tokenize(m[2], rules);
      }
      if (lang === 'yaml') {
        // "- uses: x" and "key: value": keys highlighted, the rest by rule.
        const m = /^(\s*-?\s*)([\w-]+)(:)(.*)$/.exec(line);
        if (m && !line.trimStart().startsWith('#')) return esc(m[1]) + span('key', m[2]) + esc(m[3]) + tokenize(m[4], rules);
      }
      return tokenize(line, rules);
    })
    .join('\n');
}
