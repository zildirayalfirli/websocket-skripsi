FROM node:18

# Buat direktori kerja
WORKDIR /app

# Copy dan install dependency
COPY package*.json ./
RUN npm install -g pm2 && npm install

# Copy semua source code
COPY . .

# Expose WebSocket port
EXPOSE 9100

# Jalankan pakai pm2-runtime (cluster auto)
CMD ["pm2-runtime", "server.js", "-i", "max"]
