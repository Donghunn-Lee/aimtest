FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV REACT_APP_API_BASE_URL=/api
RUN npm run build
EXPOSE 3000
CMD ["sh", "-c", "cp -r build /shared && tail -f /dev/null"]