# Propeller GraphQL API Testing - Complete Setup Guide

Create the following directory structure in your `Propeller_qa` folder:

```
Propeller_qa/
├── package.json
├── jest.config.js
├── .gitignore
├── README.md
├── tests/
│   ├── setup.js
│   ├── users.query.test.js
│   ├── users.mutation.test.js
│   ├── albums.query.test.js
│   ├── albums.mutation.test.js
│   ├── error-handling.test.js
│   └── integration.test.js
└── .github/
    └── workflows/
        └── test.yml
```

## How to setup, clone the repository and get it ready for execute

### 1. First create a folder where you want your repository to be

### 2. Then open the terminal in that folder

### 3. Run git initilization 

    ```bash
    git init
    ```

### 4. Clone repository

    ```bash
    git clone https://github.com/KaloshevD/Propeller-QA
    ```

## Commands on how to run the project

Run these commands in your terminal to run the code:

### 1. Navigate to your cloned project directory
```bash
cd C:\Users\<YOUR_USER>\Desktop\Propeller_QA
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run tests
```bash
npm test
```

That should be it, some test fail others pass, you should be good.