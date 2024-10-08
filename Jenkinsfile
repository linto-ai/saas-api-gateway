pipeline {
    agent any
    environment {
        DOCKER_HUB_REPO = "saas/linto-platform-api-gateway"
        DOCKER_HUB_CRED = 'harbor-jenkins-robot'
        VERSION = ''
    }

    stages{
        stage('Docker build for master branch'){
            when{
                branch 'master'
            }
            steps {
                echo 'Publishing latest'
                script {
                    image = docker.build(env.DOCKER_HUB_REPO)
                    VERSION = sh(
                        returnStdout: true, 
                        script: "awk -v RS='' '/#/ {print; exit}' RELEASE.md | head -1 | sed 's/#//' | sed 's/ //'"
                    ).trim()

                    docker.withRegistry('https://registry.linto.ai', env.DOCKER_HUB_CRED) {
                        image.push("${VERSION}")
                        image.push('latest')
                    }
                }
            }
        }

        stage('Docker build for next (unstable) branch'){
            when{
                branch 'next'
            }
            steps {
                echo 'Publishing unstable'
                script {
                    image = docker.build(env.DOCKER_HUB_REPO)

                    docker.withRegistry('https://registry.linto.ai', env.DOCKER_HUB_CRED) {
                        image.push('latest-unstable')
                    }
                }
            }
        }
    }// end stages
}