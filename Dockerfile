FROM node:10.13.0

RUN npm i -g npm@latest

ENV NODE_ENV=production
ENV ENV=production

RUN npm i -g typescript ts-node tslint

COPY . /var/www/

WORKDIR /var/www/

RUN npm i

RUN npm run compile

RUN echo 'STARTING...'

CMD ["npm", "start"]
