// Toolkit de UI para a CLI interativa do Lumen.
// Sem dependencias novas: usa so chalk (e ora, quando o comando quiser spinner).
// Mantem um visual coeso — dourado da marca + molduras arredondadas limpas.

const GOLD = '#f5c518';

// Largura "visivel" de uma string em colunas do terminal.
// Ignora cor (ANSI), conta combinantes como 0 e simbolos/emojis largos como 2 —
// para a moldura fechar certo mesmo com simbolos decorativos.
const ANSI = /\[[0-9;]*m/g;
function charWidth(cp) {
  if (cp === 0) return 0;
  if ((cp >= 0x0300 && cp <= 0x036f) || (cp >= 0xfe00 && cp <= 0xfe0f) || cp === 0x200d) return 0;
  if (
    (cp >= 0x1100 && cp <= 0x115f) ||
    (cp >= 0x2600 && cp <= 0x27bf) ||   // dingbats / simbolos diversos
    (cp >= 0x2b00 && cp <= 0x2bff) ||   // estrelas e setas
    (cp >= 0x2e80 && cp <= 0xa4cf) ||
    (cp >= 0xac00 && cp <= 0xd7a3) ||
    (cp >= 0xf900 && cp <= 0xfaff) ||
    (cp >= 0xfe30 && cp <= 0xfe4f) ||
    (cp >= 0xff00 && cp <= 0xff60) ||
    (cp >= 0xffe0 && cp <= 0xffe6) ||
    (cp >= 0x1f000 && cp <= 0x1faff)
  ) return 2;
  return 1;
}
export function visibleLength(s) {
  const plain = String(s).replace(ANSI, '');
  let w = 0;
  for (const ch of plain) w += charWidth(ch.codePointAt(0));
  return w;
}

const pad = n => ' '.repeat(Math.max(0, n));

// Cabecalho emoldurado do comando. Ex.: renderHeader(chalk, 'documentar', 'le o sistema e extrai specs')
export function renderHeader(chalk, mode, tagline) {
  const gold = chalk.hex(GOLD);
  const title = `LUMEN · ${mode}`;
  const sub = tagline || 'luz sobre o sistema';
  const inner = Math.max(visibleLength(title), visibleLength(sub)) + 2;
  const top = '╭' + '─'.repeat(inner) + '╮';
  const bot = '╰' + '─'.repeat(inner) + '╯';
  const row = (text, colored) => '  ' + gold('│') + ' ' + colored + pad(inner - visibleLength(text) - 1) + gold('│');
  return [
    '',
    '  ' + gold(top),
    row(title, gold.bold(title)),
    row(sub, chalk.gray(sub)),
    '  ' + gold(bot),
    '',
  ].join('\n');
}

// Contador de passos: const step = makeStepper(chalk); step('Escopo', 'o que construir')
export function makeStepper(chalk) {
  let n = 0;
  const gold = chalk.hex(GOLD);
  return (title, subtitle) => {
    n += 1;
    const head = `  ${gold('◆')} ${chalk.bold(`${n}. ${title}`)}`;
    console.log('\n' + head + (subtitle ? chalk.gray(`  ·  ${subtitle}`) : ''));
  };
}

// Linha de dica discreta.
export function hint(chalk, text) {
  console.log(chalk.gray('  ' + text));
}

// Caixa de resumo (rotulo -> valor alinhados). pairs: [[k, v], ...]
export function summaryBox(chalk, title, pairs) {
  const gold = chalk.hex(GOLD);
  const keyW = Math.max(...pairs.map(([k]) => visibleLength(k)));
  const rows = pairs.map(([k, v]) => `${k}${pad(keyW - visibleLength(k))}   ${v}`);
  const inner = Math.max(visibleLength(title), ...rows.map(visibleLength)) + 2;
  const top = '╭' + '─'.repeat(inner) + '╮';
  const mid = '├' + '─'.repeat(inner) + '┤';
  const bot = '╰' + '─'.repeat(inner) + '╯';
  const row = (text, colored) => '  ' + gold('│') + ' ' + colored + pad(inner - visibleLength(text) - 1) + gold('│');
  const out = ['', '  ' + gold(top), row(title, gold.bold(title)), '  ' + gold(mid)];
  for (const [k, v] of pairs) {
    const text = `${k}${pad(keyW - visibleLength(k))}   ${v}`;
    const colored = chalk.gray(k) + pad(keyW - visibleLength(k)) + '   ' + chalk.white(v);
    out.push(row(text, colored));
  }
  out.push('  ' + gold(bot), '');
  return out.join('\n');
}

export const palette = { GOLD };
