// Banner simples do Lumen. Sem ASCII art pesada — só um cabeçalho limpo.

export function renderBanner(chalk) {
  const gold = chalk.hex('#f5c518');
  return [
    '',
    gold('  ✦ LUMEN'),
    chalk.gray('  luz sobre o sistema · documenta e constrói'),
    '',
  ].join('\n');
}
