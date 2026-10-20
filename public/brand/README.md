# Ambientis — kit de identidade visual

Proposta 0.1, elaborada em 19/10/2026. Abra `index.html` para consultar o guia. A versão servida pelo aplicativo funciona em `/brand/index.html`.

## Conteúdo

- Logo horizontal e símbolo: SVG com curvas e PNG transparente, nas versões Forest, reversa, preta e branca.
- Ícone do aplicativo: SVG e PNG de 32, 192 e 512 px; Apple Touch Icon em 180 px com fundo opaco.
- Treze ícones semânticos em SVG, grade de 24 px e traço de 1,7 px.
- Grafismo de contornos, capa de demonstração em SVG e assinatura de e-mail em HTML.
- Prancha em PNG e HTML com o conjunto da identidade.
- Fontes Manrope e Fraunces, acompanhadas das licenças SIL Open Font License.

## Uso

Use o logo Forest sobre fundos claros e a versão reversa sobre fundos escuros. Preserve uma margem de ¼ da altura do símbolo. Tamanho mínimo sugerido: 24 px para o símbolo e 144 px para o logo horizontal. Os SVGs do logo têm o nome convertido em curvas; não exigem fontes instaladas.

Os exemplos são peças de identidade, sem validade técnica. O símbolo não representa certificação ambiental. A proposta ainda está em avaliação e não passou por pesquisa de disponibilidade ou registro de marca.

## Proveniência

O símbolo é um desenho vetorial original para Ambientis. A linguagem visual e os parâmetros de interação seguem Meridian Forest. Os ícones combinam desenhos selecionados de Meridian para o projeto e utilitários no mesmo traço. Meridian não concede uma licença geral de redistribuição; confirme os direitos antes de reutilizar seus desenhos fora dos projetos previstos. As licenças das fontes estão em `fonts/`.

No repositório, `src/brand/identity.json` é a fonte do símbolo e da paleta. `scripts/build-brand-assets.py` gera os logos em curvas com a fonte fixada no projeto; `scripts/render-brand-assets.mjs` exporta os PNGs e ícones. O aplicativo não depende dessas ferramentas de autoria para rodar.
