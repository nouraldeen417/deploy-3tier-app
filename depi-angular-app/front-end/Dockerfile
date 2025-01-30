FROM node AS build 
WORKDIR /app
COPY package*.json ./

RUN npm install 
COPY . .
RUN npm install -g @angular/cli && ng build --configuration production 

# Stage 2: Serve the frontend using Nginx
FROM nginx:alpine
COPY --from=build /app/dist/my-angular-app/browser/ /usr/share/nginx/html
EXPOSE 80
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
# Set the entrypoint to run the script before starting Nginx
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]