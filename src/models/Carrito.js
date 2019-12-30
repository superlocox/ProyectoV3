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


    }

    this.generateArray = function(){
        var arr= [];
        for(var id in this.items){
            arr.push(this.items[id]);
        }
        return arr;
    }
}