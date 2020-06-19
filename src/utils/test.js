const si = require('systeminformation');
setInterval(()=>{
    si.cpuTemperature()
        .then(tmp=>{
            console.log(tmp);
        });
    },5000);