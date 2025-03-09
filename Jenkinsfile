pipeline {
    agent any

    stages {
        stage('build docker image') {
            steps {
                    sh "ls -l"
                    sh "cd ./depi-angular-app/front-end/ && docker build -t app-frontend:$BUILD_NUMBER .   "
                    sh "ls -l && pwd"
                    sh "cd ./depi-angular-app/backend/   && docker build -t app-backend:$BUILD_NUMBER  .   "
                    // echo 'start my local registry'
                    // sh 'docker start registry'
                    // sh ' docker tag app-frontend:$BUILD_NUMBER 192.168.1.150:5000/app-frontend:$BUILD_NUMBER && docker tag app-backend:$BUILD_NUMBER 192.168.1.150:5000/app-backend:$BUILD_NUMBER '
                    // sh ' docker push 192.168.1.150:5000/app-frontend:$BUILD_NUMBER && docker push 192.168.1.150:5000/app-backend:$BUILD_NUMBER '                 
                    echo 'optional push images in my public regitry '
                withCredentials([usernamePassword(credentialsId: 'dockerhub', passwordVariable: 'PASS', usernameVariable: 'USER')]) 
                {
                    sh 'docker login -u $USER -p $PASS'
                    sh ' docker tag app-frontend:$BUILD_NUMBER nouraldeen152/app-frontend:$BUILD_NUMBER && docker tag app-backend:$BUILD_NUMBER nouraldeen152/app-backend:$BUILD_NUMBER '
                    sh 'docker push nouraldeen152/app-frontend:$BUILD_NUMBER              && docker push nouraldeen152/app-backend:$BUILD_NUMBER '
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
                sh 'cd ./depi-angular-app && docker compose up -d' 
            }
        }
    }
}
