require('dotenv').config()
require('colors');
const inquirer = require('inquirer');
const binance = require('./services/binance');
const {stringListd} = require('./listComand')

inquirer.registerPrompt('suggest', require('inquirer-prompt-suggest'));

function trunc (x, posiciones = 0) {
    var s = x.toString()
    var l = s.length
    var decimalLength = s.indexOf('.') + 1
    var numStr = s.substr(0, decimalLength + posiciones)
    return Number(numStr)
}

// Getting list of current balances
async function _balances(){
    try {
        await binance.useServerTime();
        return await binance.balance();   
    } catch (error) {
        return error.body;
     }
}

async function _updateBalances(par1,par2){
    
    const balances = await _balances()
    // var balancePar1=0;
    // var balancePar2=0;
    var objectBalances = {
        par1:0,
        par2:0
    };
    if(typeof balances == 'object'){
        // balancePar1 = parseFloat(balances[par1].available);
        // balancePar2 = parseFloat(balances[par2].available);
        objectBalances.par1 = parseFloat(balances[par1].available);
        objectBalances.par2 = parseFloat(balances[par2].available);
        return objectBalances;
    }else{
        return 'Fallo al consultar balance '+balances;
    }
}

// Compra precio market con cantidad a comprar ,Placing a MARKET order
// @param: float,float,string,string
async function _buyMarket(amount,balancePar2,par1,par2){
    var market = par1 + par2;
    var arrayPar =[par1,par2];
    const pricem = await binance.prices(market);
    var price = parseFloat(pricem[market]);
        
    if(parseFloat(balancePar2) >= amount * price){
        const res = await binance.marketBuy(market, amount);
        if(res.status == 'FILLED'){
            return  printResult(res,'COMPRA','market',arrayPar);
        }else{
            return "falloApi";
        }    

    }else{
        return "Balance no suficiente";
    }
}

// ** Compra, venta limite ,Monto cantidad dada ,Placing a LIMIT order
// ** @param: string,string,float,float,float
async function _buyLimit(par1,par2,balancePar2,amount,price_buy){
    var market = par1+par2;
    var part = [par1,par2];
    if(parseFloat(balancePar2) >= amount * price_buy){
        try {
            await binance.useServerTime()
            const res = await binance.buy(market, amount, price_buy);
            
            if(res.status == 'NEW'){
                
                return printResult(res,'COMPRA','limit',part);
            }else{
                return "falloApi";
            }    
        } catch (error) {
            return error.body
        }
    }else{
        return "Balance no Suficiente";
    }

}
// venta market,@param: float,float,string,string
async function _sellMarket(amount,balancePar1,par1,par2){
    var market = par1 + par2;
    var part = [par1,par2];
    if(balancePar1>=amount){
        const res = await binance.marketSell(market, amount);
        if(res.status == 'FILLED'){
            return printResult(res,'VENTA','market',part);
        }else{
            return "falloApi";
            // console.log('FALLO DE API:', res)
        }
    }else{
        return 'Cantidad no suficiente'
    }
}
// venta limite,@param: string,string,float,float,float
async function _sellLimit(par1,par2,balancePar1,amount,price_sell){
    var market = par1 + par2;
    var part = [par1,par2];
    if(balancePar1>=amount){
        try {
            const res = await binance.sell(market, amount, price_sell);
            if(res.status == 'NEW'){
                return printResult(res,'VENTA','limit',part);
            }else{
                return "falloApiSellLimit";
            }
        } catch (error) {
            return error.body
        }
    }else{
        return 'Balance no suficiente';
    }
    
}

// ** cancelar todas las ordenes, Cancel all open orders,@param: string
async function _cancelAll(market){
    try {
        // return objet
        return res = await binance.cancelAll(market);
    } catch (error) {
        return error.body; //string
    }
}

// ** Mostrar todas las ordenes abiertas, Get list of all open orders
async function _openOrders(){
    return res = await binance.openOrders();
}

// **Compra market usando todo saldo disponible,@param: string,string,float
async function _buyMarketTotal100(par1,par2,balancePar2){
    const market = par1 + par2;
    const arrayPar = [par1,par2];
    const pricem = await binance.prices(market);
    var price = parseFloat(pricem[market]);

    var totalA = balancePar2/price;
    var amount = trunc(totalA,5);
    // console.log('cantidad a comprar: ', amount)
    if(balancePar2 >= amount * price){
        const res = await binance.marketBuy(market, amount)
        var stringMsg = "";
        if(res.status == 'FILLED'){
            stringMsg+="Todo saldo de spot ".green+"("+res.status+")\n";
            stringMsg+= printResult(res,'COMPRA','market',arrayPar)
            
            return stringMsg;
        }else{
            return "falloApi";
            // console.log('FALLO DE API:', res)
        }       
        
    }else{
        return 'Balance '+par2+' no suficiente';
    }
}
// venta toda cantidad disponible, @param string,string,float
async function _sellMarketTotal100(par1,par2,balancePar1){
    const market = par1+par2;
    const arrayPar = [par1,par2];
    var amount = trunc(balancePar1,5);
    const res = await binance.marketSell(market, amount);
    
    var stringMsg = "";
    if(res.status == 'FILLED'){
        stringMsg+=" Toda cantidad disponible".red+"("+res.status+")\n";
        stringMsg+= printResult(res,'VENTA','market',arrayPar);
            
        return stringMsg;
    }else{
        return "falloApi";
        // console.log(res)
    }
}

async function orderBuyMarketLimitSell(par1,par2,balancePar2,sellPrice){
    const market = par1 + par2;
    const part = [par1,par2];
    const pricem = await binance.prices(market);
    var price = parseFloat(pricem[market]);
    
    var amountT = parseFloat(balancePar2)/price;
    var amount = trunc(amountT,5);
    // console.log('montototal:',amount);
    if(parseFloat(balancePar2) >= amount * price){
        // try {
            const res = await binance.marketBuy(market, amount);
            // console.log(res);
        // } catch (error) {
        //     console.log(error.body);
        // }
        var stringMsg = "";
        if (res.status === 'FILLED'){
            stringMsg += printResult(res,'COMPRA','market',part);
            
            var totalAmountCont = 0;
            // commission buy par1
            for (let index = 0; index < res.fills.length; index++) {
                const element = res.fills[index];
                if(element.commissionAsset == par1){
                    totalAmountCont = totalAmountCont + (element.qty - element.commission);
                }else{
                    totalAmountCont = totalAmountCont + element.qty;
                }
            }
            
            stringMsg+=" Resultado de orden limite Venta \n".yellow;
            stringMsg+="--------------------------------\n".red;
            // --- crea orden limite venta ---
            stringMsg += await _sellLimit(par1,par2,trunc(totalAmountCont,5),trunc(totalAmountCont,5),sellPrice);
            
            return stringMsg;
            
        }else {
            return 'Fallo compra market';
        }

    } else {
       return 'Balance no suficiente';
    }
}
// imprimir resultados, @param: objet,string,string,array
function printResult(res,sideString,type,arrayPar){
    var stringMsg = "";
    if(type == 'market'){
        if(sideString=='COMPRA') 
            stringMsg+= " COMPRA MARKET ".green+"("+res.status+")\n";
        else
            stringMsg+= " VENTA MARKET ".red+"("+res.status+")\n";
        
            for (let index = 0; index < res.fills.length; index++) {
                const element = res.fills[index];
                stringMsg+=" Precio: "+element.price+" "+arrayPar[1]+"\n";
                stringMsg+=" Cantidad: "+element.qty+" "+arrayPar[0]+"\n";
                stringMsg+=" Commision: "+element.commission+"\n";
                stringMsg+=" CommisionAsset: "+element.commissionAsset+"\n";
                stringMsg+=" Total: "+element.qty*element.price+" "+arrayPar[1]+"\n";
                stringMsg+=" -----------------------------\n".yellow;
                
            }
        
        return stringMsg;
    }else{
        if(sideString=='COMPRA') 
            stringMsg+= " COMPRA LIMIT ".green+"("+res.status+")\n";
        else
            stringMsg+= " VENTA LIMIT ".red+"("+res.status+")\n";

        stringMsg+=" IdOrder: "+res.orderId+"\n";
        stringMsg+=" Precio: "+res.price+" "+arrayPar[1]+"\n";
        stringMsg+=" Cantidad: "+res.origQty+" "+arrayPar[0]+"\n";
        stringMsg+=" Total: "+res.origQty*res.price+" "+arrayPar[1]+"\n";
        return stringMsg;
    }
    
}

// symbol orderId price origQty status type side stopPrice
const init = async () =>{ 
    const questionPar =[{
        type: 'input',
        name: 'par1',
        message: 'Ingrese PAR 1:',
        default: 'BTC'
    },
    {
        type: 'input',
        name:'par2',
        message: 'Ingrese PART 2:',
        default: 'USDT'
    }
    ];

    var msgError="";
    do {
        console.clear();
        console.log(msgError);
         const res = await inquirer.prompt(questionPar);
         var par1 = res.par1.toUpperCase();
         var par2 = res.par2.toUpperCase();
         var market = par1 + par2;
         const balances = await _balances();
         if(typeof balances == 'object'){
            var cont=0;
            for (const property in balances) {
                if(property==par1)cont++;
                else if(property==par2)cont++
            }
            if(cont==2){
                balancePar1 = parseFloat(balances[par1].available);
                balancePar2 = parseFloat(balances[par2].available);
            }else{
                msgError = 'Par de trade no existe.'.red;
            }
            
        }else{
            msgError = 'Fallo al Consultar balance.'.red+"error: "+balances;
        }
    } while (cont!=2);
    
    var stringComand = '';
    var msgHistory ='';
    var suggestionComand = ['.'];
    // table response
    var tableMsg = false;
    var colTable = [];
    var arrayResp = [];
    
    do {
        console.clear();    
        console.log(`${'**********************'.rainbow+'@IngSoftware*'.magenta}`)
        console.log(`    ${'SPOT BINANCE'.yellow}`     )
        console.log(`    ${par1.yellow+'/'+par2.yellow}`     )
        console.log(` ${par1.green+' : '+balancePar1+' '+par2.green +' : '+balancePar2 }`     )
        console.log(`${'***********************************'.rainbow}`)
        
        console.log(msgHistory);
        if(tableMsg == true) console.table(arrayResp,colTable);
        console.log(`${'____________________________'.green}`)
        
        const question = [
            {
              type: 'suggest',
              name: 'comand',
              message: 'Ingresar comando:',
              suggestions: suggestionComand,
              
            },
          ];
    
        const com = await inquirer.prompt(question);    
        
        stringComand = com.comand;
        suggestionComand.splice(1, 0, com.comand); //guardar comando history
        var arrayComand = stringComand.split(' ');
        // console.log(arrayComand);
        switch (arrayComand[0]) {
            case 'a': //**BUY MARKET s ,cantidad dada de par 1
                const resBuy = await _buyMarket(parseFloat(arrayComand[1]),balancePar2,par1,par2);
                msgHistory = resBuy;
                tableMsg = false;
                colTable = [];
                arrayResp = [];
                //update balances
                balances = await _balances()
                if(typeof balances == 'object'){
                    balancePar1 = parseFloat(balances[par1].available)
                    balancePar2 = parseFloat(balances[par2].available)
                    
                }else{
                    msgHistory += 'Fallo al consultar balance.'.red+"error: "+balances;
                }
                break;
            case 'd': //**BUY LIMIT Compra limit con candidad de compra, precio limite
                const resBuyL = await _buyLimit(par1,par2,balancePar2,parseFloat(arrayComand[1]),parseFloat(arrayComand[2]));
                
                msgHistory = resBuyL;
                tableMsg = false;
                colTable = [];
                arrayResp = [];

                //update balances
                balances = await _balances()
                if(typeof balances == 'object'){
                    balancePar1 = parseFloat(balances[par1].available)
                    balancePar2 = parseFloat(balances[par2].available)
                    
                }else{
                    msgHistory += 'Fallo al consultar balance.'.red+"error: "+balances;
                }
            break;
            case 's': //**SELL MARKET venta market con cantidad dada
                const resSell = await _sellMarket(parseFloat(arrayComand[1]),balancePar1,par1,par2);
                
                msgHistory = resSell;
                tableMsg = false;
                colTable = [];
                arrayResp = [];
                //update balances
                balances = await _balances()
                if(typeof balances == 'object'){
                    balancePar1 = parseFloat(balances[par1].available)
                    balancePar2 = parseFloat(balances[par2].available)
                    
                }else{
                    msgHistory += 'Fallo al consultar balance.'.red+"error: "+balances;
                }
            break;
            case 'f': //**SELL limit venta limite con cantidad de venta
                const resSellL = await _sellLimit(par1,par2,balancePar1,parseFloat(arrayComand[1]),parseFloat(arrayComand[2]));
                
                msgHistory = resSellL;
                tableMsg = false;
                colTable = [];
                arrayResp = [];

                //update balances
                balances = await _balances()
                if(typeof balances == 'object'){
                    balancePar1 = parseFloat(balances[par1].available)
                    balancePar2 = parseFloat(balances[par2].available)
                    
                }else{
                    msgHistory += 'Fallo al consultar balance.'.red+"error: "+balances;
                }
            break;
            case 'q': // cambiar PAR de trade *

                const resp = await inquirer.prompt(questionPar);
                var par1p = resp.par1.toUpperCase();
                var par2p = resp.par2.toUpperCase();
                balances = await _balances();
                if(typeof balances == 'object'){
                    var cont=0;
                    for (const property in balances) {
                        if(property==par1p)cont++;
                        else if(property==par2p)cont++
                    }
                    if(cont==2){
                        par1 = par1p;
                        par2 = par2p;
                        market = par1 + par2;
                        balancePar1 = parseFloat(balances[par1].available);
                        balancePar2 = parseFloat(balances[par2].available);
                        msgHistory = 'Cambio de trade: '.green+market;
                    }else{
                        msgHistory = 'Par de trade no existe.'.red;
                    }
                    
                }else{
                    msgHistory =  'Fallo al Consultar balance.'.red+"error: "+balances;
                }
            break;
            case '.': //lista comando *
               msgHistory = stringListd;
               tableMsg = false;
               colTable = [];
               arrayResp = [];
            break;
            case 'cl': //limpiar consola *
               msgHistory = '';
               tableMsg = false;
               colTable = [];
               arrayResp = [];
            break;
            case 'c': // cancelar todas las ordenes *al cancelar orden se actualiza balances
             const resc = await  _cancelAll(market);

             if(typeof resc == 'object'){
                 msgHistory = 'Ordenes Canceladas';
                 tableMsg = true;
                 colTable = ['symbol','price','origQty','type','side','status'];
                 arrayResp = resc;
                 //update balances
                 balances = await _balances()
                 if(typeof balances == 'object'){
                     balancePar1 = parseFloat(balances[par1].available)
                     balancePar2 = parseFloat(balances[par2].available)
                     
                 }else{
                     msgHistory += 'Fallo al consultar balance.'.red+"error: "+balances;
                 }
                }else{
                    msgHistory = 'Fallo al cancelar '+resc;
                    tableMsg = false;
                    colTable = [];
                    arrayResp = [];
                }
             break;
             case 'op': //Lista de ordenes abiertas *
                 const res = await _openOrders();
                 if(typeof res == 'object'){
                    var arrayOrders = [];
                    for (var i = 0; i < res.length; i++) {
                        var order = res[i];
                        var newCol = order.symbol+'/'+order.side+'/'+order.type;
                        order.trade = newCol;
                        arrayOrders.push(order);
                    }
                    msgHistory = ' Respuesta: Lista de todas las ordenes abiertas';
                    tableMsg = true;
                    colTable = ['orderId','trade','price','origQty'];
                    arrayResp = arrayOrders;
                }else{
                     msgHistory = 'Fallo de Api';
                     tableMsg = false;
                     colTable = [];
                     arrayResp = [];
                 }                 
            break;
            case 'co'://**cancelar una orden
                const resList = await _openOrders();
                 if(typeof resList == 'object'){
                    var arrayOrders = [];
                    for (var i = 0; i < resList.length; i++) {
                        var order = resList[i];
                        var newCol = order.orderId+" "+order.symbol+'/'+order.side+'/'+order.type+" price "+order.price+" qty "+order.origQty;
                        // order.trade = newCol;
                        arrayOrders.push(newCol);
                    }
                    arrayOrders.push('Salir');
                    
                    if(arrayOrders.length>1){
                        const questionList = [
                        {
                            type: 'list',
                            name: 'idOrder',
                            message: 'Elegir Order a cancelar:',
                            choices: arrayOrders
                            
                        },
                        ];
                        const resoc = await inquirer.prompt(questionList);
                        var op = resoc.idOrder;
                        // console.log(resoc.idOrder);
                        
                        if(op != 'Salir'){
                            var id = op.split(' ');
                            var orderid = parseFloat(id[0])
                            const resCancel = await binance.cancel(market, orderid);
                        // ---
                        if(typeof resCancel == 'object'){
                            msgHistory = 'Orden Cancelada\n'.green;
                            msgHistory += 'Symbol: '+resCancel.symbol+'\n';
                            msgHistory += 'Type: '+resCancel.type+'\n';
                            msgHistory += 'Price: '+resCancel.price+'\n';
                            msgHistory += 'Mount: '+resCancel.origQty+'\n';
                            
                            tableMsg = false;
                            colTable = [];
                            arrayResp = [];
                            //update balances
                            balances = await _balances()
                            if(typeof balances == 'object'){
                                balancePar1 = parseFloat(balances[par1].available)
                                balancePar2 = parseFloat(balances[par2].available)
                                
                            }else{
                                msgHistory += 'Fallo al consultar balance.'.red+"error: "+balances;
                            }
                           }else{
                               msgHistory = 'Fallo al cancelar ';
                               tableMsg = false;
                               colTable = [];
                               arrxayResp = [];
                           }
                        }
                        
                    }else{
                        msgHistory = 'No hay ordenes abiertas';
                        tableMsg = false;
                        colTable = [];
                        arrayResp = [];
                    }
                    
                }else{
                     msgHistory = 'Fallo de Api';
                     tableMsg = false;
                     colTable = [];
                     arrayResp = [];
                 }
                break;
            case 'b': // actualiza balance
                  
                //update balances
                balances = await _balances()
                if(typeof balances == 'object'){
                    var cont=0;
                    for (const property in balances) {
                        if(property==par1)cont++;
                        else if(property==par2)cont++
                        // console.log(`${property}: ${object[property]}`);
                    }
                    if(cont==2){
                        balancePar1 = parseFloat(balances[par1].available);
                        balancePar2 = parseFloat(balances[par2].available);
                    }else{
                        msgHistory += 'PAR no existe'.red;
                    }
                    
                }else{
                    msgHistory += 'Fallo al actualizar balance.'.red+"error: "+balances;
                }
            break;
            // --- COMANDOS PAR BTC/ USDT BUSD
            case 'w': //**Compra market todo saldo en spot
                const resT = await _buyMarketTotal100(par1,par2,balancePar2);
                msgHistory = resT;
                tableMsg = false;
                colTable = [];
                arrayResp = [];
                // actualiza balance available
                //update balances
                balances = await _balances()
                if(typeof balances == 'object'){
                    balancePar1 = parseFloat(balances[par1].available)
                    balancePar2 = parseFloat(balances[par2].available)
                    
                }else{
                    msgHistory += 'Fallo al consultar balance.'.red+"error: "+balances;
                }
            break;
            case 'e': //**Venta market usando toda la cantidad disponible
                const resM = await _sellMarketTotal100(par1,par2,balancePar1)
                msgHistory = resM;
                tableMsg = false;
                colTable = [];
                arrayResp = [];
                // actualiza balance available
                //update balances
                balances = await _balances()
                if(typeof balances == 'object'){
                    balancePar1 = parseFloat(balances[par1].available)
                    balancePar2 = parseFloat(balances[par2].available)
                    
                }else{
                    msgHistory += 'Fallo al consultar balance.'.red+"error: "+balances;
                }
            break;
            case 'r': //**compra market, venta limite,todo saldo: r precioVentaLimite
               
               const resO = await orderBuyMarketLimitSell(par1,par2,balancePar2,parseFloat(arrayComand[1]));
               msgHistory = resO;
               tableMsg = false;
               colTable = [];
               arrayResp = [];
               // actualiza balance available
               //update balances
               balances = await _balances()
               if(typeof balances == 'object'){
                   balancePar1 = parseFloat(balances[par1].available)
                   balancePar2 = parseFloat(balances[par2].available)
                   
               }else{
                   msgHistory += 'Fallo al consultar balance.'.red+"error: "+balances;
               }
               break;
            case 't': //** compra market,venta limite , saldo a gastar: t cantidadAGastar precioLimiteVenta
                const resBS = await orderBuyMarketLimitSell(par1,par2,arrayComand[1],parseFloat(arrayComand[2]));
                msgHistory = resBS;
                tableMsg = false;
                colTable = [];
                arrayResp = [];
                
                //update balances
                balances = await _balances()
                if(typeof balances == 'object'){
                    balancePar1 = parseFloat(balances[par1].available)
                    balancePar2 = parseFloat(balances[par2].available)
                    
                }else{
                    msgHistory += 'Fallo al consultar balance.'.red+"error: "+balances;
                }
            break;
        }
        
    } while (arrayComand[0] != 'x');
}

init()
