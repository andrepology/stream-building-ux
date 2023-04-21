import axios from "axios";

const queryDB = async ( query = 'tft', top_k = 100) => {
    const queries = [ // Send an NLQuery to VectorDB and return similar results
        { query: query, top_k: top_k },
    ];
     
    const data = JSON.stringify({
        queries: queries,
    });

    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 1234',
            'accept': 'application/json',
        },
    };

    const response = await axios.post('https://trails-chat-retrieval.fly.dev/query', data, config);
    const docs: any = response.data.results[0].results;

    // Filter results with a score below 0.7
    const filteredDocs = docs.filter((doc: any) => doc.score > 0.75);
    console.log(filteredDocs);
    return filteredDocs;
}

export { queryDB };