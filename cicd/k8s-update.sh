
NEW_DOCKER_IMAGE_VERSION=$(cat cicd/current_deployed_version.txt)
echo $NEW_DOCKER_IMAGE_VERSION
REMOTE_DEPLOY_COMMAND="microk8s.kubectl set image deployment podcaststudio-deployment podcaststudio=matt404/podcaststudio:"$NEW_DOCKER_IMAGE_VERSION
echo $REMOTE_DEPLOY_COMMAND
ssh ubuntu@app1.domo $REMOTE_DEPLOY_COMMAND
