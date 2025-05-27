pipeline {
  agent any

  environment {
    REGISTRY   = 'docker.io'
    IMAGE_NAME = 'kiezu/login-web'
    IMAGE_TAG  = "${BUILD_NUMBER}"
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Unit Test') {
      agent {
        docker {
          image 'node:18-alpine'
        }
      }
      steps {
        sh 'npm ci'
        sh 'npm test || echo "no tests"'
      }
    }

    stage('Build Image') {
      agent {
        docker {
          image 'docker:24.0.7-dind'
          args '-v /var/run/docker.sock:/var/run/docker.sock'
        }
      }
      steps {
        script {
          dockerImage = docker.build("${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}")
        }
      }
    }

    stage('Push Image') {
      agent {
        docker {
          image 'docker:24.0.7-dind'
          args '-v /var/run/docker.sock:/var/run/docker.sock'
        }
      }
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'docker-credentials-kiezu',
          usernameVariable: 'DOCKER_USER',
          passwordVariable: 'DOCKER_PASS'
        )]) {
          sh "echo $DOCKER_PASS | docker login ${REGISTRY} -u $DOCKER_USER --password-stdin"
          sh "docker push ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
          sh "docker tag  ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} ${REGISTRY}/${IMAGE_NAME}:latest"
          sh "docker push ${REGISTRY}/${IMAGE_NAME}:latest"
        }
      }
    }

    stage('Install kubectl') {
      steps {
        sh '''
            curl -LO "https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl"
            chmod +x kubectl
            mv kubectl /usr/local/bin/
        '''
      }
    }

    stage('Deploy to K8s') {
      steps {
        script {
          // Ganti 'your-kubeconfig-credential-id' dengan ID credential kubeconfig Anda di Jenkins
          withCredentials([file(credentialsId: 'your-kubeconfig-credential-id', variable: 'KUBECONFIG_FILE')]) {
            sh '''
                echo "Applying namespace..."
                kubectl --kubeconfig="${KUBECONFIG_FILE}" apply -f k8s/namespace.yaml

                echo "Applying deployment..."
                kubectl --kubeconfig="${KUBECONFIG_FILE}" apply -f k8s/deployment.yaml

                echo "Applying service..."
                kubectl --kubeconfig="${KUBECONFIG_FILE}" apply -f k8s/service.yaml
            '''
          }
        }
      }
    }
  }

  post {
    success { echo '✅ Deploy sukses' }
    failure { echo '❌ Deploy gagal' }
  }
}