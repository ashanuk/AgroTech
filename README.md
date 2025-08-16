# AgroTech 🌱

**AI-Powered Precision Farming Assistant**

AgroTech is a comprehensive digital platform designed to revolutionize agriculture by empowering farmers with cutting-edge technology, education, and community support. Our mission is to reduce the involvement of intermediate sellers and maximize farmer profits through smart, data-driven farming solutions.

## 🎯 Main Purposes

### 1. **Direct Market Access**

- Eliminate middlemen and intermediary sellers
- Connect farmers directly with consumers and buyers
- Maximize profit margins for farmers
- Transparent pricing and fair trade practices

### 2. **Smart Cultivation with AI/ML**

- AI-powered crop recommendation systems
- Weather-based cultivation planning
- Precision farming techniques
- Automated irrigation and farming schedules
- Yield prediction and optimization

### 3. **Agricultural Education Hub**

- Comprehensive crop information database
- Step-by-step growing guides
- Disease identification and treatment methods
- Best practices and modern farming techniques
- Expert tips and recommendations

### 4. **Community Support Platform**

- Farmer-to-farmer knowledge sharing
- Problem posting and solution sharing
- Expert advice and consultation
- Success stories and case studies
- Local farming community building

## 🚀 Main Features & Pages

### 📊 **Dashboard**

- Real-time farm analytics and insights
- Weather forecasts and alerts
- Task management and scheduling
- Profit tracking and financial overview

### 🤖 **AI Crop Recommendation**

- Smart crop selection based on:
  - Soil type and pH levels
  - Weather patterns and climate data
  - Market demand and pricing
  - Historical yield data
- Personalized farming plans

### 📅 **Task Calendar**

- Interactive farming calendar
- Planting, harvesting, and maintenance schedules
- Weather-based task recommendations
- Automated reminders and notifications
- Task tracking and completion status

### 🏪 **Marketplace**

- Direct buyer-seller connections
- Real-time market prices
- Product listing and management
- Order tracking and fulfillment
- Payment processing and transactions

### 📚 **Education Center**

- Crop encyclopedia with detailed guides
- Video tutorials and demonstrations
- Disease and pest identification
- Treatment methods and solutions
- Sustainable farming practices

### 💬 **Community Forum**

- Post farming problems and questions
- Expert and peer responses
- Knowledge sharing and discussions
- Local farming groups and networks
- Success story sharing

### 📈 **Analytics & Reports**

- Yield tracking and analysis
- Profit/loss statements
- Market trend analysis
- Performance comparisons
- Data-driven insights

## 🛠 Tech Stack

### **Frontend**

- **Framework**: Next.js 14 (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React
- **State Management**: React Hooks
- **Date Handling**: date-fns

### **Backend**

- **Framework**: FastAPI (Python)
- **Language**: Python 3.8+
- **API**: RESTful APIs with automatic documentation
- **Authentication**: JWT-based authentication

### **AI/ML Components**

- **Machine Learning**: Scikit-learn, TensorFlow
- **Data Processing**: Pandas, NumPy
- **Weather API Integration**: OpenWeatherMap
- **Crop Recommendation Models**: Custom ML algorithms

### **Database & Storage**

- **Database**: PostgreSQL / MongoDB
- **File Storage**: Local storage / Cloud storage
- **Data Caching**: Redis (optional)

### **Additional Tools**

- **API Documentation**: FastAPI automatic docs
- **Package Management**: npm (Frontend), pip (Backend)
- **Development**: Hot reload, TypeScript support
- **Version Control**: Git

## 🚀 How to Run

### **Prerequisites**

- Node.js 18+
- Python 3.8+
- Git

## Frontend .env template
```
MONGODB_URI= 
AUTH_TRUST_HOST=true
```
## Server .env template
```
MONGODB_URI
PORT
NODE_ENV
JWT_SECRET
FRONTEND_URL
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET 
```
### **Frontend Setup**

1. **Clone the repository**

   ```bash
   git clone https://github.com/ashanuk/AgroTech.git
   cd AgroTech
   ```

2. **Install frontend dependencies**

   ```bash
   cd frontend
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run the frontend development server**

   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

### **Backend Setup**

1. **Navigate to backend directory**

   ```bash
   cd backend/AIbakend
   ```

2. **Create virtual environment**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install backend dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Run the backend server**

   ```bash
   uvicorn app.main:app --reload
   ```

   The backend API will be available at `http://localhost:8000`
   API documentation at `http://localhost:8000/docs`

### ** GraphQL server setup**

1. **Navigate to forum API directory**

   ```bash
   cd backend/server
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up database and environment**

   ```bash
   # Configure your database connection in config files
   npm run setup-db
   ```

4. **Start the forum API server**
   ```bash
   npm start
   # Or for development: npm run dev
   ```

## 📁 Project Structure

```
AgroTech/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── lib/            # Utility functions and configurations
│   │   └── models/         # Data models and types
│   └── public/             # Static assets
├── backend/
│   ├── AIbakend/           # FastAPI AI/ML backend
│   │   ├── app/            # Main application code
│   │   ├── data/           # Training data and datasets
│   │   └── model/          # Trained ML models
│   └── server/          # Node.js graphql API
└── README.md
```

## 🌟 Key Benefits

- **🌾 Increased Farmer Profits**: Direct market access eliminates middleman costs
- **🤖 Smart Farming**: AI-driven decisions improve yield and reduce costs
- **📚 Knowledge Empowerment**: Educational resources enhance farming skills
- **🤝 Community Support**: Peer-to-peer learning and problem-solving
- **📊 Data-Driven Insights**: Analytics help optimize farming operations
- **🌍 Sustainable Agriculture**: Promotes eco-friendly farming practices


## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and queries:

- Create an issue in this repository
- Contact our development team
- Join our community forum

---

**Built with ❤️ for farmers worldwide** 🌍🚜
