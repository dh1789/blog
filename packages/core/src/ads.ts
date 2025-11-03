/**
 * 광고 코드 삽입 로직
 */

import type { AdConfig } from '@blog/shared';

export function injectAds(htmlContent: string, adConfig: AdConfig): string {
  let result = htmlContent;

  for (const position of adConfig.positions) {
    const adCode = generateAdCode(adConfig);

    switch (position) {
      case 'top':
        result = adCode + result;
        break;

      case 'after-first-paragraph':
        result = result.replace(/<\/p>/, `</p>${adCode}`);
        break;

      case 'after-first-h2':
        result = result.replace(/<\/h2>/, `</h2>${adCode}`);
        break;

      case 'middle':
        result = insertAtMiddle(result, adCode);
        break;

      case 'bottom':
        result = result + adCode;
        break;
    }
  }

  return result;
}

function generateAdCode(adConfig: AdConfig): string {
  return `
<!-- Google AdSense -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="${adConfig.clientId}"
     data-ad-slot="${adConfig.slotId}"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
`;
}

function insertAtMiddle(html: string, adCode: string): string {
  const paragraphs = html.match(/<p>.*?<\/p>/gs) || [];
  if (paragraphs.length < 2) {
    return html;
  }

  const middleIndex = Math.floor(paragraphs.length / 2);
  const middleParagraph = paragraphs[middleIndex];
  return html.replace(middleParagraph, middleParagraph + adCode);
}
