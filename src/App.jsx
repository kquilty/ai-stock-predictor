import { useState } from 'react'
import './App.css'

export default function App() {
    const [count, setCount] = useState(0)

    return (
        <>

            <Header />

            <Instructions />

            <Input />

            <AddedTickersList />

            <GenerateReportButton />

            <Footer />

        </>
    )
}

function Header() {
        return (
        <header>
            <h1>Stock Predictor</h1>
            <h2>Powered by AI</h2>
        </header>
    )
}

function Instructions() {
    return (
        <section>
            <p>Add up to 3 stock tickers below to predict their future prices.</p>
        </section>
    )
}

function Input() {

    return (
        <div className="card">
            <input type="text" placeholder="Enter stock ticker" />
            <button>
                Add Ticker
            </button>
        </div>
    )
}

function AddedTickersList() {
    return (
        <section>
            <h3>Added Tickers:</h3>
            <ul>
                <li>--NONE--</li>
            </ul>
        </section>
    )
}

function GenerateReportButton() {
    return (
        <section>
            <button>Generate Report</button>
        </section>
    )
}

function Footer() {
    return (
        <footer>
            <p>THIS IS NOT REAL FINANCIAL ADVICE</p>
        </footer>
    )
}
