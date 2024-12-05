const queries = {
  insertFilme: `
        INSERT INTO filme (titulo, imagemUrl) 
        VALUES (?, ?);
    `,

  getFilmeById: `
        SELECT * 
        FROM filme 
        WHERE id = ?;
    `,

  getTop100Filmes: `
        SELECT * 
        FROM filme 
        ORDER BY votos DESC 
        LIMIT 100;
    `,
  getFilmesCount: `
      SELECT count(filme.id) AS count
      FROM filme;
    `,
  incrementVoto: `
      UPDATE filme
      SET votos = votos + ?
      WHERE id = ?;
    `,
  getVotesCount: `
      SELECT
      SUM(f.votos) as count
      FROM
      filme f;
  `,
}

export default queries

