class Ingrediente {
    constructor(nombre, costoPorKilo, cantidadReceta, id=Date.now()) {
        this.nombre = nombre;
        this.costoPorKilo = costoPorKilo;
        this.cantidadReceta = cantidadReceta;
        this.id = id;
    };

    calcularCosto(){
        const costoPorGramo = this.costoPorKilo / 1000;
        return costoPorGramo * this.cantidadReceta;
    };
};

// Guardar la lista de ingredientes en localStorage
const CLAVE_STORAGE = "ingredientes";

function cargarIngredientes(){
    let ingredientes = [];

    try {
    const ingredientesGuardados = JSON.parse(localStorage.getItem(CLAVE_STORAGE));

     ingredientes = ingredientesGuardados ? ingredientesGuardados.map(ingrediente => new Ingrediente(ingrediente.nombre, ingrediente.costoPorKilo, ingrediente.cantidadReceta)) : [];

    } catch (error) {
        console.error("Error al cargar los ingredientes desde localStorage:", error);
        localStorage.removeItem(CLAVE_STORAGE);

    } finally {
        console.log(`Carga finalizada: ${ingredientes.length} ingredientes cargados desde localStorage.`);
    } return ingredientes;
};

function guardarIngredientes(){
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(listaIngredientes));
};

const listaIngredientes = cargarIngredientes();

// Elementos del DOM
const form = document.getElementById('formulario');
const boton = document.querySelector(".btn-agregar");
const textoOriginal = boton.textContent;
const cuerpoTabla = document.getElementById("cuerpoTabla");

let temporizadorMensaje;

function mostrarMensaje(texto, tipo) {
    clearTimeout(temporizadorMensaje);
   
    boton.textContent = texto;
    boton.classList.add(tipo);

    temporizadorMensaje = setTimeout(() => {
        boton.textContent = textoOriginal;
        boton.classList.remove("exito", "error");
    }, 2000);
};  

// Agregar / modificar ingrediente al hacer submit en el formulario
form.addEventListener("submit", function(evento){
    evento.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const costoPorKilo = parseFloat(document.getElementById("costoPorKilo").value);
    const cantidadReceta = parseFloat(document.getElementById("cantidadReceta").value);

    if (!nombre || isNaN(costoPorKilo) || isNaN(cantidadReceta)) {
        mostrarMensaje("Completa todos los campos.", "error");
        return;
    };

    // verificar si el ingrediente ya existe en la lista
    const existente = listaIngredientes.find(ingrediente => ingrediente.nombre.toLowerCase() === nombre.toLowerCase());

    if (existente) {
        existente.costoPorKilo = costoPorKilo;
        existente.cantidadReceta = cantidadReceta;
        mostrarMensaje(`${nombre} actualizado en la receta.`, "exito");
    } else { listaIngredientes.push(new Ingrediente(nombre, costoPorKilo, cantidadReceta));
   
    };

    guardarIngredientes();
    form.reset();
    mostrarMensaje(existente ? `${nombre} actualizado en la receta.` : `${nombre} agregado a la receta.`, "exito");

});

// Eliminar un ingrediente
function eliminarIngrediente(id) {
    const indice = listaIngredientes.findIndex(ingrediente => ingrediente.id === id);

    if (indice !== -1) {
        const { nombre } = listaIngredientes[indice];   
        listaIngredientes.splice(indice, 1);
        guardarIngredientes();
        mostrarTabla();
        mostrarMensaje(`${nombre} eliminado de la receta.`, "exito"); 
    };
};

cuerpoTabla.addEventListener("click", function(evento) {
    if (evento.target.classList.contains("btn-eliminar")) {
        eliminarIngrediente(Number(evento.target.dataset.id));
    };
});

function calcularTotal() {

    return listaIngredientes.reduce((total, ingrediente) => {
        return total + ingrediente.calcularCosto();
    }, 0);
};

function mostrarTabla() {
    cuerpoTabla.innerHTML = ""; // Limpiar el contenido del tbody

    listaIngredientes.forEach(ingrediente => {
        const {id, nombre, costoPorKilo, cantidadReceta} = ingrediente;

        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${nombre}</td>
            <td>${costoPorKilo.toFixed(2)}</td>
            <td>${cantidadReceta}</td>
            <td>${ingrediente.calcularCosto().toFixed(2)}</td>
            <td><button class="btn-eliminar" data-id="${id}" title="Eliminar">✕</button></td>
        `;
        cuerpoTabla.appendChild(fila);
    });


    const costoTotalResultado = document.getElementById("costoTotal");
    costoTotalResultado.textContent = calcularTotal().toFixed(2);
};

mostrarTabla();

// Evento para limpiar tabla al presionar la tecla "Esc"
document.addEventListener("keydown", function(evento) {
    if (evento.key === "Escape") {
        return;
    }

    if (listaIngredientes.length === 0) {
        mostrarMensaje("La tabla ya está vacía.", "error");
        return;
    }

    if (confirm("¿Estás seguro de que deseas limpiar la tabla y eliminar todos los ingredientes?")) {
        listaIngredientes.length = 0;
        localStorage.removeItem(CLAVE_STORAGE);
        mostrarTabla();
        mostrarMensaje("La tabla y lista de ingredientes limpiados.", "exito");
    }
});

// Alerta de aviso al cargar la página si hay ingredientes guardados

setTimeout(() => {
    const aviso = document.getElementById("aviso");

    aviso.textContent = listaIngredientes.length > 0 ? `Tenés ${listaIngredientes.length} ingredientes guardados. Costo actual de la receta: $${calcularTotal().toFixed(2)}`
        : "Tip: Divide el costo de compra por la cantidad kilos para obtener el costo por kilo.";

    aviso.classList.add("visible");
    setTimeout(() => {
        aviso.classList.remove("visible");
    }, 6000);   
}, 3000); 



