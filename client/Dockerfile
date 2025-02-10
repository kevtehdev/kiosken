# Use an official node image as the base image
FROM node:18-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

ARG VITE_VIVA_URL
ENV VITE_VIVA_URL=$VITE_VIVA_URL

# Build the application
RUN npm run build

# Use an official nginx image as the base image for the production stage
FROM nginx:alpine

# Copy the build output to the nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 5173
EXPOSE 5173

# Start nginx
CMD ["nginx", "-g", "daemon off;"]