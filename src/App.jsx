import { useState } from 'react'
import './App.css'

export default function App() {
    const [stockTickers, setStockTickers] = useState([])
    const [isGeneratingReport, setIsGeneratingReport] = useState(false)

    return (
        <>

            <Header />

            <Instructions />

            <Input onAddTicker={(ticker) => setStockTickers([...stockTickers, ticker])} />

            <AddedTickersList stockTickers={stockTickers} />

            <GenerateReportButton setIsGeneratingReport={setIsGeneratingReport} />

            {isGeneratingReport && <ReportOutput stockTickers={stockTickers} />}

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

function Input({ onAddTicker }) {

    return (
        <div className="card">
            <input type="text" placeholder="Enter stock ticker" id="ticker-input" />
            <button onClick={() => {
                const input = document.querySelector('#ticker-input');
                const ticker = input.value.trim().toUpperCase();
                if (ticker) {
                    onAddTicker(ticker);
                    input.value = '';
                }
            }}>
                Add Ticker
            </button>
        </div>
    )
}

function AddedTickersList({ stockTickers }) {
    return (
        <section>
            <h3>Added Tickers:</h3>
            <ul>
                {stockTickers.length === 0 ? (
                    <li>--NONE--</li>
                ) : (
                    stockTickers.map((ticker, index) => <li key={index}>{ticker}</li>)
                )}
            </ul>
        </section>
    )
}

function GenerateReportButton({ setIsGeneratingReport }) {
    return (
        <section>
            <button onClick={() => setIsGeneratingReport(true)}>Generate Report</button>
        </section>
    )
}

function ReportOutput({ stockTickers }) {
    return (
        <section>
            <h3>Report Output:</h3>
            {stockTickers.length === 0 ? (
                <p>No tickers added. Please add stock tickers to generate a report.</p>
            ) : (
                <p>Report for: {stockTickers.join(', ')}</p>
            )}
        </section>
    )
}

function Footer() {
    return (
        <footer>
            <p style={{
                color: 'darkred',
                textAlign: 'center',
                marginTop: '80px',
                fontSize: '12px',
                // fontWeight: 'bold'
            }}>* THIS IS NOT REAL FINANCIAL ADVICE</p>
        </footer>
    )
}
