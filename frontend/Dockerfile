# frontend Dockerfile
FROM node:20

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (including devDependencies)
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the port your app uses
EXPOSE 5173

# Run Vite
CMD ["npm", "run", "dev"]
