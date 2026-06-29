# Project setup

This template should help get you started developing. Run the following code to clone the project in your machine:

```sh
git clone https://gitlab.com/tiagofviana/construction-management.git
```

## Recommended IDE

[VSCode](https://code.visualstudio.com/)

## 🛠️ Languages

Make sure you have the following programs correctly installed:

- NodeJS 22.17.0
- Python 3.12.6

> **IMPORTANT:** To end the execution of commands that are in watch mode, simply press `CTRL + C` in the corresponding terminal.

### Node

Install node dependencies:

```sh
npm install
```

#### Tailwind

Generate the CSS file in watch mode:

```sh
npm run styles-dev
```

#### [Esbuild](https://esbuild.github.io/)

Compile and minify some javascript files in watch mode:

```sh
npm run build-dev
```

#### Type check

Type check the typescript in watch mode:

```sh
npm run type-check
```

#### [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Python

> **IMPORTANT:** See how to invoke the Python terminal. These instructions refer to the name "python"

In the project directory, create the python virtual environment:

```sh
python -m venv venv
```

Activate it with:

```sh
. .\venv\Scripts\activate
```

Note that `(env)` will appear at the prompt. This indicates that the terminal is running in a virtual environment.

Install python dependencies:

```sh
pip install -r ./requirements-dev.txt
```

Access the `\src\back-end` folder:

```sh
cd .\src\back-end
```

Create the `.env` file and add the environment variables listed below with their respective keys:

```
DJANGO_LOG_LEVEL=DEBUG
DJANGO_SECRET_KEY=<your-key>
DJANGO_ALLOWED_HOSTS=*
DJANGO_CSRF_TRUSTED_ORIGINS=https://*


# Email
EMAIL_PORT=<port>
EMAIL_HOST_USER=<email>
EMAIL_HOST_PASSWORD=<password>
DJANGO_ADMINS=Admin <admin-email>

```

Create the database with:

```sh
python manage.py migrate
```

## 🛠️ Run the project

```sh
python manage.py runserver
```

Browse it at <a href="http://127.0.0.1:8000/">http://127.0.0.1:8000/</a>
