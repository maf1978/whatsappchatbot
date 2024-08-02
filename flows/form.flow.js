const { addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const { createEvent } = require("../scripts/calendar")

const formFlow = addKeyword(EVENTS.ACTION)
    .addAction("Excelente! Gracias por confirmar la fecha. Te voy a hacer unas consultas para agendar el turno. Cual es tu nombre?", { capture: true},
        async (ctx, ctxFn) => {
            await ctxFn.state.update({ name: ctx.body }); 
        }    
    )        
    .addAnswer("Perfecto, Cual es el motivo del turno?", { capture: true},
        async (ctx, ctxFn) => {
            await ctxFn.state.update({ motive: ctx.body }); 
    }        
)            

    .addAnswer("Excelente!! Ya cree la reunion. Te esperamos!", null,
        async (ctx, ctxFn) => {
            const userInfo = await ctxFn.state.getMyState();
            const eventName = userInfo.name;
            const description = userInfo.name;
            const date = userInfo.date;
            const eventId = await createEvent(eventName, description, date)
            await ctxFn.state.clear();
        }
)
module.exports = { formFlow };   