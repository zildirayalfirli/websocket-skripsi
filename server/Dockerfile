FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install -g pm2 && npm install

RUN apt-get update && apt-get install -y lsof --no-install-recommends

COPY . .

EXPOSE 9000

CMD ["pm2-runtime", "server.js", "-i", "max"]
