# Dockerfile customizado para Jenkins com Docker e AWS CLI pré-instalados

FROM jenkins/jenkins:lts

USER root

# Instalar Docker CLI
RUN apt-get update && \
    apt-get install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release && \
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg && \
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && \
    apt-get install -y docker-ce-cli && \
    rm -rf /var/lib/apt/lists/*

# Instalar AWS CLI v2
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -rf awscliv2.zip aws

# Adicionar usuário jenkins ao grupo docker
RUN groupadd -f docker && \
    usermod -aG docker jenkins

# Instalar plugins Jenkins essenciais
USER jenkins
RUN jenkins-plugin-cli --plugins \
    docker-workflow \
    pipeline-aws \
    git \
    github \
    credentials-binding \
    workflow-aggregator \
    timestamper \
    ws-cleanup

USER root

# Script de inicialização
COPY init.groovy.d/ /usr/share/jenkins/ref/init.groovy.d/

USER jenkins

EXPOSE 8080 50000
