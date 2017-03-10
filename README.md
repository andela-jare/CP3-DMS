[![Build Status](https://travis-ci.org/andela-jare/CP3-DMS.svg?branch=development)](https://travis-ci.org/andela-jare/CP3-DMS)
[![Coverage Status](https://coveralls.io/repos/github/andela-jare/CP3-DMS/badge.svg?branch=development)](https://coveralls.io/github/andela-jare/CP3-DMS?branch=development)
[![Code Climate](https://codeclimate.com/github/andela-jare/CP3-DMS/badges/gpa.svg)](https://codeclimate.com/github/andela-jare/CP3-DMS)

# CP3-DMS
## Document management system

This is a system (API) that manages documents with users and user roles. Each document defines access rights; the document defines which roles can access it. Also, each document specifies the date it was published. It is built with NodeJS, Express and Postgres as it's database.
Source code employs ES6 syntax traspiled down to ES5 using Babel.


### Features

Below are some of its features:

#### Authentication

- It uses JWT for authentication.
- It generates a token and returns it to the client.
- It verifies the token on every request.
- It ensures a user is authenticated to access some routes.

#### Users

- It allows users to be created.
- It sets a newly created user's role to regular by default.
- It allows the created user to edit, update and delete its information.
- All users can be retrieved.
- It allows an admin create an admin user.
- An admin can also update a regular user to an admin status.

#### Roles

- It ensures that users have roles.
- It ensures users roles can be atleast an admin or regular role.
- It ensures new roles can be created, updated and deleted by an admin user.
- It returns all roles to an admin user.

#### Documents

- It allows new documents to be created by authenticated users.
- It ensures all documents have access roles defined.
- It ensures newly created documents have it's access role set to public by default.
- It allows admin users to retrieve all documents.
- It allows private, public and role access documents to be retrieved by its owners.
- It ensures only authenticated users can delete, edit and update documents they own.
- It allows admin users to be able to update and delete any document.

---
### Postman Collection
[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/238b94f40ca6e8e195d7)

### Hosted App on Heroku
[Heroku Link](https://cp3-dms.herokuapp.com)

---


### Usage

**Users**

Request type | Endpoint | Action
------------ | -------- | ------
**POST** | /users | Sign up user
**GET** | /users | Get all users
**GET** | /users/:id | Get details of a specific user
**PUT** | /users/:id | Edit user details
**DELETE** | /users/:id | Remove a user from database
**GET** | /login | To log a user in
**GET** | /logout | To log a user out
**GET** | /users/:id/documents | Retrieve all documents created by a user

**Roles**

Request type | Endpoint | Action
------------ | -------- | ------
**POST** | /roles | Create a new role
**GET** | /roles | Get all created roles
**GET** | /role/:id | Get a specific role
**PUT** | /role/:id | Edit a specific role
**DELETE** | /role/:id | Delete a specific role

**Documents**

Request type | Endpoint | Action
------------ | -------- | ------
**POST** | /documents | Create a new document
**GET** | /documents | Retrieve all documents
**GET** | /documents/:id | Retrieve a specific document
**GET** | /documents/search?search=new | Search documents using query
**PUT** | /documents/:id | Update a specific document
**DELETE** | /documents/:id | Delete a specific document from database

### Technologies Used
---
- JavaScript (ES6)
- Node.js
- Express
- Postgresql
- Sequelize ORM.

### Installation
---

- Clone the project repository.
- Run git clone https://github.com/andela-jare/CP3-DMS.git.
- Change directory into the CP3-DMS directory.
- Run npm install to install the dependencies in the package.json file.
- Run npm run start:dev to start the project for development.
- Run npm start to start the project for production.
- Use Postman or any API testing tool of your choice to access the endpoints defined above.

#### Contributing
---

1. Fork this repositry to your account.
2. Clone your repositry: git clone https://github.com/andela-jare/CP3-DMS.git
3. Create your feature branch: git checkout -b new-feature
4. Commit your changes: git commit -m "did something"
5. Push to the remote branch: git push origin new-feature
6. Open a pull request.

#### Licence
ISC

Copyright (c) 2017 Jorg Are
