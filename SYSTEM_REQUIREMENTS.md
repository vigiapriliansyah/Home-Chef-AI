# 🖥️ System Requirements - Home Chef AI

Complete system specification guide for all Home Chef AI projects including web application, AI training pipeline, and API server.

## 📋 **Project Overview**

| Project | Technology Stack | Primary Use |
|---------|------------------|-------------|
| **Home Chef AI Web App** | Next.js 15, React 19, TypeScript, Prisma | Frontend & Backend Web Application |
| **AI Training Pipeline** | PyTorch, Transformers, LoRA, PEFT | Model Fine-tuning & Training |
| **AI API Server** | FastAPI, PyTorch, Uvicorn | Model Inference & API Serving |

---

## 💻 **Development Environment Specifications**

### 🔧 **Minimum Requirements (Based on Current Setup)**

| Component | Specification |
|-----------|---------------|
|  OS  | Windows 10/11| 
|  CPU  | Intel i5-10th gen | 
|  RAM  | 16GB DDR4 | 
|  Storage  | 1TB SSD |  
|  GPU  | RTX 3060 (12GB VRAM) | 
|  Network  | 50 Mbps+ |  

### 🚀 **Recommended Development Specs**

| Component | Specification |
|-----------|---------------|
|  OS  | Ubuntu 22.04 LTS / Windows 11 Pro |
|  CPU  | Intel® Core™ Ultra / AMD Ryzen™ AI |
|  RAM  | 128GB DDR4/DDR5 |
|  Storage  | 2TB NVMe SSD |
|  GPU  | NVIDIA RTX 5090 |
|  Network  | 1 Gbps+|

---

## 🎓 **AI Training Environment Specifications**

### ⚡ **Minimum Training Setup**

| Component | Specification | Use Case |
|-----------|---------------|----------|
| **CPU** | Intel i7-10th gen / AMD Ryzen 7 5700X | 8+ cores for data processing |
| **RAM** | 32GB DDR4 | Handle large datasets |
| **GPU** | NVIDIA RTX 3060 (12GB) / RTX 4060 Ti | Small model training (0.5B-1.5B params) |
| **VRAM** | 12GB+ | LoRA fine-tuning with batch size 1-2 |
| **Storage** | 1TB NVMe SSD | Fast dataset loading |
| **Cooling** | Good airflow, GPU temps <80°C | Sustained training sessions |

### 🔥 **Recommended Training Setup**

| Component | Specification | Use Case |
|-----------|---------------|----------|
| **CPU** | Intel i9-13th gen / AMD Ryzen 9 7900X | 12+ cores for parallel processing |
| **RAM** | 64GB DDR5 | Large batch sizes, complex datasets |
| **GPU** | NVIDIA RTX 4080 / RTX 4090 (24GB) | Medium to large model training |
| **VRAM** | 24GB+ | Larger batch sizes, faster training |
| **Storage** | 2TB NVMe SSD + 4TB HDD | Fast access + bulk storage |
| **PSU** | 850W+ 80+ Gold | Stable power for high-end GPU |

### 🏆 **Professional Training Setup**

| Component | Specification | Use Case |
|-----------|---------------|----------|
| **CPU** | Intel Xeon / AMD Threadripper | 16+ cores, enterprise reliability |
| **RAM** | 128GB+ ECC DDR5 | Large-scale training, stability |
| **GPU** | NVIDIA A6000 / H100 (48GB+) | Production model training |
| **VRAM** | 48GB+ | Large models, high batch sizes |
| **Storage** | 4TB NVMe SSD RAID | High-speed parallel I/O |
| **Network** | 10Gbps+ | Fast data transfer |

---

## 🚀 **Production Environment Specifications**

### 🌐 **Web Application Server**

#### **Minimum Production**
| Component | Specification | Notes |
|-----------|---------------|-------|
| **CPU** | 2 vCPU / 4 cores | Basic Next.js SSR |
| **RAM** | 4GB | Small user base |
| **Storage** | 50GB SSD | Application + logs |
| **Bandwidth** | 1TB/month | Basic traffic |
| **Concurrent Users** | 100-500 | Development/staging |

#### **Recommended Production**
| Component | Specification | Notes |
|-----------|---------------|-------|
| **CPU** | 4 vCPU / 8 cores | Smooth SSR performance |
| **RAM** | 8-16GB | Multiple processes |
| **Storage** | 100GB SSD | Assets + database |
| **Bandwidth** | 5TB/month | Production traffic |
| **Concurrent Users** | 1,000-5,000 | Small to medium scale |

### 🤖 **AI API Server**

#### **Minimum Inference**
| Component | Specification | Notes |
|-----------|---------------|-------|
| **CPU** | 4 vCPU / 8 cores | CPU-only inference |
| **RAM** | 8GB | Model loading |
| **Storage** | 20GB SSD | Model files |
| **GPU** | None (CPU mode) | Basic functionality |
| **Requests/min** | 10-50 | Light usage |

#### **Recommended Inference**
| Component | Specification | Notes |
|-----------|---------------|-------|
| **CPU** | 8 vCPU / 16 cores | Fast preprocessing |
| **RAM** | 16-32GB | Multiple model instances |
| **Storage** | 50GB SSD | Multiple model versions |
| **GPU** | NVIDIA T4 / RTX 4060 | GPU acceleration |
| **VRAM** | 8-16GB | Batch processing |
| **Requests/min** | 100-500 | Production scale |

### 💾 **Database Server**

#### **Minimum Database**
| Component | Specification | Notes |
|-----------|---------------|-------|
| **CPU** | 2 vCPU / 4 cores | SQLite/PostgreSQL |
| **RAM** | 4GB | Basic queries |
| **Storage** | 50GB SSD | Data + backups |
| **IOPS** | 1,000+ | Read/write performance |

#### **Recommended Database**
| Component | Specification | Notes |
|-----------|---------------|-------|
| **CPU** | 4 vCPU / 8 cores | Complex queries |
| **RAM** | 16GB | Query caching |
| **Storage** | 200GB SSD | Growth + backups |
| **IOPS** | 3,000+ | High-performance queries |

---

## 🛠️ **Software Requirements**

### **Development Environment**

| Software | Version | Purpose |
|----------|---------|---------|
| **Node.js** | 18.17+ | Next.js runtime |
| **Python** | 3.9-3.11 | AI training & API |
| **Git** | 2.30+ | Version control |
| **Docker** | 20.10+ | Containerization |
| **PostgreSQL** | 15+ | Production database |
| **Redis** | 7.0+ | Caching layer |

### **AI/ML Dependencies**

| Package | Version | Installation |
|---------|---------|-------------|
| **PyTorch** | 2.1.0+ | `pip install torch torchvision` |
| **Transformers** | 4.35.0+ | `pip install transformers` |
| **PEFT** | 0.6.0+ | `pip install peft` |
| **Datasets** | 2.14.0+ | `pip install datasets` |
| **FastAPI** | 0.104.0+ | `pip install fastapi uvicorn` |

### **GPU Drivers & CUDA**

| Component | Version | Notes |
|-----------|---------|-------|
| **NVIDIA Driver** | 545.29.06+ | Latest stable |
| **CUDA Toolkit** | 12.1+ | GPU acceleration |
| **cuDNN** | 8.9+ | Deep learning optimization |

---

## 🔍 **Performance Benchmarks**

### **Training Performance (Qwen2-0.5B Model)**

| Setup | Batch Size | Training Time (1 epoch) | Memory Usage |
|-------|------------|-------------------------|--------------|
| **RTX 3060 (12GB)** | 1 | ~45 minutes | 8-10GB VRAM |
| **RTX 4060 Ti (16GB)** | 2 | ~30 minutes | 12-14GB VRAM |
| **RTX 4080 (16GB)** | 4 | ~20 minutes | 14-16GB VRAM |
| **RTX 4090 (24GB)** | 8 | ~15 minutes | 20-22GB VRAM |

### **Inference Performance**

| Setup | Tokens/Second | Latency (256 tokens) | Concurrent Users |
|-------|---------------|---------------------|------------------|
| **CPU Only (8 cores)** | 5-10 | 25-50s | 1-2 |
| **RTX 3060** | 25-35 | 7-10s | 5-10 |
| **RTX 4060 Ti** | 40-60 | 4-6s | 10-20 |
| **RTX 4080** | 80-120 | 2-3s | 20-50 |

---

## 💰 **Cost Estimation**

### **Cloud Infrastructure (Monthly)**

#### **Development Environment**
| Service | Specs | Provider | Monthly Cost |
|---------|-------|----------|--------------|
| **Web Server** | 2 vCPU, 4GB RAM | AWS t3.medium | $30-40 |
| **Database** | 2 vCPU, 4GB RAM | AWS RDS | $25-35 |
| **Storage** | 100GB SSD | AWS EBS | $10-15 |
| **Total** | | | **$65-90** |

#### **Production Environment**
| Service | Specs | Provider | Monthly Cost |
|---------|-------|----------|--------------|
| **Web Servers (2x)** | 4 vCPU, 8GB RAM | AWS c5.xlarge | $120-160 |
| **AI API Server** | GPU instance | AWS p3.2xlarge | $800-1000 |
| **Database** | 4 vCPU, 16GB RAM | AWS RDS | $80-120 |
| **Load Balancer** | Application LB | AWS ALB | $20-30 |
| **Storage & CDN** | 500GB + CDN | AWS S3/CloudFront | $30-50 |
| **Total** | | | **$1,050-1,360** |

### **On-Premise Hardware**

#### **Development Workstation**
| Component | Recommended | Estimated Cost |
|-----------|-------------|----------------|
| **CPU** | AMD Ryzen 7 5800X | $200-250 |
| **RAM** | 32GB DDR4 | $100-150 |
| **GPU** | RTX 4060 Ti 16GB | $400-500 |
| **Storage** | 1TB NVMe SSD | $80-120 |
| **Motherboard** | B550 chipset | $100-150 |
| **PSU** | 750W 80+ Gold | $80-120 |
| **Case & Cooling** | Mid-tower + AIO | $100-150 |
| **Total** | | **$1,060-1,440** |

#### **Training Workstation**
| Component | Recommended | Estimated Cost |
|-----------|-------------|----------------|
| **CPU** | AMD Ryzen 9 7900X | $400-500 |
| **RAM** | 64GB DDR5 | $300-400 |
| **GPU** | RTX 4080 | $1,000-1,200 |
| **Storage** | 2TB NVMe SSD | $150-200 |
| **Motherboard** | X670 chipset | $200-300 |
| **PSU** | 850W 80+ Gold | $120-150 |
| **Case & Cooling** | Full tower + AIO | $150-200 |
| **Total** | | **$2,320-2,950** |

---

## 📦 **Deployment Recommendations**

### **Small Scale (Startup)**
- **Web App**: Vercel/Netlify (free tier)
- **Database**: Supabase/PlanetScale (free tier)
- **AI API**: Single GPU cloud instance
- **CDN**: Cloudflare (free tier)
- **Monitoring**: Basic logging
- **Cost**: $100-300/month

### **Medium Scale (Growing Business)**
- **Web App**: AWS/GCP with auto-scaling
- **Database**: Managed PostgreSQL with replicas
- **AI API**: Load-balanced GPU instances
- **CDN**: Enterprise CDN with edge caching
- **Monitoring**: Comprehensive APM
- **Cost**: $500-1,500/month

### **Large Scale (Enterprise)**
- **Web App**: Kubernetes cluster with HPA
- **Database**: High-availability cluster
- **AI API**: Auto-scaling GPU cluster
- **CDN**: Multi-region edge network
- **Monitoring**: Full observability stack
- **Cost**: $2,000-10,000+/month

---

## ⚠️ **Important Notes**

### **Hardware Compatibility**
- ✅ **NVIDIA GPUs**: Full CUDA support
- ⚠️ **AMD GPUs**: Limited PyTorch support
- ❌ **Intel Arc**: Not recommended for AI workloads
- ✅ **Apple Silicon**: Good for development, limited for training

### **Memory Considerations**
- **Training**: VRAM = Model Size × 4-6 (for gradients)
- **Inference**: VRAM = Model Size × 1.5-2 (for KV cache)
- **System RAM**: 2× VRAM for data loading

### **Storage Requirements**
- **Base Model**: ~1GB (Qwen2-0.5B)
- **Fine-tuned Model**: ~1.5GB (with adapters)
- **Dataset**: ~50MB-500MB (depending on size)
- **Dependencies**: ~5-10GB (PyTorch, etc.)
- **Logs & Checkpoints**: ~2-5GB per training run

### **Network Requirements**
- **Model Download**: 1-5GB (first time)
- **Dataset Download**: 50MB-1GB
- **Development**: 10Mbps sufficient
- **Production**: 100Mbps+ recommended