FROM directus/directus:11.12.0

# Configurações de produção
ENV NODE_ENV=production
ENV LOG_LEVEL=info

# Copiar extensões customizadas (quando houver)
# COPY ./extensions /directus/extensions

# Expor porta padrão
EXPOSE 8055

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8055/server/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando padrão
CMD ["node", "cli.js", "start"]
