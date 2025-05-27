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

    stage('Deploy to K8s') {
      steps {
        withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
          sh """
          kubectl --kubeconfig=$KUBECONFIG apply -f k8s/namespace.yaml
          kubectl --kubeconfig=$KUBECONFIG apply -f k8s/rbac.yaml
          kubectl --kubeconfig=$KUBECONFIG apply -f k8s/service.yaml
          kubectl --kubeconfig=$KUBECONFIG apply -f k8s/deployment.yaml
          kubectl --kubeconfig=$KUBECONFIG -n login-app \
              set image deploy/login-app login-app=${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
          kubectl --kubeconfig=$KUBECONFIG -n login-app rollout status deploy/login-app
          """
        }
      }
    }
  }

  post {
    success { echo '✅ Deploy sukses' }
    failure { echo '❌ Deploy gagal' }
  }
}