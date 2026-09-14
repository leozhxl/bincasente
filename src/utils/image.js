// Retorna true quando `value` é algo que pode ser usado como src de <img>
// (caminho local, data URL de upload, ou URL http(s)). Qualquer outra coisa
// (ex: emoji usado como placeholder de produtos de demonstração) deve ser
// renderizada como texto/emoji, não como imagem.
export function isImageSrc(value) {
  return typeof value === 'string' && (
    value.startsWith('/') ||
    value.startsWith('data:image') ||
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('blob:')
  )
}
