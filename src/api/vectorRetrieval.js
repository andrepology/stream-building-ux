import axios from 'axios';


const queryDB = async ( query = "tft", top_k = 100) => {

    // send a NLQuery to VectorDB and return similar docs

    const queries = [
      { query: query, top_k: top_k }
    ]

    const data = JSON.stringify({
      queries: queries
    })

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 1234',
        'accept': 'application/json'
      },
    }

    const response = await axios.post('http://0.0.0.0:8000/query', data, config)
    const docs = response.data.results[0].results

    return docs
}


export { queryDB }