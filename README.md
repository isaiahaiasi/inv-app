# INV-APP

## Inventory app project

A simple e-commerce CRUD app made using Node, Express, MongoDB (Mongoose), and Handlebars.

Server hosted on Heroku, database hosted on Atlas, and images hosted on Cloudinary.

[Explore the site here!](https://inv-app-top.herokuapp.com/)

## Build local version

```sh
git clone https://github.com/isaiahaiasi/inv-app.git
cd inv-app
npm install
npm run tailwind:css # Generate tailwind styles file

# Set the following ENV variables:
# ADMIN_PW: Password to confirm database changes (Create, Update, Delete)
# CLOUDINARY_URL: Cloudinary API URL, to store and retrieve uploaded images
# MONGODB_URI: MongoDB API URL, to access your database server.

npm run dev # run in dev mode on localhost:3000
```

## Reflection

With this project, I decided to really experiment with several technologies for the first time:

- Handlebars, a server-side view layer
- TailwindCSS, an atomic css library
- Cloudinary, an image hosting service

This is also my first project using NodeJS and Express.

### Front-End

I made the poor choice of experimenting with both Handlebars and Tailwind at the same time. Tailwind expects you to organize your UI into components, whereas Handlebars is a very simple, "logicless" view layer with only rudimentary support for organizing the UI into components. Both are very interesting, but they are less than the sum of their parts when combined.

### Promises

When first learning Node, the tutorials I went through used the older callback-driven approach to asynchronous code. For this project, I chose to use the more modern Promise-driven approach. However, organizing promises in a clean way proved to be a challenge, and one big thing I could definitely improve is the organization and DRY-ness of the Promise-based code.
