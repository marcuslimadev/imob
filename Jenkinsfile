pipeline {
    agent any
    
    environment {
        AWS_REGION = 'sa-east-1'
        ECR_REGISTRY = '575098225472.dkr.ecr.sa-east-1.amazonaws.com'
        ECR_REPOSITORY = 'imobi-frontend'
        ECS_CLUSTER = 'production-imobi-cluster'
        ECS_SERVICE = 'production-imobi-frontend'
        IMAGE_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT.take(7)}"
        DOCKER_BUILDKIT = '1'
    }
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
        timeout(time: 20, unit: 'MINUTES')
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "🔄 Checkout do código - Branch: ${env.GIT_BRANCH}"
                    echo "📝 Commit: ${env.GIT_COMMIT}"
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    echo "🐳 Iniciando build da imagem Docker..."
                    dir('nextjs') {
                        sh """
                            docker build \
                                -f Dockerfile.prod \
                                -t ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG} \
                                -t ${ECR_REGISTRY}/${ECR_REPOSITORY}:latest \
                                --build-arg BUILDKIT_INLINE_CACHE=1 \
                                .
                        """
                    }
                    echo "✅ Build concluído: ${IMAGE_TAG}"
                }
            }
        }
        
        stage('Push to ECR') {
            steps {
                script {
                    echo "📤 Fazendo push para ECR..."
                    withAWS(credentials: 'aws-credentials', region: "${AWS_REGION}") {
                        sh """
                            aws ecr get-login-password --region ${AWS_REGION} | \
                            docker login --username AWS --password-stdin ${ECR_REGISTRY}
                            
                            docker push ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}
                            docker push ${ECR_REGISTRY}/${ECR_REPOSITORY}:latest
                        """
                    }
                    echo "✅ Push concluído"
                }
            }
        }
        
        stage('Deploy to ECS') {
            steps {
                script {
                    echo "🚀 Iniciando deploy no ECS..."
                    withAWS(credentials: 'aws-credentials', region: "${AWS_REGION}") {
                        // Captura a task definition atual para possível rollback
                        sh """
                            aws ecs describe-services \
                                --cluster ${ECS_CLUSTER} \
                                --services ${ECS_SERVICE} \
                                --region ${AWS_REGION} \
                                --query 'services[0].taskDefinition' \
                                --output text > previous_task_def.txt
                        """
                        
                        // Force new deployment
                        sh """
                            aws ecs update-service \
                                --cluster ${ECS_CLUSTER} \
                                --service ${ECS_SERVICE} \
                                --force-new-deployment \
                                --region ${AWS_REGION}
                        """
                        
                        echo "⏳ Aguardando deployment estabilizar..."
                        timeout(time: 10, unit: 'MINUTES') {
                            sh """
                                aws ecs wait services-stable \
                                    --cluster ${ECS_CLUSTER} \
                                    --services ${ECS_SERVICE} \
                                    --region ${AWS_REGION}
                            """
                        }
                    }
                    echo "✅ Deploy concluído com sucesso!"
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    echo "🏥 Verificando health da aplicação..."
                    sleep 10
                    
                    def healthCheckPassed = sh(
                        script: 'curl -f -s -o /dev/null -w "%{http_code}" https://lojadaesquina.store/home',
                        returnStatus: true
                    ) == 0
                    
                    if (healthCheckPassed) {
                        echo "✅ Health check passou - aplicação respondendo"
                    } else {
                        error "❌ Health check falhou - iniciando rollback"
                    }
                }
            }
        }
    }
    
    post {
        success {
            script {
                echo "🎉 Deploy bem-sucedido!"
                echo "📦 Imagem: ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}"
                echo "🌐 URL: https://lojadaesquina.store/"
            }
        }
        
        failure {
            script {
                echo "❌ Deploy falhou!"
                
                // Rollback automático
                withAWS(credentials: 'aws-credentials', region: "${AWS_REGION}") {
                    def previousTaskDef = readFile('previous_task_def.txt').trim()
                    if (previousTaskDef) {
                        echo "🔄 Iniciando rollback para: ${previousTaskDef}"
                        sh """
                            aws ecs update-service \
                                --cluster ${ECS_CLUSTER} \
                                --service ${ECS_SERVICE} \
                                --task-definition ${previousTaskDef} \
                                --force-new-deployment \
                                --region ${AWS_REGION}
                        """
                        echo "✅ Rollback executado"
                    }
                }
            }
        }
        
        always {
            script {
                // Limpa imagens Docker antigas localmente
                sh """
                    docker image prune -f --filter "until=24h" || true
                """
            }
        }
    }
}
