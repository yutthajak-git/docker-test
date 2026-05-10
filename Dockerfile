FROM oven/bun:latest

#work directory หลักในการเอาอย่างอื่นที่ copy มาไส่ 
WORKDIR /app 

# copy ของในเครื่องไปไส่ เช่น package ## ./ ต่อท้ายคือบอกว่าให้เอาไปอยู่ภายไต้ WORKDIR 
# /app/package.json, app/bun.lock
COPY package.json bun.lock ./

# ลง dep
RUN bun install

# /app/src
COPY src ./src/
COPY tsconfig.json ./

#เมือรันจะเป็น localhost:8000
EXPOSE 8000

#run แล้วคา process ไว้ 
CMD ["bun", "run", "src/index.ts"]