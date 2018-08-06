FROM node:9
WORKDIR /usr/src/app

RUN apt-get update
RUN apt-get install -y bluetooth
RUN apt-get install -y bluez
RUN apt-get install -y libbluetooth-dev
RUN apt-get install -y libudev-dev

COPY package*.json ./
RUN npm install

COPY . .

CMD [ "npm", "run", "start" ]