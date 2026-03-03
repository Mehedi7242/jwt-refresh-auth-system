# base image 

FROM node:22

# set working dir

WORKDIR /app

# copy package.json and install dependencies

COPY package*.json ./

#install dependancies

RUN npm install

COPY . .

EXPOSE 5000

CMD [ "node","index.js" ]