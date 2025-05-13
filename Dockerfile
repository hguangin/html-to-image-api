FROM node:18

# 安裝系統套件（Puppeteer Chromium 與 font 支援）
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-noto-color-emoji \
    fontconfig \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# 安裝 sharp 可能需要的 native lib（保險用途）
RUN apt-get update && apt-get install -y \
    libvips-dev \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# 複製字體到系統位置
COPY fonts/*.ttf /usr/share/fonts/truetype/custom/
RUN fc-cache -f -v

# Puppeteer 專用 Chromium 路徑
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app
COPY . .

# 安裝套件並 rebuild sharp（確保環境正確）
RUN npm install --omit=dev && npm rebuild sharp

CMD ["npm", "start"]
