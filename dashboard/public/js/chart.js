// =====================================
// CHART CONFIG
// =====================================

let myChart = null;
let currentActiveStock = null;
let currentTimeRange = "1h";



// =====================================
// OPEN CHART
// =====================================

function openChart(stock){

    currentActiveStock = stock;


    const modal =
        document.getElementById("chart-modal");


    const title =
        document.getElementById("modal-title");


    title.innerText =
        stock + " Prijs Grafiek";


    modal.style.display = "block";


    loadChart(stock);

}



// =====================================
// CLOSE CHART
// =====================================

function closeModal(){

    document.getElementById("chart-modal").style.display = "none";

}



// =====================================
// LOAD CHART
// =====================================

function loadChart(stock){


    let history =
        priceHistory[stock];


    if(!history || history.length === 0){

        console.log(
            "Geen data voor",
            stock
        );

        return;

    }



    // tijd filter toepassen

    const now = new Date();


    let milliseconds;


    if(currentTimeRange === "1h"){

        milliseconds = 60 * 60 * 1000;

    }


    if(currentTimeRange === "6h"){

        milliseconds = 6 * 60 * 60 * 1000;

    }


    if(currentTimeRange === "24h"){

        milliseconds = 24 * 60 * 60 * 1000;

    }



    const filteredHistory =
        history.filter(item => {

            return (
                now - item.time <= milliseconds
            );

        });



    const labels =
        filteredHistory.map(item =>

            item.time.toLocaleTimeString()

        );



    const prices =
        filteredHistory.map(item =>

            item.price

        );



    const ctx =
        document
        .getElementById("stockChart")
        .getContext("2d");



    if(myChart){

        myChart.destroy();

    }



    myChart = new Chart(ctx, {


        type: "line",


        data: {


            labels: labels,


            datasets: [{

                label: stock,

                data: prices,

                borderWidth: 2,

                tension: 0.3,

                pointRadius: 0

            }]


        },



        options: {


            responsive: true,


            maintainAspectRatio: false,


            animation: false,


            scales: {


                y: {

                    beginAtZero: false

                }


            },


            plugins: {


                legend: {

                    display: true

                }


            }


        }


    });


}



// =====================================
// TIME FILTER BUTTONS
// =====================================

function updateChartTime(time){


    currentTimeRange = time;



    // actieve knop aanduiden

    document
    .querySelectorAll(".filter-group button")
    .forEach(btn => {

        btn.classList.remove("active");

    });



    const button =
        document.getElementById(
            "btn-" + time
        );


    if(button){

        button.classList.add("active");

    }



    if(currentActiveStock){

        loadChart(currentActiveStock);

    }

}