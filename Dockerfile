FROM node:16-alpine as builder

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn install --frozen-lockfile --ignore-scripts && \
    yarn cache clean

COPY . .

RUN yarn build


FROM node:16-alpine

COPY --from=builder /app /app

WORKDIR /app/demo

RUN yarn install --frozen-lockfile --ignore-scripts && \
    yarn cache clean

ENV PORT 3030
EXPOSE 3030

CMD yarn start -T
