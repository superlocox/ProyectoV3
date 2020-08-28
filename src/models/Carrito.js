const Productos = require("./Productos");



module.exports = function Cart(CarritoAntiguo){
    this.items = CarritoAntiguo.items || {};
    this.cantTotal = CarritoAntiguo.cantTotal || 0;
    this.precioTotal = CarritoAntiguo.precioTotal || 0;

    this.add = function(item,id){
        var itemAlmacenado= this.items[id];
        if(!itemAlmacenado){
            itemAlmacenado = this.items[id] = {item:item, cantidad:0, precio:0};

        }
        itemAlmacenado.cantidad++;
        itemAlmacenado.precio= itemAlmacenado.precio * itemAlmacenado.cantidad;
        this.cantTotal++;
        this.precioTotal+= itemAlmacenado.item.precio;


    };

    this.addpercount = async(id,count)=>{

        //console.log(id);

        var itemAlmacenado = await Productos.findById(id);
        console.log("Producto:");
        console.log(itemAlmacenado);
        itemAlmacenado.cantidad = count;
        console.log(count);
        console.log(itemAlmacenado.cantidad);
        itemAlmacenado.precio= itemAlmacenado.precio * itemAlmacenado.cantidad;
        this.cantTotal += itemAlmacenado.cantidad;
        this.precioTotal += itemAlmacenado.precio;
        console.log("Entro");


    }

    this.reduceByOne = function (id) {
    
        console.log('esto es: ')
        console.log(this.items[id])
        this.items[id].cantidad--;
        this.items[id].precio -= this.items[id].item.precio;
        this.cantTotal--;
        this.precioTotal -= this.item[id].item.precio;
        
    };

    this.generateArray = function(){
        var arr= [];
        for(var id in this.items){
            arr.push(this.items[id]);
        }
        return arr;
    };
}