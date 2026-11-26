import { query } from "../db.js";

/**
 * Devuelve todas las canciones junto con datos del álbum y artista.
 * @param {import('express').Request} _
 * @param {import('express').Response} res
 */
const getCanciones = async (_, res) => {
  // Completar con la consulta que devuelve todas las canciones
  // Recordar que los parámetros de una consulta GET se encuentran en req.params
  // Deberían devolver los datos de la siguiente forma:
  /*
        [
            {
                "id": "Id de la canción",
                "nombre": "Nombre de la canción",
                "nombre_artista": "Id del artista",
                "nombre_album": "Id del album",
                "duracion": "Duración de la canción",
                "reproducciones": "Reproducciones de la canción"
            },
            {
                "id": "Id de la canción",
                "nombre": "Nombre de la canción",
                "nombre_artista": "Id del artista",
                "nombre_album": "Id del album",
                "duracion": "Duración de la canción",
                "reproducciones": "Reproducciones de la canción"
            },
            ...
        ]
    */
  try {
    const { rows } = await query(`
      SELECT
        c.id,
        c.nombre,
        ar.nombre AS nombre_artista,
        al.nombre AS nombre_album,
        c.duracion,
        c.reproducciones
      FROM canciones c
      JOIN albumes al ON c.album = al.id
      JOIN artistas ar ON al.artista = ar.id
      ORDER BY c.id;
    `);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Devuelve una canción por su ID junto con datos del álbum y artista.
 * @param {import('express').Request} req - Params: id
 * @param {import('express').Response} res
 */
const getCancion = async (req, res) => {
  // Completar con la consulta que devuelve una canción
  // Recordar que los parámetros de una consulta GET se encuentran en req.params
  // Deberían devolver los datos de la siguiente forma:
  /*
        {
            "id": "Id de la canción",
            "nombre": "Nombre de la canción",
            "nombre_artista": "Id del artista",
            "nombre_album": "Id del album",
            "duracion": "Duración de la canción",
            "reproducciones": "Reproducciones de la canción"
        }
    */
  try {
    const { id } = req.params;

    const { rows } = await query(
      `
      SELECT
        c.id,
        c.nombre,
        ar.nombre AS nombre_artista,
        al.nombre AS nombre_album,
        c.duracion,
        c.reproducciones
      FROM canciones c
      JOIN albumes al ON c.album = al.id
      JOIN artistas ar ON al.artista = ar.id
      WHERE c.id = $1;
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Canción no encontrada" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Crea una nueva canción con reproducciones inicializadas en 0.
 * @param {import('express').Request} req - Body: { nombre: string, album: number, duracion: number }
 * @param {import('express').Response} res
 */
const createCancion = async (req, res) => {
  // Completar con la consulta que crea una canción
  // Recordar que los parámetros de una consulta POST se encuentran en req.body
  // Deberían recibir los datos de la siguiente forma:
  /*
        {
            "nombre": "Nombre de la canción",
            "album": "Id del album",
            "duracion": "Duración de la canción",
        }
    */
  // (Reproducciones se inicializa en 0)
  try {
    const { nombre, album, duracion } = req.body;

    const { rows } = await query(
      `
      INSERT INTO canciones (nombre, album, duracion, reproducciones)
      VALUES ($1, $2, $3, 0)
      RETURNING *;
      `,
      [nombre, album, duracion]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Actualiza el nombre, álbum y duración de una canción existente.
 * @param {import('express').Request} req - Params: id. Body: { nombre: string, album: number, duracion: number }
 * @param {import('express').Response} res
 */
const updateCancion = async (req, res) => {
  // Completar con la consulta que actualiza una canción
  // Recordar que los parámetros de una consulta PUT se encuentran en req.body
  // Deberían recibir los datos de la siguiente forma:
  /*
        {
            "nombre": "Nombre de la canción",
            "album": "Id del album",
            "duracion": "Duración de la canción",
        }
    */
  // (Reproducciones no se puede modificar con esta consulta)
  try {
    const { id } = req.params;
    const { nombre, album, duracion } = req.body;

    const { rows } = await query(
      `
      UPDATE canciones
      SET
        nombre = $1,
        album = $2,
        duracion = $3
      WHERE id = $4
      RETURNING *;
      `,
      [nombre, album, duracion, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Canción no encontrada" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Elimina una canción por su ID.
 * @param {import('express').Request} req - Params: id
 * @param {import('express').Response} res
 */
const deleteCancion = async (req, res) => {
  // Completar con la consulta que elimina una canción
  // Recordar que los parámetros de una consulta DELETE se encuentran en req.params
  try {
    const { id } = req.params;

    const { rowCount } = await query(
      "DELETE FROM canciones WHERE id = $1;",
      [id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ mensaje: "Canción no encontrada" });
    }

    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Incrementa en 1 el contador de reproducciones de una canción.
 * @param {import('express').Request} req - Params: id
 * @param {import('express').Response} res
 */
const reproducirCancion = async (req, res) => {
  // Completar con la consulta que aumenta las reproducciones de una canción
  // En este caso es una consulta PUT, pero no recibe ningún parámetro en el body, solo en los params
  try {
    const { id } = req.params;

    const { rows } = await query(
      `
      UPDATE canciones
      SET reproducciones = reproducciones + 1
      WHERE id = $1
      RETURNING *;
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Canción no encontrada" });
    }

    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const canciones = {
  getCanciones,
  getCancion,
  createCancion,
  updateCancion,
  deleteCancion,
  reproducirCancion,
};

export default canciones;