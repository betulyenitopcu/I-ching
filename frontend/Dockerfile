# Basit bir Node tabanlı web sunucusu kullanıyoruz
FROM node:18-slim

WORKDIR /app

COPY . .

# http-server paketini global kur
RUN npm install -g http-server

# 8080 portunu aç
EXPOSE 8080

# Sunucuyu başlat
CMD ["http-server", "-p", "8080"]