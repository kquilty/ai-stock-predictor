import { useState } from 'react'
import './App.css'

export default function App() {
    const [stockTickers, setStockTickers] = useState([])
    const [isGeneratingReport, setIsGeneratingReport] = useState(false)
    const [isReportGenerated, setIsReportGenerated] = useState(false)
    const [reportContent, setReportContent] = useState('')

    async function handleGenerateReport() {
        setIsGeneratingReport(true)

        const reportGenerated = await fetchStockData()
        setIsGeneratingReport(false)

        if (reportGenerated) {
            setIsReportGenerated(true)
        }
    }

    async function fetchStockData() {
        // document.querySelector('.action-panel').style.display = 'none'
        // loadingArea.style.display = 'flex'
        try {
            /*
            const stockData = await Promise.all(tickersArr.map(async (ticker) => {
                const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${dates.startDate}/${dates.endDate}?apiKey=${process.env.POLYGON_API_KEY}`
                const response = await fetch(url)
                const data = await response.text()
                const status = await response.status
                if (status === 200) {
                    //apiMessage.innerText = 'Creating report...'
                    return data
                } else {
                    //loadingArea.innerText = 'There was an error fetching stock data.'
                }
            }))
            */

            // Simulated stock data fetch
            await new Promise(resolve => setTimeout(resolve, 2000))
            const stockData = stockTickers.map(ticker => `Data for ${ticker}\n`)           
            const newReportContent = 'Fetched Stock Data:\n' + stockData.join('')

            setReportContent(newReportContent)

            // Success
            return true;

        } catch(err) {
            //loadingArea.innerText = 'There was an error fetching stock data.'
            console.error('error: ', err)
        }
        return false;
    }

    return (
        <>

            <Header />

            <Instructions />

            {stockTickers.length < 3 && 
                <Input onAddTicker={(ticker) => setStockTickers([...stockTickers, ticker])} />
            }

            {stockTickers.length > 0 && 
                <AddedTickersList stockTickers={stockTickers} />
            }

            {stockTickers.length > 0 && 
                <GenerateReportButton onClick={handleGenerateReport} />
            }

            {isGeneratingReport && 
                <LoadingStatus />
            }

            {isReportGenerated && 
                <ReportOutput reportContent={reportContent} />
            }

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
        <section className="card">
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
        </section>
    )
}

function AddedTickersList({ stockTickers }) {
    return (
        <section className="card">
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

function GenerateReportButton({ onClick }) {
    return (
        <section>
            <button onClick={onClick}>Generate Report</button>
        </section>
    )
}

function LoadingStatus() {
    return (
        <section className="card">
            <h3>Generating Report...</h3>
            <p>Please wait while we analyze the data and create your report.</p>
        </section>
    )
}

function ReportOutput({ reportContent }) {
    return (
        <section className="card">
            <h3>Report Output:</h3>
            {reportContent.length === 0 ? (
                <p>No content found.</p>
            ) : (
                <pre>{reportContent}</pre>
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
