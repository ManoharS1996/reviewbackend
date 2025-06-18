# Use official Node image
FROM node:18

# Set working directory
WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Start app
EXPOSE 5000
CMD ["nodemon", "server.js"]
