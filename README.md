# Node.js Typescript Express MySQL Prisma Keycloak Example

This repository provides an example implementation of using Node.js, TypeScript, Express, MySQL, Prisma, and Keycloak together. It demonstrates how to set up a basic web application that integrates authentication and authorization with Keycloak and interacts with a MySQL database using Prisma as the ORM.

## Prerequisites
Before running this application, ensure that you have the following prerequisites installed:

Docker 
Docker Compose 

## Installation
Clone the repository:

```bash
git clone https://github.com/your-username/your-repo.git
```
Build and run the Docker containers:

```bash
cd your-repo
docker-compose up --build
```

## Access the application:

The application should now be running and accessible at http://localhost:3000.

## Configuration
The application's configuration can be adjusted using environment variables defined in the .env file located in the root of the project. The following variables are available:

```environment
# Database configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your-database-name
DB_USER=your-database-username
DB_PASSWORD=your-database-password

# Keycloak configuration
KEYCLOAK_URL=http://localhost:8080/auth
KEYCLOAK_REALM=your-realm
KEYCLOAK_CLIENT_ID=your-client-id
KEYCLOAK_CLIENT_SECRET=your-client-secret
```

## Usage

The application uses Prisma to interact with the MySQL database. You can find the Prisma client in the prisma directory.
The main application logic can be found in the src directory.
The src/routes directory contains the Express routes.
Keycloak authentication is implemented in the src/middleware/keycloakProtect.ts file.

Feel free to explore the code and modify it to fit your specific requirements.

## Contributing
Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## License
This project is licensed under the [MIT License](https://opensource.org/license/mit/).
