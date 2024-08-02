const { chat } = require('./chatgpt');
const { DateTime } = require('luxon');

function iso2text(iso) {
    try {

        const dateTime = DateTime.fromISO(iso, { zone: 'utc' }).setZone('America/New_York');

        const formattedDate = dateTime.toLocalString({
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZoneName: 'short'
        });

        return formattedDate;

    } catch (error) {
        console.error('Error al convertir la fecha: ' + error );
        return 'Formato de fecha no valido';        
    }            
    
}

async function text2iso(text) {
    const currentDate = new Date();
    const prompt = "La fecha de hoy es: " + currentDate + `Te voy a dar un texto.
        Necesito que de ese texto extraigas la fecha y la hora del texto que te voy a dar y repondas con las mismma en formato ISO.
        Me tenes que responder EXCLUSIVAMENTE con esa fecha y horarios en fromato ISO, usando el horario 10:00 en caso de que no este especificado la hora.
        Por ejemplo, el texto puede ser algo como "el jueves 30 de mayo a las 12hs". En ese caso tu repuesta tiene que ser 2024-06-30T12:00:000. 
        Por ejemplo, el texto puede ser algo como "Este viernes 31". En ese caso tu repuesta tiene que ser 2024-06-31T10:00:000.
        Si el texto es algo como:Manana 10Amp, sumarle un dia a la fecha actual y dar eso como resultado.
        si el teto no tiene sentido, reponder 'false' `;
    const messages = [{ role: "user", content: `${text}` }];
    
    const response = await chat(prompt, messages);

    return response.trim(); 
}

module.exports = { text2iso, iso2text};