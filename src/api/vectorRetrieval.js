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

    const response = await axios.post('https://trails-chat-retrieval.fly.dev/query', data, config)
    const docs = response.data.results[0].results

    // filter scores below 0.7
    const filteredDocs = docs.filter(doc => doc.score > 0.75)

    console.log(filteredDocs )


    return filteredDocs
}


export { queryDB }