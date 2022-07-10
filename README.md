# CNAI Web App

## Desarrollo

Para el startup de la aplicación **en desarrollo**, es necesario usar los siguientes comandos teniendo Node y NPM instalados (_probado en Powershell_):

```bash
# install dependencies
$ npm run install

# serve with hot reload at localhost:3000 
$ npm run dev
```

También es necesario tener Postgresql en tu equipo y crear un archivo `.env`
de la siguiente manera:

```dosini
BASE_URL=http://localhost:3000
DATABASE_NAME=Ceni_application
USER=benic
password=null
ACCESS_TOKEN_SECRET=a3cc3ab9dcf71bb2c1bd8a1b6c48f27c8214e1322e76390af7fe791ba1b254263956b307dba4c4dff52665d336c56b24a4e29213d04b6eac4de2e098dbfc9305
REFRESH_TOKEN_SECRET=50488b6de8fd5cb73a99600da8177a40e5734dc0c1bc38f811c62dba20111b78e291e0a1bf9687ab01284acae7051748883e70ed03bc27464c2b0810ea563e5f
EMAIL_PASS=null
EMAIL=beniciocardozomdp@gmail.com
DATABASE_URL=postgres://benic:null@localhost:5432/Ceni_application
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

## Estructura de Directorio  
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
| API | Contiene código que se ejecutará únicamente **desde el servidor**. Las capas son: Route Handler -> Controller -> Service -> DAO.  DB -> Conexión a la base de datos  DB / Migrations -> Migraciones. Para ejecutarlas: ```npx knex migrate:latest --knexfile=api/db/knexfile.js``` DB / Seeds -> Data inicial para la aplicación. Para ejecutarlas: ```npx knex seed:run --knexfile=api/db/knexfile.js``` |