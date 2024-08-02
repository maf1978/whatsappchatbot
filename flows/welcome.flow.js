const { addKeyword, EVENTS } = require('@bot-whatsapp/bot');

const welcomeFlow = addKeyword(EVENTS.ACTION)
      .addAction(async (ctx, ctxFn) => {
        await ctxFn.endFlow("Bienvenidos a este chatbot! \nPodes escribir 'Agenda cita' pra reservar cita")
      })

module.exports = { welcomeFlow };      