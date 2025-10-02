# React + Vite

* docker network 목록 확인하기
    ```
    docker network ls    
    ```

* MariaDB Run 하기
``` 
docker run --name db-svc -d \
  --net msanet \
  --net-alias=db-svc \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD='maria' \
  -e MYSQL_DATABASE='boot_db' \
  -e MYSQL_USER='boot' \
  -e MYSQL_PASSWORD='boot' \
  -e MYSQL_ROOT_HOST='%' \
  mariadb:10.11.8 \
  --character-set-server=utf8mb4 \
  --collation-server=utf8mb4_unicode_ci
 ```
* SpringBoot Run 하기
``` 
docker run --name myboot-svc -d -p 8080:8080 --net msanet --net-alias=myboot-svc \
-e DB_HOST='db-svc' \
-e DB_PORT='3306' \
-e DB_DATABASE='boot_db' \
-e DB_USERNAME='boot' \
-e DB_PASSWORD='boot' \
myuser/springbootreactjs:0.1
```

* Reactjs Run 하기
```
docker run --name react-svc -d -p 80:80 --net msanet --net-alias=react-svc myuser/springbootreactjs:client0.1
```