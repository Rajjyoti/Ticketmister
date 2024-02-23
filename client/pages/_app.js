import 'bootstrap/dist/css/bootstrap.css'
import buildClient from '../api/build-client'
import Header from '../components/header'

const AppComponent = ({Component, pageProps, currentUser}) => {
    return (
        <div> 
            <Header currentUser={currentUser}/>
            <Component {...pageProps} />
        </div>
    )
}

AppComponent.getInitialProps = async (appContext) => {
    const client = buildClient(appContext.ctx)
    const {data} = await client.get('/api/users/current-user')

    let pageProps = {}
    if (appContext.Component.getInitialProps) {
        pageProps = await appContext.Component.getInitialProps(appContext.ctx) //to make sure the other pages' getInitialProps are also invoked
    }

    return {
        pageProps,
        currentUser: data.currentUser //or use ...data
    }
}

export default AppComponent