var stringListd = "LISTA COMANDOS \n";
stringListd += "-------------------------------\n";

stringListd += "1) a cantidadComprar".yellow+"\n";
stringListd += " Realiza compra market con cantidad dada\n";

stringListd += "2) d cantidadCompra precioLimiteCompra".yellow+"\n";
stringListd += "  Compra limit con candidad de moneda\n";

stringListd += "3) s cantidadVenta".yellow+"\n";
stringListd += " venta market con cantidad dada\n";

stringListd += "4) f cantidadVenta precioLimiteVenta".yellow+"\n";
stringListd += " venta limite usando una cantidad dada \n";

stringListd += "5) op  ".yellow+"\n";
stringListd += " Lista de ordenes abiertas \n";

stringListd += "6) c".yellow+"\n";
stringListd += " cancelar todas las ordenes del par de trade \n";

stringListd += "7) co".yellow+"\n";
stringListd += " cancelar una orden\n";

stringListd += "8) q".yellow+"\n";
stringListd += " Cambiar de Par de trading \n";

stringListd += "9) . ".yellow+"\n";
stringListd += " Mostrar lista de comandos\n";

stringListd += "10) cl".yellow+"\n";
stringListd += " Limpiar consola\n";

stringListd += "11) b".yellow+"\n";
stringListd += " Actualiza balance\n";

stringListd += " \n";
stringListd += "-------------------------------\n".green;
stringListd += " Comandos solo para el par BTC/USDT BTC/BUSD o cualquier stablecoin".green.bold.underline+"\n";
stringListd += "-------------------------------\n".green;

stringListd += "1) w".yellow+"\n";
stringListd += " Compra market usando todo el saldo en spot\n";

stringListd += "2) e".yellow+"\n";
stringListd += " Venta market usando toda la cantidad disponible\n";

stringListd += "3) r precioLimiteVenta".yellow+"\n";
stringListd += " - realiza compra market con todo el saldo en spot,\n";
stringListd +=  "- Despues crea una orden limite de venta con el precio dado con la misma cantidad comprada\n";

stringListd += "4) t cantidadAGastar precioLimiteVenta".yellow+"\n";
stringListd += " - compra con cantidad de activos a gastar a precio de  mercado,\n";
stringListd += " - crea orden limite de venta con el precio dado y cantidad comprada,\n";
stringListd += " \n";


module.exports = {
    stringListd
}