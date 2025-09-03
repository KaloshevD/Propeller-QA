# Propeller GraphQL API Testing - Setup Guide

## How to setup, clone the repository and get it ready for execute

#### 1. First create a folder where you want your repository to be

#### 2. Then open the terminal in that folder

#### 3. Run git initilization 

```bash
git init
```

### 4. Clone repository

 ```bash
 git clone https://github.com/KaloshevD/Propeller-QA
 ```

### 5. Navigate to your cloned project directory (Change your_user to the user setup on your Windows

```bash
cd C:\Users\<YOUR_USER>\Desktop\Propeller_QA
```
You created the following folder structure

```
PROJECT_FOLDER_NAME/
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
        └── workflow.yml
```

## Commands on how to run the project

Run these commands in your terminal to run the code:

#### 1. If not already navigated to your cloned project directory, if already there COOL COOL 👍 skip it this first step!
```bash
cd C:\Users\<YOUR_USER>\Desktop\Propeller_QA
```

#### 2. Install dependencies
```bash
npm install
```

#### 3. Run tests
```bash
npm test or npx jest (a direct call)
```

I believe that should be it, some test fail others pass, you should be good.


## CI/CD
A GitHub Actions workflow is included in .github/workflows/main.yml.
It runs the tests automatically:

On every push or pull request to master, it just works
