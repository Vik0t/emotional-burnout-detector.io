FROM node:22-alpine

WORKDIR /usr/src/app

COPY package.json ./
RUN npm install
COPY . .
EXPOSE 8934

CMD sh -c "npm run init-db && npm run migrate && npm run dev"
