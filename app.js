const express = require('express');
const app = express();
const math = require('mathjs')
const http= require('http')
const router = express.Router();
const path = require('path');
const { index } = require('mathjs');
const regression = require('regression');
const fs = require('fs')


const server = http.createServer(app)
app.set('port',process.env.PORT || 3000);
app.use(express.json());




app.get('/', (req,res) =>{
    res.render('index');
})

app.post('/calibration', (req,res)=>{
    const data = req.body;
    let voltage = data.voltage_measured.map(Number);
    let torque = data.torque_measured.map(Number);


    parameters = voltage.map((value,index) => [value,torque[index]]);
    const result = regression.linear(parameters);

    const gradient = result.equation[0];
    const yintercept =result.equation[1];

    
    console.log(`y = ${gradient}x + ${yintercept}`);
    const calibration_data = {gradient, yintercept};
    
    fs.writeFile('calibration.json', JSON.stringify(calibration_data), (err) => {
        if (err) throw err;
        console.log('Values saved to file');
      });

    

})

app.get('/calibrationValues',(req,res)=>{
    fs.readFile('calibration.json',(err,data) =>{
        if (err) throw err;
        const results = JSON.parse(data);

        res.json(results); 
    })
})

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

server.listen(app.get('port'), ()=>{
    console.log(`Server on port ${app.get('port')}`)
})