[![Build Status](https://travis-ci.org/andela-jare/CP3-DMS.svg?branch=development)](https://travis-ci.org/andela-jare/CP3-DMS)
[![Coverage Status](https://coveralls.io/repos/github/andela-jare/CP3-DMS/badge.svg?branch=feature%2F139453891%2Fapi-endpoints)](https://coveralls.io/github/andela-jare/CP3-DMS?branch=feature%2F139453891%2Fapi-endpoints)
[![Code Climate](https://codeclimate.com/github/andela-jare/CP3-DMS/badges/gpa.svg)](https://codeclimate.com/github/andela-jare/CP3-DMS)
# CP3-DMS
Document management system

This is a system (API) that manages documents with users and user roles. Each document defines access rights; the document defines which roles can access it. Also, each document specifies the date it was published and can have a type set for it. It is built with NodeJS, Express and Postgres.
Source code employs ES6 syntax traspiled down to ES5 using Babel.

Features

Below are some of its features:

Authentication

It uses JWT for authentication.
It generates a token and returns it to the client.
It verifies the token on every request.
It ensures a user is authenticated to access some routes.

Users

It allows users to be created.
It sets a newly created user's role to regular by default.
It allows the created user to edit, update and delete its information.
All users can be retrieved by the admin user.

Roles

It ensures that users have roles.
It ensures users roles could be admin or regular.
It ensures new roles can be created, updated and deleted by an admin user.
It returns all roles to an admin user.

Documents

It allows new documents to be created by authenticated users.
It ensures all documents have access roles defined.
It ensures newly created documents have it's access role set to public by default.
It allows admin users to retrieve all documents.
It allows private and public access documents to be retrieved by its owners.
It ensures only authenticated users can delete, edit and update documents they own.
It allows admin users to be able to delete any documents.

Installation

Clone the project repository
Run git clone https://github.com/andela-jare/CP3-DMS.git
Change directory into the CP3-DMS directory.
Run npm install to install the dependencies in the package.json file.
Run npm start to start the project.
Use Postman or any API testing tool of your choice to access the endpoints defined below.

Usage

Users Endpoint

To CREATE a user

Make a POST request to /users endpoint.
Send data with valid username, email, password, firstName and lastName attributes.
It returns a token and a few attributes of the created user.

To LOGIN a user

Make a POST request to /users/login endpoint.
Send data with valid email and password attributes.

To LOGOUT a user

Make a POST request to /users/logout endpoint.

To GET all users

Make a GET request to /users
Set an admin user's token in the authorization headers.
Use set({ 'x-access-token': <token> })

To GET a user

Make a GET request to /users/:id
Pass id of the user in the url parameters. Set the user's token in the authorization headers.

To UPDATE or DELETE a user

Make a PUT or DELETE request to /users/:id
Pass id of the user in the url parameters.
Set the user's token in the authorization headers. Send a valid updated data on a PUT request.

Roles Endpoint

To CREATE a role

Make a POST request to /roles endpoint.
Set an admin user's token in the authorization headers.
Send data with valid title attributes.

To GET all roles

Make a GET request to /roles
Set an admin user's token in the authorization headers.
Use set({ 'x-access-token': <adminToken> })

To GET a role

Make a GET request to /roles/:id
Pass id of the role in the url parameters.
Set the admin user's token in the authorization headers.

To UPDATE or DELETE a role

Make a PUT or DELETE request to /roles/:id
Pass id of the role in the url parameters.
Set the admin user's token in the authorization headers.
Send a valid updated data on a PUT request.

Documents Endpoint

To CREATE a document

Make a POST request to /documents endpoint.
Set a user's token in the authorization headers.
Send data with valid title and content attributes.

To GET all documents

Make a GET request to /documents
Set a user's token in the authorization headers.
Use set({ 'x-access-token': <token> })

To GET a document

Make a GET request to documents/:id
Pass id of the document in the url parameters.
Set a user's token in the authorization headers.

To UPDATE or DELETE a document

Make a PUT or DELETE request to /documents/:id
Pass id of the document in the url parameters.
Set a user's token in the authorization headers.
Send a valid updated data on a PUT request.

Inspired by TIA

Licence

ISC
Copyright (c) 2017 Jorg Are
