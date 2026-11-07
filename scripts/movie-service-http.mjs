import { createServer } from 'node:http';

export function createMovieService({ origins, expectedHost, verify, synchronize, findMovie, files }) {
  function respond(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(data));
  }

  return createServer(async (req, res) => {
    const origin = req.headers.origin;
    if (!origin || !origins.has(origin) || req.headers.host !== expectedHost()) {
      respond(res, 403, { error: 'Origen no autorizado.' });
      return;
    }
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    if (req.method === 'OPTIONS' && req.url === '/play') {
      res.setHeader('Access-Control-Allow-Methods', 'POST');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Access-Control-Allow-Private-Network', 'true');
      res.writeHead(204);
      res.end();
      return;
    }
    if (req.method !== 'POST' || req.url !== '/play' || !req.headers['content-type']?.startsWith('application/json')) {
      respond(res, 404, { error: 'Solicitud inválida.' });
      return;
    }
    try {
      let body = '';
      for await (const chunk of req) {
        body += chunk;
        if (body.length > 8192) {
          respond(res, 413, { error: 'Solicitud demasiado grande.' });
          return;
        }
      }
      const { token } = JSON.parse(body);
      if (typeof token !== 'string' || token.length > 4096) {
        respond(res, 400, { error: 'Autorización inválida.' });
        return;
      }
      const movieId = await verify(origin, token);
      if (!movieId) {
        respond(res, 401, { error: 'La autorización venció o no es válida. Inténtalo nuevamente.' });
        return;
      }
      await synchronize();
      const movie = await findMovie(movieId);
      if (!movie) {
        respond(res, 404, { error: 'La película no está en la base de datos configurada en esta PC.' });
        return;
      }
      if (!await files.play(movie.title)) {
        respond(res, 404, { error: 'pelicula no disponible' });
        return;
      }
      respond(res, 200, { success: true });
    } catch (error) {
      console.error('Error en el servicio local:', error);
      respond(res, 500, { error: 'El servicio local no pudo sincronizar o abrir la película. Revisa su ventana para más detalles.' });
    }
  });
}
