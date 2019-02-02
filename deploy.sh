#/bin/bash

echo "New deploy in process..."
echo "Building project..."
npm i
tsc

echo "Removing old deploy instance..."
OLD=$(now ls | sed "s/.*\(wc3botto-.*\.sh\).*/\1/;t;d")
now rm $OLD

echo "Deploying new instance..."
now -e TOKEN=@token -e NODE_ENV=@node_env -e DB_USER=@db_user -e DB_PASS=@db_pass
NEW=$(now ls | sed "s/.*\(wc3botto-.*\.sh\).*/\1/;t;d")
now scale $NEW sfo1 1

echo "Deploy done!"
