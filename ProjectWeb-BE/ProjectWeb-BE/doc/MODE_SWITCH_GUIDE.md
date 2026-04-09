# Mode Switch Guide (Success/Error)

Tai lieu nay giup ban:
- Bat/tat bo loi bao cao bang 1 lenh Git Bash.
- Chay kich ban thanh cong (success mode).
- Chay va chup hinh cac loi (error mode).

## 1) 1 lenh bat/tat mode

Chay trong thu muc goc du an `ProjectWeb-BE/ProjectWeb-BE`:

```bash
# Mode chay binh thuong (tam rollback)
bash scripts/set-mode.sh success

# Mode tao loi de chup bao cao
bash scripts/set-mode.sh error
```

Script se:
- Sua cac file cau hinh can thiet.
- Tu dong chay `docker compose up -d --build`.

## 2) Success mode (de theo kich ban ket qua thanh cong)

### Product Service (qua API Gateway)
- Method: `POST`
- URL: `http://localhost:8080/api/product`
- Body JSON:

```json
{
  "name": "Test Product",
  "price": 100000,
  "description": "desc",
  "image": "https://example.com/a.jpg",
  "checkToCart": false,
  "rating": 5,
  "quantity": 10,
  "productCode": "SKU-T001"
}
```

### Order Service (qua API Gateway)
- Method: `POST`
- URL: `http://localhost:8080/api/order/place-order`
- Body JSON:

```json
{
  "items": [
    {
      "id": "PUT_PRODUCT_ID_HERE",
      "quantity": 1,
      "productCode": "SKU-T001"
    }
  ],
  "totalItemCount": 1,
  "delivery_type": "STANDARD",
  "delivery_type_cost": 20000,
  "cost_before_delivery_rate": 100000,
  "cost_after_delivery_rate": 120000,
  "promo_code": "",
  "contact_number": "0900000000",
  "user_id": "demo-user",
  "paymentMethod": "COD"
}
```

Gia tri `paymentMethod` hop le:
- `COD`
- `CREDIT_CARD`
- `PAYPAL`
- `VNPAY`
- `MOMO`
- `ZALO_PAY`

## 3) Error mode (de chup hinh cac loi 3.2.x)

Bat mode loi:

```bash
bash scripts/set-mode.sh error
```

### 3.2.1 Lombok compile error tren VS Code

Khi da o error mode, file `.idea/compiler.xml` se bi tat annotation processing (`enabled="false"`).

De chup trong VS Code:
1. Mo file mapper co nhieu getter/setter:
   - `order-service/src/main/java/vn/tt/practice/orderservice/mapper/OrderMapper.java`
2. Neu chua thay vet do:
   - Mo Command Palette -> `Java: Clean Java Language Server Workspace` -> `Restart and Clean`.
3. Chup man hinh cac dong `get...`/`set...` bi gach do.

### 3.2.2 Kafka broker crash (order-service)

Terminal A (theo doi log):

```bash
docker compose logs -f order-service | grep -Ei "localhost:9092|node -1|Bootstrap broker|Topic .* not present"
```

Terminal B (kich hoat request):

```bash
curl -i -H "Content-Type: application/json" --data-raw '{"items":[],"totalItemCount":0,"delivery_type":"STD","delivery_type_cost":0,"cost_before_delivery_rate":0,"cost_after_delivery_rate":0,"promo_code":"","contact_number":"000","user_id":"demo-user","paymentMethod":"COD"}' http://localhost:8080/api/order/place-order
```

Mau log can chup:
- `Connection to node -1 (localhost/127.0.0.1:9092) could not be established`
- hoac `Topic notificationTopic not present in metadata`

### 3.2.3 Eureka 401 Unauthorized

```bash
docker compose logs -f product-service | grep -Ei "401|registration failed|Cannot execute request"
```

Neu chua xuat hien ngay:

```bash
docker compose restart product-service
```

Mau log can chup:
- `Request execution failure with status code 401`

### 3.2.4 Redis connection refused

Terminal A:

```bash
docker compose logs -f user-service | grep -Ei "RedisConnectionFailureException|Unable to connect to Redis|Connection refused"
```

Terminal B:

```bash
TS=$(date +%s)
curl -i -H "Content-Type: application/json" --data-raw '{"username":"report-user-'"$TS"'","email":"report-'"$TS"'@example.com","password":"123456"}' http://localhost:8080/api/user/register
```

Mau log can chup:
- `RedisConnectionFailureException: Unable to connect to Redis`

## 4) Quay lai mode thanh cong sau khi chup xong

```bash
bash scripts/set-mode.sh success
```

## 5) Cac file bi mode script tac dong

- `.idea/compiler.xml`
- `eureka-server/src/main/java/vn/tt/practice/eurekaserver/config/SecurityConfig.java`
- `docker-compose.yml`
