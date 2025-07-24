import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fetch from 'node-fetch';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import https from 'https';
import fs from 'fs';

dotenv.config();

function hexagramToNumber(hexagram) {
  let num = 0;
  for (let i = 0; i < 6; i++) {
    num |= (hexagram[i] === 'yang' ? 1 : 0) << (5 - i);
  }
  return num + 1;
}

function isValidHexagram(arr) {
  return Array.isArray(arr) && arr.length === 6 && arr.every(x => x === 'yin' || x === 'yang');
}

// Kart listesi (frontend ile aynı şekilde)
const hexagramCards = [
  { Num: 1, Cn: "乾 (qián)", Name: "Force", Acilim: "yang,yang,yang,yang,yang,yang" },
  { Num: 2, Cn: "坤 (kūn)", Name: "Field", Acilim: "yin,yin,yin,yin,yin,yin" },
  { Num: 3, Cn: "屯 (zhūn)", Name: "Sprouting", Acilim: "yin,yang,yin,yin,yin,yang" },
  { Num: 4, Cn: "蒙 (méng)", Name: "Enveloping", Acilim: "yang,yin,yin,yin,yang,yin" },
  { Num: 5, Cn: "需 (xū)", Name: "Waiting", Acilim: "yin,yang,yin,yang,yang,yang" },
  { Num: 6, Cn: "訟 (sòng)", Name: "Dispute", Acilim: "yang,yang,yang,yin,yang,yin" },
  { Num: 7, Cn: "師 (shī)", Name: "Army", Acilim: "yin,yin,yin,yin,yang,yin" },
  { Num: 8, Cn: "比 (bǐ)", Name: "Solidarity", Acilim: "yin,yang,yin,yin,yin,yin" },
  { Num: 9, Cn: "小畜 (xiǎo xù)", Name: "Small Accumulating", Acilim: "yang,yang,yin,yang,yang,yang" },
  { Num: 10, Cn: "履 (lǚ)", Name: "Treading", Acilim: "yang,yang,yang,yin,yang,yang" },
  { Num: 11, Cn: "泰 (tài)", Name: "Peace", Acilim: "yin,yin,yin,yang,yang,yang" },
  { Num: 12, Cn: "否 (pǐ)", Name: "Obstruction", Acilim: "yang,yang,yang,yin,yin,yin" },
  { Num: 13, Cn: "同人 (tóng rén)", Name: "Fellowship", Acilim: "yang,yang,yang,yang,yin,yang" },
  { Num: 14, Cn: "大有 (dà yǒu)", Name: "Great Possessing", Acilim: "yang,yin,yang,yang,yang,yang" },
  { Num: 15, Cn: "謙 (qiān)", Name: "Modesty", Acilim: "yin,yin,yin,yang,yin,yin" },
  { Num: 16, Cn: "豫 (yù)", Name: "Enthusiasm", Acilim: "yin,yin,yang,yin,yin,yin" },
  { Num: 17, Cn: "隨 (suí)", Name: "Following", Acilim: "yin,yang,yang,yin,yin,yang" },
  { Num: 18, Cn: "蠱 (gǔ)", Name: "Correcting", Acilim: "yang,yin,yin,yang,yang,yin" },
  { Num: 19, Cn: "臨 (lín)", Name: "Approach", Acilim: "yin,yin,yin,yin,yang,yang" },
  { Num: 20, Cn: "觀 (guān)", Name: "Contemplation", Acilim: "yang,yang,yin,yin,yin,yin" },
  { Num: 21, Cn: "噬嗑 (shì kè)", Name: "Biting Through", Acilim: "yang,yin,yang,yin,yin,yang" },
  { Num: 22, Cn: "賁 (bì)", Name: "Grace", Acilim: "yang,yin,yin,yang,yin,yang" },
  { Num: 23, Cn: "剝 (bō)", Name: "Splitting Apart", Acilim: "yang,yin,yin,yin,yin,yin" },
  { Num: 24, Cn: "復 (fù)", Name: "Return", Acilim: "yin,yin,yin,yin,yin,yang" },
  { Num: 25, Cn: "無妄 (wú wàng)", Name: "Innocence", Acilim: "yang,yang,yang,yin,yin,yang" },
  { Num: 26, Cn: "大畜 (dà xù)", Name: "Great Accumulating", Acilim: "yang,yin,yin,yang,yang,yang" },
  { Num: 27, Cn: "頤 (yí)", Name: "Nourishing", Acilim: "yang,yin,yin,yin,yin,yang" },
  { Num: 28, Cn: "大過 (dà guò)", Name: "Preponderance of the Great", Acilim: "yin,yang,yang,yang,yang,yin" },
  { Num: 29, Cn: "坎 (kǎn)", Name: "Abyss", Acilim: "yin,yang,yin,yin,yang,yin" },
  { Num: 30, Cn: "離 (lí)", Name: "Radiance", Acilim: "yang,yin,yang,yang,yin,yang" },
  { Num: 31, Cn: "咸 (xián)", Name: "Influence", Acilim: "yin,yang,yang,yang,yin,yin" },
  { Num: 32, Cn: "恆 (héng)", Name: "Duration", Acilim: "yin,yin,yang,yang,yang,yin" },
  { Num: 33, Cn: "遯 (dùn)", Name: "Retreat", Acilim: "yang,yang,yang,yang,yin,yin" },
  { Num: 34, Cn: "大壯 (dà zhuàng)", Name: "Great Strength", Acilim: "yin,yin,yang,yang,yang,yang" },
  { Num: 35, Cn: "晉 (jìn)", Name: "Progress", Acilim: "yang,yin,yang,yin,yin,yin" },
  { Num: 36, Cn: "明夷 (míng yí)", Name: "Darkening of the Light", Acilim: "yin,yin,yin,yang,yin,yang" },
  { Num: 37, Cn: "家人 (jiā rén)", Name: "Family", Acilim: "yang,yang,yin,yang,yin,yang" },
  { Num: 38, Cn: "睽 (kuí)", Name: "Opposition", Acilim: "yang,yin,yang,yin,yang,yang" },
  { Num: 39, Cn: "蹇 (jiǎn)", Name: "Obstruction", Acilim: "yin,yang,yin,yang,yin,yin" },
  { Num: 40, Cn: "解 (xiè)", Name: "Deliverance", Acilim: "yin,yin,yang,yin,yang,yin" },
  { Num: 41, Cn: "損 (sǔn)", Name: "Decrease", Acilim: "yang,yin,yin,yin,yang,yang" },
  { Num: 42, Cn: "益 (yì)", Name: "Increase", Acilim: "yang,yang,yin,yin,yin,yang" },
  { Num: 43, Cn: "夬 (guài)", Name: "Break‑through", Acilim: "yin,yang,yang,yang,yang,yang" },
  { Num: 44, Cn: "姤 (gòu)", Name: "Coming to Meet", Acilim: "yang,yang,yang,yang,yang,yin" },
  { Num: 45, Cn: "萃 (cuì)", Name: "Gathering Together", Acilim: "yin,yang,yang,yin,yin,yin" },
  { Num: 46, Cn: "升 (shēng)", Name: "Pushing Upward", Acilim: "yin,yin,yin,yang,yang,yin" },
  { Num: 47, Cn: "困 (kùn)", Name: "Oppression", Acilim: "yin,yang,yang,yin,yang,yin" },
  { Num: 48, Cn: "井 (jǐng)", Name: "Well", Acilim: "yin,yang,yin,yang,yang,yin" },
  { Num: 49, Cn: "革 (gé)", Name: "Revolution", Acilim: "yin,yang,yang,yang,yin,yang" },
  { Num: 50, Cn: "鼎 (dǐng)", Name: "Cauldron", Acilim: "yang,yin,yang,yang,yang,yin" },
  { Num: 51, Cn: "震 (zhèn)", Name: "The Arousing", Acilim: "yin,yin,yang,yin,yin,yang" },
  { Num: 52, Cn: "艮 (gèn)", Name: "Keeping Still", Acilim: "yang,yin,yin,yang,yin,yin" },
  { Num: 53, Cn: "漸 (jiàn)", Name: "Development", Acilim: "yang,yang,yin,yang,yin,yin" },
  { Num: 54, Cn: "歸妹 (guī mèi)", Name: "Marrying Maiden", Acilim: "yang,yin,yang,yin,yang,yang" },
  { Num: 55, Cn: "豐 (fēng)", Name: "Abundance", Acilim: "yang,yin,yang,yang,yin,yang" },
  { Num: 56, Cn: "旅 (lǚ)", Name: "The Wanderer", Acilim: "yang,yin,yang,yin,yang,yang" },
  { Num: 57, Cn: "巽 (xùn)", Name: "The Gentle", Acilim: "yang,yang,yin,yang,yang,yin" },
  { Num: 58, Cn: "兌 (duì)", Name: "The Joyous", Acilim: "yin,yang,yang,yin,yang,yang" },
  { Num: 59, Cn: "渙 (huàn)", Name: "Dispersion", Acilim: "yang,yang,yin,yin,yang,yin" },
  { Num: 60, Cn: "節 (jié)", Name: "Limitation", Acilim: "yin,yang,yin,yin,yang,yang" },
  { Num: 61, Cn: "中孚 (zhōng fú)", Name: "Inner Truth", Acilim: "yang,yang,yin,yin,yang,yang" },
  { Num: 62, Cn: "小過 (xiǎo guò)", Name: "Preponderance of the Small", Acilim: "yin,yin,yang,yang,yin,yin" },
  { Num: 63, Cn: "既濟 (jì jì)", Name: "After Completion", Acilim: "yin,yang,yin,yang,yin,yang" },
  { Num: 64, Cn: "未濟 (wèi jì)", Name: "Before Completion", Acilim: "yang,yin,yang,yin,yang,yin" }
  ];

// Kartlar başta kontrol edilsin
hexagramCards.forEach(card => {
  const arr = card.Acilim.split(',');
  if (!isValidHexagram(arr)) {
    console.error('Hatalı kart:', card);
  }
});

async function getGeminiInterpretation(question, hexagram, cardName, cardCn, cardAcilim) {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  const hexagramVisual = [...hexagram].slice().reverse().map(x => x === 'yang' ? '⚊' : '⚋').join('\n');
  const prompt = `
Hexagram: ${cardName} (${cardCn})

Soru: ${question}
Hexagram dizilimi (en alttan en üste): ${hexagram.join(', ')}
Çizgiler:
${hexagram.map((x, i) => `${i + 1}. çizgi (en alt): ${x}`).join('\n')}
Görsel:
${hexagramVisual}

Aşağıdaki adımları takip ederek çok detaylı bir I Ching yorumu ver:
1. Doğru hexagramın ismini, sembolizmini ve temel özelliklerini açıkla.
2. Her bir çizginin (1'den 6'ya) yin/yang olmasına göre ayrı ayrı anlamını ve genel yoruma etkisini belirt.
3. Kullanıcının sorduğu "${question}" sorusuna, seçilen hexagram ve çizgi dizilimine göre kişiselleştirilmiş, kapsamlı bir yorum yap. Olası tavsiyeleri, uyarıları ve fırsatları vurgula.
4. Hexagramın genel mesajını, hayatın hangi alanlarına işaret ettiğini ve kullanıcının bu açılımdan ne bekleyebileceğini özetle.
5. Yorumun Türkçe, anlaşılır ve bütünsel olsun. Başka bir hexagramdan bahsetme, sadece bu açılıma odaklan.

Kullanıcı, I Ching'den rehberlik ve derin bir içgörü bekliyor.
`;

  const body = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': apiKey
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  // Hata ayıklama için log ekle
  console.log(JSON.stringify(data, null, 2));
  const interpretation = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Yorum alınamadı.";
  return interpretation;
}

async function consult(question, hexagram) {
  const hex = isValidHexagram(hexagram) ? hexagram : null;
  if (!hex) throw new Error("Geçersiz hexagram dizisi: 6 adet yin/yang çizgisi girilmeli ve sadece 'yin' veya 'yang' olmalı.");
  const hexagramNum = hexagramToNumber(hex);
  const bitString = hex.map(x => x === 'yang' ? '1' : '0').join('');
  // Kartı bul
  const acilimStr = hex.join(',');
  const foundCard = hexagramCards.find(card => card.Acilim === acilimStr);
  const cardName = foundCard ? foundCard.Name : '';
  const cardCn = foundCard ? foundCard.Cn : '';
  const cardAcilim = foundCard ? foundCard.Acilim : '';
  const interpretation = await getGeminiInterpretation(question, hex, cardName, cardCn, cardAcilim);
  return {
    question,
    hexagram: hex,
    hexagramNum,
    bitString,
    cardName,
    cardCn,
    cardAcilim,
    interpretation
  };
}

// --- Gelişmiş Güvenlik Middleware'leri ---
// Helmet ile HTTP başlıklarını güvenli hale getir
const app = express();
app.use(helmet());

// Rate limiting: Her IP için 15 dakikada 100 istek
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Çok fazla istek! Lütfen daha sonra tekrar deneyin." }
});
app.use(limiter);

// CORS'u sadece belirli domainlere aç (geliştirme ve prod için örnek)
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:3000',
  'https://senin-domainin.com'
];
app.use(cors({
  origin: function (origin, callback) {
    // CORS preflight veya tools için origin olmayabilir
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: Bu origin izinli değil!'));
    }
  }
}));

app.use(express.json());

const PORT = process.env.PORT || 3001;

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/iching/consult', async (req, res) => {
  const { question, hexagram } = req.body;
  try {
    const result = await consult(question, hexagram);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Yorum alınırken hata oluştu." });
  }
});

// HTTPS ile başlatmak için (geliştirme ortamı için örnek):
// Sertifika dosyalarını backend klasörüne koymalısınız: key.pem ve cert.pem
if (process.env.USE_HTTPS === 'true') {
  const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
  };
  https.createServer(options, app).listen(PORT, () => {
    console.log(`HTTPS sunucu ${PORT} portunda çalışıyor`);
  });
} else {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}