/**
 * Converte um File em Base64 redimensionado e comprimido.
 * @param {File} file - Arquivo enviado pelo input
 * @param {number} maxLargura - Largura máxima em px (padrão 800)
 * @param {number} qualidade - Qualidade JPEG 0-1 (padrão 0.8)
 * @returns {Promise<string>} - String Base64 (data URL)
 */
export function fileParaBase64(file, maxLargura = 800, qualidade = 0.8) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("Nenhum arquivo selecionado"));
    if (!file.type.startsWith("image/"))
      return reject(new Error("O arquivo precisa ser uma imagem"));

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calcula novas dimensões mantendo proporção
        let { width, height } = img;
        if (width > maxLargura) {
          height = (maxLargura / width) * height;
          width = maxLargura;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        // Fundo branco (caso a imagem tenha transparência)
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const base64 = canvas.toDataURL("image/jpeg", qualidade);
        resolve(base64);
      };
      img.onerror = () => reject(new Error("Erro ao carregar a imagem"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Erro ao ler o arquivo"));
    reader.readAsDataURL(file);
  });
}

/**
 * Retorna o tamanho aproximado em KB de uma string Base64.
 */
export function tamanhoBase64KB(base64) {
  if (!base64) return 0;
  const base64SemCabecalho = base64.split(",")[1] || base64;
  return Math.round((base64SemCabecalho.length * 3) / 4 / 1024);
}