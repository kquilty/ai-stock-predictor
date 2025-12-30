import { useState, useEffect } from 'react'
import './App.css'
import { dates } from './dates.js'
import OpenAI from 'openai';
import Markdown from 'react-markdown'
import loadingImage from './images/loading-circle.gif'

export default function App() {
    const [stockTickers, setStockTickers] = useState([])
    const [isGeneratingReport, setIsGeneratingReport] = useState(false)
    const [isReportGenerated, setIsReportGenerated] = useState(false)
    const [reportContent, setReportContent] = useState('')

    
    // On load, focus the input box
    useEffect(() => {
        document.querySelector('#ticker-input').focus();
    }, []);

    // When thinking starts, scroll to the thinking message
    useEffect(() => {
        if (isGeneratingReport) {
            document.getElementById('loading-message').scrollIntoView({behavior: 'smooth'})
        }
    }, [isGeneratingReport]);

    // When the report is shown, scroll to it
    useEffect(() => {
        if (isReportGenerated) {
            document.getElementById('report-output').scrollIntoView({behavior: 'smooth'})
        }
    }, [isReportGenerated]);

    async function handleGenerateReport() {
        setIsReportGenerated(false)
        setIsGeneratingReport(true)

        // Fetch the stock data from the Polygon API...
        const stockData = await fetchStockData()
        if(stockData === false) {
            console.error('Error fetching stock data')
            setIsGeneratingReport(false)
            return;
        }
        console.log('Fetched stock data: ', stockData)

        // Fetch the report content from OpenAI...
        const reportContent = await fetchReportData(stockData)

        // If it worked...
        if (reportContent) {

            // Set the content to display it
            setReportContent(reportContent)

            setIsReportGenerated(true)
        } else {
            console.error('Error generating report content')
        }

        setIsGeneratingReport(false)
    }

    async function fetchReportData(stockData) {
        const openai = new OpenAI({
            apiKey: import.meta.env.VITE_OPENAI_API_KEY,
            dangerouslyAllowBrowser: true
        })

        const messages = [
            {
                role: 'system',
                content: 'You are a stock market expert. Data on a few specific stocks over the past few days will be provided to you.'
                        +' Provide a brief summary on whether to buy or sell the shares from these based on that data.'
                        +' Answer in markdown format.'
                        +' Do not recommend follow up actions.'
            },
            {
                role: 'user',
                content: JSON.stringify(stockData)
            }
        ]

        const response = await openai.chat.completions.create({
            model: 'gpt-5-nano',
            messages: messages,
            max_completion_tokens: 5000 // Just a safety net. Should normally use around 2000.
        })

        console.log('OpenAI response: ', response)

        return response.choices[0].message.content
    }

    async function fetchStockData() {
        // document.querySelector('.action-panel').style.display = 'none'
        // loadingArea.style.display = 'flex'
        try {
            
            const allStockData = await Promise.all(stockTickers.map(async (ticker) => {
                const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${dates.startDate}/${dates.endDate}?apiKey=${import.meta.env.VITE_POLYGON_API_KEY}`
                const response = await fetch(url)
                const data = await response.text()
                const status = await response.status

                // console.log('Querying URL: ', url) <--- caution: exposes API key in console!
                // console.log('data for ', ticker, ': ', data)

                if (status === 200) {
                    //apiMessage.innerText = 'Creating report...'
                    return data
                } else {
                    //loadingArea.innerText = 'There was an error fetching stock data.'
                }
            }))

            // Simulated stock data fetch
            // await new Promise(resolve => setTimeout(resolve, 2000))
            // const stockData = stockTickers.map(ticker => `Data for ${ticker}\n`)           
            // const newReportContent = 'Fetched Stock Data:\n' + stockData.join('')
            // setReportContent(newReportContent)

            // Success
            return allStockData;

        } catch(err) {
            //loadingArea.innerText = 'There was an error fetching stock data.'
            console.error('error: ', err)
        }
        return false;
    }

    function handleAddTicker(ticker = null) {
        const input = document.querySelector('#ticker-input');
        if (!ticker) {
            ticker = input.value.trim();
        }


        if (ticker) {

            ticker = ticker.trim().toUpperCase();

            // Prevent duplicates
            if (stockTickers.includes(ticker)) {
                // alert('Ticker already added!')
                input.value = '';
                return;
            }

            // Prevent more than 3
            if (stockTickers.length >= 3) {
                alert('You can only add up to 3 tickers.')
                input.value = '';
                return;
            }

            // Validate ticker format (simple alphanumeric check)
            const tickerRegex = /^[A-Z0-9]{1,5}$/;
            if (!tickerRegex.test(ticker)) {
                alert('Invalid ticker format. (must be 1-5 alphanumeric characters)')
                input.value = '';
                return;
            }

            // Add it
            setStockTickers([...stockTickers, ticker])

            input.value = '';
        }
    }

    return (
        <>

            <Header />

            <Instructions />

            {stockTickers.length < 3 && !isGeneratingReport && !isReportGenerated &&
                <InputBlock onAddTicker={(ticker) => handleAddTicker(ticker)} />
            }

            {stockTickers.length > 0 && 
                <AddedTickersList stockTickers={stockTickers} onClear={() => {
                    setStockTickers([])
                    setIsReportGenerated(false)
                    setReportContent('')
                    document.querySelector("#ticker-input").focus();
                }
                } />
            }

            {stockTickers.length > 0 && !isGeneratingReport && !isReportGenerated &&
                <GenerateReportButton onClick={handleGenerateReport} />
            }

            {isGeneratingReport &&
                <LoadingStatus />
            }

            {isReportGenerated && 
                <ReportOutput reportContent={reportContent} onClear={() => {
                        setReportContent('')
                        setIsReportGenerated(false)
                        document.querySelector("#ticker-input").focus();
                    }
                } />
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
            <p>Add up to 3 stock tickers below to predict whether you should buy, hold, or sell them.</p>
        </section>
    )
}

function InputBlock({ onAddTicker }) {

    const quickTickersArray = ['NVDA', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA']

    const quickTickerLinks = quickTickersArray.map((ticker) => (
        <a key={ticker} onClick={() => {
            onAddTicker(ticker)
            document.querySelector("#ticker-input").focus();
        }} className="quick-ticker-link">
            {ticker}
        </a>
    ))

    return (
        <section className="card">
            <form className="add-ticker-form" onSubmit={(e) => {
                e.preventDefault();
                onAddTicker();
            }}>
                <input 
                    type="text" 
                    placeholder="Enter a stock ticker..." 
                    id="ticker-input" 
                    maxLength={5} 
                    className='ticker-input-empty'
                    onChange={(e) => {
                        const input = e.target;
                        if (input.value.trim()) {
                            input.className = 'ticker-input-with-content';
                        } else {
                            input.className = 'ticker-input-empty';
                        }
                    }}
                />
                <button type="submit" onClick={()=> document.querySelector("#ticker-input").focus()}>
                    Add Ticker
                </button>
            </form>
            <div style={{marginTop: '25px', fontSize: '0.7rem', fontWeight: 'bold',  borderBottom: '1px solid #ccc', color: '#aaa'}}>
                COMMON TICKERS
            </div>
            <div className='quick-ticker-link-list'>
                {quickTickerLinks}
            </div>
        </section>
    )
}

function AddedTickersList({ stockTickers, onClear }) {
    return (
        <section className="card" style={{position: 'relative'}}>
            <button 
                onClick={onClear}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: '#666',
                    padding: '5px 10px',
                    lineHeight: '1',
                    opacity: '0.6',
                    transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '1'}
                onMouseLeave={(e) => e.target.style.opacity = '0.6'}
                title="Clear all tickers"
            >
                ×
            </button>
            <h3>Added Tickers:</h3>
            <div className='added-tickers-list'>
                {stockTickers.length === 0 ? (
                    <span>--NONE--</span>
                ) : (
                    stockTickers.map((ticker, index) => <span key={index}>{ticker}</span>)
                )}
            </div>
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
        <section className="card" id="loading-message">
            <h3>Thinking...</h3>
            <img src={loadingImage} height="200px" alt="Loading..." />
            <p>Please wait while we analyze the data and create your report.</p>
        </section>
    )
}

function ReportOutput({ reportContent, onClear }) {
    return (
        <section className="card" id="report-output"  style={{position: 'relative'}}>
            <button 
                onClick={onClear}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: '#666',
                    padding: '5px 10px',
                    lineHeight: '1',
                    opacity: '0.6',
                    transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '1'}
                onMouseLeave={(e) => e.target.style.opacity = '0.6'}
                title="Clear all tickers"
            >
                ×
            </button>
            {reportContent.length === 0 ? (
                <div>
                    <p>No content found!</p>
                    <p>:(</p>
                    <p>Please try again in a few minutes.<br />(one of the endpoints may be down)</p>
                </div>
            ) : (
                <div className='report-output'>
                    <h3>Here is what I would recommend...</h3>
                    <span style={{fontSize: '2rem'}}>👇</span>
                    <Markdown>{reportContent}</Markdown>
                </div>
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
