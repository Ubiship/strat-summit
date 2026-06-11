# UbiShip-branded Novu Dashboard
# Extends official Novu web image with custom CSS theming

FROM ghcr.io/novuhq/novu/web:latest

# Copy UbiShip theme CSS to public folder
COPY ubiship-theme.css /app/public/custom/ubiship-theme.css

# Create a startup script that injects CSS link and starts the app
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'find /app -name "*.html" -exec sed -i "s|</head>|<link rel=\"stylesheet\" href=\"/custom/ubiship-theme.css\"></head>|g" {} \; 2>/dev/null || true' >> /app/start.sh && \
    echo 'exec pnpm start:static:build' >> /app/start.sh && \
    chmod +x /app/start.sh

# Expose same port as original
EXPOSE 4200

# Run startup script
CMD ["/app/start.sh"]
