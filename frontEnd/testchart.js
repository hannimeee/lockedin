//import { timeArray } from "../../FaceRec/FaceVideo3" - unused for now
document.addEventListener('DOMContentLoaded', function(){

    var timeArray = ['95', '76', '88', '91', '85'] //hardcoded values for graph for now :(

    let testChart = document.getElementById('testChart').getContext('2d');
    Chart.defaults.global.defaultFontColor = 'rgb(256, 256, 256)'; 

    let chart1 = new Chart(testChart, {
    type:'line',
    data:{
        labels:['Lap 1', 'Lap 2', 'Lap 3', 'Lap 4', 'Lap 5'],
        datasets:[{
        label:'Efficiency',
        data: timeArray,
        backgroundColor:['red','orange','yellow','green','blue','purple','pink']
        }]
    },
    options:{}
    });
})
