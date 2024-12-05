const queries = {
    
    insertFilme: `
        INSERT INTO Filme (titulo, imagemUrl, votos) 
        VALUES (?, ?, ?);
    `,

    getFilmeById: `
        SELECT * 
        FROM Filme 
        WHERE id = ?;
    `,

    getTop100Filmes: `
        SELECT * 
        FROM Filme 
        ORDER BY votos DESC 
        LIMIT 100;
    `
};

export default queries;