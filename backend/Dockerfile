# Use Node.js LTS
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install 

# Copy all backend code
COPY . .

# Expose backend port
EXPOSE 5000
EXPOSE 10000

# Use environment variables from .env
# Start the server
CMD ["npm", "start"]
