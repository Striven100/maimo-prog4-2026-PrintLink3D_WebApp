# Configurar Firebase para PrintLink 3D

Esta versión usa **Firebase Authentication** para las cuentas y **Cloud Firestore** para perfiles, trabajos, propuestas, guardados, portfolios y mensajes.

## 1. Crear el proyecto

1. Entrá a Firebase Console.
2. Creá un proyecto nuevo, por ejemplo `printlink3d`.
3. En la página del proyecto, agregá una aplicación **Web**.
4. Firebase te mostrará un objeto `firebaseConfig`.

## 2. Habilitar login con email y contraseña

En Firebase Console:

1. Abrí **Authentication**.
2. Entrá a **Sign-in method**.
3. Activá **Email/Password**.
4. Guardá.

Las contraseñas son administradas por Firebase Authentication. No deben guardarse en Firestore ni dentro del repositorio.

## 3. Crear Firestore

1. Abrí **Firestore Database**.
2. Elegí **Create database**.
3. Elegí una región razonable para tu proyecto.
4. Podés iniciar en modo bloqueado/production; luego se aplican las reglas incluidas en este repositorio.

## 4. Crear `.env.local`

Copiá `.env.example` y renombralo a `.env.local`.

Completá los valores con el `firebaseConfig` de tu aplicación Web:

```env
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="...firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="...firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="..."
```

Estas variables corresponden a la configuración pública de la aplicación Web de Firebase. La seguridad real de los datos depende de Authentication + Firestore Rules.

## 5. Aplicar las reglas de Firestore

Instalá Firebase CLI:

```bash
npm install -g firebase-tools
```

Ingresá a tu cuenta:

```bash
firebase login
```

Desde esta carpeta:

```bash
firebase use --add
```

Elegí el proyecto que creaste.

Después desplegá reglas e índices:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

## 6. Probar localmente

```bash
npm install
npm run dev
```

Abrí:

```txt
http://localhost:3000
```

Probá con dos cuentas distintas:

1. Cuenta tipo cliente.
2. Cuenta tipo taller/impresor.
3. Con el cliente, publicá un trabajo.
4. Con el taller, abrí el trabajo, guardalo y enviá una propuesta.
5. Volvé al cliente y aceptá la propuesta.
6. Abrí Mensajes desde ambas cuentas y enviá mensajes.

## 7. Recuperación de contraseña

La pantalla de login incluye **Olvidé mi contraseña**, que usa el email de Firebase Authentication para enviar el enlace de recuperación.

## 8. Dominio de Vercel

Cuando tengas la URL final de Vercel, revisá **Authentication → Settings → Authorized domains** en Firebase. Si tu dominio de producción no aparece, agregalo.
