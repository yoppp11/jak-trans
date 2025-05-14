import axios from 'axios'

export const http = axios.create({
    baseURL: 'https://api-v3.mbta.com',
    headers: {
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json'
    }
})