FROM node:22-alpine

WORKDIR /usr/src/app

COPY package.json ./
RUN npm install
COPY . .
EXPOSE 8935

CMD sh -c "npm run dev"
