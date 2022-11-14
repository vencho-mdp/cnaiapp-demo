# CNAI Web App

## Desarrollo

Para el startup de la aplicación **en desarrollo**, es necesario usar los siguientes comandos teniendo Node y NPM

```bash
# install dependencies
$ npm run install

# serve with hot reload at localhost:3000 
$ npm run dev
```

También es necesario tener Postgresql y crear un archivo `.env`

```dosini
BASE_URL=http://localhost:3000
DATABASE_NAME=cnaiapp
USER=benic
password=null
ACCESS_TOKEN_SECRET=a3cc3ab9dcf71bb2c1bd8a1b6c48f27c8214e1312e76390af7fe791ba1b254263956b307dba4c4dff52665d336c56b24a4e29213d04b6eac4de2e098dbfc9305
REFRESH_TOKEN_SECRET=50488b6de8fd5cb73a99600da8177a40e5734dc0c1bc38f811c62dba20111b78e291e0a1bf9687ab01284acae7051748883e70ed03bc27464c2b0810ea563e5f
EMAIL_PASS=null
EMAIL=beniciocardozomdp@gmail.com
DATABASE_URL=postgres://benic:null@localhost:5432/cnaiapp
# Add ?sslmode=disable if not using with ssl
```

## Tech Stack

### Frontend
[Vue](https://vuejs.org/)  
[Nuxt](https://nuxtjs.org/docs/)    
[Tailwindcss](https://tailwindcss.com/docs/)

### Backend
[Knex](https://knexjs.org/)  
[Express](https://expressjs.com/)  
[Postgresql](https://www.postgresql.org/)

## Dir Structure
| Carpeta  |  Información |
|---|---|
| Assets | https://nuxtjs.org/docs/directory-structure/assets |
| Components | https://nuxtjs.org/docs/directory-structure/components |
| Layouts | https://nuxtjs.org/docs/directory-structure/layouts |
| Middleware | https://nuxtjs.org/docs/directory-structure/middleware |
| Pages | https://nuxtjs.org/docs/directory-structure/pages |
| Plugins | https://nuxtjs.org/docs/directory-structure/plugins |
| Static | https://nuxtjs.org/docs/directory-structure/static |
| Store | https://nuxtjs.org/docs/directory-structure/store |
| API | Contiene código que se ejecutará únicamente desde el servidor. Las capas son: Route Handler -> Controller -> Service -> DAO. Para ejecutar migraciones (desde el root): ```npx knex migrate:latest --knexfile=api/db/knexfile.js```. Para ejecutar las seeds (data inicial para la aplicación)  ```npx knex seed:run --knexfile=api/db/knexfile.js``` |
