const listaPlatos =
    document.getElementById("listaPlatos");

const selectorPlatos =
    document.getElementById("selectorPlatos");

const btnCerrarSesion =
    document.getElementById("btnCerrarSesion");

const btnMostrarFormulario =
    document.getElementById("btnMostrarFormulario");

const contenedorFormulario =
    document.getElementById("contenedorFormulario");

const formPlato =
    document.getElementById("formPlato");

const platoId =
    document.getElementById("platoId");

const nombrePlato =
    document.getElementById("nombrePlato");

const descripcionPlato =
    document.getElementById("descripcionPlato");

const tituloFormulario =
    document.getElementById("tituloFormulario");

const btnGuardarPlato =
    document.getElementById("btnGuardarPlato");

const btnCancelar =
    document.getElementById("btnCancelar");

const mensajePlato =
    document.getElementById("mensajePlato");

const modalEliminar =
    document.getElementById("modalEliminar");

const nombreEliminar =
    document.getElementById("nombreEliminar");

const btnCancelarEliminar =
    document.getElementById("btnCancelarEliminar");

const btnConfirmarEliminar =
    document.getElementById("btnConfirmarEliminar");

const btnIniciarVotacion =
    document.getElementById("btnIniciarVotacion");

const mensajeVotacion =
    document.getElementById("mensajeVotacion");

const votacionActiva =
    document.getElementById("votacionActiva");

const controlVotacion =
    document.getElementById("controlVotacion");

const resultadosMama =
    document.getElementById("resultadosMama");

const totalVotosMama =
    document.getElementById("totalVotosMama");

const btnCerrarVotacion =
    document.getElementById("btnCerrarVotacion");

const resultadoFinal =
    document.getElementById("resultadoFinal");

const contenidoResultadoFinal =
    document.getElementById("contenidoResultadoFinal");

const btnNuevaVotacion =
    document.getElementById(
        "btnNuevaVotacion"
    );

const estadoVotantes =
    document.getElementById(
        "estadoVotantes"
    );

let idPendienteEliminar = null;

let platosDisponibles = [];

let votacionActual = null;
let resultadosActuales = [];



/* ========================================= */
/* SESIÓN                                    */
/* ========================================= */

async function comprobarSesionMama() {

    const {
        data: { session },
        error
    } = await supabaseClient.auth.getSession();


    if (error || !session) {

        window.location.href =
            "mama-login.html";

        return false;
    }


    return true;
}



/* ========================================= */
/* CERRAR SESIÓN                             */
/* ========================================= */

btnCerrarSesion.addEventListener(
    "click",
    async () => {

        await supabaseClient.auth.signOut();

        window.location.href =
            "index.html";

    }
);



/* ========================================= */
/* CARGAR PLATOS                             */
/* ========================================= */

async function cargarPlatos() {

    const {
        data,
        error
    } = await supabaseClient
        .from("platos")
        .select("*")
        .eq("activo", true)
        .order(
            "creado_en",
            { ascending: false }
        );


    if (error) {

        console.error(error);

        listaPlatos.innerHTML = `
            <div class="estado-vacio">
                ❌ Error cargando platos
            </div>
        `;

        return;
    }


    platosDisponibles = data || [];


    mostrarPlatos();

    mostrarSelectorPlatos();

}



/* ========================================= */
/* MOSTRAR PLATOS                            */
/* ========================================= */

function mostrarPlatos() {

    if (platosDisponibles.length === 0) {

        listaPlatos.innerHTML = `
            <div class="estado-vacio">

                <span>🍲</span>

                <h3>
                    Todavía no hay platos
                </h3>

                <p>
                    Agrega el primer plato.
                </p>

            </div>
        `;

        return;
    }


    listaPlatos.innerHTML = "";


    platosDisponibles.forEach(
        (plato) => {

            const tarjeta =
                document.createElement("article");


            tarjeta.className =
                "tarjeta-plato";


            tarjeta.innerHTML = `

                <div class="plato-informacion">

                    <div class="plato-icono">
                        🍽️
                    </div>

                    <div>

                        <h3></h3>

                        <p></p>

                    </div>

                </div>


                <div class="acciones-plato">

                    <button class="btn-editar">
                        ✏️ Editar
                    </button>

                    <button class="btn-eliminar">
                        🗑️ Eliminar
                    </button>

                </div>
            `;


            tarjeta.querySelector("h3")
                .textContent =
                plato.nombre;


            tarjeta.querySelector(
                ".plato-informacion p"
            ).textContent =
                plato.descripcion ||
                "Sin descripción";


            tarjeta.querySelector(
                ".btn-editar"
            ).addEventListener(
                "click",
                () => editarPlato(plato)
            );


            tarjeta.querySelector(
                ".btn-eliminar"
            ).addEventListener(
                "click",
                () => abrirModalEliminar(plato)
            );


            listaPlatos.appendChild(
                tarjeta
            );

        }
    );

}



/* ========================================= */
/* SELECTOR PARA VOTACIÓN                    */
/* ========================================= */

function mostrarSelectorPlatos() {

    if (platosDisponibles.length === 0) {

        selectorPlatos.innerHTML = `

            <div class="estado-vacio">

                <span>🍽️</span>

                <p>
                    Primero agrega algunos platos.
                </p>

            </div>

        `;

        return;
    }


    selectorPlatos.innerHTML = "";


    platosDisponibles.forEach(
        (plato) => {

            const opcion =
                document.createElement("label");


            opcion.className =
                "opcion-votacion";


            const checkbox =
                document.createElement("input");


            checkbox.type =
                "checkbox";


            checkbox.value =
                plato.id;


            checkbox.className =
                "checkbox-plato";


            const contenido =
                document.createElement("div");


            const titulo =
                document.createElement("strong");


            titulo.textContent =
                plato.nombre;


            const descripcion =
                document.createElement("small");


            descripcion.textContent =
                plato.descripcion ||
                "Sin descripción";


            contenido.appendChild(
                titulo
            );


            contenido.appendChild(
                descripcion
            );


            opcion.appendChild(
                checkbox
            );


            opcion.appendChild(
                contenido
            );


            selectorPlatos.appendChild(
                opcion
            );

        }
    );

}



/* ========================================= */
/* NUEVO PLATO                               */
/* ========================================= */

btnMostrarFormulario.addEventListener(
    "click",
    () => {

        prepararNuevoPlato();

        contenedorFormulario
            .classList
            .remove("oculto");

        nombrePlato.focus();

    }
);


function prepararNuevoPlato() {

    formPlato.reset();

    platoId.value = "";

    tituloFormulario.textContent =
        "🍲 Nuevo plato";

    btnGuardarPlato.textContent =
        "Guardar plato";

    mensajePlato.textContent =
        "";

}



/* ========================================= */
/* CANCELAR                                  */
/* ========================================= */

btnCancelar.addEventListener(
    "click",
    () => {

        prepararNuevoPlato();

        contenedorFormulario
            .classList
            .add("oculto");

    }
);



/* ========================================= */
/* GUARDAR PLATO                             */
/* ========================================= */

formPlato.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();


        const nombre =
            nombrePlato.value.trim();


        const descripcion =
            descripcionPlato.value.trim();


        if (!nombre) {
            return;
        }


        btnGuardarPlato.disabled =
            true;


        let error;


        if (platoId.value) {

            const resultado =
                await supabaseClient
                    .from("platos")
                    .update({
                        nombre,
                        descripcion
                    })
                    .eq(
                        "id",
                        platoId.value
                    );


            error =
                resultado.error;

        }

        else {

            const resultado =
                await supabaseClient
                    .from("platos")
                    .insert({
                        nombre,
                        descripcion,
                        activo: true
                    });


            error =
                resultado.error;

        }


        btnGuardarPlato.disabled =
            false;


        if (error) {

            console.error(error);

            mensajePlato.textContent =
                "❌ No se pudo guardar.";

            return;
        }


        prepararNuevoPlato();


        contenedorFormulario
            .classList
            .add("oculto");


        await cargarPlatos();

    }
);



/* ========================================= */
/* EDITAR                                    */
/* ========================================= */

function editarPlato(plato) {

    platoId.value =
        plato.id;


    nombrePlato.value =
        plato.nombre;


    descripcionPlato.value =
        plato.descripcion || "";


    tituloFormulario.textContent =
        "✏️ Editar plato";


    btnGuardarPlato.textContent =
        "Guardar cambios";


    contenedorFormulario
        .classList
        .remove("oculto");


    nombrePlato.focus();

}



/* ========================================= */
/* ELIMINAR                                  */
/* ========================================= */

function abrirModalEliminar(plato) {

    idPendienteEliminar =
        plato.id;


    nombreEliminar.textContent =
        plato.nombre;


    modalEliminar
        .classList
        .remove("oculto");

}


function cerrarModalEliminar() {

    idPendienteEliminar =
        null;


    modalEliminar
        .classList
        .add("oculto");

}


btnCancelarEliminar.addEventListener(
    "click",
    cerrarModalEliminar
);


btnConfirmarEliminar.addEventListener(
    "click",
    async () => {

        if (!idPendienteEliminar) {
            return;
        }


        const {
            error
        } = await supabaseClient
            .from("platos")
            .delete()
            .eq(
                "id",
                idPendienteEliminar
            );


        if (error) {

            console.error(error);

            alert(
                "No se pudo eliminar."
            );

            return;
        }


        cerrarModalEliminar();

        await cargarPlatos();

    }
);



/* ========================================= */
/* BUSCAR VOTACIÓN ACTIVA                    */
/* ========================================= */

async function comprobarVotacionActiva() {

    const {
        data,
        error
    } = await supabaseClient
        .from("votaciones")
        .select("*")
        .eq(
            "estado",
            "abierta"
        )
        .order(
            "creado_en",
            { ascending: false }
        )
        .limit(1)
        .maybeSingle();


    if (error) {

        console.error(
            "Error buscando votación:",
            error
        );

        return;
    }


    votacionActual =
        data;


    actualizarEstadoVotacion();

}



/* ========================================= */
/* MOSTRAR ESTADO                            */
/* ========================================= */

function actualizarEstadoVotacion() {

    if (votacionActual) {

        votacionActiva
            .classList
            .remove("oculto");


        btnIniciarVotacion.disabled =
            true;


        btnIniciarVotacion.textContent =
            "🟢 Votación en curso";

        cargarResultadosMama();
    }

    else {

        votacionActiva
            .classList
            .add("oculto");


        btnIniciarVotacion.disabled =
            false;


        btnIniciarVotacion.textContent =
            "🗳️ Iniciar votación";

    }

}



/* ========================================= */
/* INICIAR VOTACIÓN                          */
/* ========================================= */

btnIniciarVotacion.addEventListener(
    "click",
    async () => {

        const seleccionados =
            Array.from(
                document.querySelectorAll(
                    ".checkbox-plato:checked"
                )
            );


        if (seleccionados.length < 2) {

            mensajeVotacion.textContent =
                "⚠️ Selecciona por lo menos 2 platos.";


            mensajeVotacion.style.color =
                "#b54708";

            return;
        }


        btnIniciarVotacion.disabled =
            true;


        btnIniciarVotacion.textContent =
            "Creando votación...";


        /* CREAR VOTACIÓN */

        const {
            data: nuevaVotacion,
            error: errorVotacion
        } = await supabaseClient
            .from("votaciones")
            .insert({
                estado: "abierta"
            })
            .select()
            .single();


        if (errorVotacion) {

            console.error(
                errorVotacion
            );


            mensajeVotacion.textContent =
                "❌ No se pudo crear la votación.";


            btnIniciarVotacion.disabled =
                false;


            btnIniciarVotacion.textContent =
                "🗳️ Iniciar votación";

            return;
        }


        /* GUARDAR OPCIONES */

        const opciones =
            seleccionados.map(
                (checkbox) => ({
                    votacion_id:
                        nuevaVotacion.id,

                    plato_id:
                        Number(
                            checkbox.value
                        )
                })
            );


        const {
            error: errorOpciones
        } = await supabaseClient
            .from(
                "opciones_votacion"
            )
            .insert(opciones);


        if (errorOpciones) {

            console.error(
                errorOpciones
            );


            /*
             * Si las opciones fallan,
             * eliminamos la votación
             * incompleta.
             */

            await supabaseClient
                .from("votaciones")
                .delete()
                .eq(
                    "id",
                    nuevaVotacion.id
                );


            mensajeVotacion.textContent =
                "❌ No se pudieron guardar los platos.";


            btnIniciarVotacion.disabled =
                false;


            btnIniciarVotacion.textContent =
                "🗳️ Iniciar votación";

            return;
        }


        votacionActual =
            nuevaVotacion;


        mensajeVotacion.textContent =
            "✅ ¡Votación iniciada! Tu familia ya puede votar.";


        mensajeVotacion.style.color =
            "#027a48";


        actualizarEstadoVotacion();

    }
);

async function cargarResultadosMama() {

    if (!votacionActual) {
        return;
    }


    const {
        data: opciones,
        error: errorOpciones
    } = await supabaseClient
        .from("opciones_votacion")
        .select(`
            plato_id,
            platos (
                id,
                nombre
            )
        `)
        .eq(
            "votacion_id",
            votacionActual.id
        );


    if (errorOpciones) {

        console.error(
            "Error cargando opciones:",
            errorOpciones
        );

        return;
    }


    const {
        data: votos,
        error: errorVotos
    } = await supabaseClient
        .from("votos")
        .select("plato_id, votante")
        .eq(
            "votacion_id",
            votacionActual.id
        );


    if (errorVotos) {

        console.error(
            "Error cargando votos:",
            errorVotos
        );

        return;
    }


    resultadosActuales =
        opciones.map(opcion => {

            const cantidad =
                votos.filter(
                    voto =>
                        Number(voto.plato_id) ===
                        Number(opcion.plato_id)
                ).length;


            return {

                plato_id:
                    opcion.plato_id,

                nombre:
                    opcion.platos.nombre,

                votos:
                    cantidad

            };

        });


    resultadosActuales.sort(
        (a, b) =>
            b.votos - a.votos
    );

    mostrarEstadoVotantes(
    votos
    );

    mostrarResultadosMama(
        votos.length
    );

}

function mostrarEstadoVotantes(
    votos
) {

    const personas = [
        {
            nombre: "Alessandro",
            emoji: "👨"
        },
        {
            nombre: "Mery",
            emoji: "👩"
        }
    ];


    estadoVotantes.innerHTML = "";


    personas.forEach(
        persona => {

            const yaVoto =
                votos.some(
                    voto =>
                        voto.votante ===
                        persona.nombre
                );


            const fila =
                document.createElement("div");


            fila.className =
                "estado-votante";


            fila.innerHTML = `

                <div>

                    <span>
                        ${persona.emoji}
                    </span>

                    <strong>
                        ${persona.nombre}
                    </strong>

                </div>


                <span
                    class="${
                        yaVoto
                            ? "ya-voto"
                            : "falta-votar"
                    }"
                >

                    ${
                        yaVoto
                            ? "✓ Ya votó"
                            : "⏳ Falta votar"
                    }

                </span>

            `;


            estadoVotantes.appendChild(
                fila
            );

        }
    );

}

function mostrarResultadosMama(total) {

    resultadosMama.innerHTML = "";


    totalVotosMama.textContent =
        total === 1
            ? "1 voto"
            : `${total} votos`;


    resultadosActuales.forEach(
        resultado => {

            const porcentaje =
                total > 0
                    ? Math.round(
                        (
                            resultado.votos /
                            total
                        ) * 100
                    )
                    : 0;


            const elemento =
                document.createElement("div");


            elemento.className =
                "resultado-plato";


            elemento.innerHTML = `

                <div class="resultado-cabecera">

                    <strong></strong>

                    <span></span>

                </div>

                <div class="barra-votos">

                    <div
                        class="progreso-votos"
                        style="width:${porcentaje}%"
                    ></div>

                </div>

                <small>
                    ${porcentaje}%
                </small>

            `;


            elemento.querySelector(
                "strong"
            ).textContent =
                resultado.nombre;


            elemento.querySelector(
                ".resultado-cabecera span"
            ).textContent =
                resultado.votos === 1
                    ? "1 voto"
                    : `${resultado.votos} votos`;


            resultadosMama.appendChild(
                elemento
            );

        }
    );


    controlVotacion
        .classList
        .remove("oculto");

}

/* ========================================= */
/* INICIAR                                   */
/* ========================================= */

async function iniciarPanel() {

    const autenticada =
        await comprobarSesionMama();


    if (!autenticada) {
        return;
    }


    await cargarPlatos();

    await comprobarVotacionActiva();


    /*
     * Comenzar a escuchar Supabase
     */

    iniciarRealtimeMama();

}

btnNuevaVotacion.addEventListener(
    "click",
    async () => {

        /*
         * LIMPIAMOS VARIABLES
         */

        votacionActual =
            null;


        resultadosActuales =
            [];


        /*
         * OCULTAMOS RESULTADO
         */

        resultadoFinal
            .classList
            .add("oculto");


        btnNuevaVotacion
            .classList
            .add("oculto");


        controlVotacion
            .classList
            .add("oculto");


        votacionActiva
            .classList
            .add("oculto");


        /*
         * LIMPIAMOS MENSAJES
         */

        mensajeVotacion.textContent =
            "";


        contenidoResultadoFinal.innerHTML =
            "";


        /*
         * DESMARCAR PLATOS
         */

        document
            .querySelectorAll(
                ".checkbox-plato"
            )
            .forEach(
                checkbox => {

                    checkbox.checked =
                        false;

                }
            );


        /*
         * ACTIVAR BOTÓN
         */

        btnIniciarVotacion.disabled =
            false;


        btnIniciarVotacion.textContent =
            "🗳️ Iniciar votación";


        /*
         * VOLVER A SELECTOR
         */

        document
            .querySelector(
                ".seccion-votacion"
            )
            .scrollIntoView({

                behavior:
                    "smooth"

            });

    }
);

/* ========================================= */
/* REALTIME                                  */
/* ========================================= */

let canalRealtimeMama = null;


function iniciarRealtimeMama() {

    /*
     * Evitamos crear varios canales
     * si esta función se ejecuta otra vez.
     */

    if (canalRealtimeMama) {

        supabaseClient.removeChannel(
            canalRealtimeMama
        );

    }


    canalRealtimeMama =
        supabaseClient
            .channel(
                "realtime-panel-mama"
            )


            /* ============================= */
            /* NUEVOS VOTOS                  */
            /* ============================= */

            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "votos"
                },
                async (payload) => {

                    console.log(
                        "🗳️ Cambio en votos:",
                        payload
                    );


                    /*
                     * Si existe una votación
                     * actualmente abierta,
                     * actualizamos resultados.
                     */

                    if (votacionActual) {

                        await cargarResultadosMama();

                    }

                }
            )


            /* ============================= */
            /* CAMBIOS EN VOTACIONES         */
            /* ============================= */

            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "votaciones"
                },
                async (payload) => {

                    console.log(
                        "📊 Cambio en votación:",
                        payload
                    );

                }
            )


            /* ============================= */
            /* CAMBIOS EN PLATOS             */
            /* ============================= */

            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "platos"
                },
                async (payload) => {

                    console.log(
                        "🍽️ Cambio en platos:",
                        payload
                    );

                    await cargarPlatos();

                }
            )


            .subscribe(
                (status) => {

                    console.log(
                        "Realtime mamá:",
                        status
                    );

                }
            );

}

iniciarPanel();

btnCerrarVotacion.addEventListener(
    "click",
    async () => {

        if (!votacionActual) {
            return;
        }


        if (
            resultadosActuales.length === 0
        ) {

            return;
        }


        const confirmar =
            confirm(
                "¿Seguro que quieres cerrar la votación? Después ya no se podrán registrar más votos."
            );


        if (!confirmar) {
            return;
        }


        btnCerrarVotacion.disabled =
            true;


        btnCerrarVotacion.textContent =
            "Cerrando...";


        await cargarResultadosMama();


        const {
            error
        } = await supabaseClient
            .from("votaciones")
            .update({
                estado: "cerrada"
            })
            .eq(
                "id",
                votacionActual.id
            );


        if (error) {

            console.error(error);


            alert(
                "No se pudo cerrar la votación."
            );


            btnCerrarVotacion.disabled =
                false;


            btnCerrarVotacion.textContent =
                "🔒 Cerrar votación";


            return;
        }


        analizarResultado();

    }
);

function analizarResultado() {

    if (
        resultadosActuales.length === 0
    ) {

        return;

    }


    const total =
        resultadosActuales.reduce(
            (suma, resultado) =>
                suma + resultado.votos,
            0
        );


    controlVotacion
        .classList
        .add("oculto");


    resultadoFinal
        .classList
        .remove("oculto");


    /*
     * NADIE VOTÓ
     */

    if (total === 0) {

        contenidoResultadoFinal.innerHTML = `

            <div class="ganador-final">

                <div class="trofeo">
                    😴
                </div>

                <p class="panel-mini">
                    SIN VOTOS
                </p>

                <h2>
                    Nadie votó
                </h2>

                <p>
                    Esta votación terminó
                    sin ningún voto.
                </p>

            </div>

        `;


        btnNuevaVotacion
            .classList
            .remove("oculto");


        return;

    }


    /*
     * BUSCAR MAYOR CANTIDAD
     */

    const maximoVotos =
        Math.max(
            ...resultadosActuales.map(
                resultado =>
                    resultado.votos
            )
        );


    /*
     * BUSCAR PRIMEROS PUESTOS
     */

    const ganadores =
        resultadosActuales.filter(
            resultado =>
                resultado.votos ===
                maximoVotos
        );


    /*
     * GANADOR DIRECTO
     */

    if (ganadores.length === 1) {

        guardarGanador(
            ganadores[0]
        );

        return;

    }


    /*
     * EMPATE
     */

    mostrarEmpate(
        ganadores
    );

}

async function guardarGanador(
    ganador
) {

    const {
        error
    } = await supabaseClient
        .from("votaciones")
        .update({

            ganador_id:
                ganador.plato_id,

            estado:
                "cerrada"

        })
        .eq(
            "id",
            votacionActual.id
        );


    if (error) {

        console.error(
            "Error guardando ganador:",
            error
        );


        alert(
            "No se pudo guardar el ganador."
        );


        return;

    }


    /*
     * ACTUALIZAR OBJETO LOCAL
     */

    votacionActual.estado =
        "cerrada";


    votacionActual.ganador_id =
        ganador.plato_id;


    /*
     * MOSTRAR GANADOR
     */

    contenidoResultadoFinal.innerHTML = `

        <div class="ganador-final">

            <div class="trofeo">
                🏆
            </div>

            <p class="panel-mini">
                GANADOR
            </p>

            <h2></h2>

            <p>

                Obtuvo

                <strong>
                    ${ganador.votos}
                </strong>

                ${
                    ganador.votos === 1
                        ? "voto"
                        : "votos"
                }

            </p>


            <div class="mensaje-comida">

                🍴 ¡Esto se come hoy!

            </div>

        </div>

    `;


    contenidoResultadoFinal
        .querySelector("h2")
        .textContent =
            ganador.nombre;


    /*
     * MOSTRAR NUEVA VOTACIÓN
     */

    btnNuevaVotacion
        .classList
        .remove("oculto");

}

function mostrarEmpate(
    empatados
) {

    contenidoResultadoFinal.innerHTML = "";


    const contenedor =
        document.createElement("div");


    contenedor.className =
        "empate-final";


    const icono =
        document.createElement("div");


    icono.className =
        "trofeo";


    icono.textContent =
        "⚖️";


    const etiqueta =
        document.createElement("p");


    etiqueta.className =
        "panel-mini";


    etiqueta.textContent =
        "TENEMOS UN EMPATE";


    const titulo =
        document.createElement("h2");


    titulo.textContent =
        "¡Hora del sorteo!";


    const texto =
        document.createElement("p");


    texto.textContent =
        "Los siguientes platos obtuvieron la misma cantidad de votos:";


    const lista =
        document.createElement("div");


    lista.className =
        "lista-empatados";


    empatados.forEach(
        plato => {

            const item =
                document.createElement("div");


            item.className =
                "plato-empatado";


            item.textContent =
                `🍽️ ${plato.nombre} · ${plato.votos} votos`;


            lista.appendChild(
                item
            );

        }
    );


    const boton =
        document.createElement("button");


    boton.className =
        "btn-sorteo";


    boton.textContent =
        "🎲 SORTEO";


    boton.addEventListener(
        "click",
        () => realizarSorteo(
            empatados,
            boton
        )
    );


    contenedor.appendChild(icono);

    contenedor.appendChild(etiqueta);

    contenedor.appendChild(titulo);

    contenedor.appendChild(texto);

    contenedor.appendChild(lista);

    contenedor.appendChild(boton);


    contenidoResultadoFinal
        .appendChild(
            contenedor
        );

}

async function realizarSorteo(
    empatados,
    boton
) {

    if (
        !votacionActual ||
        empatados.length === 0
    ) {
        return;
    }


    boton.disabled = true;

    boton.textContent =
        "🎲 Sorteando...";


    /*
     * Creamos/reiniciamos el estado
     * del sorteo.
     */

    const {
        error: errorInicio
    } = await supabaseClient
        .from("sorteo_realtime")
        .upsert(
            {
                votacion_id:
                    votacionActual.id,

                plato_id:
                    null,

                estado:
                    "sorteando",

                actualizado_en:
                    new Date().toISOString()
            },
            {
                onConflict:
                    "votacion_id"
            }
        );


    if (errorInicio) {

        console.error(
            "Error iniciando sorteo:",
            errorInicio
        );

        boton.disabled = false;

        boton.textContent =
            "🎲 SORTEO";

        return;
    }


    /*
     * Pantalla que verá mamá.
     */

    let pantalla =
        document.querySelector(
            ".pantalla-sorteo"
        );


    if (!pantalla) {

        pantalla =
            document.createElement(
                "div"
            );

        pantalla.className =
            "pantalla-sorteo";


        contenidoResultadoFinal
            .appendChild(
                pantalla
            );

    }


    let vueltas = 0;

    const maxVueltas = 20;


    const intervalo =
        setInterval(
            async () => {

                /*
                 * Elegimos uno de los
                 * empatados.
                 */

                const temporal =
                    empatados[
                        Math.floor(
                            Math.random() *
                            empatados.length
                        )
                    ];


                /*
                 * Mamá lo ve.
                 */

                pantalla.textContent =
                    `🍽️ ${temporal.nombre}`;


                /*
                 * Lo enviamos a Supabase.
                 *
                 * Los hijos recibirán este
                 * cambio mediante Realtime.
                 */

                await supabaseClient
                    .from(
                        "sorteo_realtime"
                    )
                    .update(
                        {
                            plato_id:
                                temporal.plato_id,

                            estado:
                                "sorteando",

                            actualizado_en:
                                new Date()
                                    .toISOString()
                        }
                    )
                    .eq(
                        "votacion_id",
                        votacionActual.id
                    );


                vueltas++;


                if (
                    vueltas >= maxVueltas
                ) {

                    clearInterval(
                        intervalo
                    );


                    /*
                     * Pequeña espera para que
                     * termine visualmente.
                     */

                    setTimeout(
                        () => {

                            seleccionarGanadorSorteo(
                                empatados
                            );

                        },
                        400
                    );

                }

            },
            180
        );

}

async function seleccionarGanadorSorteo(
    empatados
) {

    const ganador =
        empatados[
            Math.floor(
                Math.random() *
                empatados.length
            )
        ];


    /*
     * Marcamos el sorteo como terminado.
     */

    const {
        error
    } = await supabaseClient
        .from("sorteo_realtime")
        .update(
            {
                plato_id:
                    ganador.plato_id,

                estado:
                    "finalizado",

                actualizado_en:
                    new Date().toISOString()
            }
        )
        .eq(
            "votacion_id",
            votacionActual.id
        );


    if (error) {

        console.error(
            "Error finalizando sorteo:",
            error
        );

    }


    /*
     * Guardamos el ganador oficial.
     */

    await guardarGanador(
        ganador
    );

}