import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'
import './styles/common.css'
import {Provider,} from "@dhis2/app-runtime";
import {checkAuth, login} from "./utils/login";
import {CssReset} from "@dhis2/ui";

const root = document.getElementById('root') as HTMLElement;


const getServerVersion = async (baseUrl: string, authorization?: string) => {
    const appVersion = await fetch(`${baseUrl}/api/system/info.json`, {
        headers: authorization ? {
            Authorization: authorization,
        } : undefined
    })
        .then(res => res.json())
        .then((systemInfo) => systemInfo.version);

    const [major, minor, patch] = appVersion.split('.')

    return {
        major,
        minor,
        patch,
        full: appVersion
    }
}

const renderProductionApp = async () => {
    const render = (baseUrl: string, apiVersion: number, serverVersion: { full: string, major: number, minor: number, patch: number }) =>
        ReactDOM.createRoot(root).render(
            <Provider
                config={{
                    baseUrl,
                    apiVersion,
                    serverVersion
                }}
            >
                <CssReset/>
                <App/>
            </Provider>,
        )
    try {

        const manifest = await (await fetch('./manifest.webapp')).json()
        const serverVersion = await getServerVersion(manifest.baseUrl);

        render(manifest.activities.dhis.href, serverVersion.minor, serverVersion)
    } catch (error) {
        console.error('Could not read manifest:', error)
        ReactDOM.createRoot(root).render(<code>No manifest found</code>)
    }
}

const renderDevApp = async () => {
    const baseUrl = import.meta.env.VITE_REACT_APP_DHIS2_BASE_URL;
    const username = import.meta.env.VITE_REACT_APP_DHIS2_USERNAME;
    const password = import.meta.env.VITE_REACT_APP_DHIS2_PASSWORD;

    const authorization = `Basic ${btoa(`${username}:${password}`)}`

    const serverVersion = await getServerVersion(baseUrl, authorization)
    const config = {
        baseUrl,
        serverVersion,
        apiVersion: serverVersion.minor
    }

    const isAuthenticated = await checkAuth(baseUrl);

    if (!isAuthenticated) {
        await login(baseUrl, {username, password})
    }

    ReactDOM.createRoot(root).render(
        <React.StrictMode>
            <CssReset/>
            <Provider config={config}>
                <App/>
            </Provider>
        </React.StrictMode>
    )
}


if (import.meta.env.PROD) {
    renderProductionApp();
} else {
    renderDevApp()
}



