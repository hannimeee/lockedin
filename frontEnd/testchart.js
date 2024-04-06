document.addEventListener('DOMContentLoaded', function(){

    //import { timeArray } from "../../FaceRec/FaceVideo3"
    var timeArray = ['25', '48', '32']

    let testChart = document.getElementById('testChart').getContext('2d');
    Chart.defaults.global.defaultFontColor = 'rgb(256, 256, 256)'; 

    let chart1 = new Chart(testChart, {
    type:'line',
    data:{
        labels:['Lap 1', 'Lap 2', 'Lap 3'],
        datasets:[{
        label:'Efficiency',
        data: ['25', '48', '32'],
        backgroundColor:['red','orange','yellow','green','blue','purple','pink']
        }]
    },
    options:{}
    });
})
