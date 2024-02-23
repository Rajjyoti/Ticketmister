import Router from "next/router";
import useRequest from "../../hooks/use-request";
import { useEffect } from "react";

const SignOut = () => {
    const {doRequest} = useRequest({
        url: '/api/users/signout',
        method: 'post',
        body: {},
        onSuccess: () => Router.push('/')
    })
    
    useEffect(() => {
        doRequest()
    }, [])
}

export default SignOut