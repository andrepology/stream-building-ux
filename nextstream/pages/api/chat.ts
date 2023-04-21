import axios from 'axios';

const sendChat = async (messages: any) => {
    const data = {
        messages: messages
    }

    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 1234',
            'accept': 'application/json',
        },
    }

    const chatResponse = await axios.post('https://trails-chat-retrieval.fly.dev/chat', data, config);

    // Return error message (if required)
    if (chatResponse?.data?.error) {
        return chatResponse?.data?.error;
    }

    return chatResponse?.data?.message;
}

export { sendChat };