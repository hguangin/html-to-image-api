FROM node:18

# 安裝 Chromium、中文字型、Emoji 字型
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-noto-cjk \
    fonts-noto-color-emoji \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Puppeteer 的可執行路徑
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# 建立工作目錄與安裝專案
WORKDIR /app
COPY . .

RUN npm install

CMD ["npm", "start"]
