This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Películas locales

La web alojada en Vercel no puede acceder directamente a los archivos ni ejecutar
programas en la PC. Para usar **VER** desde `https://psj-psi.vercel.app`, hay que
mantener un servicio local ejecutándose en la PC Windows donde están
`D:\peliculas` y `D:\BSPlayer\bsplayer.exe`. El navegador también debe estar en
esa PC: desde otro dispositivo se intentará contactar al servicio de ese otro
dispositivo, no al de esta PC.

### Configuración

1. En Vercel, configura `MOVIE_PLAYBACK_SECRET` como variable de entorno de
   producción, con un valor aleatorio privado de al menos 32 caracteres.
   Por ejemplo, genera uno localmente con
   `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   y cópialo en la configuración de Vercel. No lo compartas ni lo subas a Git.
   Vuelve a desplegar la aplicación después de configurar la variable.
2. En la PC, el archivo `.env` debe configurar `DATABASE_URL` apuntando a la
   **misma base de datos** que utiliza Vercel. No hace falta copiar la clave de
   reproducción de Vercel a la PC, salvo para ejecutar también la web local:
   en ese caso configura `MOVIE_PLAYBACK_SECRET` en el `.env` local y reinicia
   Next.js. El servicio local requiere Node.js 22.6 o posterior.
3. Antes de iniciar la web y el servicio local, ejecuta `npx prisma migrate deploy`
   para aplicar las migraciones a la base de datos configurada y
   `npx prisma generate` para actualizar el cliente Prisma. Si ya están en
   ejecución, detén ambos procesos antes de generar el cliente y vuelve a
   iniciarlos después.
4. En una terminal abierta en este proyecto ejecuta `npm run local:movies` y
   déjala abierta. Inícialo antes de modificar títulos por primera vez, para
   que registre la correspondencia con las carpetas existentes. Hay que volver
   a iniciarlo después de reiniciar Windows.
5. Abre el sitio de Vercel en esa PC y pulsa **VER**. Si el navegador solicita
   permiso para acceder a la red local, concédelo y vuelve a intentarlo.

El servicio escucha únicamente en `127.0.0.1:43125`, acepta peticiones del sitio
indicado y de `http://localhost:3000`, y verifica cada autorización con el sitio
correspondiente. No expongas el puerto ni compartas la clave de Vercel. Si el
servicio está apagado o el navegador bloquea el acceso local, se muestra un
mensaje; si hay un error de sincronización, consulta la terminal del servicio.

Al agregar una película, el servicio crea su carpeta dentro de `D:\peliculas`.
Si está apagado, la crea cuando vuelve a iniciarse; mientras está encendido,
comprueba los cambios cada 30 segundos y antes de reproducir. El inicio muestra
hasta 12 películas ordenadas por la fecha de creación más reciente de sus
archivos de vídeo; esa fecha se sincroniza con la base de datos mediante el
servicio local. Coloca allí
el archivo de vídeo manualmente. Los caracteres que Windows no admite en un
nombre de carpeta se reemplazan por `-`; los puntos y espacios finales se
eliminan y los nombres reservados de Windows llevan un `-` inicial. Si hay
varios vídeos, se abre el primero por orden alfabético. Se reconocen AVI, MKV,
MP4, M4V, MOV, WMV, MPG, MPEG, WEBM, FLV, TS, M2TS, 3GP, VOB y DIVX.
Si no hay vídeo, aparece «pelicula no disponible».

Al cambiar el título se renombra la carpeta con sus archivos, incluso si el
servicio estuvo apagado durante el cambio. Si la carpeta se comparte con otra
película o la carpeta de destino ya existe, la sincronización se detiene y el
servicio informa del conflicto sin sobrescribir archivos: resuélvelo antes de
continuar. Al eliminar una película no se elimina su carpeta. El registro de
correspondencias se guarda en `%LOCALAPPDATA%\PSJ\movie-folders.json`: consérvalo,
ya que sin él no se pueden reconstruir automáticamente los títulos anteriores.
Los cambios hechos antes de la primera ejecución del servicio tampoco pueden
asociarse automáticamente con una carpeta de nombre anterior.

Para preparar las carpetas de películas ya registradas sin iniciar el servicio
puedes ejecutar `npm run sync:movie-folders`. Este comando no registra los
nombres anteriores necesarios para sincronizar cambios de título posteriores.

## Géneros

Los filtros y formularios usan el catálogo de géneros de la base de datos:
animes, películas y series comparten una lista, y videojuegos tiene otra. Se
pueden seleccionar varios géneros. Los valores anteriores que no pertenecen al
catálogo se conservan y aparecen marcados al editar el contenido; se pueden
quitar, pero no asignar a otros contenidos.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
