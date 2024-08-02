const {google} = require('googleapis');

const auth = new google.auth.GoogleAuth({
    keyFile : './google.json',
    scopes :['https:/www.googleapis.com/auth/calendar']
});

const calendar = google.calendar({ version: 'v3' });

// constantes configurables
const calendarID = 'ADDCALENDERAPI';
const timeZone = 'America/New_York';

const rangeLimit = {
    days: [1, 2, 3, 4, 5], // dias de la semana
    startHour: 8, //hora de entrada
    endHour: 19, //hora de salida
};

const standardDuration = 1; // duracion de la cita
const dateLimit = 30; // maximo de dias a traer la lista de next events.

async function createEvent(eventName, description, date, duration = standardDuration) {
    try {
        // Autenticaion
        const authClient = await auth.getClient();
        google.options({ auth: authClient });
        //fecha y hora de inicio evento
        const startDateTime = new Date(date);
        //fecha y hora
        const endDateTime = new Date(startDateTime);
        endDateTime.setHours(startDateTime.getHours() + duration);

        const event = {
            summary: eventName,
            description: description,
            start: {
                dateTime: startDateTime.toISOString(),
                timeZone: timeZone,
            },
            end:{
                dateTime: endDateTime.toISOString(),
                timeZone: timeZone,
            },
            colorId: '2' // el id de color verde en google calendaer es '11'    
        };

        const response = await calendar.events.insert({
            calendarId: calendarID,
            resource: event,
        });
        
        //generar la url de la invitacion
        const eventId = response.data.id;
        console.log('Evento creado con exito');
        return eventId;
    } catch (err) {
        console.error('Hubo un ploblema al crear el evento en el servicio del Calendar:', err);
        throw err;
    }
}

async function listAvailableSlots(startDate = new Date(), endDate) {
    try {
        // Autenticaion
        const authClient = await auth.getClient();
        google.options({ auth: authClient });
        
        
        //definir la fecha de fin si no se proporciona
        if (!endDate) {
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + dateLimit);
        }    

        const response = await calendar.events.list({
            calendarId: calendarID,
            timeMin: startDate.toISOString(), 
            timeMax: endDate.toISOString(),
            timeZone: timeZone,
            singleEvents: true,
            orderBy: 'startTime' 
        });

        const events = reponse.date.items;
        const slots = [];
        let currentDate = new Date(startDate); 

        // generar slots disponible basados en rangeLimit
        while (currentDate < endDate) {
            const dayOfWeek = currentDate.getDay();
            if (rangeLimit.days.includes(dayOfWeek)) {
                for (let hour = rangeLimit.startHour; hour < rangeLimit.endHour; hour++) {
                     const slotStart = new Date(currentDate);
                     slotStart.setHours(hour, 0, 0, 0);
                     const slotEnd = new Date(slotStart);
                     slotEnd.setHours(hour + standardDuration);

                     const isBusy = events.some(event => {
                        const evenStart = new Date(event.start.dateTime || event.start.date);
                        const evenEnd = new Date(event.end.dateTime || event.end.date);
                        return (slotStart < eventEnd && slotEnd > eventStart);
                     });

                     if (!isBusy) {
                        slots.push({ start: slotStart, end: slotEnd });
                    }
                }
            }   
            currentDate.setDate(currentDate.getDate() + 1); 
        }
        
        return slots;
    } catch (err) {
        console.error('Hubo un error al contactar el servicio de Calendar: ' + err );
        throw err; 
    }    
}
async function getNextAvailableSlot(date) {
        try {
            if (typeof date === 'string') {
                
                date = new Date(date);
            } else if (!(date instanceof Date) || isNaN(date)) {
                throw new Error('La fecha proporcionada no es valida.');
            }   
            
            const availableSlots = await listAvailableSlots(date);

            const filteredSlots = availableSlots.filter(slot => new Date(slot.start) > date);

            const sortedSlots = filteredSlots.sort((a, b) => new Date(a.start) - new Date(b.start));

            return sortedSlots.lenght > 0 ? sortedSlots[0] : nulls;
        } catch (err) {
            console.error('Hubo un error al obtener el proximo appoiment disponible: ' + err )
    
        }    
}        
async function isDateAvailable(date) {
            try {
                              
                const currentDate = new Date();
                const maxDate = new Date(currentDate);
                maxDate.setDate(currentDate.getDate() + dateLimit);

                if (date < currentDate || date > maxDate) {
                    return false;
                }
    
                const daysOfWeek = date.getDay();
                if (!rangeLimit.days.includes(daysOfWeek)) {
                return false;
                }
                const hour = date.getHours();
                if (hour < rangeLimit.startHour || hour >= rangeLimit.endHour) {
                return false;
                }
                const availableSlots = await listAvailableSlots(currentDate);

                const slotsOnGivenDate = availableSlots.filter(slot => new Date(slot.start).toDataString() === date.toDataString());

                const isSlotAvailable = slotsOnGivenDate.some(slot =>
                    new Date(slot.start).getTime() === date.getTime() &&
                    new Date(slot.end).getTime() === date.getTime() + standarDuration * 60 * 60 * 1000
                );

                return isSlotAvailable;
                
        } catch (err) {
            console.error('Hubo un error al verificar disponbilidad de la fecha: ' + err );
            throw err;        
        }            
}    

module.exports = { createEvent, isDateAvailable, getNextAvailableSlot };
