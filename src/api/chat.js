import axios from 'axios';


const sendChat = async (messages) => {

    const data = {
      messages: messages
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 1234',
        'accept': 'application/json'
      },
    }

    const chatResponse = await axios.post('http://0.0.0.0:8000/chat', data, config)

    return chatResponse.data.message
}

export { sendChat }