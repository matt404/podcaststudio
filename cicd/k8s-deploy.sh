
NEW_DOCKER_IMAGE_VERSION=$(cat cicd/current_deployed_version.txt)
echo $NEW_DOCKER_IMAGE_VERSION

OUTPUT_FILE_NAME="podcaststudio.yaml"

cat  cicd/config/k8s/secret-tls.yaml > $OUTPUT_FILE_NAME
echo "\n---" >> $OUTPUT_FILE_NAME
cat  cicd/config/k8s/deployment.yaml | sed 's/IMAGE_VERSION/'$NEW_DOCKER_IMAGE_VERSION'/' >> $OUTPUT_FILE_NAME
echo "\n---" >> $OUTPUT_FILE_NAME
cat  cicd/config/k8s/service.yaml >> $OUTPUT_FILE_NAME
echo "\n---" >> $OUTPUT_FILE_NAME
cat  cicd/config/k8s/service-nodeport.yaml >> $OUTPUT_FILE_NAME
echo "\n---" >> $OUTPUT_FILE_NAME
cat  cicd/config/k8s/ingress.yaml >> $OUTPUT_FILE_NAME

scp $OUTPUT_FILE_NAME ubuntu@app1.domo:/home/ubuntu/$OUTPUT_FILE_NAME

rm $OUTPUT_FILE_NAME

REMOTE_DEPLOY_COMMAND="microk8s.kubectl create -f /home/ubuntu/$OUTPUT_FILE_NAME"
echo $REMOTE_DEPLOY_COMMAND
ssh ubuntu@app1.domo $REMOTE_DEPLOY_COMMAND
