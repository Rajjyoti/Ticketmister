import axios from "axios"

const buildClient = ({req}) => {
    if (typeof window === 'undefined') {
        //we are in the server
        return axios.create({
            baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
            headers: req.headers
        })
    } else {
        //we are on the browser
        return axios.create({
            baseUrl: '/',
        })
    }
}

export default buildClient