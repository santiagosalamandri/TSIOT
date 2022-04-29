
const express = require('express')
const app = express()

app.use(express.json());
app.use(express.urlencoded({extended:true}))

const httpPort = 8080

var count = -1;

app.get('/reset', function(req, res) {
   count = 0;
   res.sendFile('reset.html', { root: __dirname }); console.log('reset');
} )

app.get('/hitcount', function(req, res) {
   res.send(
`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Page HitCount</title>
</head>
<body>
<div id="count">${count}</div>  
</body>
</html>`);

 console.log('hitcount');
} )



app.get('/hit', function(req, res) {
   ++count;
   res.send('hit ok'); console.log('get hit');

} )


app.post('/cargar_datos.php', function(req, res) {
   ++count;
   res.sendFile('postOk.html', { root: __dirname } ); console.log('post hit');

} )

app.get('/multiply', function(req, res) {
   ++count;
   res.sendFile('multiply.html', { root: __dirname } ); console.log('multiply hit');

} )

app.post('/multiply', function(req, res) {
   ++count;

if(req.body.num1 !=undefined && req.body.num2!=undefined){
   mult=req.body.num1*req.body.num2;
   res.send(`<h1>El resultado de multiplicar ${req.body.num1} con ${req.body.num2} es:</> <h1 id="mult">${mult}</>` );
    console.log('multiply hit');
}
else{
res.send('error')
console.log('error');
}
} )

app.get('/imagen.png', function(req, res) {
   ++count;
   res.sendFile('gok.png', { root: __dirname } ); console.log('img hit');

} )

app.listen(httpPort, () => console.log(`App listening on port ${httpPort}!`))

