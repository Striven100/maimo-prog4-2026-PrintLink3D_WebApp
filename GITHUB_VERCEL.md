# Subir PrintLink 3D a GitHub y Vercel

## Parte A — GitHub

### 1. Crear repositorio

En GitHub creá un repositorio vacío, por ejemplo:

```txt
printlink3d
```

No hace falta que GitHub agregue README o `.gitignore`, porque el proyecto ya los incluye.

### 2. Abrir la terminal de VS Code

Parado en la carpeta del proyecto:

```bash
git init
git add .
git commit -m "feat: PrintLink 3D funcional con Firebase"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/printlink3d.git
git push -u origin main
```

### 3. No subir `.env.local`

`.gitignore` ya excluye `.env.local`.

Nunca subas contraseñas, claves privadas ni archivos de service account al repositorio.

---

## Parte B — Vercel

### 1. Importar el repositorio

1. Entrá a Vercel.
2. Elegí **Add New → Project**.
3. Importá tu repositorio de GitHub.
4. Vercel debería detectar **Next.js** automáticamente.
5. Dejá los comandos de build por defecto.

### 2. Agregar variables de entorno

En el proyecto de Vercel:

**Settings → Environment Variables**

Agregá las seis variables del archivo `.env.example`:

```txt
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

Usá los mismos valores de tu `.env.local`.

Aplicá las variables a Production y, si querés probar branches, también a Preview.

### 3. Deploy

Hacé Deploy o Redeploy después de agregar las variables.

Después, cada push a `main` volverá a desplegar la versión de producción automáticamente si mantenés la integración GitHub ↔ Vercel.

---

## Parte C — Firebase en producción

No tenés que mover los datos a Vercel. Vercel sirve la aplicación Next.js y los usuarios se conectan directamente al proyecto Firebase configurado.

Asegurate de haber desplegado `firestore.rules` antes de compartir la aplicación públicamente.

## Flujo de verificación final

Después de publicar:

1. Registrá una cuenta cliente.
2. Registrá una segunda cuenta como taller.
3. Cliente: publicar solicitud.
4. Taller: guardar trabajo y enviar propuesta.
5. Cliente: aceptar propuesta.
6. Ambas cuentas: probar el chat.
7. Recargar la página y comprobar que la información siga ahí.
