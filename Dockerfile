FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG REACT_APP_API_BASE_URL=http://ec2-52-79-221-80.ap-northeast-2.compute.amazonaws.com:3001/api
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
RUN echo "REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL" > .env
RUN npm run build
EXPOSE 3000
CMD ["npx", "serve", "-s", "build", "-l", "3000"]