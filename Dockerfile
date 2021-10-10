FROM node:12-alpine as builder

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn install --frozen-lockfile --ignore-scripts

COPY . .

RUN yarn build


FROM node:12-alpine

COPY --from=builder /app /app

WORKDIR /app/demo

RUN yarn install --frozen-lockfile --ignore-scripts

ENV PORT 3030
EXPOSE 3030

CMD yarn start -T
