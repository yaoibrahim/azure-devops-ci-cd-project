pipeline {
    agent any

    environment {
        // Informations du serveur SQL
        DB_SERVER = 'srv-webapp.mysql.database.azure.com'
        DB_USER   = 'adminsql'
        DB_NAME   = 'webappdb'
        
        // Mot de passe SQL stocké dans Jenkins (Credentials ID: AZURE_SQL_PASSWORD)
        DB_PASSWORD = credentials('AZURE_SQL_PASSWORD') 
        
        // Informations Azure générales
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
                // Récupération des secrets du Service Principal pour la connexion az login
                withCredentials([
                    string(credentialsId: 'AZURE_CLIENT_ID', variable: 'AZ_ID'),
                    string(credentialsId: 'AZURE_CLIENT_SECRET', variable: 'AZ_SECRET'),
                    string(credentialsId: 'AZURE_TENANT_ID', variable: 'AZ_TENANT')
                ]) {
                    sh """
                    # 1. Connexion automatique à Azure via le robot (Service Principal)
                    az login --service-principal -u ${AZ_ID} -p ${AZ_SECRET} --tenant ${AZ_TENANT}
                    
                    # 2. Récupération du fichier kubeconfig pour AKS
                    az aks get-credentials --resource-group ${RESOURCE_GROUP} --name ${AKS_NAME} --overwrite-existing
                    
                    # 3. Mise à jour de l'image du conteneur dans Kubernetes
                    kubectl set image deployment/webapp-deployment node-app=${ACR_URL}/${IMAGE_NAME}:${IMAGE_TAG}
                    
                    # 4. Attente que le déploiement soit terminé et opérationnel
                    kubectl rollout status deployment/webapp-deployment
                    """
                }
            }
        }
    }
}