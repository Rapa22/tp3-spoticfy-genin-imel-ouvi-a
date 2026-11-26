import { query } from "../db.js";

/**
 * Devuelve todos los álbumes junto con el nombre del artista.
 * @param {import('express').Request} _
 * @param {import('express').Response} res
 */
const getAlbumes = async (_, res) => {
  // Completar con la consulta que devuelve todos los albumes
  // Recordar que los parámetros de una consulta GET se encuentran en req.params
  // Deberían devolver los datos de la siguiente forma:
  /*
        [
            {
                "id": 1,
                "nombre": "Nombre del album",
                "nombre_artista": "Nombre del artista"
            },
            {
                "id": 2,
                "nombre": "Nombre del album",
                "nombre_artista": "Nombre del artista"
            },
            ...
        ]
    */
  try {
    const { rows } = await query(`
      SELECT
        al.id,
        al.nombre,
        ar.nombre AS nombre_artista
      FROM albumes al
        JOIN artistas ar ON al.artista = ar.id
      ORDER BY al.id;
    `);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Devuelve un álbum por su ID junto con el nombre del artista.
 * @param {import('express').Request} req - Params: id
 * @param {import('express').Response} res
 */
const getAlbum = async (req, res) => {
  // Completar con la consulta que devuelve un album por id
  // Recordar que los parámetros de una consulta GET se encuentran en req.params
  // Deberían devolver los datos de la siguiente forma:
  /*
        {
            "id": 1,
            "nombre": "Nombre del album",
            "nombre_artista": "Nombre del artista"
        }
    */
  try {
    const { id } = req.params;

    const { rows } = await query(
      `
      SELECT
        al.id,
        al.nombre,
        ar.nombre AS nombre_artista
      FROM albumes al
        JOIN artistas ar ON al.artista = ar.id
      WHERE al.id = $1;
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Álbum no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Crea un nuevo álbum.
 * @param {import('express').Request} req - Body: { nombre: string, artista: number }
 * @param {import('express').Response} res
 */
const createAlbum = async (req, res) => {
  // Completar con la consulta que crea un album
  // Recordar que los parámetros de una consulta POST se encuentran en req.body
  // Deberían recbir los datos de la siguiente forma:
  /*
        {
            "nombre": "Nombre del album",
            "artista": "Id del artista"
        }
    */
  try {
    const { nombre, artista } = req.body;

    const { rows } = await query(
      `
      INSERT INTO albumes (nombre, artista)
      VALUES ($1, $2)
      RETURNING *;
      `,
      [nombre, artista]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Actualiza el nombre y artista de un álbum existente.
 * @param {import('express').Request} req - Params: id. Body: { nombre: string, artista: number }
 * @param {import('express').Response} res
 */
const updateAlbum = async (req, res) => {
  // Completar con la consulta que actualiza un album
  // Recordar que en este caso tienen parámetros en req.params (el id) y en req.body (los demás datos)
  // Deberían recbir los datos de la siguiente forma:
  /*
        {
            "nombre": "Nombre del album",
            "artista": "Id del artista"
        }
    */
  try {
    const { id } = req.params;
    const { nombre, artista } = req.body;

    const { rows } = await query(
      `
      UPDATE albumes
      SET
        nombre = $1,
        artista = $2
      WHERE id = $3
      RETURNING *;
      `,
      [nombre, artista, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Álbum no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Elimina un álbum por su ID. Retorna 400 si el álbum tiene canciones asociadas.
 * @param {import('express').Request} req - Params: id
 * @param {import('express').Response} res
 */
const deleteAlbum = async (req, res) => {
  // Completar con la consulta que elimina un album
  // ¡Ojo con albumes que tengan canciones! Devuelvan el error apropiado, 400.
  // Recordar que los parámetros de una consulta DELETE se encuentran en req.params
  try {
    const { id } = req.params;

    const { rows: canciones } = await query(
      "SELECT id FROM canciones WHERE album = $1;",
      [id]
    );

    if (canciones.length > 0) {
      return res.status(400).json({
        error: "El álbum tiene canciones asociadas",
      });
    }

    const { rowCount } = await query(
      "DELETE FROM albumes WHERE id = $1;",
      [id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ mensaje: "Álbum no encontrado" });
    }

    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Devuelve todas las canciones de un álbum, incluyendo datos del artista.
 * @param {import('express').Request} req - Params: id
 * @param {import('express').Response} res
 */
const getCancionesByAlbum = async (req, res) => {
  // Completar con la consulta que devuelve las canciones de un album
  // Recordar que los parámetros de una consulta GET se encuentran en req.params
  // Deberían devolver los datos de la misma forma que getCanciones
  try {
    const { id } = req.params;

    const { rows } = await query(
      `
      SELECT
        c.id,
        c.nombre,
        c.duracion,
        c.reproducciones,
        ar.nombre AS nombre_artista,
        al.nombre AS nombre_album
      FROM canciones c
        JOIN albumes al ON c.album = al.id
        JOIN artistas ar ON al.artista = ar.id
      WHERE al.id = $1
      ORDER BY c.id;
      `,
      [id]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const albumes = {
  getAlbumes,
  getAlbum,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  getCancionesByAlbum,
};

export default albumes;