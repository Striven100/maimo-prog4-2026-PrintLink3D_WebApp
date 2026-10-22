# GitHub y Vercel — PrintLink 3D local

## GitHub

El proyecto ya está preparado para alojarse directamente en GitHub.

Si trabajás desde una copia local:

```bash
git add .
git commit -m "feat: autenticacion y datos locales"
git push origin main
```

## Vercel

1. Entrá a Vercel.
2. Importá el repositorio de GitHub.
3. Vercel detectará Next.js automáticamente.
4. No agregues variables de Firebase.
5. No necesitás configurar una base de datos.
6. Hacé Deploy.

Cada push posterior a `main` puede disparar un nuevo deployment automáticamente.

## Datos locales en Vercel

Vercel solamente publica el código de la aplicación.

Los datos de usuarios se guardan dentro del navegador de cada visitante usando Web Storage. Vercel no almacena:

- cuentas,
- contraseñas,
- trabajos,
- propuestas,
- conversaciones,
- portfolio.

Esto significa que dos personas en dispositivos distintos **no comparten información**.

Para demostrar el flujo con dos usuarios, usá dos pestañas del mismo navegador. La base local es compartida entre las pestañas y la sesión es independiente en cada una.

## Variables de entorno

No son necesarias.

El archivo `.env.example` contiene solamente un nombre opcional de la aplicación.
