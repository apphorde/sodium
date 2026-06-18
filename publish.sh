set -e

npm i @node-lambdas/cli
export PATH="./node_modules/.bin:$PATH"
export componentsDir=components
export libsDir=libraries

echo "---"
for scope in $(ls -1 $libsDir); do
  echo "Entering $scope"
  for library in $(ls -1 $libsDir/$scope); do
    name=$(echo $library | sed s/.mjs//)
    echo -n "Processing $scope/$name... "
    cat $libsDir/$scope/$library | fn es-minify --module true > $componentsDir/$scope/$library
  done
done


for scope in $(ls -1 $componentsDir); do
  echo "Publishing components from $scope"
  tar -cz -f - -C $componentsDir/$scope --exclude node_modules/ --exclude .git/ --exclude tmp/ . | curl -sS -H 'Authorization: '$DEPLOY_API_KEY $DEPLOY_API_URL --data-binary @-
done

