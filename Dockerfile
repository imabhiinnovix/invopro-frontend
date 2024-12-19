
#####################
# Development Stage
FROM node:20 AS dev
RUN mkdir /app
WORKDIR /app

COPY package*.json .
RUN npm install

# Expose the application port.
EXPOSE 5173

# CMD ["tail", "-f", "/dev/null"]
CMD ["npm", "run", "start"]

# CMD ["vite", "--port", "3000"]
# CMD ["tail",  "-f", "/dev/null"]

##############################
# Build Stage for Production
FROM node:20 AS build

ARG REPORTIVIX_BACKEND_URL=http://localhost:5002/

ENV VITE_DOWNLOAD_URL=$REPORTIVIX_BACKEND_URL
ENV VITE_API_URL=${REPORTIVIX_BACKEND_URL}api/v1

# RUN echo  "VITE_DOWNLOAD_URL $VITE_DOWNLOAD_URL"
# RUN echo "VITE_API_URL $VITE_API_URL"

RUN mkdir /app
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .

# **Important: Remove any existing 'dist' folder**
RUN rm -rf dist

RUN npm run-script build

####################
# Production stage
FROM nginx:alpine AS prod

RUN apk add --no-cache bash

COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
