import axios from "axios";

const LandingPage = ({ currentUser }) => {  
    //data.currentUser is accessible from getInitialProps once SSR is complete
    console.log(currentUser); 
    // axios.get('/api/users/currentuser').catch((err) => {
    //   console.log(err.message);
    // });
   
    return <h1>Landing Page</h1>;
  };

LandingPage.getInitialProps = async ({req}) => {
    if (typeof window === 'undefined') {
        //we are in the server
        const {data} = await axios.get('http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/current-user', {
            headers: req.headers //passing the cookie, and the host for ingress to set the routing rules
        })
        return data
    } else {
        //we are on the browser
        const {data} = await axios.get('/api/users/current-user')
        return data
    }
}
   
export default LandingPage;