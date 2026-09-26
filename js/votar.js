/* ========================================= */
/* ELEMENTOS                                 */
/* ========================================= */

const seccionPersona =
    document.getElementById("seccionPersona");

const seccionVotacionHijo =
    document.getElementById("seccionVotacionHijo");

const nombrePersonaActual =
    document.getElementById("nombrePersonaActual");

const emojiPersonaActual =
    document.getElementById("emojiPersonaActual");

const btnCambiarPersona =
    document.getElementById("btnCambiarPersona");

const estadoVotacion =
    document.getElementById("estadoVotacion");

const listaVotacion =
    document.getElementById("listaVotacion");

const mensajeVotoRealizado =
    document.getElementById("mensajeVotoRealizado");

const platoVotado =
    document.getElementById("platoVotado");

const contenedorResultados =
    document.getElementById("contenedorResultados");

const listaResultados =
    document.getElementById("listaResultados");

const totalVotos =
    document.getElementById("totalVotos");

const modalVoto =
    document.getElementById("modalVoto");

const nombrePlatoConfirmar =
    document.getElementById("nombrePlatoConfirmar");

const textoConfirmacionPersona =
    document.getElementById("textoConfirmacionPersona");

const btnCancelarVoto =
    document.getElementById("btnCancelarVoto");

const btnConfirmarVoto =
    document.getElementById("btnConfirmarVoto");


let personaActual = null;
let votacionActual = null;
let opcionesActuales = [];
let platoSeleccionado = null;
let canalRealtimeHijos = null;



/* ========================================= */
/* ELEGIR PERSONA                            */
/* ========================================= */

document
    .querySelectorAll(".tarjeta-persona")
    .forEach((boton) => {

        boton.addEventListener(
            "click",
            async () => {

                personaActual =
                    boton.dataset.persona;


                nombrePersonaActual.textContent =
                    personaActual;


                    if (personaActual === "Mery") {

                        emojiPersonaActual.textContent = "👩";
                    
                    } else if (personaActual === "Papá") {
                    
                        emojiPersonaActual.textContent = "👨‍🦳";
                        
                        } else {
                        
                            emojiPersonaActual.textContent = "👨";
                                
                                }


                seccionPersona
                    .classList
                    .add("oculto");


                seccionVotacionHijo
                    .classList
                    .remove("oculto");


                limpiarPantallaVotacion();


                await buscarVotacion();

            }
        );

    });



/* ========================================= */
/* CAMBIAR PERSONA                           */
/* ========================================= */

btnCambiarPersona.addEventListener(
    "click",
    () => {

        personaActual = null;

        votacionActual = null;

        opcionesActuales = [];

        platoSeleccionado = null;


        limpiarPantallaVotacion();


        seccionVotacionHijo
            .classList
            .add("oculto");


        seccionPersona
            .classList
            .remove("oculto");

    }
);



/* ========================================= */
/* LIMPIAR PANTALLA                          */
/* ========================================= */

function limpiarPantallaVotacion() {

    listaVotacion.innerHTML = "";


    mensajeVotoRealizado
        .classList
        .add("oculto");


    contenedorResultados
        .classList
        .add("oculto");


    platoVotado.textContent = "";

}



/* ========================================= */
/* BUSCAR ÚLTIMA VOTACIÓN                    */
/* ========================================= */

async function buscarVotacion() {

    if (!personaActual) {
        return;
    }


    estadoVotacion.innerHTML = `

        <div class="estado-vacio">

            <span>⏳</span>

            <h3>
                Buscando votación...
            </h3>

        </div>

    `;


    const {
        data,
        error
    } = await supabaseClient
        .from("votaciones")
        .select("*")
        .order(
            "creado_en",
            {
                ascending: false
            }
        )
        .limit(1)
        .maybeSingle();


    if (error) {

        console.error(
            "Error buscando votación:",
            error
        );

        mostrarError();

        return;
    }


    if (!data) {

        votacionActual = null;

        estadoVotacion.innerHTML = `

            <div class="estado-vacio">

                <span>🍳</span>

                <h3>
                    Todavía no hay votación
                </h3>

                <p>
                    Mamá aún no ha publicado
                    las opciones de hoy.
                </p>

            </div>

        `;

        return;
    }


    votacionActual = data;


    if (data.estado === "abierta") {

        estadoVotacion.innerHTML = `

            <div class="votacion-disponible">

                <span>🟢</span>

                <div>

                    <strong>
                        ¡La votación está abierta!
                    </strong>

                    <p>
                        ${personaActual}, elige tu plato favorito.
                    </p>

                </div>

            </div>

        `;


        await cargarOpciones();

        return;
    }


    if (data.estado === "cerrada") {

        await mostrarResultadoFinalHijos();

    }

}



/* ========================================= */
/* CARGAR OPCIONES                           */
/* ========================================= */

async function cargarOpciones() {

    if (!votacionActual) {
        return;
    }


    const {
        data,
        error
    } = await supabaseClient
        .from("opciones_votacion")
        .select(`
            id,
            votacion_id,
            plato_id,
            platos (
                id,
                nombre,
                descripcion
            )
        `)
        .eq(
            "votacion_id",
            votacionActual.id
        );


    if (error) {

        console.error(
            "Error cargando opciones:",
            error
        );

        mostrarError();

        return;
    }


    opcionesActuales =
        data || [];


    await comprobarSiYaVoto();

}



/* ========================================= */
/* COMPROBAR SI LA PERSONA YA VOTÓ           */
/* ========================================= */

async function comprobarSiYaVoto() {

    if (
        !personaActual ||
        !votacionActual
    ) {
        return;
    }


    const {
        data,
        error
    } = await supabaseClient
        .from("votos")
        .select("*")
        .eq(
            "votacion_id",
            votacionActual.id
        )
        .eq(
            "votante",
            personaActual
        )
        .maybeSingle();


    if (error) {

        console.error(
            "Error comprobando voto:",
            error
        );

        return;
    }


    if (data) {

        mostrarVotoRealizado(
            data.plato_id
        );


        await cargarResultados();

        return;
    }


    mostrarOpciones();

    await cargarResultados();

}



/* ========================================= */
/* MOSTRAR PLATOS                            */
/* ========================================= */

function mostrarOpciones() {

    listaVotacion.innerHTML = "";


    mensajeVotoRealizado
        .classList
        .add("oculto");


    opcionesActuales.forEach(
        (opcion) => {

            const plato =
                opcion.platos;


            if (!plato) {
                return;
            }


            const tarjeta =
                document.createElement("article");


            tarjeta.className =
                "tarjeta-voto";


            const contenido =
                document.createElement("div");


            contenido.className =
                "info-voto";


            const icono =
                document.createElement("div");


            icono.className =
                "icono-voto";


            icono.textContent =
                "🍽️";


            const textos =
                document.createElement("div");


            const nombre =
                document.createElement("h3");


            nombre.textContent =
                plato.nombre;


            const descripcion =
                document.createElement("p");


            descripcion.textContent =
                plato.descripcion ||
                "Sin descripción";


            textos.appendChild(nombre);

            textos.appendChild(descripcion);


            contenido.appendChild(icono);

            contenido.appendChild(textos);


            const boton =
                document.createElement("button");


            boton.className =
                "btn-votar";


            boton.textContent =
                "Votar";


            boton.addEventListener(
                "click",
                () => abrirConfirmacion(
                    plato
                )
            );


            tarjeta.appendChild(
                contenido
            );


            tarjeta.appendChild(
                boton
            );


            listaVotacion.appendChild(
                tarjeta
            );

        }
    );

}



/* ========================================= */
/* CONFIRMACIÓN                              */
/* ========================================= */

function abrirConfirmacion(plato) {

    platoSeleccionado =
        plato;


    textoConfirmacionPersona.textContent =
        `${personaActual}, estás votando por:`;


    nombrePlatoConfirmar.textContent =
        `🍽️ ${plato.nombre}`;


    modalVoto
        .classList
        .remove("oculto");

}


btnCancelarVoto.addEventListener(
    "click",
    () => {

        platoSeleccionado =
            null;


        modalVoto
            .classList
            .add("oculto");

    }
);



/* ========================================= */
/* REGISTRAR VOTO                            */
/* ========================================= */

btnConfirmarVoto.addEventListener(
    "click",
    async () => {

        if (
            !personaActual ||
            !platoSeleccionado ||
            !votacionActual
        ) {
            return;
        }


        /*
         * Comprobar que siga abierta.
         */

        const {
            data: votacionComprobada,
            error: errorComprobacion
        } = await supabaseClient
            .from("votaciones")
            .select("estado")
            .eq(
                "id",
                votacionActual.id
            )
            .single();


        if (
            errorComprobacion ||
            !votacionComprobada ||
            votacionComprobada.estado !==
                "abierta"
        ) {

            modalVoto
                .classList
                .add("oculto");


            await buscarVotacion();

            return;
        }


        btnConfirmarVoto.disabled =
            true;


        btnConfirmarVoto.textContent =
            "Registrando...";


        const platoElegido =
            platoSeleccionado;


        const {
            error
        } = await supabaseClient
            .from("votos")
            .insert({

                votacion_id:
                    votacionActual.id,

                plato_id:
                    platoElegido.id,

                votante:
                    personaActual

            });


        btnConfirmarVoto.disabled =
            false;


        btnConfirmarVoto.textContent =
            "Confirmar voto";


        if (error) {

            console.error(
                "Error registrando voto:",
                error
            );


            modalVoto
                .classList
                .add("oculto");


            /*
             * UNIQUE violado:
             * esa persona ya votó.
             */

            if (error.code === "23505") {

                alert(
                    `${personaActual} ya votó en esta votación.`
                );


                await comprobarSiYaVoto();

                return;
            }


            alert(
                "No se pudo registrar el voto."
            );

            return;
        }


        platoSeleccionado = null;


        modalVoto
            .classList
            .add("oculto");


        mostrarVotoRealizado(
            platoElegido.id
        );


        await cargarResultados();

    }
);



/* ========================================= */
/* VOTO REALIZADO                            */
/* ========================================= */

function mostrarVotoRealizado(
    platoId
) {

    listaVotacion.innerHTML = "";


    const opcion =
        opcionesActuales.find(
            (item) =>
                Number(item.plato_id) ===
                Number(platoId)
        );


    const nombre =
        opcion?.platos?.nombre ||
        "tu plato seleccionado";


    platoVotado.textContent =
        `${personaActual} votó por ${nombre}.`;


    mensajeVotoRealizado
        .classList
        .remove("oculto");

}



/* ========================================= */
/* RESULTADOS                                */
/* ========================================= */

async function cargarResultados() {

    if (!votacionActual) {
        return;
    }


    const {
        data: votos,
        error
    } = await supabaseClient
        .from("votos")
        .select("plato_id, votante")
        .eq(
            "votacion_id",
            votacionActual.id
        );


    if (error) {

        console.error(
            "Error cargando resultados:",
            error
        );

        return;
    }


    const conteo = {};


    opcionesActuales.forEach(
        (opcion) => {

            conteo[opcion.plato_id] = 0;

        }
    );


    votos.forEach(
        (voto) => {

            if (
                conteo[voto.plato_id] !==
                undefined
            ) {

                conteo[voto.plato_id]++;

            }

        }
    );


    mostrarResultados(
        conteo,
        votos.length
    );

}



/* ========================================= */
/* MOSTRAR RESULTADOS                        */
/* ========================================= */

function mostrarResultados(
    conteo,
    cantidadTotal
) {

    listaResultados.innerHTML = "";


    totalVotos.textContent =
        `${cantidadTotal} de 3 ${
            cantidadTotal === 1
                ? "ha votado"
                : "han votado"
        }`;


    const ordenados =
        [...opcionesActuales]
            .sort(
                (a, b) =>
                    conteo[b.plato_id] -
                    conteo[a.plato_id]
            );


    ordenados.forEach(
        (opcion) => {

            const cantidad =
                conteo[
                    opcion.plato_id
                ] || 0;


            const porcentaje =
                cantidadTotal > 0
                    ? Math.round(
                        (
                            cantidad /
                            cantidadTotal
                        ) * 100
                    )
                    : 0;


            const resultado =
                document.createElement("div");


            resultado.className =
                "resultado-plato";


            resultado.innerHTML = `

                <div class="resultado-cabecera">

                    <strong></strong>

                    <span>
                        ${cantidad}
                        ${
                            cantidad === 1
                                ? "voto"
                                : "votos"
                        }
                    </span>

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


            resultado
                .querySelector("strong")
                .textContent =
                    opcion.platos.nombre;


            listaResultados.appendChild(
                resultado
            );

        }
    );


    contenedorResultados
        .classList
        .remove("oculto");

}



/* ========================================= */
/* RESULTADO FINAL                           */
/* ========================================= */

async function mostrarResultadoFinalHijos() {

    limpiarPantallaVotacion();


    if (
        !votacionActual.ganador_id
    ) {

        estadoVotacion.innerHTML = `

            <div class="resultado-hijos">

                <div class="resultado-hijos-icono">
                    🎲
                </div>

                <p class="panel-mini">
                    VOTACIÓN FINALIZADA
                </p>

                <h2>
                    Esperando resultado
                </h2>

                <p>
                    Mamá está revisando
                    el resultado o realizando
                    el sorteo.
                </p>

                <div class="esperando-sorteo">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

            </div>

        `;

        return;
    }


    const {
        data: ganador,
        error
    } = await supabaseClient
        .from("platos")
        .select("*")
        .eq(
            "id",
            votacionActual.ganador_id
        )
        .single();


    if (error) {

        console.error(
            "Error buscando ganador:",
            error
        );

        mostrarError();

        return;
    }


    const {
        count,
        error: errorVotos
    } = await supabaseClient
        .from("votos")
        .select(
            "*",
            {
                count: "exact",
                head: true
            }
        )
        .eq(
            "votacion_id",
            votacionActual.id
        )
        .eq(
            "plato_id",
            ganador.id
        );


    if (errorVotos) {

        console.error(
            "Error contando votos:",
            errorVotos
        );

    }


    const cantidad =
        count || 0;


    estadoVotacion.innerHTML = `

        <div class="resultado-hijos">

            <div class="resultado-hijos-icono">
                🏆
            </div>

            <p class="panel-mini">
                VOTACIÓN FINALIZADA
            </p>

            <p class="ganador-etiqueta">
                Hoy ganó
            </p>

            <h2 id="nombreGanadorFinal"></h2>

            <p>

                ${cantidad}

                ${
                    cantidad === 1
                        ? "voto"
                        : "votos"
                }

            </p>


            <div class="mensaje-comida">
                🍴 ¡Esto se come hoy!
            </div>

        </div>

    `;


    document
        .getElementById(
            "nombreGanadorFinal"
        )
        .textContent =
            ganador.nombre;

}



/* ========================================= */
/* REALTIME                                  */
/* ========================================= */

function iniciarRealtimeHijos() {

    if (canalRealtimeHijos) {

        supabaseClient.removeChannel(
            canalRealtimeHijos
        );

    }


    canalRealtimeHijos =
        supabaseClient
            .channel(
                "familia-realtime"
            )


            /*
             * VOTOS
             */

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


                    if (
                        personaActual &&
                        votacionActual &&
                        votacionActual.estado ===
                            "abierta"
                    ) {

                        await comprobarSiYaVoto();

                    }

                }
            )


            /*
             * VOTACIONES
             */

            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "votaciones"
                },
                async (payload) => {

                    console.log(
                        "📡 Cambio en votación:",
                        payload
                    );


                    if (!personaActual) {
                        return;
                    }


                    /*
                     * Nueva votación
                     */

                    if (
                        payload.eventType ===
                        "INSERT"
                    ) {

                        await buscarVotacion();

                        return;

                    }


                    /*
                     * Votación actualizada
                     */

                    if (
                        payload.eventType ===
                        "UPDATE"
                    ) {

                        const nueva =
                            payload.new;


                        if (
                            votacionActual &&
                            Number(nueva.id) ===
                                Number(
                                    votacionActual.id
                                )
                        ) {

                            votacionActual =
                                nueva;


                            if (
                                nueva.estado ===
                                "cerrada"
                            ) {

                                await mostrarResultadoFinalHijos();

                            }

                        }

                    }

                }
            )


            /*
             * OPCIONES
             */

            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table:
                        "opciones_votacion"
                },
                async () => {

                    if (personaActual) {

                        await buscarVotacion();

                    }

                }
            )

            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "sorteo_realtime"
                },
                async (payload) => {

                    console.log(
                        "🎲 Sorteo en vivo:",
                        payload
                    );


                    if (
                        !personaActual ||
                        !votacionActual
                    ) {
                        return;
                    }


                    const sorteo =
                        payload.new;


                    /*
                    * Ignorar sorteos de
                    * votaciones anteriores.
                    */

                    if (
                        Number(
                            sorteo.votacion_id
                        ) !==
                        Number(
                            votacionActual.id
                        )
                    ) {

                        return;

                    }


                    /*
                    * ANIMACIÓN EN CURSO
                    */

                    if (
                        sorteo.estado ===
                        "sorteando" &&
                        sorteo.plato_id
                    ) {

                        await mostrarPlatoSorteoHijos(
                            sorteo.plato_id
                        );

                    }


                    /*
                    * TERMINÓ
                    */

                    if (
                        sorteo.estado ===
                        "finalizado"
                    ) {

                        mostrarFinalizandoSorteo();

                    }

                }
            )

            .subscribe(
                (status) => {

                    console.log(
                        "Realtime hijos:",
                        status
                    );

                }
            );

}

async function mostrarPlatoSorteoHijos(
    platoId
) {

    const {
        data: plato,
        error
    } = await supabaseClient
        .from("platos")
        .select("id, nombre")
        .eq(
            "id",
            platoId
        )
        .single();


    if (error || !plato) {

        console.error(
            "Error cargando plato del sorteo:",
            error
        );

        return;
    }


    estadoVotacion.innerHTML = `

        <div class="resultado-hijos sorteo-en-vivo">

            <div class="resultado-hijos-icono">
                🎲
            </div>

            <p class="panel-mini">
                SORTEO EN VIVO
            </p>

            <h2>
                ¿Qué comeremos?
            </h2>

            <div class="plato-sorteo-hijos"></div>

            <p class="texto-sorteando">
                Mamá está realizando el sorteo...
            </p>

        </div>

    `;


    document
        .querySelector(
            ".plato-sorteo-hijos"
        )
        .textContent =
            `🍽️ ${plato.nombre}`;

}



/* ========================================= */
/* ERROR                                     */
/* ========================================= */

function mostrarError() {

    estadoVotacion.innerHTML = `

        <div class="estado-vacio">

            <span>❌</span>

            <h3>
                Algo salió mal
            </h3>

            <p>
                No pudimos cargar la votación.
            </p>

        </div>

    `;

}



/* ========================================= */
/* INICIAR                                   */
/* ========================================= */

function iniciar() {

    iniciarRealtimeHijos();

}

function mostrarFinalizandoSorteo() {

    estadoVotacion.innerHTML = `

        <div class="resultado-hijos sorteo-en-vivo">

            <div class="resultado-hijos-icono">
                🥁
            </div>

            <p class="panel-mini">
                SORTEO FINALIZADO
            </p>

            <h2>
                Y el ganador es...
            </h2>

            <div class="esperando-sorteo">
                <span></span>
                <span></span>
                <span></span>
            </div>

        </div>

    `;

}


iniciar();
