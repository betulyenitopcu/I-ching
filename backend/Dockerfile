# Node.js imajını kullan
FROM node:18-slim

# Çalışma dizinini ayarla
WORKDIR /app

# Paket dosyalarını kopyala
COPY package*.json ./

# Sadece prod bağımlılıkları yükle
RUN npm install --omit=dev

# Tüm backend dosyalarını kopyala
COPY . .

# Uygulamanın çalışacağı portu belirt
EXPOSE 3001

# Health check ekle
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD wget -qO- http://localhost:3001/health || exit 1

# Uygulamayı başlat
CMD ["node", "server.js"]