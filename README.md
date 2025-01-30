# deploy-3tier-app
# 3-Tier Application Deployment

This document outlines the step-by-step process for deploying a **3-Tier Application** using **Docker, Docker Compose, a Private Container Registry, and Kubernetes (kubeadm)**.

## **Prerequisites**

Ensure you have the following installed:

- Git
- Docker & Docker Compose
- Kubernetes (kubeadm)
- kubelet & kubectl

---

## **Step 1: Clone Application Repository**

Start by cloning the application repository from GitHub:

```sh
git clone https://github.com/marwansss/depi-angular-app.git
cd depi-angular-app
```

---

## **Step 2: Create Dockerfiles**

### **Frontend Dockerfile**

The frontend Dockerfile consists of two layers:

1. **Build Stage** – Compiles the frontend application.
2. **Hosting Stage** – Uses **Nginx** to serve the application.

```dockerfile
FROM node AS build 
WORKDIR /app
COPY package*.json ./
RUN npm install 
COPY . .
RUN npm install -g @angular/cli && ng build --configuration production 
# Stage 2: Serve the frontend using Nginx
FROM nginx:alpine
COPY --from=build /app/dist/my-angular-app/browser/ /usr/share/nginx/html
EXPOSE 80
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
# Set the entrypoint to run the script before starting Nginx
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
```

**Dynamic API URL Handling:** A script dynamically assigns the `API_URL`, making it easy to set up connections between the frontend and backend.

---

### **Backend Dockerfile**

The backend requires a database configuration file (`db.json`), and environment variables are used to set values dynamically.

```dockerfile
FROM node
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

---

## **Step 3: Create Docker Compose File**

The `docker-compose.yml` defines **three services**: `frontend`, `backend`, and `db-sql`.

```yaml
version: '3.8'
services:
  frontend:
    build: ./front-end
    container_name: my_frontend
    environment:
      API_URL: http://localhost:3000 # Change this URL dynamically
    ports:
      - "80:80"
    depends_on:
      - backend

  backend:
    build: ./backend
    container_name: my_backend
    restart: always
    environment:
      DB_HOST: db  # Use the service name as the hostname
      DB_USER: root
      DB_PASS: rootpassword
      DB_NAME: angular
    ports:
      - "3000:3000"
    depends_on:
      - db

  db:
    image: mysql
    restart: always
    environment:
      MYSQL_DATABASE: angular
      MYSQL_ROOT_PASSWORD: rootpassword
    volumes:
      - sql_data:/var/lib/db/sql_data

volumes:
  sql_data:
```

To run the application locally using Docker Compose:

```sh
docker-compose up -d
```

---

## **Step 4: Push Images to Local Registry**

### **Create a Local Registry**

```sh
docker run -d -p 5000:5000 --name registry registry:2
```

### **Tag & Push Images**

```sh
docker tag frontend:latest localhost:5000/my-frontend
docker tag backend:latest localhost:5000/my-backend

docker push localhost:5000/frontend
docker push localhost:5000/backend
```

---

## **Step 5: Kubernetes Cluster Setup (kubeadm)**

### **Initialize the Kubernetes Cluster**

```sh
sudo kubeadm init --pod-network-cidr=192.168.0.0/16
```

### **Join Worker Nodes**

Run the command provided after initialization to join worker nodes.

### **Remove Master Node Taint (Optional)**

To allow scheduling on the master node:

```sh
kubectl taint nodes --all node-role.kubernetes.io/control-plane-
```

---

## **Step 6: Deploy Application in Kubernetes**

### **Create Kubernetes Pods & Services**

#### **Backend Pod & Service**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: backend
spec:
  containers:
    - name: backend
      image: localhost:5000/backend
      ports:
        - containerPort: 5000
---
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    tier: backend
  name: backend
spec:
  containers:
  - image: 192.168.1.150:5000/my-backend
    name: backend
    ports:
    - containerPort: 3000
    env:
    - name: DB_HOST
      value: "db"  # Change this URL dynamically
    - name: DB_USER
      value: "root"  # Change this URL dynamically
    - name: DB_PASS
      value: "rootpassword"  # Change this URL dynamically
    - name: DB_NAME
      value: "angular"  # Change this URL dynamically
    
    resources: {}
  dnsPolicy: ClusterFirst
  restartPolicy: Always
status: {}

---
apiVersion: v1
kind: Service
metadata:
  name: backend
spec:
  type: NodePort
  selector:
    tier: backend
  ports:
    - protocol: TCP
      port: 3000
      targetPort: 3000
      nodePort: 30008 
```

#### **Frontend Pod & Service**

```yaml
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    tier: frontend  
  name: frontend
spec:
  containers:
  - image: 192.168.1.150:5000/my-frontend:latest
    name: frontend
    ports:
    - containerPort: 80
    env:
    - name: API_URL
      value: "http://192.168.1.100:30008"  # Change this URL dynamically
  dnsPolicy: ClusterFirst
  restartPolicy: Always
status: {}

---
apiVersion: v1
kind: Service
metadata:
  name: frontend
spec:
  type: NodePort
  selector:
    tier: frontend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
    nodePort: 30007  
```

#### **Database Pod & Service**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mysql-pod
  labels:
    tier: mysql
spec:
  containers:
  - name: db
    image: mysql
    env:
    - name: MYSQL_ROOT_PASSWORD
      value: "rootpassword"
    - name: MYSQL_DATABASE
      value: "angular"
    ports:
    - containerPort: 3306
    volumeMounts:
      - name: mysql-storage
        mountPath: /var/lib/mysql
  volumes:
  - name: mysql-storage
    persistentVolumeClaim:
      claimName: mysql-pvc

---
apiVersion: v1
kind: Service
metadata:
  name: db
spec:
  selector:
    tier: mysql
  ports:
    - protocol: TCP
      port: 3306
      targetPort: 3306

```
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mysql-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  storageClassName: manual
```
```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: mysql-pv
spec:
  capacity:
    storage: 5Gi  # Adjust size as needed
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: manual
  hostPath:
    path: "/mnt/data/mysql"  # Adjust path based on your environment
```


### **Deploy Pods & Services**

```sh
kubectl apply -f backend.yaml
kubectl apply -f frontend.yaml
kubectl apply -f PVC.yaml
kubectl apply -f PV.yaml
kubectl apply -f mysql.yaml
```

---

## **Step 7: Verify Deployment**

### **Check Pods**

```sh
kubectl get pods
```

### **Check Services**

```sh
kubectl get services
```

### **Access Application**

- **Frontend:** `http://<node-ip>:30007`
- **Backend:** `http://<node-ip>:30008`

---

## **Conclusion**

You have successfully deployed a **3-Tier Application** using **Docker, Docker Compose, Kubernetes, and a Private Container Registry**. 🚀

If you encounter any issues, check logs using:

```sh
kubectl logs <pod-name>
```

Enjoy your scalable and containerized application! 🎉

