FROM node:20-alpine
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY services/booking-api/package.json services/booking-api/package.json
RUN pnpm install --frozen-lockfile --filter @repo/booking-api...
COPY services/booking-api services/booking-api
RUN pnpm --filter @repo/booking-api build
ENV NODE_ENV=production
EXPOSE 3002
CMD ["node", "services/booking-api/dist/index.js"]
