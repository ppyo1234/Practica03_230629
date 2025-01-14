import express from "express"
import session from "express-session"
import moment from "moment-timezone"

const app = express()

//configuración del middleware de sesiones
app.use(
    session({
        secret: 'YE-Ppyo-OG-JAGG-82',
        resave: false, //permite deshabilitar cambios hasta que haya
        saveUninitialized: true, //sino esta inicializada la crea
        cookie:{maxAge: 24 * 60 * 60 * 100} //duración que mantiene la sesi+on se utilizan los milisegundos, por eso se multiplica, esto da igual a un día
    })
)

app.get('/iniciar-sesion', (req,res)=>{
    if(!req.session.inicio){ // al igual la ultima palabra es el nombre de la variable, este if esta determinando si la sesión no existe
        req.session.inicio = new Date(); //fecha de inicio de sesión
        req.session.ultimoAcceso = new Date(); //fecha de ultima consula inicial
        res.send('Sesión iniciada')
    }else{
        res.send('La sesión ya está activa')
    }
})

app.get('/actualizar', (req,res)=>{ // evalua que ya exista sino manda el mensaje de error 
    if(req.session.inicio){ 
        req.session.ultimoAcceso = new Date(); //fecha de ultima consula inicial
        res.send('Fecha de última consulta actualizada')
    }else{
        res.send('No hay una sesión activa')
    }
})
app.get('/estado-sesion', (req, res) => { 
    if (req.session.inicio) { 
        const inicio = new Date(req.session.inicio); // Convertimos a objeto Date
        const ultimoAcceso = new Date(req.session.ultimoAcceso); // Convertimos a objeto Date
        const ahora = new Date();

        if (isNaN(inicio.getTime()) || isNaN(ultimoAcceso.getTime())) {
            return res.status(400).json({ mensaje: 'Datos de sesión inválidos.' });
        }

        // Calcular la antigüedad de la cuenta
        const antiguedadMs = ahora - inicio;
        const horas = Math.floor(antiguedadMs / (1000 * 60 * 60));
        const minutos = Math.floor((antiguedadMs % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((antiguedadMs % (1000 * 60)) / 1000);

        // Convertimos las fechas al huso horario de CDMX
        const inicioCDMX = moment(inicio).tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss');
        const ultimoAccesoCDMX = moment(ultimoAcceso).tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss');

        res.json({
            mensaje: `Estado de la sesión`,
            sesionId: req.session.id, // Cambiado para mostrar solo el ID
            inicio: inicioCDMX,
            ultimoAcceso: ultimoAccesoCDMX,
            antiguedad: `${horas} horas, ${minutos} minutos, ${segundos} segundos`
        });
    } else {
        res.send('No hay una sesión activa');
    }
});

app.get('/cerrar-sesion',(req,res)=>{
    if(req.session){
        req.session.destroy((err)=>{
            if(err){
                return res.status(500).send('Error al cargar la sesión')
            }
            res.send('Sesión cerrada correctamente')
        })
    } else {
        res.send('No hay sesión activa para cerrar')
    }
})

//iniciar el servidor
const PORT = 3000
app.listen(PORT, ()=>{
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`)
})