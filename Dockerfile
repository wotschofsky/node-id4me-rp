FROM node:12-alpine

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --frozen-lockfile --ignore-scripts
RUN yarn global add typescript


COPY . .

RUN tsc --build tsconfig.json


WORKDIR /demo/

RUN npm install


ENV PORT 3030
EXPOSE 3030

CMD yarn start -T
