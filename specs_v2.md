# FLOWWVR — SPECIFICATIONS DEL PROYECTO (v2)

> Cambios respecto a v1: se retira la integración con las APIs de OCA/Correo Argentino de la V1 (queda como Fase futura), el envío se cotiza con **tarifas fijas por zona configurables por el admin** y se gestiona el despacho por fuera del sistema, se agregan legales de e-commerce, soporte multi-admin, personalización gestionada offline, y Mercado Pago vía Checkout Pro.

---

## 1. Resumen

FLOWWVR será una tienda online propia para un emprendimiento de encendedores personalizados, con venta a todo el territorio argentino.

El sistema tendrá dos áreas:

- **Tienda pública:** experiencia de compra para clientes.
- **Panel de administración:** gestión completa del negocio por parte de uno o más dueños/administradores.

Objetivos principales:

- Mostrar productos, categorías, precios y stock en tiempo real.
- Permitir carrito y checkout.
- Cobrar con Mercado Pago (vía link de pago generado automáticamente).
- Permitir transferencia bancaria como alternativa, al alias que configure el administrador.
- Calcular el costo de envío en base a **zonas y tarifas fijas configurables por el admin** (sin integración de API de OCA/Correo Argentino en V1).
- Recolectar los datos de dirección del cliente para que el administrador gestione el despacho real (OCA, Correo Argentino u otro) **por fuera del sistema**.
- Descontar stock físico automáticamente solo cuando el pago quede confirmado.
- Permitir gestión de personalización de encendedores de forma manual, coordinada directamente entre cliente y administrador (WhatsApp), fuera del flujo de checkout.
- Permitir al dueño/dueños administrar productos, precios, stock, categorías, promociones, pedidos, zonas de envío y configuración sin tocar código.
- Tener estadísticas y gráficos de ventas.
- Cumplir con la información legal mínima exigida a un e-commerce en Argentina (arrepentimiento, cambios/devoluciones, términos, privacidad).
- Mantener como objetivo **$0 de infraestructura fija**, usando servicios gratuitos dentro de sus límites.
- Comenzar sin comprar dominio: utilizar el subdominio gratuito de Netlify. Un dominio propio podrá agregarse posteriormente.

---

# 2. Principios del proyecto

1. **Mobile-first:** la tienda y el panel deben funcionar perfectamente desde celular.
2. **Simple para el administrador:** cualquier operación cotidiana debe poder hacerse desde el panel sin conocimientos técnicos, incluso siendo más de un administrador.
3. **Simple para el cliente:** comprar debe requerir la menor cantidad posible de pasos.
4. **Stock confiable:** nunca descontar stock solamente por agregar un producto al carrito; solo al confirmarse el pago.
5. **Seguridad:** credenciales y operaciones sensibles nunca deben quedar expuestas al frontend.
6. **Escalable:** la arquitectura debe permitir agregar funcionalidades (envío automatizado, personalización online, más operadores) sin rehacer el proyecto.
7. **Costo fijo $0:** evitar servicios pagos mientras sea posible.
8. **Preparado para personalización:** la arquitectura debe permitir incorporar un personalizador avanzado de encendedores en el futuro, aunque en V1 se gestione manualmente.
9. **Transparencia legal:** el cliente debe tener siempre visible la información de cambios, devoluciones, arrepentimiento y contacto, conforme a la normativa de Defensa del Consumidor.

---

# 3. Stack tecnológico

## Frontend
- React
- Vite
- TypeScript
- PWA
- CSS/estilos propios o solución liviana

## Hosting
- Netlify Free

## Backend / datos
- Firebase Authentication
- Firestore
- Firebase Storage

## Backend server-side
- Netlify Functions para operaciones que requieran secretos, webhooks o comunicación segura con servicios externos (Mercado Pago).

## Pagos
- Mercado Pago — **Checkout Pro (API de Preferencias)**.

## Envíos (V1)
- Sin integración de API de transportista. Tarifas fijas por zona, configurables por el administrador.
- Despacho gestionado manualmente por el administrador fuera del sistema (OCA, Correo Argentino, u otro medio que el admin decida caso a caso).

## Estadísticas
- Gráficos generados a partir de datos reales de Firestore.

---

# 4. Restricción de costos

Objetivo: **$0 de costo fijo mensual para la infraestructura inicial.**

Se utilizarán las cuotas gratuitas disponibles de los servicios. No comprar dominio inicialmente.

URL inicial esperada: `flowwvr.netlify.app`

Un dominio propio como `flowwvr.com.ar` será opcional y podrá agregarse posteriormente.

Importante:
- Mercado Pago puede cobrar comisiones por las ventas.
- Los envíos reales (pagados por el admin al operador) tienen su costo propio, aparte de lo que se le cobra al cliente.
- Los límites gratuitos de Netlify/Firebase deben monitorearse.
- No incorporar servicios pagos innecesarios.

---

# 5. Arquitectura general

```text
                         FLOWWVR
                            |
              +-------------+-------------+
              |                           |
          TIENDA                         ADMIN
              |                           |
              +-------------+-------------+
                            |
                         React/PWA
                            |
                         Netlify
                            |
                    Netlify Functions
                            |
              +-------------+-------------+
              |                           |
          Firebase                  Mercado Pago
              |                    (Checkout Pro)
      Firestore
      Storage
      Auth

      Envío = tarifa fija por zona (config. en Firestore)
      Despacho real = gestionado manualmente por el admin
      fuera del sistema (WhatsApp / operador elegido caso a caso)
```

---

# 6. Tienda pública

## 6.1 Inicio

Debe mostrar:
- Identidad FLOWWVR.
- Mensaje principal de marca.
- Acceso al catálogo.
- Productos destacados.
- Categorías.
- Productos nuevos.
- Información básica de compra.
- Información de envíos (zonas y plazos estimados).
- Aviso de que la personalización se coordina por WhatsApp.
- Acceso a WhatsApp.
- Acceso a Instagram.
- Link a Términos y Condiciones / Política de cambios y devoluciones en el footer.

La estética debe respetar la identidad visual de FLOWWVR y no parecer una plantilla genérica de ecommerce.

---

# 7. Catálogo

Debe permitir:
- Ver todos los productos.
- Filtrar por categoría.
- Ver productos destacados.
- Ver productos nuevos.
- Ver disponibilidad.
- Ver precio.
- Entrar al detalle del producto.

Cada tarjeta de producto debe mostrar como mínimo:
- Imagen.
- Nombre.
- Precio.
- Estado de stock.
- Etiquetas opcionales.

Estados: `Disponible` / `Últimas unidades` / `Sin stock`

---

# 8. Producto

Cada producto tendrá:
- Nombre, descripción, precio, precio promocional si corresponde.
- Imágenes, categoría, stock físico.
- Peso, alto, ancho, largo (se conservan para uso futuro con envío automatizado).
- Estado publicado, destacado, nuevo.

La pantalla permitirá:
- Ver imágenes, leer descripción, seleccionar cantidad, agregar al carrito.
- Ver una nota/CTA de "¿Querés personalizarlo? Escribinos por WhatsApp" (enlace directo), sin flujo de personalización dentro del sistema en V1.

Si el stock es 0: no permitir agregar al carrito, mostrar `SIN STOCK`.

---

# 9. Carrito

Debe permitir:
- Ver productos, modificar cantidades, eliminar productos.
- Ver subtotal.
- Aplicar código promocional y ver descuento.
- Ingresar código postal/provincia para calcular la **tarifa fija de envío según zona**.
- Ver costo de envío (tarifa fija, no cotización en tiempo real de un operador).
- Ver total final (productos + envío − descuento).

Ejemplo:

```text
Productos                 $30.000
Descuento                  -$5.000
Envío (zona AMBA)           $4.000
---------------------------------
TOTAL                      $29.000
```

> El cliente no elige operador logístico (OCA/Correo) en V1: solo paga una tarifa de envío según su zona. El operador real que se use para despachar lo decide el administrador puertas adentro.

---

# 10. Checkout

No será obligatorio crear una cuenta.

## Datos del comprador
Campos obligatorios: Nombre y apellido, DNI, WhatsApp, Email.

## Datos de envío
Solo se ofrecerá **entrega a domicilio**. Campos: Provincia, Localidad, Código postal, Calle, Número, Piso/departamento (si corresponde), Referencia.

No habrá opción de retiro en sucursal ni retiro presencial en la V1.

## Notas del pedido (opcional)
Campo de texto libre para que el cliente indique pedidos de personalización a coordinar luego con el administrador (no afecta precio ni stock automáticamente).

## Aceptación legal (obligatorio)
Checkbox obligatorio: *"Acepto los Términos y Condiciones y la Política de Cambios y Devoluciones"*, con links visibles antes de confirmar el pedido. No se puede continuar sin marcarlo.

---

# 11. Envíos (V1 — gestión manual con tarifa por zona)

En V1 **no hay integración con las APIs de OCA ni Correo Argentino**. El sistema resuelve dos cosas separadas:

1. **Costo que paga el cliente:** una tarifa fija según la zona de destino (configurada por el admin), que se suma automáticamente al total y se paga junto con los productos.
2. **Despacho real:** el administrador, una vez confirmado el pago, ve los datos de dirección del pedido y gestiona el envío por fuera del sistema (llevando el paquete a OCA, Correo Argentino, o el medio que corresponda), cargando manualmente el número de seguimiento si lo desea informar al cliente.

## Flujo

```text
Cliente ingresa provincia/CP
        |
        v
Sistema busca la zona configurada
        |
        v
Muestra tarifa fija de envío de esa zona
        |
        v
Costo se suma al total del pedido
        |
        v
Pago confirmado
        |
        v
Administrador ve pedido con dirección completa
        |
        v
Administrador despacha por fuera del sistema
        |
        v
Administrador carga (opcional) tracking manual
```

## Configuración de zonas (panel admin)

El administrador podrá crear/editar zonas de envío:
- Nombre de la zona (ej. "CABA", "GBA", "Interior").
- Provincias/localidades o códigos postales incluidos.
- Tarifa fija.
- Plazo estimado de entrega (texto libre, ej. "3 a 5 días hábiles").
- Activa/inactiva.

Si la dirección del cliente no coincide con ninguna zona configurada, se debe mostrar un mensaje pidiendo que contacte por WhatsApp para cotizar manualmente (no bloquear la venta sin alternativa).

## Roadmap (fuera de V1)

Cuando el proyecto avance y se confirmen credenciales/convenios reales con OCA y Correo Argentino, se podrá incorporar cotización y creación de envío automatizada. La base de datos ya contempla los campos de peso/dimensiones del producto para no rediseñar nada cuando eso pase. Se recomienda mantener una interfaz interna común para operadores (`ShippingProvider`: quote/createShipment/getLabel/getTracking/getStatus) para poder enchufarlos sin tocar el checkout cuando llegue el momento.

---

# 12. Cuentas de operadores logísticos (fuera de alcance en V1)

No aplica en V1: el envío se gestiona manualmente por el administrador. Cuando se incorpore automatización (ver Roadmap), las credenciales de OCA/Correo Argentino deberán vivir exclusivamente en variables de entorno del servidor (Netlify), nunca en frontend ni en Firestore accesible al cliente.

---

# 13. Pagos

Habrá dos métodos: Mercado Pago y transferencia bancaria.

## Mercado Pago — Checkout Pro (recomendado)

Flujo:

```text
Cliente confirma pedido
        |
        v
Netlify Function crea una "Preferencia de pago" en Mercado Pago
(server-side, con Access Token seguro)
        |
        v
Mercado Pago devuelve un link de pago único para ese pedido
        |
        v
Cliente es redirigido a ese link y paga
        |
        v
Mercado Pago notifica por Webhook
        |
        v
Netlify Function valida la notificación server-side
        |
        v
Pedido pasa a "Pagado"
        |
        v
Se descuenta stock
```

Por qué Checkout Pro y no un link genérico armado a mano:
- El link se genera automáticamente por pedido (no depende de que el admin lo cree a mano cada vez).
- Queda asociado a un `external_reference` = ID del pedido, lo que hace directa la conciliación en el webhook.
- Los datos de tarjeta nunca pasan por el servidor propio (los procesa Mercado Pago).
- Permite habilitar más adelante otros medios dentro del mismo checkout (cuotas, otras billeteras) sin cambiar arquitectura.

Reglas:
- Nunca considerar un pedido como pagado únicamente porque el usuario volvió a la página de éxito.
- La confirmación debe basarse siempre en la notificación/validación server-side del webhook (consultando el pago por su ID contra la API de Mercado Pago, no solo confiando en el payload recibido).
- El webhook debe ser idempotente: si Mercado Pago reintenta la notificación, no se debe descontar stock dos veces.

## Transferencia

El administrador configura: Alias, Titular, Banco/billetera, WhatsApp, Email.

El cliente verá: Total a transferir, datos de transferencia, instrucciones, botón para enviar comprobante por WhatsApp.

El pedido quedará en estado `Esperando comprobante`. El administrador podrá marcarlo manualmente como `Pago confirmado`.

---

# 14. Pago del envío

El cliente paga en un único pago:

```text
Productos
+
Envío (tarifa fija por zona)
-
Descuento
=
TOTAL DEL PEDIDO
```

El sistema registra por separado: subtotal de productos, descuento, costo de envío cobrado al cliente, total. Esto permite separar en estadísticas cuánto entra por productos y cuánto por envío, aunque el costo logístico real que paga el negocio al operador no esté automatizado (se puede cargar manualmente si en el futuro se quiere comparar margen).

---

# 15. Stock

Cada producto tendrá `stockActual` (stock físico real).

- El stock **no** se descuenta al agregar al carrito.
- El stock se descuenta **únicamente cuando el pago queda confirmado** (Mercado Pago aprobado, o transferencia marcada como confirmada por el admin).
- Si el pago es rechazado/cancelado, no se descuenta stock.
- Si un pedido ya pagado se cancela después (ej. por reembolso), el stock debe reponerse.

Debe existir protección contra: compras simultáneas, stock negativo, confirmaciones duplicadas (idempotencia vía transacción de Firestore).

---

# 16. Pedidos

Cada pedido tendrá:
- ID, fecha, cliente, DNI, WhatsApp, email.
- Dirección completa.
- Notas de personalización (texto libre, opcional).
- Productos, cantidades, precios unitarios, subtotal.
- Promoción aplicada, descuento.
- Zona de envío aplicada, costo de envío congelado.
- Tracking manual (opcional, cargado a mano por el admin).
- Operador logístico real usado (campo de texto libre que carga el admin, ej. "OCA sucursal Once").
- Estado del pago, estado del pedido, método de pago.
- Estado de reembolso (si aplica).
- Fecha creación, fecha actualización.

---

# 17. Estados del pedido

Estados principales:
```text
Pendiente de pago
Esperando comprobante   (solo transferencia)
Pagado
Preparando
Enviado
Entregado
Cancelado
Reembolsado
```

El administrador cambia el estado manualmente cuando corresponda (no hay integración automática con transportista que lo actualice solo).

---

# 18. Reembolsos

El reembolso es **manual**: el cliente solicita el reembolso (por WhatsApp/email), y el administrador:
1. Revisa el pedido.
2. Si corresponde, gestiona la devolución del dinero directamente en Mercado Pago (o por transferencia si fue ese el medio) fuera del sistema o usando las herramientas del propio panel de Mercado Pago.
3. Marca el pedido como `Reembolsado` en el panel de FLOWWVR.
4. Si el pedido ya había descontado stock, el sistema debe permitir reponerlo (manual o automáticamente al marcar el estado).

No se automatiza la devolución de dinero vía API en V1.

---

# 19. Promociones

El administrador podrá crear promociones sin modificar código.

Tipos: Porcentaje (`20% OFF`), Monto fijo (`$2.000 OFF`), Por producto, Por categoría, Código promocional (`FLOWWVR10`), Envío gratis desde $X.

Configuración: Código, Tipo, Valor, Productos/categorías afectadas, Fecha de inicio, Fecha de finalización, Límite de usos, Estado activo/inactivo.

Las promociones no deben sobrescribir el precio original del producto. El pedido debe guardar: precio original, promoción, descuento, precio final.

---

# 20. Panel de administración

Ruta: `/admin`. Debe requerir autenticación.

Puede haber **más de un administrador/dueño** con acceso completo (ver sección 25).

## Dashboard

Mostrar: Ventas de hoy, ventas del período, cantidad de pedidos, productos vendidos, pedidos pendientes, productos con poco stock, alertas.

---

# 21. Gestión de productos

Funciones: Listar, crear, editar, publicar, ocultar, eliminar, modificar precio, modificar stock, subir imágenes, asignar categoría, marcar destacado, marcar nuevo.

Formulario: Nombre, descripción, precio, stock, categoría, imágenes, peso, dimensiones, publicado, destacado, nuevo.

---

# 22. Gestión de categorías

Funciones: Crear, editar, ocultar, eliminar. No permitir eliminar accidentalmente una categoría que tenga productos activos sin confirmación.

---

# 23. Gestión de pedidos

Lista con filtros: Todos, Pendientes, Esperando comprobante, Pagados, Preparando, Enviados, Entregados, Cancelados, Reembolsados.

Cada pedido debe permitir: ver detalle, cliente, productos, pago, dirección completa (para el despacho manual), notas de personalización, cambiar estado, cargar tracking manual, contactar al cliente por WhatsApp, iniciar reembolso manual.

---

# 24. Gestión de zonas de envío

Panel específico para crear/editar zonas con su tarifa fija y plazo estimado (ver sección 11). Reemplaza lo que en v1 del documento era "cuentas de operadores".

---

# 25. Gestión de promociones

Funciones: Crear, editar, activar, desactivar, eliminar, ver uso.

---

# 26. Ventas y estadísticas

## Métricas
Ventas, pedidos, unidades vendidas, ticket promedio, descuentos, envíos cobrados, ingreso por productos.

## Filtros
Hoy, 7 días, 30 días, 3 meses, 6 meses, 1 año, rango personalizado.

## Gráficos
- Evolución de ventas (líneas).
- Ventas por día/mes (barras).
- Productos más vendidos (barras).
- Métodos de pago (distribución).
- Zonas de envío más usadas (distribución) — reemplaza la comparación OCA vs. Correo Argentino de v1.
- Promociones: usos, descuento otorgado, ventas generadas.

> Nota técnica: calcular estas métricas con documentos de resumen pre-agregados (diarios/mensuales) en vez de recorrer toda la colección de pedidos en cada carga del dashboard, para no agotar la cuota gratuita de lecturas de Firestore.

---

# 27. Stock y alertas

El sistema debe identificar: stock normal, stock bajo, sin stock. El administrador podrá configurar el umbral (ej. "avisar cuando queden 5 unidades o menos").

Dashboard:
```text
⚠️ 4 productos con poco stock
🔴 2 productos agotados
```

---

# 28. Configuración general

El administrador podrá modificar:

## Negocio
Nombre, WhatsApp, Email, Instagram.

## Legales
Texto de Términos y Condiciones, Política de Privacidad, Política de Cambios y Devoluciones/Arrepentimiento (ver sección 32). Editable sin tocar código.

## Transferencia
Alias, Titular, Banco/billetera.

## Envíos
Zonas y tarifas fijas (alta/baja/edición), plazos estimados.

## Stock
Umbral de stock bajo.

---

# 29. Autenticación y administradores

Solo usuarios autorizados tendrán acceso al panel. Se usa Firebase Authentication.

- Puede haber **más de un administrador**. Se mantiene una colección `administradores` en Firestore (o custom claims de Firebase Auth) con los UID autorizados.
- No habrá registro público de administradores: cada alta la hace un administrador existente (o se configura manualmente al inicio del proyecto).
- Todos los administradores tienen, en V1, el mismo nivel de permisos (no hay roles diferenciados todavía). Queda como posible mejora futura diferenciar permisos (ej. un rol que solo prepara pedidos).
- El frontend debe proteger las rutas administrativas y las Firebase Security Rules deben validar contra la lista de administradores, no contra un único UID fijo.

---

# 30. Seguridad

Reglas fundamentales:
- Cliente puede leer productos publicados.
- Cliente no puede modificar productos, stock, precios, zonas de envío ni configuración.
- Cliente no puede acceder a pedidos de otros clientes.
- Cliente no puede acceder a credenciales.
- Solo administradores autorizados (lista, no UID único) pueden modificar datos administrativos.
- Operaciones sensibles (creación de preferencia de pago, webhook, descuento de stock) deben validarse server-side, en Netlify Functions.
- El webhook de Mercado Pago debe validarse contra la API oficial (no confiar ciegamente en el payload) y ser idempotente.
- Operaciones de stock deben ser transacciones seguras (Firestore transactions).
- Secretos externos (Access Token de Mercado Pago, credenciales de Firebase Admin) solo en variables de entorno de Netlify.

---

# 31. PWA

La tienda será instalable como aplicación. Debe incluir: Manifest, ícono FLOWWVR, splash/branding, service worker, diseño responsive, experiencia mobile-first. No depender de Play Store para la primera versión.

---

# 32. Legales y cumplimiento (nuevo)

Requisitos mínimos para operar como e-commerce en Argentina que deben quedar reflejados en el sitio (contenido editable desde el panel, sección 28):

- **Términos y Condiciones**: página accesible desde el footer.
- **Política de Privacidad**: cómo se usan los datos personales (DNI, dirección, contacto) recolectados.
- **Botón/derecho de arrepentimiento**: informar que el cliente tiene derecho a arrepentirse de la compra dentro de los plazos que marca la Ley de Defensa del Consumidor, con instrucciones claras de cómo ejercerlo (contacto del negocio).
- **Política de cambios y devoluciones**: condiciones, plazos, estado del producto exigido, quién paga el envío de devolución.
- **Datos de contacto visibles**: nombre del negocio/responsable, WhatsApp, email — deben estar accesibles sin necesidad de comprar.
- **Checkbox de aceptación obligatorio en el checkout** (ver sección 10) antes de poder pagar.
- **Facturación**: pendiente de definición por el dueño (monotributo/AFIP). No se automatiza en V1, pero se recomienda dejarlo resuelto administrativamente antes de facturar ventas reales, ya que es una obligación legal independiente del desarrollo del sitio.

Estos textos deben poder editarse desde el panel de configuración sin tocar código, igual que el resto del contenido comercial.

---

# 33. Diseño visual

Identidad: **FLOWWVR**. La captura proporcionada por el dueño será la referencia inicial de identidad.

Dirección visual: oscura, urbana, moderna, psicodélica, visual, productos protagonistas, animaciones sutiles, buena legibilidad, no saturar la interfaz.

La tienda debe sentirse como una marca, no como una plantilla genérica.

---

# 34. Personalización (V1 offline, preparado para el futuro)

En V1, la personalización de encendedores **no es parte del flujo de compra**: el cliente ve un CTA en el producto y en el carrito/checkout puede dejar una nota de texto libre, pero la definición final (modelo, color, texto, imagen) se coordina por WhatsApp directamente con el administrador, incluso pudiendo generarse un pedido aparte o un ajuste manual de precio.

La arquitectura (base de datos) debe quedar preparada para, en el futuro, incorporar sin rediseñar todo:
- Selección de modelo y color.
- Texto personalizado y tipografía.
- Subida de imagen del cliente.
- Vista previa.
- Precio dinámico según personalización.

Esto no es obligatorio para la V1.

---

# 35. Estructura de datos inicial

## productos
```text
id
nombre
descripcion
precio
stockActual
categoriaId
imagenes[]
peso
alto
ancho
largo
publicado
destacado
nuevo
createdAt
updatedAt
```

## categorias
```text
id
nombre
descripcion
imagen
activa
orden
createdAt
updatedAt
```

## zonasEnvio
```text
id
nombre
provincias[]           // o codigosPostales[]
tarifa
plazoEstimado
activa
createdAt
updatedAt
```

## administradores
```text
uid
nombre
email
activo
createdAt
```

## pedidos
```text
id
cliente
dni
whatsapp
email
notasPersonalizacion

direccion:
  provincia
  localidad
  codigoPostal
  calle
  numero
  piso
  referencia

productos[]
subtotal
promocionId
descuento
zonaEnvioId
costoEnvio
trackingManual
operadorManual

metodoPago
estadoPago
estadoPedido
estadoReembolso

fechaCreacion
fechaActualizacion
```

## promociones
```text
id
codigo
tipo
valor
productos[]
categorias[]
fechaInicio
fechaFin
limiteUsos
usosActuales
activa
createdAt
updatedAt
```

## configuracion
```text
tienda
transferencia
envios        // zonas y tarifas
stock
redesSociales
legales       // términos, privacidad, cambios/devoluciones
```

---

# 36. Flujo completo de compra

```text
Cliente entra
    |
    v
Inicio
    |
    v
Catálogo
    |
    v
Producto
    |
    v
Agregar al carrito
    |
    v
Carrito
    |
    v
Código promocional (opcional)
    |
    v
Datos del comprador
    |
    v
Dirección + zona de envío (tarifa fija)
    |
    v
Acepta Términos / Política de cambios
    |
    v
Total final
    |
    +----------------------+
    |                      |
Mercado Pago          Transferencia
(Checkout Pro)              |
    |                      v
    v                Esperando comprobante
Pago confirmado             |
    |                      |
    +----------+-----------+
               |
               v
           Pedido
               |
               v
        Stock actualizado
               |
               v
     Administrador gestiona
     despacho por fuera del
     sistema (OCA/Correo/etc)
               |
               v
            Despacho
```

---

# 37. Flujo de administración

```text
Administrador inicia sesión
            |
            v
         Dashboard
            |
     +------+------+------+
     |      |      |      |
 Productos Pedidos Ventas Zonas
     |      |      |      de envío
     v      v      v
 Stock   Estado  Gráficos
 Precios Tracking
 Fotos   manual
         Reembolsos
```

---

# 38. Requisitos funcionales de la V1

La V1 se considera terminada cuando:

- [ ] Cliente puede navegar productos.
- [ ] Cliente puede filtrar por categorías.
- [ ] Cliente puede ver stock.
- [ ] Cliente puede agregar productos al carrito.
- [ ] Cliente puede modificar cantidades.
- [ ] Cliente puede aplicar promociones.
- [ ] Cliente puede ingresar DNI y dirección.
- [ ] Sistema calcula tarifa de envío según zona configurada.
- [ ] Cliente puede pagar productos + envío juntos.
- [ ] Cliente puede pagar con Mercado Pago (Checkout Pro).
- [ ] Cliente puede elegir transferencia y enviar comprobante.
- [ ] Cliente debe aceptar Términos y Política de cambios antes de pagar.
- [ ] Pago aprobado actualiza pedido y descuenta stock (idempotente).
- [ ] Stock no puede quedar negativo.
- [ ] Administrador puede iniciar sesión (y puede haber más de un administrador).
- [ ] Administrador puede crear/editar productos, precios, stock, categorías.
- [ ] Administrador puede crear promociones.
- [ ] Administrador puede crear/editar zonas de envío y tarifas.
- [ ] Administrador puede gestionar pedidos, ver dirección completa, cargar tracking manual.
- [ ] Administrador puede marcar reembolsos manuales.
- [ ] Administrador puede ver ventas y gráficos.
- [ ] Administrador puede configurar transferencia y textos legales.
- [ ] PWA funciona en móvil.
- [ ] Infraestructura inicial funciona sin costo fijo.

---

# 39. Requisitos no funcionales

## Rendimiento
Carga rápida, imágenes optimizadas, lazy loading, evitar dependencias innecesarias.

## Responsive
Debe funcionar correctamente en Android, iPhone, tablet, desktop. Prioridad: móvil.

## Seguridad
Firebase Security Rules, Auth multi-admin, variables de entorno, validación server-side, webhook seguro, idempotencia.

## Mantenibilidad
TypeScript, componentes reutilizables, separación clara entre UI/servicios/lógica, no duplicar lógica de negocio, variables de configuración centralizadas.

---

# 40. Prioridad de desarrollo

## Fase 1 — Base
Proyecto React/Vite/TypeScript, Netlify, Firebase (Auth/Firestore/Storage), PWA, estructura visual.

## Fase 2 — Catálogo
Productos, categorías, stock, fotos, detalle de producto, carrito.

## Fase 3 — Administración
Login multi-admin, dashboard, CRUD productos, CRUD categorías, stock, configuración, textos legales.

## Fase 4 — Promociones
Descuentos, códigos, fechas, límites.

## Fase 5 — Checkout y zonas de envío
Datos comprador, DNI, dirección, zonas de envío con tarifa fija, aceptación legal, total.

## Fase 6 — Pagos
Mercado Pago (Checkout Pro), webhooks, transferencia, comprobantes.

## Fase 7 — Gestión de pedidos y despacho manual
Estados de pedido, tracking manual, contacto WhatsApp, reembolsos manuales.

## Fase 8 — Estadísticas
Ventas, gráficos, productos, métodos de pago, zonas de envío, promociones.

## Fase 9 — Pruebas
Pagos aprobados/rechazados, transferencias, stock, compras simultáneas, promociones, seguridad, responsive, PWA.

## Fase futura (fuera de V1)
Integración real con APIs de OCA y Correo Argentino (cotización, creación de envío, etiquetas, tracking automático) una vez validadas cuentas comerciales y condiciones. Personalización online del encendedor (selección de modelo/color/texto/imagen con vista previa y precio dinámico).

---

# 41. Reglas de negocio críticas

1. Un producto sin stock no se puede comprar.
2. El stock se descuenta únicamente al confirmarse el pago.
3. Un pago no puede descontar stock dos veces (idempotencia).
4. Un pedido cancelado no debe generar un descuento permanente de stock; si ya se había descontado, se repone.
5. Los precios históricos de un pedido no deben cambiar aunque el administrador modifique el producto después.
6. Las promociones deben quedar registradas dentro del pedido.
7. El costo de envío (tarifa de zona) debe quedar congelado en el pedido al momento de la compra, aunque luego se edite la tarifa de esa zona.
8. La zona de envío aplicada debe quedar registrada en el pedido.
9. El tracking manual, si se carga, debe quedar asociado al pedido.
10. El cliente nunca debe tener acceso a datos de otros clientes.
11. Cualquier administrador autorizado debe poder modificar la información comercial sin tocar código.
12. El sistema debe funcionar sin dominio propio.
13. No se debe depender de Firebase Blaze para la V1.
14. Las credenciales de Mercado Pago nunca deben estar en el frontend.
15. Las confirmaciones de pago deben validarse server-side.
16. El cliente debe aceptar los Términos y la Política de cambios/devoluciones antes de poder pagar.
17. Los reembolsos se gestionan manualmente y quedan registrados en el estado del pedido.

---

# 42. Objetivo final

FLOWWVR debe funcionar como una tienda online completa donde:

### Cliente
```text
Entra
→ elige producto
→ agrega al carrito
→ recibe descuento si corresponde
→ ingresa DNI y dirección
→ ve tarifa de envío según su zona
→ acepta términos y política de cambios
→ paga todo junto (Mercado Pago o transferencia)
→ recibe confirmación
```

### Administrador
```text
Entra al panel
→ ve pedido pagado, con dirección completa
→ prepara paquete
→ despacha por fuera del sistema (OCA/Correo/otro)
→ carga tracking manual (opcional)
```

Y desde el mismo panel puede:
```text
Crear productos
Cambiar precios
Cambiar stock
Subir fotos
Crear categorías
Crear promociones
Gestionar pedidos
Configurar zonas y tarifas de envío
Marcar reembolsos
Ver ventas
Ver gráficos
Cambiar datos de transferencia
Editar textos legales
Agregar otros administradores
```

La primera versión debe priorizar **funcionalidad, seguridad, facilidad de administración, cumplimiento legal básico, velocidad y costo $0**, dejando preparada la arquitectura para envío automatizado, personalización avanzada y futuras funcionalidades.
