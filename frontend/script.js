const loadingHTML = `<div style="text-align:center;margin-top:20px;"><span class="loader"></span> Yoruma bakılıyor...</div>`;

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function markdownToHtml(md) {
  if (!md) return '';
  // Önce escape işlemi uygula, sonra markdown dönüştür
  md = escapeHtml(md);
  return md
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>')
    .replace(/\*(.*?)\*/gim, '<i>$1</i>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

// defaultCards dizisi kaldırıldı

const linesContainer = document.getElementById('lines-container');
const submitBtn = document.getElementById('submit-btn');
let hexagram = [];

function renderLines() {
  linesContainer.innerHTML = '';
  // 6 çizgi tamamlandığında sadece sembolleri yukarıdan aşağıya sırayla göster
  if (hexagram.length === 6) {
    for (let i = 0; i < hexagram.length; i++) {
      const lineDiv = document.createElement('div');
      lineDiv.style.marginBottom = '6px';
      lineDiv.style.display = 'flex';
      lineDiv.style.alignItems = 'center';
      lineDiv.style.justifyContent = 'center';
      lineDiv.innerHTML = `<span style="font-size:2em;">${hexagram[i] === 'yin' ? '⚋' : '⚊'}</span>`;
      linesContainer.appendChild(lineDiv);
    }
  } else {
    // Çizgi ekleme aşamasında eski haliyle devam
    const displayArr = [...hexagram];
    for (let i = 0; i < displayArr.length; i++) {
      const lineDiv = document.createElement('div');
      lineDiv.style.marginBottom = '6px';
      lineDiv.style.display = 'flex';
      lineDiv.style.alignItems = 'center';
      lineDiv.style.justifyContent = 'center';
      const label = `${i + 1}. çizgi (en üstten aşağı)`;
      lineDiv.innerHTML = `<span style="width:90px;display:inline-block;">${label}</span><span style="margin-left:18px;min-width:24px;font-weight:bold;">${displayArr[i] === 'yin' ? '⚋ Yin' : '⚊ Yang'}</span>`;
      linesContainer.appendChild(lineDiv);
    }
    if (hexagram.length < 6) {
      const nextDiv = document.createElement('div');
      nextDiv.style.marginBottom = '6px';
      nextDiv.style.display = 'flex';
      nextDiv.style.alignItems = 'center';
      nextDiv.style.justifyContent = 'center';
      nextDiv.innerHTML = `<span style="width:90px;display:inline-block;">${hexagram.length + 1}. çizgi (en üst)</span><button type="button" class="random-btn" style="background:#6c47a6;color:#fff;min-width:90px;">Rastgele</button>`;
      linesContainer.appendChild(nextDiv);
      nextDiv.querySelector('.random-btn').onclick = function () {
        hexagram.push(Math.random() > 0.5 ? 'yang' : 'yin');
        renderLines();
        checkReady();
      };
    }
  }
}

function isValidHexagram(arr) {
  return Array.isArray(arr) && arr.length === 6 && arr.every(x => x === 'yin' || x === 'yang');
}

function checkReady() {
  submitBtn.disabled = !isValidHexagram(hexagram);
}

renderLines();
checkReady();

document.getElementById('iching-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  if (!isValidHexagram(hexagram)) {
    alert('Lütfen 6 adet yin/yang çizgisi girin. Her çizgi sadece "yin" veya "yang" olmalı.');
    return;
  }
  // Çizgi seçim alanını gizle
  document.getElementById('hexagram-select').style.display = 'none';
  const question = document.getElementById('question').value;
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = loadingHTML;

  // Backend'e yukarıdan aşağıya sırayla gönder
  const hexagramToSend = [...hexagram].reverse();

  try {
    const response = await fetch('http://localhost:3001/iching/consult', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, hexagram: hexagramToSend })
    });
    const data = await response.json();
    if (data.error) {
      resultDiv.innerHTML = `<div style='color:#b00020;font-weight:bold;margin-top:18px;'>${data.error}</div>`;
    } else {
      // Hexagramı ekranda yukarıdan aşağıya sırayla göster
      const displayArr = data.hexagram ? [...data.hexagram] : [];
      // Kart bilgilerini backend'den al
      const cardName = data.cardName || '';
      const cardCn = data.cardCn || '';
      const cardAcilim = data.cardAcilim || '';
      // Kullanıcının seçtiği yin/yang dizilimini metin olarak gösterme
      // const hexagramText = data.hexagram ? data.hexagram.map((x, i) => `${i + 1}. çizgi: ${x}`).join(', ') : '';
      // Yorumun başındaki gereksiz başlıkları ve açıklamaları temizle
      function cleanGeminiComment(text) {
        if (!text) return '';
        // 'Yorum:' ve 'I Ching ve Hexagramların İsimlendirme Mantığı' ve sonrasını sil
        let cleaned = text.replace(/Yorum:([\s\S]*?)(?=\n|$)/i, '');
        cleaned = cleaned.replace(/I Ching[\s\S]*?\n\*/i, '');
        // Başta veya sonda kalan boşlukları temizle
        return cleaned.trim();
      }
      // Backend'den gelen kart bilgileriyle numarayı bul
      // const cardNum = (() => {
      //   const found = hexagramCards.find(card => card.Name === cardName && card.Cn === cardCn);
      //   return found ? found.Num : '';
      // })();
      resultDiv.innerHTML = `
        <div class="result-card">
          <div style="font-size:1.1em;margin-bottom:8px;"><b>Soru:</b> ${data.question}</div>
          <div><b>Hexagram:</b></div>
          <div style="font-weight:bold; margin:8px 0 4px 0; font-size:1.15em;">${cardName} (${cardCn})</div>
          <div>
            ${Array.isArray(displayArr) ? displayArr.map(line =>
              `<div class="hexagram-line">${line === 'yang' ? '⚊' : '⚋'}</div>`
            ).join('') : ''}
          </div>
          <div style="margin-top:10px;"><b>Yorum:</b><br><div style='white-space:normal;'>${markdownToHtml(cleanGeminiComment(data.interpretation))}</div></div>
        </div>
      `;
    }
  } catch (err) {
    resultDiv.innerHTML = `<div style='color:#b00020;font-weight:bold;margin-top:18px;'>Sunucuya erişilemiyor.</div>`;
  }
});