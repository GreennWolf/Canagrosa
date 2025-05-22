# Guía de Despliegue - Canagrosa

## Problema de 404 en Producción

### Descripción del Problema
Cuando un usuario recarga la página en rutas como `/clientes`, `/usuarios`, etc., el servidor devuelve un error 404. Esto ocurre porque el servidor intenta buscar archivos físicos en esas rutas que no existen.

### Solución
Las Single Page Applications (SPA) necesitan que el servidor redirija todas las rutas al archivo `index.html` para que React Router pueda manejar la navegación.

## Configuraciones por Servidor

### 1. Apache (.htaccess)
El archivo `.htaccess` ya está incluido en `public/.htaccess`:
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_PATH} !-f
RewriteRule ^ index.html [QSA,L]
```

### 2. Nginx
Agregar esta configuración al bloque server en `nginx.conf`:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 3. Netlify
El archivo `_redirects` ya está incluido en `public/_redirects`:
```
/*    /index.html   200
```

### 4. Vercel
Crear `vercel.json` en la raíz del proyecto:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 5. Firebase Hosting
En `firebase.json`:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

## Proceso de Build

1. **Desarrollo**: `npm run dev` o `yarn dev`
2. **Build**: `npm run build` o `yarn build`
3. **Preview**: `npm run preview` o `yarn preview`

## Verificación

Después de configurar el servidor, verifica que:
1. La página principal `/` carga correctamente
2. Al navegar a `/clientes` y recargar, sigue funcionando
3. Las rutas protegidas redirigen al login si no hay autenticación
4. Los archivos estáticos (CSS, JS, imágenes) se cargan correctamente

## Notas Importantes

- Los archivos de configuración están en la carpeta `public/` para que se copien al build
- Si usas un servidor personalizado, asegúrate de que sirva archivos estáticos desde la carpeta `dist/`
- Las rutas de API (si las tienes) deben configurarse por separado para no ser interceptadas