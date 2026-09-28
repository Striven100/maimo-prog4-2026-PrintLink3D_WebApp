# PrintLink 3D — Web App para Visual Studio Code

Aplicación web demo para buscar modelos 3D, cotizar impresiones, publicar solicitudes de trabajo, guardar trabajos como taller, enviar ofertas y aceptar ofertas.

Está preparada para abrir en Visual Studio Code, subir a GitHub y desplegar en Vercel.

## Tecnologías

- Next.js 14
- React 18
- CSS propio
- API Routes locales
- Persistencia demo con `localStorage`

## Funciones incluidas

- Ingreso demo para cambiar entre compra de impresiones y taller.
- API local con 20 modelos 3D.
- Búsqueda y filtros por texto, categoría y material.
- Detalle de modelo con peso, tiempo, material, licencia, autor y precio estimado.
- Cotizador por material, tiempo, subtotal, comisión y precio final.
- Publicación de solicitudes de impresión.
- Guardado de trabajos desde el taller.
- Envío de ofertas de impresión.
- Aceptación de ofertas desde la cuenta de compra.
- Pantalla de acuerdo/chat demo.
- Portfolio visual para taller.

## Estructura

```txt
src/
├─ app/
│  ├─ api/
│  │  ├─ models/route.js
│  │  ├─ models/[id]/route.js
│  │  └─ quote/route.js
│  ├─ globals.css
│  ├─ layout.jsx
│  └─ page.jsx
├─ .env.example
├─ .gitignore
├─ jsconfig.json
├─ next.config.mjs
├─ package.json
└─ README.md
```

## Probar localmente

1. Descomprimir el ZIP.
2. Abrir la carpeta en Visual Studio Code.
3. Abrir la terminal integrada.
4. Instalar dependencias:

```bash
npm install
```

5. Correr el servidor:

```bash
npm run dev
```

6. Abrir:

```txt
http://localhost:3000
```

## Probar la API

Todos los modelos:

```txt
http://localhost:3000/api/models
```

Buscar por texto:

```txt
http://localhost:3000/api/models?q=soporte
```

Filtrar por categoría:

```txt
http://localhost:3000/api/models?category=Miniaturas
```

Filtrar por material:

```txt
http://localhost:3000/api/models?material=PLA
```

Ver un modelo por ID:

```txt
http://localhost:3000/api/models/pl3d-001
```

Cotizador:

```txt
http://localhost:3000/api/quote?weightGrams=125&gramPrice=250&printHours=8&hourPrice=700&extras=1500&platformFeePercent=12
```

## Subir a GitHub

Crear un repositorio vacío en GitHub. Luego, dentro de la carpeta del proyecto:

```bash
git init
git add .
git commit -m "Initial PrintLink 3D web app"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/NOMBRE_DEL_REPO.git
git push -u origin main
```

También podés usar GitHub CLI:

```bash
gh auth login
gh repo create printlink3d-webapp --public --source=. --remote=origin --push
```

## Desplegar en Vercel

Opción desde la web:

1. Entrar a Vercel.
2. Elegir **Add New Project**.
3. Importar el repositorio de GitHub.
4. Vercel debería detectar Next.js automáticamente.
5. Build Command: `npm run build`.
6. Development Command: `npm run dev`.
7. Deploy.

Opción con Vercel CLI:

```bash
npm i -g vercel
vercel login
vercel
vercel --prod
```

## Variables de entorno

Esta versión no necesita tokens externos.

El archivo `.env.example` solo incluye:

```env
NEXT_PUBLIC_APP_NAME="PrintLink 3D"
```

Si luego agregás Apify, Supabase o una base de datos real, no subas `.env.local` a GitHub.

## Limitaciones

- El ingreso no autentica usuarios reales.
- Las publicaciones, trabajos guardados y ofertas se guardan en `localStorage`.
- `localStorage` vive en cada navegador/dispositivo.
- La API de modelos es local y mock.
- No hay pagos reales.
- No procesa archivos STL reales.
- No hay base de datos remota todavía.
