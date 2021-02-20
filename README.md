# Simple GraphQL Server/Playground

This repository consists of a simple GraphQL server with a couple local variables (owners and pets) acting as our database, for simplicity's sake. The purpose of this is to give anyone an already constructed GraphQL server to look through, play around with, and become familiar with. There is a fair amount of psuedocode within the server.js file in the repository explaining the parts of the code, as well as explaining how to use GraphQL's graphiql tool in your browser (analogous to Postman for a RESTful API) to make requests to the server and see what data you get back.

## Getting Started

(1) Fork the repo and clone it down to your computer.

(2) Open it in VS Code (or whatever IDE you use) like you normally would.

(3) In your terminal, from the root directory, run

```
npm install
```
(4) then run this to start your server
```
npm run start
```
(5) Look through the server.js file and read the psuedocode to become familiar with a simple GraphQL server and how it's constructed.

(6) Once done, type
```
localhost:8080/graphql
```
into your browser and hit ENTER. The GraphiQL tool should open up.

(7) Use the example queries that are commented out at the bottom of the server.js file in the GraphiQL tool in your browser to test out queries, mutations, see what data comes back, etc...

(8) Also, toward the top-right corner of the GraphiQL tool in your browser, there's a Docs tab. Click it and play around with it. It shows you, for the server, what root types exist (i.e. query and mutation, in our case), etc... This is especially useful for anyone using a GraphQL server they didn't set up, as it informs them what kinds of queries can be made and what information is available.

From here, you can play around with the queries/mutations, and even play around with the code in server.js.

Happy tinkering!