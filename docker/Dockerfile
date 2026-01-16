# Utilise l'image Node.js officielle
FROM node:18

# Crée le dossier de travail dans le conteneur
WORKDIR /app

# On cherche 'app/' directement car on build depuis la racine du projet
COPY app/package*.json ./

# Installe les dépendances
RUN npm install

# Copie le reste de l'application
COPY app/ .

# Expose le port 3000
EXPOSE 3000

# Commande pour lancer l'app
CMD ["node", "app.js"]