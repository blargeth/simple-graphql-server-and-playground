const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList, GraphQLNonNull } = require('graphql');

const app = express();

// OUR "DATABASE"
// The "owners" and "pets" variables below are storing our data locally, so as to avoid having to set up a database for this simple server. Notice the relationship between "owners" and "pets," where each pet has an owner indicated by the ownerId. I will refer to each of these variables as 'collections' (i.e. the pets collection and owners collection).
const owners = [
  { id: 1, name: 'Joey Calamad' },
  { id: 2, name: 'Johnny Basanagol' },
  { id: 3, name: 'Vinny Gabagool' },
  { id: 4, name: 'Bob' }
];
const pets = [
  { id: 1, name: 'Groucho Barks', ownerId: 1 },
  { id: 2, name: 'Bark Twain', ownerId: 4 },
  { id: 3, name: 'Kanye Westie', ownerId: 1 },
  { id: 4, name: 'Mary Puppins', ownerId: 2 },
  { id: 5, name: 'Jimmy Chew', ownerId: 4 },
  { id: 6, name: 'Snoop Dog', ownerId: 3 },
  { id: 7, name: 'Dogzilla', ownerId: 3 },
  { id: 8, name: 'Pup Tart', ownerId: 4 },
  { id: 9, name: 'Chew-barka', ownerId: 3 },
  { id: 10, name: 'Meatball', ownerId: 1 }
]

// FOR OUR OWNERS COLLECTION AND PETS COLLECTION ABOVE, WE MUST SET UP CORRESPONDING "TYPES," AS FOLLOWS

// We must set up a 'PetType' (an instance of GraphQLObjectType) for our pets collection. If you look at the fields method below, each pet has an id, name, and ownerId, and a given pet's owner is indicated where owner.id === pet.ownerId.
const PetType = new GraphQLObjectType({
  name: 'Pet',
  description: 'This represents a pet owned by an owner',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    ownerId: { type: GraphQLNonNull(GraphQLInt) },
    owner: {
      type: OwnerType,
      resolve: (pet) => {
        return owners.find(owner => owner.id === pet.ownerId)
      }
    }
  })
})

// We must set up an 'OwnerType' (an instance of GraphQLObjectType) for our owners collection. If you look at the fields method below, each owner has an id and name, and a given owner's pet is indicated where pet.ownerId === owner.id.
const OwnerType = new GraphQLObjectType({
  name: 'Owner',
  description: 'This represents an owner of a pet',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    pets: {
      type: new GraphQLList(PetType),
      resolve: (owner) => {
        return pets.filter(pet => pet.ownerId === owner.id)
      }
    }
  })
})

// NOW THAT WE'RE DONE SETTING UP EACH "TYPE" FOR EACH COLLECTION, WE CAN SET UP THE KINDS OF REQUESTS WE CAN MAKE TO OUR SERVER. ONE KIND OF REQUEST BELOW WILL BE A "QUERY," WHICH FUNCTIONS LIKE A GET REQUEST (IN A REST API), GRABBING AND RETURNING DATA FROM THE DATABASE. THE OTHER KIND OF REQUEST WE WILL SET UP WILL BE A "MUTATION," WHICH FUNCTIONS LIKE A POST REQUEST (IN A REST API), ADDING DATA TO THE DATABASE FOR YOU.
// IN OUR CASE, THE "DATABASE" CONSISTS OF THE OWNERS AND PETS VARIABLES ABOVE.

// This allows the frontend to make queries to our server to retrieve data from the database (like a GET request). If you look within the fields method, it indicates we could query for a single pet (and the args indicates we'll have to provide an id for the pet), we could query for all the pets, we could query for a single owner (and the args indicates we'll have to provide an id for the owner), and we could query for all the owners. Queries can also consist of a mixture of these things (e.g. can query for all the owners and for each of them, show all their pets). Some of the query examples at the bottom of this file demonstrate this.
const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    pet: {
      type: PetType,
      description: 'A single pet',
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent, args) => pets.find(pet => pet.id === args.id)
    },
    pets: {
      type: new GraphQLList(PetType),
      description: 'A list of all pets',
      resolve: () => pets
    },
    owner: {
      type: OwnerType,
      description: 'A single owner',
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent, args) => owners.find(owner => owner.id === args.id)
    },
    owners: {
      type: new GraphQLList(OwnerType),
      description: 'A list of all owners',
      resolve: () => owners
    },
  }),
});

// This allows the frontend to make "mutation" requests to our server to add data to our database (like a POST request). If you look within the fields method, it indicates we could add a new pet (and the args indicates we'll have to provide a name and ownerId for the newly created pet), and we can add a new owner (and the args indicates we'll have to provide a name for the newly created owner).
const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root Mutation',
  fields: () => ({
    addNewPet: {
      type: PetType,
      description: 'Add a new pet',
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        ownerId: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parent, args) => {
        const pet = {
          id: pets.length + 1,
          name: args.name,
          ownerId: args.ownerId
        };
        pets.push(pet);
        return pet;
      }
    },
    addNewOwner: {
      type: OwnerType,
      description: 'Add a new owner',
      args: {
        name: { type: GraphQLNonNull(GraphQLString) }
      },
      resolve: (parent, args) => {
        const owner = {
          id: owners.length + 1,
          name: args.name
        };
        owners.push(owner);
        return owner;
      }
    }
  })
})

// WITH THE ABOVE REQUEST TYPES FINISHED...

// We create our schema here, as so
const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
});

// We set up an endpoint for our requests (GraphQL is characterized by having only one endpoint, and the data you get not being a function of having multiple endpoints, but rather being dictated by the query/queries you formulate in the front-end, so you can get the data you want, nothing more and nothing less)...
app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true // allows us to use the GraphiQL tool (analogous to Postman, except for GraphQL) to manually issue GraphQL queries. This tool comes up when you go to this endpoint in your browser.
}));

// ... and listen on port 8080 in this case
app.listen(8080, () => {
  console.log('Running a GraphQL API server at http://localhost:8080/graphql');
});

// AT THIS POINT YOU CAN START YOUR SERVER ('npm install' and then 'npm run start' in your terminal from this repo's root directory if you haven't done so already), THEN TYPE localhost:8080/graphql INTO YOUR BROWSER, HIT ENTER, AND THE GRAPHIQL TOOL (a tool like Postman, allowing you to make HTTP requests without having a built-out frontend) WILL POP UP IN YOUR BROWSER, WHERE YOU CAN TRY OUT VARIOUS QUERIES AND MUTATIONS AND SEE WHAT DATA YOU GET BACK FROM THIS SERVER.

// YOU CAN USE THE QUERIES/MUTATIONS BELOW IN THE GRAPHIQL TOOL IN YOUR BROWSER TO GET YOU STARTED. YOU CAN ONLY RUN ONE QUERY/MUTATION AT A TIME, SO MAKE SURE THE OTHERS ARE COMMENTED OUT BEFORE YOU HIT THE RUN BUTTON IN THE GRAPHIQL TOOL (in the event you copy and paste all of the below in the tool at once, which is fine). FROM THERE YOU CAN JUST PLAY AROUND WITH THE QUERIES/MUTATIONS, AND THEN MAYBE EVEN PLAY AROUND WITH THE ABOVE CODE TO MODIFY THE SERVER AND THUS THE QUERIES/MUTATIONS YOU CAN MAKE.

// LASTLY IN THE GRAPHIQL TOOL IN YOUR BROWSER, IN THE TOP RIGHT IS A "DOCS" TAB. CLICK ON THAT AND PLAY AROUND WITH IT. IT SHOWS YOU, FOR YOUR SERVER, WHAT ROOT TYPES EXIST, WHAT FIELDS EXISTS IN THOSE, WHAT FIELDS EXISTS WITHIN THOSE FIELDS, ETC..., INFORMING THE KINDS OF QUERIES THAT ARE POSSIBLE AND WHAT INFORMATION EXISTS. THIS IS ESPECIALLY USEFUL IF YOU'RE USING A GRAPHQL SERVER THAT YOU DIDN'T CREATE AND ARE THEREFORE NOT FAMILIAR WITH.

// SAMPLE QUERIES FOR GRAPHIQL TOOL IN YOUR BROWSER. ONLY RUN ONE AT A TIME, MAKING SURE THE OTHERS ARE COMMENTED OUT IN THE EVENT YOU COPY AND PASTE ALL OF THE BELOW AT ONCE INTO GRAPHIQL.

/*

query {
  pets {
    id
    name
  }
}

query {
  pets {
    ownerId
    owner {
      name
    }
  }
}

query {
  owners {
    name
  }
}

query {
  owners {
    id
    name
    pets {
      name
    }
  }
}

query {
  pet(id: 1) {
    id
    name
    owner {
      name
    }
  }
}

query {
  owner(id: 3) {
    id
    name
    pets {
      name
    }
  }
}

mutation {
  addNewPet(name: "Lucky", ownerId: 2) {
    name
    id
  }
}

{
  pets {
    name
    id
  }
}

mutation {
  addNewOwner(name: "This guy") {
    name
    id
  }
}

{
  owners {
    name
    id
  }
}

*/
