pipeline {
    agent any
    
    environment {
        // Informations du serveur SQL
        DB_SERVER = 'srv-webapp.mysql.database.azure.com'
        DB_USER   = 'adminsql'
        DB_NAME   = 'webappdb'
        // On récupère le mot de passe stocké de manière sécurisée dans Jenkins
        DB_PASSWORD = credentials('AZURE_SQL_PASSWORD') 
        IMAGE_NAME = "webapp-image"
    }

    stages {
        stage('Checkout') {
            steps {
                // Récupère ton code depuis GitHub
                checkout scm
            }
        }

        stage('Database Migration') {
            steps {
                script {
                    echo "Application des migrations SQL..."
                    // Jenkins utilise un client MySQL pour créer la table si elle n'existe pas
                    sh "mysql -h ${DB_SERVER} -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} < database/migrations.sql"
                }
            }
        }

        stage('Build Docker') {
            steps {
                echo "Construction de l'image Docker..."
                sh "docker build -t ${IMAGE_NAME}:latest -f docker/Dockerfile ."
            }
        }

        stage('Deploy') {
            steps {
                echo "Déploiement du conteneur..."
                sh "docker stop webapp-azure || true"
                sh "docker rm webapp-azure || true"
                sh """
                    docker run -d -p 3000:3000 --name webapp-azure \
                    --env DB_USER='${DB_USER}' \
                    --env DB_PASSWORD='${DB_PASSWORD}' \
                    --env DB_SERVER='${DB_SERVER}' \
                    --env DB_NAME='${DB_NAME}' \
                    ${IMAGE_NAME}:latest
                """
            }
        }
    }
}