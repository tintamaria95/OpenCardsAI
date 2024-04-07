import { useRouteError } from "react-router-dom"

export function GlobalErrorElement(){
    let error = useRouteError()
    console.log(error) 
    return <h1>Oops... It seems that something went wrong !</h1>
}