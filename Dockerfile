FROM node:18

# 安裝系統套件（含字體支援）
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-noto-color-emoji \
    fontconfig \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# 將字體複製進系統字體資料夾
COPY fonts/*.ttf /usr/share/fonts/truetype/custom/

# 更新字體快取
RUN fc-cache -f -v

# Puppeteer 使用 Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app
COPY . .

RUN npm install
CMD ["npm", "start"]
