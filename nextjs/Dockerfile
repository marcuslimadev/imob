FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps --production=false
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=development  
ENV PORT=4000
EXPOSE 4000
CMD [""npm"", ""run"", ""dev""]