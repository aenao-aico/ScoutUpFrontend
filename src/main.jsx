import React from 'react'
import ReactDOM from 'react-dom/client'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import App from './App.jsx'
import './index.css'

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#22c55e',
        },
        secondary: {
            main: '#38bdf8',
        },
        background: {
            default: '#020617',
            paper: '#0f172a',
        },
    },
    shape: {
        borderRadius: 14,
    },
    typography: {
        fontFamily: [
            'Inter',
            'system-ui',
            '-apple-system',
            'BlinkMacSystemFont',
            'Segoe UI',
            'sans-serif',
        ].join(','),
    },
})

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </React.StrictMode>,
)