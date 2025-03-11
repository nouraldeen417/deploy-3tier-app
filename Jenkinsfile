pipeline {
    agent any
    // Define parameters
    parameters {
        choice(
            name: 'DEPLOY_TARGET',
            choices: ['kubernetes', 'docker_aws', 'both'],
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
                    echo 'push images in my public regitry '
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
                withCredentials([string(credentialsId: 'kubeconfig-secret', variable: 'KUBECONFIG_BASE64')]) {
                    // Decode the kubeconfig and write it to a file
                    sh """
                        mkdir -p ${WORKSPACE}/.kube
                        echo ${KUBECONFIG_BASE64} | base64 --decode > ${KUBECONFIG}
                        chmod 600 ${KUBECONFIG}
                    """
                }
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

