# UbiShip-branded Novu Dashboard
# Extends official Novu web image with custom CSS theming

FROM ghcr.io/novuhq/novu/web:latest

# Copy UbiShip theme CSS
COPY ubiship-theme.css /app/public/custom/ubiship-theme.css

# Inject stylesheet link into index.html
RUN sed -i 's|</head>|<link rel="stylesheet" href="/custom/ubiship-theme.css"></head>|' /app/.next/server/app/index.html 2>/dev/null || \
    sed -i 's|</head>|<link rel="stylesheet" href="/custom/ubiship-theme.css"></head>|' /app/public/index.html 2>/dev/null || \
    echo "Warning: Could not find index.html to patch"

# Expose same port as original
EXPOSE 4200

# Use original entrypoint
CMD ["node", "server.js"]
