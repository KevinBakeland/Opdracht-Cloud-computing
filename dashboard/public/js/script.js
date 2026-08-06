// =====================================
// CONFIG
// =====================================

const NODE_RED_URL = "/nodered";



// =====================================
// STOCK DATA
// =====================================

let currentPrices = {
    AAPL: 0,
    TSLA: 0,
    KEVB: 0,
    CATS: 0
};



let priceHistory = {
    AAPL: [],
    TSLA: [],
    KEVB: [],
    CATS: []
};




// =====================================
// TRADING DATA LADEN
// =====================================

let cash =
    Number(localStorage.getItem("cash")) || 10000;


let realizedProfit =
    Number(localStorage.getItem("realizedProfit")) || 0;



let userPortfolio =
    JSON.parse(
        localStorage.getItem("userPortfolio")
    )
    ||
    {

        AAPL:{
            amount:0,
            totalCost:0
        },

        TSLA:{
            amount:0,
            totalCost:0
        },

        KEVB:{
            amount:0,
            totalCost:0
        },

        CATS:{
            amount:0,
            totalCost:0
        }

    };





// =====================================
// LIVE STOCK DATA
// =====================================

async function fetchData(){

    try{


        const response =
            await fetch(
                `${NODE_RED_URL}/stocks?t=${Date.now()}`
            );


        const stocks =
            await response.json();



        Object.keys(stocks).forEach(symbol=>{


            const price =
                Number(stocks[symbol]);



            currentPrices[symbol] =
                price;



            priceHistory[symbol].push({

                time:new Date(),

                price:price

            });



            if(priceHistory[symbol].length > 200){

                priceHistory[symbol].shift();

            }



            const element =
                document.getElementById(
                    `${symbol.toLowerCase()}-price`
                );



            if(element){

                element.innerText =
                    "€" + price.toFixed(2);

            }


        });



        calculatePortfolio();


    }
    catch(error){

        console.error(
            "Stock data fout:",
            error
        );

    }

}






// =====================================
// BUY / SELL
// =====================================

function executeTrade(stock,type,event){


    event.stopPropagation();



    const price =
        currentPrices[stock];


    const portfolio =
        userPortfolio[stock];



    if(price <= 0){

        alert(
            "Geen prijs beschikbaar"
        );

        return;

    }





    // =====================
    // KOPEN
    // =====================

    if(type === "buy"){


        if(cash < price){

            alert(
                "Niet genoeg geld"
            );

            return;

        }



        portfolio.amount++;

        portfolio.totalCost += price;


        cash -= price;


    }






    // =====================
    // VERKOPEN
    // =====================

    if(type === "sell"){



        if(portfolio.amount <= 0){

            alert(
                "Je bezit geen aandelen"
            );

            return;

        }



        const average =
            portfolio.totalCost /
            portfolio.amount;



        const profit =
            price - average;



        realizedProfit += profit;



        portfolio.amount--;

        portfolio.totalCost -= average;


        cash += price;


    }



    saveGame();


    calculatePortfolio();


}








// =====================================
// OPSLAAN
// =====================================

function saveGame(){


    localStorage.setItem(
        "cash",
        cash
    );


    localStorage.setItem(
        "realizedProfit",
        realizedProfit
    );


    localStorage.setItem(
        "userPortfolio",
        JSON.stringify(userPortfolio)
    );


}









// =====================================
// PORTFOLIO BEREKENING
// =====================================

function calculatePortfolio(){



    let portfolioValue =
        cash;



    let totalProfit =
        realizedProfit;




    Object.keys(userPortfolio).forEach(stock=>{


        const data =
            userPortfolio[stock];


        const price =
            currentPrices[stock];



        const lower =
            stock.toLowerCase();




        const count =
            document.getElementById(
                `${lower}-count`
            );



        if(count){

            count.innerText =
                data.amount;

        }






        if(data.amount > 0){



            const currentValue =
                data.amount * price;



            portfolioValue +=
                currentValue;





            const average =
                data.totalCost /
                data.amount;





            const unrealizedProfit =
                (price-average)
                *
                data.amount;



            totalProfit +=
                unrealizedProfit;






            const buy =
                document.getElementById(
                    `${lower}-buyprice-display`
                );



            if(buy){

                buy.innerText =
                    "€" +
                    average.toFixed(2);

            }







            const pl =
                document.getElementById(
                    `${lower}-pl`
                );



            if(pl){

                pl.innerText =

                    (unrealizedProfit >= 0 ? "+" : "")
                    +
                    "€"
                    +
                    unrealizedProfit.toFixed(2);

            }



        }


    });






    const total =
        document.getElementById(
            "total-pl"
        );



    if(total){


        total.innerText =

            (totalProfit >= 0 ? "+" : "")
            +
            "€"
            +
            totalProfit.toFixed(2);


    }





    const cashDisplay =
        document.getElementById(
            "cash-display"
        );



    if(cashDisplay){

        cashDisplay.innerText =
            "€" + cash.toFixed(2);

    }






    const portfolioDisplay =
        document.getElementById(
            "portfolio-value"
        );



    if(portfolioDisplay){

        portfolioDisplay.innerText =
            "€" + portfolioValue.toFixed(2);

    }







    const status =
        document.getElementById(
            "total-status"
        );



    if(status){

        status.innerText =

            "Cash: €"
            +
            cash.toFixed(2)
            +
            " | Portfolio: €"
            +
            portfolioValue.toFixed(2);

    }


}








// =====================================
// NIEUW SPEL
// =====================================

function resetSession(){


    if(!confirm(
        "Nieuw spel starten?"
    ))

    return;




    cash = 10000;


    realizedProfit = 0;



    Object.keys(userPortfolio)
    .forEach(stock=>{


        userPortfolio[stock].amount = 0;


        userPortfolio[stock].totalCost = 0;


    });




    saveGame();



    calculatePortfolio();


}








// =====================================
// START
// =====================================

window.onload = ()=>{


    fetchData();



    calculatePortfolio();



    setInterval(
        fetchData,
        5000
    );


};