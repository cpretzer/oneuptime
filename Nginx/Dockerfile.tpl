FROM nginx:1.26.1-alpine 


ARG GIT_SHA
ARG APP_VERSION

ENV GIT_SHA=${GIT_SHA}
ENV APP_VERSION=${APP_VERSION}


# IF APP_VERSION is not set, set it to 1.0.0
RUN if [ -z "$APP_VERSION" ]; then export APP_VERSION=1.0.0; fi

# Install bash. 
RUN apk add bash && apk add curl && apk add openssl

# Install NJS module
RUN apk add nginx-module-njs

COPY ./Nginx/envsubst-on-templates.sh /etc/nginx/envsubst-on-templates.sh

RUN chmod +x /etc/nginx/envsubst-on-templates.sh

COPY ./Nginx/default.conf.template /etc/nginx/templates/default.conf.template 
COPY ./Nginx/nginx.conf /etc/nginx/nginx.conf

# Now install nodejs

RUN apk add nodejs npm

RUN mkdir /usr/src

WORKDIR /usr/src/Common
COPY ./Common/package*.json /usr/src/Common/
# Set version in ./Common/package.json to the APP_VERSION
RUN sed -i "s/\"version\": \".*\"/\"version\": \"$APP_VERSION\"/g" /usr/src/Common/package.json
RUN npm install
COPY ./Common /usr/src/Common


WORKDIR /usr/src/Model
COPY ./Model/package*.json /usr/src/Model/
# Set version in ./Model/package.json to the APP_VERSION
RUN sed -i "s/\"version\": \".*\"/\"version\": \"$APP_VERSION\"/g" /usr/src/Model/package.json
RUN npm install
COPY ./Model /usr/src/Model

WORKDIR /usr/src/CommonProject
COPY ./CommonProject/package*.json /usr/src/CommonProject/
# Set version in ./CommonProject/package.json to the APP_VERSION
RUN sed -i "s/\"version\": \".*\"/\"version\": \"$APP_VERSION\"/g" /usr/src/CommonProject/package.json
RUN npm install
COPY ./CommonProject /usr/src/CommonProject


WORKDIR /usr/src/CommonServer
COPY ./CommonServer/package*.json /usr/src/CommonServer/
# Set version in ./CommonServer/package.json to the APP_VERSION
RUN sed -i "s/\"version\": \".*\"/\"version\": \"$APP_VERSION\"/g" /usr/src/CommonServer/package.json
RUN npm install
COPY ./CommonServer /usr/src/CommonServer

ENV PRODUCTION=true

WORKDIR /usr/src/app

# Install app dependencies
COPY ./Nginx/package*.json /usr/src/app/
RUN npm install

COPY ./Nginx /usr/src/app
# Bundle app source
RUN npm run compile

RUN chmod +x ./run.sh

CMD ./run.sh


