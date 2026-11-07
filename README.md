This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Películas locales

La aplicación debe ejecutarse en el equipo Windows donde están `D:\peliculas` y
`D:\BSPlayer\bsplayer.exe`: el botón **VER** abre BS.Player en ese equipo, no en
otro dispositivo desde el que se acceda al navegador. No expongas esta
instalación a usuarios que no deban poder iniciar el reproductor en el servidor.

Al agregar una película se crea su carpeta dentro de `D:\peliculas`. Coloca allí
el archivo de vídeo manualmente. Los caracteres que Windows no admite en un
nombre de carpeta se reemplazan por `-`; los puntos y espacios finales se
eliminan y los nombres reservados de Windows llevan un `-` inicial. Si hay
varios vídeos, se abre el primero por orden alfabético. Se reconocen AVI, MKV,
MP4, M4V, MOV, WMV, MPG, MPEG, WEBM, FLV, TS, M2TS, 3GP, VOB y DIVX.
Si no hay vídeo, aparece «pelicula no disponible».

Al cambiar el título se renombra la carpeta con sus archivos. Si la carpeta se
comparte con otra película o la carpeta de destino ya existe, el cambio se
rechaza para no mover ni sobrescribir archivos. Al eliminar una película no se
elimina su carpeta.

Para crear las carpetas de películas ya registradas, ejecuta en ese mismo equipo
`npm run sync:movie-folders`. Este comando requiere Node.js 22.6 o posterior,
acceso a la base de datos configurada y permisos de escritura en `D:\peliculas`.
Se puede volver a ejecutar sin borrar archivos existentes.

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
