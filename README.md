# I Ching Web Uygulaması

Bu proje, I Ching (Değişimler Kitabı) kehanet sistemi için modern, etkileşimli bir web uygulamasıdır. Kullanıcılar, kendi sorularını girip altı çizgili bir hexagram oluşturur ve Google Gemini API'si ile detaylı Türkçe yorum alır.

## İçindekiler
- [Genel Bakış](#genel-bakış)
- [Teknolojiler](#teknolojiler)
- [Klasör Yapısı](#klasör-yapısı)
- [Kurulum](#kurulum)
  - [Ortam Değişkenleri (.env)](#ortam-değişkenleri-env)
  - [Backend Kurulumu](#backend-kurulumu)
  - [Frontend Kurulumu](#frontend-kurulumu)
  - [Docker ile Çalıştırma](#docker-ile-çalıştırma)
- [API Kullanımı](#api-kullanımı)
- [Frontend Kullanımı](#frontend-kullanımı)
- [Sıkça Sorulan Sorular](#sıkça-sorulan-sorular)
- [Katkı ve Lisans](#katkı-ve-lisans)

---

## Genel Bakış

- **Backend:** Express.js tabanlı, güvenlik (helmet, rate limit), CORS, .env ile yapılandırılabilir, Google Gemini API ile entegre.
- **Frontend:** HTML, vanilla JS, responsive ve modern arayüz, kullanıcıdan soru ve hexagram alır, sonucu gösterir.
- **Docker:** Hem backend hem frontend için hazır Dockerfile ve docker-compose desteği.

## Teknolojiler
- Node.js 18+
- Express.js
- dotenv, helmet, cors, express-rate-limit, node-fetch
- Google Gemini API (anahtar gerektirir)
- Vanilla JS, HTML, CSS (Milligram framework)
- Docker, docker-compose

## Klasör Yapısı
```
I-ching/
  backend/         # Sunucu kodları ve API
    server.js      # Ana sunucu dosyası
    package.json   # Bağımlılıklar
    Dockerfile     # Backend için Docker
    docker-compose.yml # Çoklu servis için Docker Compose
  frontend/        # İstemci arayüzü
    index.html     # Ana HTML
    script.js      # Tüm JS mantığı
    Dockerfile     # Frontend için Docker
```

## Kurulum

### Ortam Değişkenleri (.env)
Backend'in çalışabilmesi için bir `.env` dosyası gereklidir. Proje kökünde veya `backend/` klasöründe oluşturun:

```env
GEMINI_API_KEY=buraya-gemini-api-anahtarınızı-yazın
PORT=3001
```
- `GEMINI_API_KEY`: Google Gemini API anahtarınız (zorunlu)
- `PORT`: Sunucu portu (varsayılan: 3001)

### Backend Kurulumu
```bash
cd backend
npm install
# .env dosyanızı oluşturun
npm start
```

### Frontend Kurulumu
```bash
cd frontend
npm install -g http-server
http-server -p 8080
```

### Docker ile Çalıştırma
#### Tekil Servis
Backend veya frontend klasöründe:
```bash
# Backend için
cd backend
docker build -t iching-backend .
docker run --env-file .env -p 3001:3001 iching-backend

# Frontend için
cd frontend
docker build -t iching-frontend .
docker run -p 8080:8080 iching-frontend
```
#### docker-compose ile
Proje kökünde veya backend klasöründe:
```bash
docker-compose up --build
```
Bu komut hem backend'i hem frontend'i başlatır.

## API Kullanımı
Backend, `/api/consult` gibi bir uç nokta sağlar. Temel kullanım örneği:

```http
POST /api/consult
Content-Type: application/json
{
  "question": "Hayatımda neye odaklanmalıyım?",
  "hexagram": ["yin", "yang", "yin", "yin", "yang", "yang"]
}
```
Yanıt:
```json
{
  "question": "...",
  "hexagram": [...],
  "hexagramNum": 23,
  "cardName": "Splitting Apart",
  "interpretation": "..."
}
```

## Frontend Kullanımı
- Sorunuzu girin.
- Altı çizgiyi (yin/yang) seçin veya rastgele oluşturun.
- "Danış" butonuna tıklayın.
- Sonuç, detaylı Türkçe yorum olarak ekranda gösterilir.

## Sıkça Sorulan Sorular

**S: .env dosyamı neden oluşturmalıyım?**
C: Google Gemini API anahtarı olmadan yorum alınamaz. .env dosyası zorunludur.

**S: Hangi portlar kullanılıyor?**
C: Backend için 3001, frontend için 8080 (Docker ile de aynı).

**S: Rate limit ve güvenlik var mı?**
C: Evet, IP başına 15 dakikada 100 istek limiti ve helmet ile güvenlik başlıkları uygulanır.

**S: CORS ayarları nasıl?**
C: Sadece belirli domainler (localhost ve prod) izinli. Gerekirse backend/server.js içinden güncelleyebilirsiniz.

## Katkı ve Lisans

Katkıda bulunmak için fork'layıp PR gönderebilirsiniz. Her türlü öneri ve katkı memnuniyetle karşılanır.

Bu proje MIT lisansı ile lisanslanmıştır. 