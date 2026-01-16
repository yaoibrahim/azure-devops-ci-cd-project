pipeline {
    agent any

    environment {
        // Informations du serveur SQL
        DB_SERVER = 'srv-webapp.mysql.database.azure.com'
        DB_USER   = 'adminsql'
        DB_NAME   = 'webappdb'
        
        // IMPORTANT : 'AZURE_SQL_PASSWORD' est l'ID que tu as saisi dans Jenkins (Secret Text)
        DB_PASSWORD = credentials('AZURE_SQL_PASSWORD') 
        
        // Informations Azure
        ACR_URL = "acrwebappdevops.azurecr.io"
        IMAGE_NAME = "webapp"
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        AKS_NAME = "aks-webapp-devops"
        RESOURCE_GROUP = "vm-devops"
    }

    stages {
        stage('Checkout') {
            steps {
                // Récupération automatique depuis ton repo public
                checkout scm
            }
        }

        stage('Database Migration') {
            steps {
                script {
                    echo "Application des migrations SQL sur Azure..."
                    // Utilisation de guillemets simples pour protéger le mot de passe
                    sh "mysql -h ${DB_SERVER} -u ${DB_USER} -p'${DB_PASSWORD}' ${DB_NAME} < database/migrations.sql"
                }
            }
        }

        stage('Docker Build & Push') {
            steps {
                script {
                    // Connexion à l'ACR avec l'ID d'identifiant créé précédemment
                    docker.withRegistry("https://${ACR_URL}", 'acr_credentials') {
                        def customImage = docker.build("${ACR_URL}/${IMAGE_NAME}:${IMAGE_TAG}", "-f docker/Dockerfile .")
                        customImage.push()
                        customImage.push("latest")
                    }
                }
            }
        }

        stage('Deploy to AKS') {
            steps {
                sh """
                # Récupération du fichier kubeconfig pour AKS
                az aks get-credentials --resource-group ${RESOURCE_GROUP} --name ${AKS_NAME} --overwrite-existing
                
                # Mise à jour de l'image du conteneur dans Kubernetes
                kubectl set image deployment/webapp-deployment node-app=${ACR_URL}/${IMAGE_NAME}:${IMAGE_TAG}
                
                # Attente que le déploiement soit terminé et opérationnel
                kubectl rollout status deployment/webapp-deployment
                """
            }
        }
    }
}