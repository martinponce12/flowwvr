# FLOWWVR — App completa (Fase 1-6)

Tienda + panel de administración de FlowwVR. Funciona **ahora mismo en modo
demo** (sin credenciales, con productos de ejemplo) y pasa a producción real
apenas completes el `.env` — sin tocar código.

## 🚀 Arrancar en tu VS Code (modo demo, funciona ya)

```bash
npm install
npm run dev
```

Abrí `http://localhost:5173`. Vas a ver la tienda funcionando con 4 productos
de ejemplo. Para entrar al panel admin: `http://localhost:5173/admin/login`
— en modo demo, cualquier email/contraseña te deja entrar (es solo para que
puedas probar el panel; una vez que cargues Firebase real, esto se pone serio).

## 🧩 Qué es "modo demo"

Mientras el `.env` no tenga las credenciales de Firebase, la app usa datos en
memoria (`src/data/mock.ts`) en vez de Firestore. Es la misma app, mismo
código: apenas completes el `.env`, automáticamente empieza a usar Firestore
real. No hay que cambiar nada a mano.

---

## Paso a paso: cuentas y credenciales

**Ninguna credencial se envía por chat.** Las cargás vos directamente donde
te indico. Yo ya dejé el código preparado para leerlas.

### 1. Firebase (gratis)
1. `console.firebase.google.com` → crear proyecto (ej. `flowwvr`). **No actives Blaze.**
2. Activar: Authentication (método Email/Contraseña), Firestore Database (modo producción), Storage.
3. ⚙️ Configuración del proyecto → "Tus apps" → crear app **Web** → copiar el bloque `firebaseConfig`.
4. Pegar esos 6 valores en `.env` (`VITE_FIREBASE_...`).
5. Crear el primer administrador:
   - Authentication → Users → "Agregar usuario" (tu email + contraseña) → copiar el UID.
   - Firestore → crear colección `administradores` → documento con ID = ese UID → campos `activo: true`, `nombre`, `email`.
   - Repetir por cada dueño/administrador adicional.
6. Firestore → Rules → pegar el contenido de `firestore.rules` de este proyecto → Publicar.
7. **Storage (opcional por ahora):** Firebase exige el plan Blaze para aprovisionar el bucket de Storage, incluso si el uso real es gratis (dentro de la cuota gratis de 5GB, Blaze no cobra nada — solo pide vincular una tarjeta). Mientras no lo actives, el proyecto funciona igual: en `/admin/productos` el campo de foto se carga pegando una URL en vez de subir el archivo.
   - **Cuando quieras activarlo:** Firebase Console → Storage → activar (te va a pedir pasar a Blaze) → Storage → Rules → pegar el contenido de `storage.rules` → Publicar. Después, en Netlify (o en tu `.env` local), cambiar `VITE_STORAGE_HABILITADO` a `true` y volver a desplegar. **No hace falta tocar código**: el botón de "subir foto desde el dispositivo" aparece solo.
   - Recomendación al activar Blaze: poné una alerta de presupuesto en $0-$1 en Google Cloud Console → Facturación, para tener aviso si algún día te acercás a superar la cuota gratis.
8. (Opcional, recomendado) Cargar los datos iniciales reales sin hacerlo a mano:
   - Configuración del proyecto → Cuentas de servicio → "Generar nueva clave privada" → guardar como `scripts/serviceAccountKey.json`.
   - Copiar esos mismos 3 datos (`project_id`, `client_email`, `private_key`) a `.env` como `FIREBASE_ADMIN_...` (para las Netlify Functions).
   - Correr `node scripts/seed.mjs`.

### 2. Netlify (gratis)
1. `app.netlify.com` → crear cuenta.
2. Todavía no hace falta conectar el repo (eso es el paso de deploy, más abajo).

### 3. Mercado Pago developers
1. `mercadopago.com.ar/developers/panel`, logueado con la cuenta de Mercado Pago
   que va a recibir los cobros (puede ser tu cuenta personal si es la que usás para el negocio).
2. "Crear aplicación" → nombre (ej. "FlowwVR Tienda").
3. Copiar el **Access Token de producción** → pegarlo en `.env` como `MERCADOPAGO_ACCESS_TOKEN`.
4. Poner `VITE_MP_HABILITADO=true` en `.env` recién cuando quieras que el checkout
   muestre la opción de tarjeta. Si lo dejás en `false`, el checkout solo
   ofrece transferencia/alias (cero riesgo, cero integración activa).

### 4. Dónde va cada credencial

| Variable | Dónde se carga |
|---|---|
| `VITE_FIREBASE_*` | `.env` local y Netlify → Environment variables |
| `VITE_MP_HABILITADO` | `.env` local y Netlify → Environment variables |
| `VITE_STORAGE_HABILITADO` | `.env` local y Netlify → Environment variables (`false` hasta que actives Blaze + Storage) |
| `MERCADOPAGO_ACCESS_TOKEN` | Solo Netlify → Environment variables (nunca en el código) |
| `FIREBASE_ADMIN_*` | Solo Netlify → Environment variables (nunca en el código) |

---

## Deploy a Netlify

1. Subí el proyecto a un repositorio de GitHub.
2. Netlify → "Add new site" → "Import an existing project" → elegir el repo.
   (`netlify.toml` ya define build command y carpeta de publicación).
3. Cargar las Environment Variables (tabla de arriba) antes del primer deploy.
4. Deploy. El sitio queda en algo como `flowwvr.netlify.app`.
5. Pegar esa misma URL en `URL` (Netlify ya la expone automáticamente como
   variable de entorno del lado de las funciones, no hace falta cargarla a mano).

## Estructura del proyecto

```text
flowwvr/
├─ src/
│  ├─ pages/tienda/       → Inicio, Catálogo, Producto, Carrito, Checkout, Legales, ResultadoPago
│  ├─ pages/admin/        → Login, Dashboard, Productos, Categorías, Zonas de envío, Promociones, Pedidos, Configuración
│  ├─ components/         → ui/ (Botón, Badge, ImagenProducto), layout/ (Header, Footer), admin/ (LayoutAdmin, RutaProtegidaAdmin), catalogo/ (TarjetaProducto)
│  ├─ services/
│  │  ├─ firebase/        → config.ts (con modo demo automático), auth.ts (multi-admin)
│  │  └─ datos/           → una función por colección (productos, categorías, zonas, promos, pedidos, configuración) — Firestore real o mock según haya credenciales
│  ├─ store/               → carrito.ts (zustand + localStorage), sesionAdmin.ts
│  ├─ data/mock.ts          → productos/categorías/zonas de ejemplo para el modo demo
│  └─ types/                → tipos compartidos
├─ netlify/functions/
│  ├─ crear-preferencia-pago.ts  → arma la preferencia de Checkout Pro leyendo el pedido real de Firestore
│  ├─ webhook-mercadopago.ts     → confirma pagos de forma idempotente y descuenta stock en transacción
│  └─ _lib/firebaseAdmin.ts      → conexión server-side a Firestore (credenciales de servicio)
├─ scripts/seed.mjs         → carga los datos iniciales reales en Firestore (opcional)
├─ firestore.rules           → reglas de seguridad (multi-admin, cliente no accede a pedidos ajenos)
└─ .env.example
```

## Reemplazar los datos de ejemplo por los reales

Todo lo que hoy son placeholders se edita **sin tocar código**, desde `/admin`:
- Productos y fotos (subir `imagenUrl` — podés usar cualquier link de imagen mientras no tengan Storage configurado con subida directa, o cargar la URL de Firebase Storage).
- Categorías, zonas de envío y tarifas.
- WhatsApp, Instagram, email, alias de transferencia.
- Textos legales (Términos, Privacidad, Cambios y devoluciones).

## Pendiente para dejarlo 100% de producción

- [ ] Reemplazar `public/icons/icon.svg` por el isotipo real de FlowwVR en PNG (192x192 y 512x512) — ver `public/icons/LEEME.txt`.
- [ ] Cargar productos y fotos reales desde `/admin/productos`.
- [ ] Completar WhatsApp, Instagram, email, alias real en `/admin/configuracion`.
- [ ] Revisar/ajustar los textos legales con un profesional si querés blindarlos del todo (los que están son un punto de partida razonable, no asesoramiento legal).
- [ ] Definir facturación (AFIP/monotributo) — es una gestión administrativa aparte, no técnica.
