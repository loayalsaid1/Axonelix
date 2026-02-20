FROM node:20-alpine AS builder
WORKDIR /app

# make pnpm available via corepack
RUN corepack enable

# install dependencies using pnpm (uses pnpm-lock.yaml if present)
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# copy source (node_modules excluded by .dockerignore)
COPY . .
RUN pnpm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN corepack enable

# copy built artifacts and package files
COPY --from=builder /app/dist ./dist
COPY package.json pnpm-lock.yaml* ./

# install production deps only
RUN pnpm install --prod --frozen-lockfile

EXPOSE 3000
CMD ["pnpm", "run", "start:prod"]
