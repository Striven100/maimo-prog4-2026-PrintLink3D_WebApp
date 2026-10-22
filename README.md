# PrintLink 3D — versión funcional con Firebase

Plataforma web para conectar personas que necesitan una impresión 3D con talleres/impresores capaces de producirla.

## Qué cambia respecto del MVP

- Ya no existe un selector artificial de “modo cliente / trabajador”.
- Cada persona crea una cuenta con **email y contraseña** usando Firebase Authentication.
- El rol se elige una vez durante el registro: `client` o `worker`.
- Los trabajos, propuestas, guardados, perfiles, portfolio y mensajes viven en Cloud Firestore.
- El chat es persistente y usa listeners en tiempo real.
- La API local incluye 20 modelos 3D con imágenes SVG propias, peso, tiempo, material y precio orientativo.
- Diseño responsive con rutas separadas y navegación específica según el tipo de cuenta.

## Funciones principales

### Cuenta cliente

- Crear cuenta e iniciar sesión.
- Explorar modelos 3D.
- Abrir ficha técnica de un modelo.
- Publicar una solicitud desde un modelo o desde cero.
- Ver sus solicitudes.
- Recibir propuestas de talleres.
- Comparar propuestas.
- Aceptar una propuesta.
- Abrir chat privado con el taller elegido.
- Recuperar contraseña por email.
- Editar datos del perfil.

### Cuenta taller / impresor

- Crear cuenta e iniciar sesión.
- Ver trabajos abiertos.
- Guardar trabajos para revisar después.
- Enviar una propuesta con precio, material, entrega y notas.
- Ver el estado de sus propuestas.
- Recibir el trabajo cuando el cliente acepta.
- Usar el chat del trabajo.
- Actualizar el estado del trabajo aceptado.
- Crear un portfolio persistente.
- Editar ubicación, materiales y tarifas base.

## Tecnologías

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Firebase Authentication
- Cloud Firestore
- Firebase Security Rules
- Vercel

## Ejecutar localmente

### 1. Configurar Firebase

Leé `FIREBASE_SETUP.md` y completá `.env.local`.

### 2. Instalar

```bash
npm install
```

### 3. Ejecutar

```bash
npm run dev
```

Abrí:

```txt
http://localhost:3000
```

## Probar el flujo completo

Usá dos emails distintos.

1. Registrá una cuenta como cliente.
2. Registrá otra como taller/impresor.
3. Cliente: abrí Modelos 3D y elegí uno.
4. Cliente: publicá una solicitud.
5. Taller: abrí Trabajos y guardá la solicitud.
6. Taller: abrí el trabajo y enviá una propuesta.
7. Cliente: abrí la solicitud y aceptá la propuesta.
8. Cliente y taller: abrí Mensajes y escribí desde ambas cuentas.
9. Taller: agregá trabajos al Portfolio.
10. Recargá el navegador para comprobar que Firestore mantiene la información.

## API de modelos

Todos:

```txt
/api/models
```

Búsqueda:

```txt
/api/models?q=soporte
```

Filtros:

```txt
/api/models?material=PLA
/api/models?category=Miniaturas
```

Detalle:

```txt
/api/models/pl3d-001
```

Cotizador:

```txt
/api/quote?weightGrams=125&gramPrice=250&printHours=8&hourPrice=700&extras=1500&platformFeePercent=12
```

## Datos persistentes

GitHub contiene el **código fuente**. Los datos creados por usuarios no se escriben dentro del repositorio.

Cloud Firestore guarda:

- `users`
- `jobs`
- `offers`
- `savedJobs`
- `conversations`
- `conversations/{id}/messages`
- `portfolioItems`

Esto permite que los datos persistan tanto en localhost como en Vercel.

## Seguridad

El proyecto incluye `firestore.rules`.

No publiques `.env.local` ni archivos de service account.

Para desplegar las reglas:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

## GitHub y Vercel

Leé `GITHUB_VERCEL.md` para el procedimiento completo.
