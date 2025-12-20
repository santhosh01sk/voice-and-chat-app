# Project Setup Instructions

## 1. Frontend (React + Vite)
You have successfully started the frontend!
It runs at: `http://localhost:5173`

To restart it anytime:
```powershell
cd frontend
npm install
npm run dev
```

## 2. Backend (Spring Boot)
The backend requires **Apache Maven** to build and run.
Since `mvn` is not recognized on your system, you have two options:

### Option A: Install Maven (Recommended)
1. Download Maven: [https://maven.apache.org/download.cgi](https://maven.apache.org/download.cgi)
   - Download the "Binary zip archive".
2. Extract it to a folder (e.g., `C:\Program Files\Maven`).
3. Add the `bin` folder to your System PATH environment variable.
4. Restart your terminal (VS Code users: restart VS Code).
5. Verify with `mvn -v`.
6. Run the app:
   ```powershell
   cd backend
   mvn spring-boot:run
   ```

### Option B: Use an IDE
Open the `backend` folder in **IntelliJ IDEA** or **Eclipse**. These IDEs usually come with Maven built-in and can run the project without manual installation.
