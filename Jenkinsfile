pipeline {
    agent any
    // Define parameters
    parameters {
        choice(
            name: 'DEPLOY_TARGET',
            choices: ['kubernetes', 'docker', 'both'],
            description: 'Select the deployment target'
        )
        choice(
            name: 'PIPELINE_ACTION',
            choices: ['build & deploy','build only', 'deploy only'],
            description: 'Choose to build only, deploy only, or both build and deploy'
        )
        string(name: 'CUSTOM_BUILD_NUMBER', defaultValue: "${BUILD_NUMBER}", description: 'specify  image tag or BUILD_NUMBER will be as default')
        booleanParam(name: 'SKIP_TESTS', defaultValue: false, description: 'Skip running tests')
    }

    environment {
        DOCKER_REGISTRY = 'your-docker-registry' // e.g., Docker Hub
        FRONTEND_IMAGE_NAME = "nouraldeen152/app-frontend"
        BACKEND_IMAGE_NAME =  "nouraldeen152/app-backend"
        IMAGE_TAG =  "${params.CUSTOM_BUILD_NUMBER}" // Use custom build number or default to BUILD_NUMBER
        REMOTE_USER = 'jenkins-remote'
        REMOTE_HOST = '192.168.1.150'
        REMOTE_DIR = "/home/jenkins-remote/"
        KUBECONFIG = "${WORKSPACE}/.kube/config"
        SLACK_CHANNEL = '#team-project' // Slack channel to send notifications
    }
    stages {
        stage('build docker image') {
            steps {
                sh """
                    cd ./depi-angular-app/front-end/
                    docker build -t ${env.FRONTEND_IMAGE_NAME}:${IMAGE_TAG}  .
                    cd ../backend/
                     docker build -t ${env.BACKEND_IMAGE_NAME}:${IMAGE_TAG}  .
                """
                    // sh "ls -l"
                    // sh "cd ./depi-angular-app/front-end/ && docker build -t app-frontend:$BUILD_NUMBER .   "
                    // sh "ls -l && pwd"
                    // sh "cd ./depi-angular-app/backend/   && docker build -t app-backend:$BUILD_NUMBER  .   "
                    // echo 'start my local registry'
                    // sh 'docker start registry'
                    // sh ' docker tag app-frontend:$BUILD_NUMBER 192.168.1.150:5000/app-frontend:$BUILD_NUMBER && docker tag app-backend:$BUILD_NUMBER 192.168.1.150:5000/app-backend:$BUILD_NUMBER '
                    // sh ' docker push 192.168.1.150:5000/app-frontend:$BUILD_NUMBER && docker push 192.168.1.150:5000/app-backend:$BUILD_NUMBER '                 
                    echo 'optional push images in my public regitry '
                withCredentials([usernamePassword(credentialsId: 'dockerhub', passwordVariable: 'PASS', usernameVariable: 'USER')]) 
                {
                    sh 'docker login -u $USER -p $PASS'
                    sh"""
                         docker push ${env.FRONTEND_IMAGE_NAME}:${IMAGE_TAG} 
                         docker push ${env.BACKEND_IMAGE_NAME}:${IMAGE_TAG}
                    """
                    
                }
            }
        }       
        stage('test') {
            steps {
                sh "echo test stage"
            }
        }
        stage('deploy') {
            steps {

             sh """
                mkdir -p ${WORKSPACE}/.kube
                cp /root/.kube/config ${KUBECONFIG}
                chmod 600 ${KUBECONFIG}
               """
              dir('kubernates/') {
                sh """
                kubectl get nodes --kubeconfig=${KUBECONFIG}
                echo ${KUBECONFIG}
                export KUBECONFIG=${KUBECONFIG}
                chmod +x ./manage.sh 
                ./manage.sh apply

                    """  
                }
                // sh 'cd ./depi-angular-app && docker compose up -d' 
            }
        }
    }
}

