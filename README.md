# PrintLink 3D — versión local funcional

Plataforma web para conectar solicitudes de impresión 3D con talleres/impresores.

Esta versión **no usa Firebase ni una base de datos externa**. Las cuentas y todos los datos creados en la aplicación se guardan localmente en el navegador.

## Qué funciona

### Cuentas

- Registro con email y contraseña.
- Elección de tipo de cuenta al registrarse: cliente o taller/impresor.
- Login y logout.
- Perfil editable.
- Contraseña almacenada como hash local con salt, no como texto plano.
- Sesión independiente por pestaña mediante `sessionStorage`.

### Cliente

- Explorar 20 modelos 3D.
- Abrir ficha técnica y estimación.
- Publicar una solicitud desde un modelo o desde cero.
- Ver sus solicitudes.
- Recibir y comparar propuestas.
- Aceptar una propuesta.
- Abrir el chat del trabajo aceptado.
- Explorar talleres.

### Taller / impresor

- Ver trabajos abiertos.
- Guardar trabajos.
- Enviar una propuesta.
- Consultar propuestas enviadas.
- Ver trabajos aceptados.
- Cambiar el estado del trabajo.
- Usar el chat.
- Crear y editar un portfolio.
- Configurar materiales y tarifas base.

## Cómo se guardan los datos

La aplicación usa:

- `localStorage`: cuentas, perfiles, trabajos, propuestas, guardados, conversaciones, mensajes y portfolio.
- `sessionStorage`: usuario actualmente logueado en cada pestaña.

Esto permite abrir dos pestañas del mismo dominio y usar una cuenta distinta en cada una. Por ejemplo:

- Pestaña A: cliente.
- Pestaña B: taller.

Ambas pestañas comparten los trabajos y mensajes locales, pero mantienen sesiones distintas.

## Importante

Los datos existen **solo en ese navegador y para ese dominio**.

Por lo tanto:

- Si borrás los datos del navegador, se eliminan las cuentas y trabajos.
- Otro dispositivo no puede ver esos datos.
- Otro navegador no comparte los datos.
- Esta autenticación sirve para demostración y pruebas, no para producción con información sensible.

Para una plataforma pública multiusuario real será necesario conectar una base de datos y autenticación de servidor.

## Tecnologías

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Web Storage API
- Web Crypto API
- Vercel

## Ejecutar localmente

```bash
npm install
npm run dev
```

Abrí:

```txt
http://localhost:3000
```

No necesitás crear `.env.local` ni configurar servicios externos.

## Probar el flujo completo

1. Abrí la app.
2. Registrá una cuenta como cliente.
3. Abrí una segunda pestaña del mismo sitio.
4. Cerrá la sesión de esa segunda pestaña si heredó alguna navegación inicial y registrá una segunda cuenta como taller.
5. Cliente: publicá una solicitud.
6. Taller: abrí Trabajos, guardá la solicitud y enviá una propuesta.
7. Cliente: aceptá la propuesta.
8. Abrí Mensajes desde ambas pestañas.
9. Enviá mensajes desde las dos cuentas.
10. Recargá las páginas para verificar que los datos persisten.

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

## GitHub y Vercel

Leé `GITHUB_VERCEL.md`.

No hay variables de entorno obligatorias para esta versión.
