const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')

const { dateFlow } = require("./flows./date.flow")
const { formFlow } = require("./flows./form.flow")
const { welcomeFlow } = require("./flows./welcome.flow")



const flowPrincipal = addKeyword([EVENTS.WELCOME])
    .addAction(async (ctx, ctxFn) => {
        const bodyText = ctx.body.toLowerCase();
        
        const keywords = ["hola", "buenas", "ola"];
        const containsKeyword = keywords.some(keyword => bodyText.includes(keyword));
        if (containsKeyword && ctx.body.lengh < 8) {
            return await ctxFn .gotoFlow(welcomeFlow)
        }

        const keywordsDate = ["agendar", "cita", "reunion", "turno"];
        const containsKeywordDate = keywordsDate.some(keyword => bodyText.includes(keyword));
        if (containsKeywordDate) {
            return ctxFn.gotoFlow(dateFlow);
        } else {
            return ctxFn.endFlow("No entiendo");
        }
    });
    

const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowPrincipal, dateFlow, formFlow, welcomeFlow])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
